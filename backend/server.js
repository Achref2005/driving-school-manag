const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const winston = require('winston');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const path = require('path');

// Load environment variables
dotenv.config();

// Configure logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} - ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console()
  ]
});

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: '*',
  allowedHeaders: '*',
  credentials: true
}));
app.use(express.json());

// Database connection
let pool;

async function initializeDatabase() {
  try {
    // Create the database connection pool
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test the connection
    const connection = await pool.getConnection();
    logger.info('Database connection established');
    connection.release();
  } catch (error) {
    logger.error(`Failed to connect to the database: ${error.message}`);
    process.exit(1);
  }
}

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token is required' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [decoded.id]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Add user to request
    req.user = users[0];
    
    next();
  } catch (error) {
    logger.error(`Authentication error: ${error.message}`);
    return res.status(401).json({ message: 'Not authorized' });
  }
};

// Role-based authorization middleware
const authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};

// API routes
const apiRouter = express.Router();

// Root route
apiRouter.get('/', (req, res) => {
  return res.json({ message: 'Driving School Management API' });
});

// Auth routes
apiRouter.post('/auth/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, password } = req.body;

    // Check if user exists
    const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );

    // Return user data without password
    const { password: _, ...userData } = user;

    return res.json({
      user: userData,
      token
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    return res.status(500).json({ message: 'Server error' });
  }
});

apiRouter.post('/auth/register', [
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['admin', 'instructor', 'student']).withMessage('Valid role is required'),
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, email, password, role, first_name, last_name, phone, address, date_of_birth } = req.body;

    // Check if user already exists
    const [existingUsers] = await pool.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate ID
    const id = uuidv4();

    // Create user
    await pool.query(
      'INSERT INTO users (id, username, email, password, role, first_name, last_name, phone, address, date_of_birth) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, username, email, hashedPassword, role, first_name, last_name, phone || null, address || null, date_of_birth || null]
    );

    // If user is a student or instructor, create corresponding record
    if (role === 'student') {
      const studentId = uuidv4();
      const { license_type } = req.body;
      if (!license_type) {
        return res.status(400).json({ message: 'License type is required for students' });
      }
      await pool.query(
        'INSERT INTO students (id, user_id, license_type, registration_date) VALUES (?, ?, ?, CURDATE())',
        [studentId, id, license_type]
      );
    } else if (role === 'instructor') {
      const instructorId = uuidv4();
      const { license_number, specializations } = req.body;
      if (!license_number) {
        return res.status(400).json({ message: 'License number is required for instructors' });
      }
      await pool.query(
        'INSERT INTO instructors (id, user_id, license_number, hire_date, specializations) VALUES (?, ?, ?, CURDATE(), ?)',
        [instructorId, id, license_number, specializations || null]
      );
    }

    // Generate token
    const token = jwt.sign(
      { id, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );

    return res.status(201).json({
      user: {
        id,
        username,
        email,
        role,
        first_name,
        last_name,
        phone,
        address,
        date_of_birth
      },
      token
    });
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    return res.status(500).json({ message: 'Server error' });
  }
});

// User routes
apiRouter.get('/users', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, username, email, role, first_name, last_name, phone, address, date_of_birth, created_at, updated_at FROM users'
    );
    return res.json(users);
  } catch (error) {
    logger.error(`Error fetching users: ${error.message}`);
    return res.status(500).json({ message: 'Server error' });
  }
});

apiRouter.get('/users/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Only allow users to access their own data unless they are an admin
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const [users] = await pool.query(
      'SELECT id, username, email, role, first_name, last_name, phone, address, date_of_birth, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(users[0]);
  } catch (error) {
    logger.error(`Error fetching user: ${error.message}`);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Instructor routes
apiRouter.get('/instructors', authenticate, async (req, res) => {
  try {
    const [instructors] = await pool.query(`
      SELECT i.*, u.first_name, u.last_name, u.email, u.phone
      FROM instructors i
      JOIN users u ON i.user_id = u.id
      WHERE i.status = 'active'
    `);
    return res.json(instructors);
  } catch (error) {
    logger.error(`Error fetching instructors: ${error.message}`);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Student routes
apiRouter.get('/students', authenticate, authorize(['admin', 'instructor']), async (req, res) => {
  try {
    const [students] = await pool.query(`
      SELECT s.*, u.first_name, u.last_name, u.email, u.phone
      FROM students s
      JOIN users u ON s.user_id = u.id
    `);
    return res.json(students);
  } catch (error) {
    logger.error(`Error fetching students: ${error.message}`);
    return res.status(500).json({ message: 'Server error' });
  }
});

apiRouter.get('/students/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get student details
    const [students] = await pool.query(`
      SELECT s.*, u.first_name, u.last_name, u.email, u.phone, u.address
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `, [id]);

    if (students.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get student's enrollments
    const [enrollments] = await pool.query(`
      SELECT e.*, c.name as course_name
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.student_id = ?
    `, [id]);

    // Get student's lessons
    const [lessons] = await pool.query(`
      SELECT l.*, 
             i.id as instructor_id, 
             u.first_name as instructor_first_name, 
             u.last_name as instructor_last_name,
             v.make as vehicle_make,
             v.model as vehicle_model,
             v.vehicle_number
      FROM lessons l
      JOIN enrollments e ON l.enrollment_id = e.id
      JOIN instructors i ON l.instructor_id = i.id
      JOIN users u ON i.user_id = u.id
      LEFT JOIN vehicles v ON l.vehicle_id = v.id
      WHERE e.student_id = ?
      ORDER BY l.start_time DESC
    `, [id]);

    // Get student's exams
    const [exams] = await pool.query(`
      SELECT *
      FROM exams
      WHERE student_id = ?
      ORDER BY exam_date DESC
    `, [id]);

    // Get student's payments
    const [payments] = await pool.query(`
      SELECT p.*
      FROM payments p
      JOIN enrollments e ON p.enrollment_id = e.id
      WHERE e.student_id = ?
      ORDER BY p.payment_date DESC
    `, [id]);

    return res.json({
      student: students[0],
      enrollments,
      lessons,
      exams,
      payments
    });
  } catch (error) {
    logger.error(`Error fetching student details: ${error.message}`);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Course routes
apiRouter.get('/courses', async (req, res) => {
  try {
    const [courses] = await pool.query('SELECT * FROM courses WHERE status = "active"');
    return res.json(courses);
  } catch (error) {
    logger.error(`Error fetching courses: ${error.message}`);
    return res.status(500).json({ message: 'Server error' });
  }
});

apiRouter.post('/courses', authenticate, authorize(['admin']), [
  body('name').notEmpty().withMessage('Course name is required'),
  body('license_type').isIn(['A', 'B', 'C', 'D', 'E']).withMessage('Valid license type is required'),
  body('theory_hours').isInt({ min: 0 }).withMessage('Theory hours must be a positive number'),
  body('practical_hours').isInt({ min: 0 }).withMessage('Practical hours must be a positive number'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, description, license_type, theory_hours, practical_hours, price, status } = req.body;
    
    const id = uuidv4();
    
    await pool.query(
      'INSERT INTO courses (id, name, description, license_type, theory_hours, practical_hours, price, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, description || null, license_type, theory_hours, practical_hours, price, status || 'active']
    );
    
    return res.status(201).json({
      id,
      name,
      description,
      license_type,
      theory_hours,
      practical_hours,
      price,
      status: status || 'active'
    });
  } catch (error) {
    logger.error(`Error creating course: ${error.message}`);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Vehicle routes
apiRouter.get('/vehicles', authenticate, async (req, res) => {
  try {
    const [vehicles] = await pool.query('SELECT * FROM vehicles');
    return res.json(vehicles);
  } catch (error) {
    logger.error(`Error fetching vehicles: ${error.message}`);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Enrollment routes
apiRouter.post('/enrollments', authenticate, [
  body('student_id').notEmpty().withMessage('Student ID is required'),
  body('course_id').notEmpty().withMessage('Course ID is required')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { student_id, course_id } = req.body;
    
    // Check if student exists
    const [students] = await pool.query('SELECT * FROM students WHERE id = ?', [student_id]);
    if (students.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check if course exists
    const [courses] = await pool.query('SELECT * FROM courses WHERE id = ?', [course_id]);
    if (courses.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const id = uuidv4();
    
    await pool.query(
      'INSERT INTO enrollments (id, student_id, course_id, enrollment_date) VALUES (?, ?, ?, CURDATE())',
      [id, student_id, course_id]
    );
    
    // Get the new enrollment with course details
    const [enrollments] = await pool.query(`
      SELECT e.*, c.name as course_name, c.license_type, c.theory_hours, c.practical_hours, c.price
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.id = ?
    `, [id]);
    
    return res.status(201).json(enrollments[0]);
  } catch (error) {
    logger.error(`Error creating enrollment: ${error.message}`);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Lesson routes
apiRouter.post('/lessons', authenticate, authorize(['admin', 'instructor']), [
  body('enrollment_id').notEmpty().withMessage('Enrollment ID is required'),
  body('instructor_id').notEmpty().withMessage('Instructor ID is required'),
  body('lesson_type').isIn(['theory', 'practical']).withMessage('Valid lesson type is required'),
  body('start_time').isISO8601().withMessage('Valid start time is required'),
  body('end_time').isISO8601().withMessage('Valid end time is required')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { enrollment_id, instructor_id, vehicle_id, lesson_type, start_time, end_time, notes } = req.body;
    
    // Calculate duration in minutes
    const startDate = new Date(start_time);
    const endDate = new Date(end_time);
    const duration = Math.round((endDate - startDate) / (1000 * 60));
    
    if (duration <= 0) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }
    
    const id = uuidv4();
    
    // Add vehicle validation for practical lessons
    if (lesson_type === 'practical' && !vehicle_id) {
      return res.status(400).json({ message: 'Vehicle ID is required for practical lessons' });
    }
    
    await pool.query(
      'INSERT INTO lessons (id, enrollment_id, instructor_id, vehicle_id, lesson_type, start_time, end_time, duration, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, enrollment_id, instructor_id, vehicle_id || null, lesson_type, start_time, end_time, duration, notes || null]
    );
    
    // Get the new lesson with enrollment and instructor details
    const [lessons] = await pool.query(`
      SELECT l.*, 
             i.id as instructor_id, 
             u.first_name as instructor_first_name, 
             u.last_name as instructor_last_name,
             v.make as vehicle_make,
             v.model as vehicle_model,
             v.vehicle_number
      FROM lessons l
      JOIN instructors i ON l.instructor_id = i.id
      JOIN users u ON i.user_id = u.id
      LEFT JOIN vehicles v ON l.vehicle_id = v.id
      WHERE l.id = ?
    `, [id]);
    
    return res.status(201).json(lessons[0]);
  } catch (error) {
    logger.error(`Error creating lesson: ${error.message}`);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Payment routes
apiRouter.post('/payments', authenticate, authorize(['admin']), [
  body('enrollment_id').notEmpty().withMessage('Enrollment ID is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('payment_method').isIn(['cash', 'credit_card', 'bank_transfer', 'other']).withMessage('Valid payment method is required')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { enrollment_id, amount, payment_method, reference_number, notes } = req.body;
    
    // Check if enrollment exists
    const [enrollments] = await pool.query('SELECT * FROM enrollments WHERE id = ?', [enrollment_id]);
    if (enrollments.length === 0) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    
    const id = uuidv4();
    
    await pool.query(
      'INSERT INTO payments (id, enrollment_id, amount, payment_date, payment_method, reference_number, notes) VALUES (?, ?, ?, CURDATE(), ?, ?, ?)',
      [id, enrollment_id, amount, payment_method, reference_number || null, notes || null]
    );
    
    // Update total_paid in enrollment
    await pool.query(
      'UPDATE enrollments SET total_paid = total_paid + ? WHERE id = ?',
      [amount, enrollment_id]
    );
    
    // Get the new payment
    const [payments] = await pool.query('SELECT * FROM payments WHERE id = ?', [id]);
    
    return res.status(201).json(payments[0]);
  } catch (error) {
    logger.error(`Error creating payment: ${error.message}`);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Exam routes
apiRouter.post('/exams', authenticate, authorize(['admin', 'instructor']), [
  body('student_id').notEmpty().withMessage('Student ID is required'),
  body('exam_type').isIn(['theory', 'practical']).withMessage('Valid exam type is required'),
  body('license_type').isIn(['A', 'B', 'C', 'D', 'E']).withMessage('Valid license type is required'),
  body('exam_date').isISO8601().withMessage('Valid exam date is required')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { student_id, exam_type, license_type, exam_date, result, score, notes } = req.body;
    
    // Check if student exists
    const [students] = await pool.query('SELECT * FROM students WHERE id = ?', [student_id]);
    if (students.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const id = uuidv4();
    
    await pool.query(
      'INSERT INTO exams (id, student_id, exam_type, license_type, exam_date, result, score, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, student_id, exam_type, license_type, exam_date, result || 'pending', score || null, notes || null]
    );
    
    // Get the new exam
    const [exams] = await pool.query('SELECT * FROM exams WHERE id = ?', [id]);
    
    return res.status(201).json(exams[0]);
  } catch (error) {
    logger.error(`Error creating exam: ${error.message}`);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Schedule routes
apiRouter.get('/schedule', authenticate, async (req, res) => {
  try {
    // Get date range from query parameters or default to current week
    const { start_date, end_date } = req.query;
    
    let queryStartDate = start_date || new Date().toISOString().split('T')[0];
    let queryEndDate = end_date;
    
    if (!queryEndDate) {
      // Default to 7 days from start date
      const endDate = new Date(queryStartDate);
      endDate.setDate(endDate.getDate() + 7);
      queryEndDate = endDate.toISOString().split('T')[0];
    }
    
    // Filter by instructor if specified and if user is an instructor
    let instructorFilter = '';
    let params = [queryStartDate, queryEndDate];
    
    if (req.query.instructor_id) {
      instructorFilter = 'AND l.instructor_id = ?';
      params.push(req.query.instructor_id);
    } else if (req.user.role === 'instructor') {
      // If user is an instructor, only show their lessons
      const [instructors] = await pool.query('SELECT id FROM instructors WHERE user_id = ?', [req.user.id]);
      if (instructors.length > 0) {
        instructorFilter = 'AND l.instructor_id = ?';
        params.push(instructors[0].id);
      }
    }
    
    // Get lessons within date range
    const [lessons] = await pool.query(`
      SELECT l.*,
             e.student_id,
             s.first_name as student_first_name,
             s.last_name as student_last_name,
             i.id as instructor_id,
             i.first_name as instructor_first_name,
             i.last_name as instructor_last_name,
             v.make as vehicle_make,
             v.model as vehicle_model,
             v.vehicle_number
      FROM lessons l
      JOIN enrollments e ON l.enrollment_id = e.id
      JOIN (
        SELECT s.id, u.first_name, u.last_name
        FROM students s
        JOIN users u ON s.user_id = u.id
      ) s ON e.student_id = s.id
      JOIN (
        SELECT i.id, u.first_name, u.last_name
        FROM instructors i
        JOIN users u ON i.user_id = u.id
      ) i ON l.instructor_id = i.id
      LEFT JOIN vehicles v ON l.vehicle_id = v.id
      WHERE DATE(l.start_time) BETWEEN ? AND ?
      ${instructorFilter}
      ORDER BY l.start_time
    `, params);
    
    return res.json(lessons);
  } catch (error) {
    logger.error(`Error fetching schedule: ${error.message}`);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Dashboard statistics
apiRouter.get('/dashboard/stats', authenticate, async (req, res) => {
  try {
    // Total number of active students
    const [activeStudentsResult] = await pool.query(`
      SELECT COUNT(*) as count FROM students WHERE status = 'active'
    `);
    const activeStudents = activeStudentsResult[0].count;
    
    // Total number of active instructors
    const [activeInstructorsResult] = await pool.query(`
      SELECT COUNT(*) as count FROM instructors WHERE status = 'active'
    `);
    const activeInstructors = activeInstructorsResult[0].count;
    
    // Total number of vehicles
    const [vehiclesResult] = await pool.query(`
      SELECT COUNT(*) as count FROM vehicles WHERE status = 'active'
    `);
    const activeVehicles = vehiclesResult[0].count;
    
    // Total enrollments this month
    const [enrollmentsResult] = await pool.query(`
      SELECT COUNT(*) as count FROM enrollments WHERE YEAR(enrollment_date) = YEAR(CURDATE()) AND MONTH(enrollment_date) = MONTH(CURDATE())
    `);
    const enrollmentsThisMonth = enrollmentsResult[0].count;
    
    // Upcoming lessons in the next 7 days
    const [upcomingLessonsResult] = await pool.query(`
      SELECT COUNT(*) as count 
      FROM lessons 
      WHERE start_time BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
      AND status = 'scheduled'
    `);
    const upcomingLessons = upcomingLessonsResult[0].count;
    
    // Revenue this month
    const [revenueResult] = await pool.query(`
      SELECT SUM(amount) as total 
      FROM payments 
      WHERE YEAR(payment_date) = YEAR(CURDATE()) AND MONTH(payment_date) = MONTH(CURDATE())
    `);
    const revenueThisMonth = revenueResult[0].total || 0;
    
    // Courses by enrollment count
    const [courseEnrollments] = await pool.query(`
      SELECT c.id, c.name, COUNT(e.id) as enrollment_count
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id
      GROUP BY c.id
      ORDER BY enrollment_count DESC
      LIMIT 5
    `);
    
    // Exam pass rate
    const [examResults] = await pool.query(`
      SELECT exam_type, result, COUNT(*) as count
      FROM exams
      WHERE result IN ('pass', 'fail')
      GROUP BY exam_type, result
    `);
    
    // Process exam results to calculate pass rates
    const examStats = {};
    examResults.forEach(row => {
      if (!examStats[row.exam_type]) {
        examStats[row.exam_type] = { pass: 0, fail: 0, total: 0, pass_rate: 0 };
      }
      
      examStats[row.exam_type][row.result.toLowerCase()] = row.count;
      examStats[row.exam_type].total += row.count;
    });
    
    // Calculate pass rates
    for (const type in examStats) {
      if (examStats[type].total > 0) {
        examStats[type].pass_rate = (examStats[type].pass / examStats[type].total) * 100;
      }
    }
    
    return res.json({
      activeStudents,
      activeInstructors,
      activeVehicles,
      enrollmentsThisMonth,
      upcomingLessons,
      revenueThisMonth,
      courseEnrollments,
      examStats
    });
  } catch (error) {
    logger.error(`Error fetching dashboard stats: ${error.message}`);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Reports
apiRouter.get('/reports/students', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const [students] = await pool.query(`
      SELECT s.*, 
             u.first_name, u.last_name, u.email, u.phone,
             COUNT(e.id) as enrollment_count,
             COUNT(l.id) as lesson_count,
             SUM(IF(ex.result = 'pass', 1, 0)) as exams_passed,
             SUM(IF(ex.result = 'fail', 1, 0)) as exams_failed
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN enrollments e ON s.id = e.student_id
      LEFT JOIN lessons l ON e.id = l.enrollment_id
      LEFT JOIN exams ex ON s.id = ex.student_id
      GROUP BY s.id
      ORDER BY u.last_name, u.first_name
    `);
    
    return res.json(students);
  } catch (error) {
    logger.error(`Error generating student report: ${error.message}`);
    return res.status(500).json({ message: 'Server error' });
  }
});

apiRouter.get('/reports/instructors', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const [instructors] = await pool.query(`
      SELECT i.*,
             u.first_name, u.last_name, u.email, u.phone,
             COUNT(DISTINCT l.id) as lesson_count,
             SUM(l.duration) as total_teaching_minutes,
             COUNT(DISTINCT e.student_id) as student_count
      FROM instructors i
      JOIN users u ON i.user_id = u.id
      LEFT JOIN lessons l ON i.id = l.instructor_id
      LEFT JOIN enrollments e ON l.enrollment_id = e.id
      GROUP BY i.id
      ORDER BY u.last_name, u.first_name
    `);
    
    // Convert teaching minutes to hours for better readability
    instructors.forEach(instructor => {
      instructor.total_teaching_hours = instructor.total_teaching_minutes 
        ? Math.round((instructor.total_teaching_minutes / 60) * 10) / 10 
        : 0;
    });
    
    return res.json(instructors);
  } catch (error) {
    logger.error(`Error generating instructor report: ${error.message}`);
    return res.status(500).json({ message: 'Server error' });
  }
});

apiRouter.get('/reports/financial', authenticate, authorize(['admin']), async (req, res) => {
  try {
    // Get date range from query parameters or default to current year
    const { year, month } = req.query;
    
    let yearFilter = year || new Date().getFullYear();
    let monthFilter = month || null;
    
    let timeFilter = 'YEAR(p.payment_date) = ?';
    let params = [yearFilter];
    
    if (monthFilter) {
      timeFilter += ' AND MONTH(p.payment_date) = ?';
      params.push(monthFilter);
    }
    
    // Monthly revenue breakdown
    const [monthlyRevenue] = await pool.query(`
      SELECT 
        YEAR(p.payment_date) as year,
        MONTH(p.payment_date) as month,
        SUM(p.amount) as total
      FROM payments p
      WHERE ${timeFilter}
      GROUP BY YEAR(p.payment_date), MONTH(p.payment_date)
      ORDER BY YEAR(p.payment_date), MONTH(p.payment_date)
    `, params);
    
    // Revenue by course
    const [courseRevenue] = await pool.query(`
      SELECT 
        c.id, 
        c.name,
        c.license_type,
        SUM(p.amount) as total,
        COUNT(DISTINCT e.id) as enrollment_count,
        SUM(p.amount) / COUNT(DISTINCT e.id) as average_per_enrollment
      FROM payments p
      JOIN enrollments e ON p.enrollment_id = e.id
      JOIN courses c ON e.course_id = c.id
      WHERE ${timeFilter}
      GROUP BY c.id
      ORDER BY total DESC
    `, params);
    
    // Revenue by payment method
    const [paymentMethodRevenue] = await pool.query(`
      SELECT 
        p.payment_method,
        COUNT(*) as count,
        SUM(p.amount) as total
      FROM payments p
      WHERE ${timeFilter}
      GROUP BY p.payment_method
      ORDER BY total DESC
    `, params);
    
    // Total revenue
    const [totalRevenue] = await pool.query(`
      SELECT SUM(p.amount) as total
      FROM payments p
      WHERE ${timeFilter}
    `, params);
    
    return res.json({
      total: totalRevenue[0].total || 0,
      monthly: monthlyRevenue,
      byCourse: courseRevenue,
      byPaymentMethod: paymentMethodRevenue
    });
  } catch (error) {
    logger.error(`Error generating financial report: ${error.message}`);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Mount the API router with /api prefix
app.use('/api', apiRouter);

// Start the server
const PORT = process.env.PORT || 8001;
app.listen(PORT, '0.0.0.0', async () => {
  await initializeDatabase();
  logger.info(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  if (pool) {
    await pool.end();
    logger.info('Database connection pool closed');
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  if (pool) {
    await pool.end();
    logger.info('Database connection pool closed');
  }
  process.exit(0);
});
