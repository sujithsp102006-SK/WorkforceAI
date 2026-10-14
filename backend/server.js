require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connectDB } = require('./config/db');
const employeeRepo = require('./data/employeeRepo');

const employeeRoutes = require('./routes/employeeRoutes');
const predictRoutes = require('./routes/predictRoutes');
const skillRoutes = require('./routes/skillRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const authRoutes = require('./routes/authRoutes');
const { seedUsers } = require('./data/userSeed');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & utility middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/predict', predictRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Enterprise Workforce Predictive Analytics Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    serpApiActive: !!(process.env.SERPAPI_KEY && process.env.SERPAPI_KEY !== 'your_serpapi_key_here')
  });
});

// Root route
app.get('/', (req, res) => {
  res.send('Enterprise Workforce Predictive Analytics API is running. Check /api/health for system status.');
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Global Error]', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Initialize DB and launch server
async function startServer() {
  try {
    await connectDB();
    await employeeRepo.initSeed();
    await seedUsers();

    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(` Workforce Analytics API listening on port ${PORT}`);
      console.log(` Health Check: http://localhost:${PORT}/api/health`);
      console.log(` Dashboard:    http://localhost:${PORT}/api/dashboard/stats`);
      console.log(` Employees:    http://localhost:${PORT}/api/employees`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Fatal error during startup:', error);
    process.exit(1);
  }
}

startServer();
