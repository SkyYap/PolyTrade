const express = require('express');
const router = express.Router();

// Import controllers directly
const { getEvents } = require('../controllers/polymarketController');
const {
  getSeries,
  getMarkets,
  getMarket,
  getMarketOrderbook,
  getEvents: getKalshiEvents,
  getEvent
} = require('../controllers/kalshiController');

// Polymarket routes
router.route('/polymarket/events').get(getEvents);

// Kalshi routes
router.route('/kalshi/series/:seriesTicker').get(getSeries);
router.route('/kalshi/markets').get(getMarkets);
router.route('/kalshi/markets/:marketTicker').get(getMarket);
router.route('/kalshi/markets/:marketTicker/orderbook').get(getMarketOrderbook);
router.route('/kalshi/events').get(getKalshiEvents);
router.route('/kalshi/events/:eventTicker').get(getEvent);

// Base API route
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to PolyTrade API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      polymarket: {
        events: '/api/polymarket/events'
      },
      kalshi: {
        series: '/api/kalshi/series/:seriesTicker',
        markets: '/api/kalshi/markets',
        market: '/api/kalshi/markets/:marketTicker',
        orderbook: '/api/kalshi/markets/:marketTicker/orderbook',
        events: '/api/kalshi/events',
        event: '/api/kalshi/events/:eventTicker'
      }
    },
  });
});

module.exports = router;