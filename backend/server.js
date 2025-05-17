const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const winston = require('winston');
const { v4: uuidv4 } = require('uuid');
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
    
    // Initialize tables if they don't exist
    await initializeTables(connection);
    
    connection.release();
  } catch (error) {
    logger.error(`Failed to connect to the database: ${error.message}`);
    process.exit(1);
  }
}

async function initializeTables(connection) {
  try {
    // Create status_checks table if it doesn't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS status_checks (
        id VARCHAR(36) PRIMARY KEY,
        client_name VARCHAR(255) NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    logger.info('Database tables initialized');
  } catch (error) {
    logger.error(`Failed to initialize database tables: ${error.message}`);
    throw error;
  }
}

// API routes
const apiRouter = express.Router();

// Root route
apiRouter.get('/', (req, res) => {
  return res.json({ message: 'Hello World' });
});

// Create status check
apiRouter.post('/status', async (req, res) => {
  try {
    const { client_name } = req.body;
    
    if (!client_name) {
      return res.status(400).json({ error: 'client_name is required' });
    }
    
    const id = uuidv4();
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    const [result] = await pool.query(
      'INSERT INTO status_checks (id, client_name, timestamp) VALUES (?, ?, ?)',
      [id, client_name, timestamp]
    );
    
    return res.status(201).json({
      id,
      client_name,
      timestamp
    });
  } catch (error) {
    logger.error(`Error creating status check: ${error.message}`);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all status checks
apiRouter.get('/status', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM status_checks ORDER BY timestamp DESC LIMIT 1000');
    return res.json(rows);
  } catch (error) {
    logger.error(`Error fetching status checks: ${error.message}`);
    return res.status(500).json({ error: 'Internal server error' });
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
