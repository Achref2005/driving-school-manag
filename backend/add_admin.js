const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function addAdmin() {
  let connection;

  try {
    // Create connection to MySQL
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('Connected to database');

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password', salt);

    // Delete existing admin user if exists
    await connection.query('DELETE FROM users WHERE username = "admin"');
    console.log('Deleted existing admin user if present');

    // Insert admin user
    const [result] = await connection.query(`
      INSERT INTO users 
      (id, username, email, password, role, first_name, last_name) 
      VALUES 
      ('admin-uuid', 'admin', 'admin@drivingschool.com', ?, 'admin', 'Admin', 'User')
    `, [hashedPassword]);

    console.log('Admin user created successfully');
    console.log(`Rows affected: ${result.affectedRows}`);
    
  } catch (error) {
    console.error('Error adding admin user:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

addAdmin();
