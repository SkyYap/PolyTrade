const express = require('express');
const router = express.Router();

// Import controllers
const {
  getEvents: getPolymarketEvents,
  getMarkets: getPolymarketMarkets,
  getMarket: getPolymarketMarket,
  getPriceHistory,
  getOrderBook: getPolymarketOrderBook,
  searchMarkets: searchPolymarketMarkets
} = require('../controllers/polymarketController');

const {
  getEvents: getKalshiEvents,
  getEvent: getKalshiEvent,
  getMarkets: getKalshiMarkets,
  getMarket: getKalshiMarket,
  getOrderBook: getKalshiOrderBook,
  getSeries,
  getTrades,
  searchMarkets: searchKalshiMarkets
} = require('../controllers/kalshiController');

const {
  getAllPredictions,
  getPredictionStats
} = require('../controllers/combinedController');

// Polymarket routes
router.route('/polymarket/events').get(getPolymarketEvents);
router.route('/polymarket/markets').get(getPolymarketMarkets);
router.route('/polymarket/markets/:slug').get(getPolymarketMarket);
router.route('/polymarket/markets/:slug/price-history').get(getPriceHistory);
router.route('/polymarket/markets/:slug/book').get(getPolymarketOrderBook);
router.route('/polymarket/search').get(searchPolymarketMarkets);

// Kalshi routes
router.route('/kalshi/events').get(getKalshiEvents);
router.route('/kalshi/events/:ticker').get(getKalshiEvent);
router.route('/kalshi/markets').get(getKalshiMarkets);
router.route('/kalshi/markets/:ticker').get(getKalshiMarket);
router.route('/kalshi/markets/:ticker/orderbook').get(getKalshiOrderBook);
router.route('/kalshi/markets/:ticker/trades').get(getTrades);
router.route('/kalshi/series').get(getSeries);
router.route('/kalshi/search').get(searchKalshiMarkets);

// Base API route
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to PolyTrade API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      polymarket: {
        events: '/api/polymarket/events',
        markets: '/api/polymarket/markets',
        market: '/api/polymarket/markets/:slug',
        priceHistory: '/api/polymarket/markets/:slug/price-history',
        orderBook: '/api/polymarket/markets/:slug/book',
        search: '/api/polymarket/search'
      },
      kalshi: {
        events: '/api/kalshi/events',
        event: '/api/kalshi/events/:ticker',
        markets: '/api/kalshi/markets',
        market: '/api/kalshi/markets/:ticker',
        orderBook: '/api/kalshi/markets/:ticker/orderbook',
        trades: '/api/kalshi/markets/:ticker/trades',
        series: '/api/kalshi/series',
        search: '/api/kalshi/search'
      }
    },
  });
});

module.exports = router;