const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('dev')); // Clean logging format
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.use('/api', require('./routes/index'));

// Health check endpoint (includes Supabase connection test)
app.get('/health', async (req, res) => {
  try {
    // Test Supabase connection
    const supabase = require('./config/supabase');
    const { data, error } = await supabase.from('examples').select('count').limit(1);
    
    res.status(200).json({
      status: 'OK',
      message: 'Server is running',
      database: error ? 'Connection failed' : 'Connected',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(200).json({
      status: 'OK',
      message: 'Server is running',
      database: 'Connection test skipped',
      timestamp: new Date().toISOString(),
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `The requested route ${req.originalUrl} does not exist.`,
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API base URL: http://localhost:${PORT}/api/polymarket/events`);
  console.log(`🔗 API base URL: http://localhost:${PORT}/api/kalshi/events`);
  console.log(`🗄️  Database: Supabase PostgreSQL`);
});

module.exports = app;