const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const winston = require('winston');

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

async function setupDatabase() {
  let connection;

  try {
    // Create connection to MySQL
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      multipleStatements: true
    });

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    logger.info(`Database ${process.env.DB_NAME} created or already exists`);

    // Use the database
    await connection.query(`USE ${process.env.DB_NAME}`);

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'instructor', 'student') NOT NULL,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        date_of_birth DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    logger.info('Users table created or already exists');

    // Create instructors table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS instructors (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        license_number VARCHAR(50) NOT NULL,
        hire_date DATE NOT NULL,
        specializations TEXT,
        status ENUM('active', 'inactive') DEFAULT 'active',
        teaching_hours INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    logger.info('Instructors table created or already exists');

    // Create students table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS students (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        license_type ENUM('A', 'B', 'C', 'D', 'E') NOT NULL,
        registration_date DATE NOT NULL,
        status ENUM('active', 'inactive', 'completed') DEFAULT 'active',
        medical_certificate_expiry DATE,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    logger.info('Students table created or already exists');

    // Create vehicles table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id VARCHAR(36) PRIMARY KEY,
        vehicle_number VARCHAR(20) UNIQUE NOT NULL,
        make VARCHAR(50) NOT NULL,
        model VARCHAR(50) NOT NULL,
        year INT NOT NULL,
        vehicle_type ENUM('car', 'motorcycle', 'truck', 'bus') NOT NULL,
        license_type_required ENUM('A', 'B', 'C', 'D', 'E') NOT NULL,
        registration_expiry DATE NOT NULL,
        insurance_expiry DATE NOT NULL,
        inspection_expiry DATE NOT NULL,
        status ENUM('active', 'maintenance', 'inactive') DEFAULT 'active',
        maintenance_notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    logger.info('Vehicles table created or already exists');

    // Create courses table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        license_type ENUM('A', 'B', 'C', 'D', 'E') NOT NULL,
        theory_hours INT NOT NULL,
        practical_hours INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    logger.info('Courses table created or already exists');

    // Create enrollment table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id VARCHAR(36) PRIMARY KEY,
        student_id VARCHAR(36) NOT NULL,
        course_id VARCHAR(36) NOT NULL,
        enrollment_date DATE NOT NULL,
        completion_date DATE,
        status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
        theory_progress INT DEFAULT 0,
        practical_progress INT DEFAULT 0,
        total_paid DECIMAL(10, 2) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      )
    `);
    logger.info('Enrollments table created or already exists');

    // Create lessons table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS lessons (
        id VARCHAR(36) PRIMARY KEY,
        enrollment_id VARCHAR(36) NOT NULL,
        instructor_id VARCHAR(36) NOT NULL,
        vehicle_id VARCHAR(36),
        lesson_type ENUM('theory', 'practical') NOT NULL,
        start_time DATETIME NOT NULL,
        end_time DATETIME NOT NULL,
        duration INT NOT NULL,
        status ENUM('scheduled', 'completed', 'cancelled', 'no-show') DEFAULT 'scheduled',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
        FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE CASCADE,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL
      )
    `);
    logger.info('Lessons table created or already exists');

    // Create payments table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(36) PRIMARY KEY,
        enrollment_id VARCHAR(36) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        payment_date DATE NOT NULL,
        payment_method ENUM('cash', 'credit_card', 'bank_transfer', 'other') NOT NULL,
        reference_number VARCHAR(100),
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE
      )
    `);
    logger.info('Payments table created or already exists');

    // Create exams table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS exams (
        id VARCHAR(36) PRIMARY KEY,
        student_id VARCHAR(36) NOT NULL,
        exam_type ENUM('theory', 'practical') NOT NULL,
        license_type ENUM('A', 'B', 'C', 'D', 'E') NOT NULL,
        exam_date DATE NOT NULL,
        result ENUM('pass', 'fail', 'pending') DEFAULT 'pending',
        score INT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      )
    `);
    logger.info('Exams table created or already exists');

    // Insert admin user if it doesn't exist
    await connection.query(`
      INSERT IGNORE INTO users 
      (id, username, email, password, role, first_name, last_name) 
      VALUES 
      ('admin-uuid', 'admin', 'admin@drivingschool.com', '$2a$10$CwTycUXWue0Thq9StjUM0uQxTmrz4FzJOMpQvi6.9Z4kkOD0PD5P2', 'admin', 'Admin', 'User')
    `);
    logger.info('Admin user created or already exists');

    // Insert sample data
    // Add sample courses
    await connection.query(`
      INSERT IGNORE INTO courses 
      (id, name, description, license_type, theory_hours, practical_hours, price, status) 
      VALUES 
      ('course-1', 'Class B License - Standard', 'Standard course for passenger car license', 'B', 20, 15, 1200.00, 'active'),
      ('course-2', 'Class A License - Motorcycle', 'Course for motorcycle license', 'A', 15, 10, 900.00, 'active'),
      ('course-3', 'Class C License - Commercial', 'Course for commercial vehicle license', 'C', 30, 25, 2000.00, 'active')
    `);
    logger.info('Sample courses created or already exists');

    // Add sample vehicles
    await connection.query(`
      INSERT IGNORE INTO vehicles 
      (id, vehicle_number, make, model, year, vehicle_type, license_type_required, registration_expiry, insurance_expiry, inspection_expiry, status) 
      VALUES 
      ('vehicle-1', 'DS001', 'Toyota', 'Corolla', 2021, 'car', 'B', '2025-12-31', '2025-06-30', '2025-03-31', 'active'),
      ('vehicle-2', 'DS002', 'Honda', 'CBR500', 2022, 'motorcycle', 'A', '2025-12-31', '2025-06-30', '2025-03-31', 'active'),
      ('vehicle-3', 'DS003', 'Mercedes', 'Actros', 2020, 'truck', 'C', '2025-12-31', '2025-06-30', '2025-03-31', 'active')
    `);
    logger.info('Sample vehicles created or already exists');

    logger.info('Database setup completed successfully');
  } catch (error) {
    logger.error(`Database setup failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();
