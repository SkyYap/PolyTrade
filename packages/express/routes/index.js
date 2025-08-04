const express = require('express');
const router = express.Router();

// Import controllers directly
const { getEvents } = require('../controllers/polymarketController');

// Polymarket routes
router.route('/polymarket/events').get(getEvents);

// Base API route
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to PolyTrade API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      polymarket: {
        events: '/api/polymarket/events'
      }
    },
  });
});

module.exports = router;