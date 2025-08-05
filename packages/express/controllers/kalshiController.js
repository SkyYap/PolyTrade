const axios = require('axios');
const asyncHandler = require('../middleware/asyncHandler');

const KALSHI_BASE_URL = 'https://api.elections.kalshi.com/trade-api/v2';

// @desc    Get series information
// @route   GET /api/kalshi/series/:seriesTicker
// @access  Public
exports.getSeries = asyncHandler(async (req, res, next) => {
  try {
    const { seriesTicker } = req.params;

    if (!seriesTicker) {
      return res.status(400).json({
        success: false,
        error: 'Series ticker is required',
        message: 'Please provide a series ticker parameter'
      });
    }

    const response = await axios.get(`${KALSHI_BASE_URL}/series/${seriesTicker}`, {
      timeout: 10000
    });

    res.status(200).json({
      success: true,
      message: `Series information retrieved successfully for ${seriesTicker}`,
      data: response.data,
      meta: {
        timestamp: new Date().toISOString(),
        source: 'Kalshi API',
        endpoint: `/series/${seriesTicker}`
      }
    });

  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        error: 'Kalshi API Error',
        message: error.response.data?.message || 'Failed to fetch series information',
        details: error.response.data
      });
    } else if (error.request) {
      return res.status(503).json({
        success: false,
        error: 'Service Unavailable',
        message: 'Unable to connect to Kalshi API'
      });
    } else {
      next(error);
    }
  }
});

// @desc    Get markets with filters
// @route   GET /api/kalshi/markets
// @access  Public
exports.getMarkets = asyncHandler(async (req, res, next) => {
  try {
    // Extract query parameters
    const {
      series_ticker,
      status,
      event_ticker,
      limit,
      cursor
    } = req.query;

    // Build query parameters object
    const params = {};
    if (series_ticker) params.series_ticker = series_ticker;
    if (status) params.status = status;
    if (event_ticker) params.event_ticker = event_ticker;
    if (limit) params.limit = limit;
    if (cursor) params.cursor = cursor;

    const response = await axios.get(`${KALSHI_BASE_URL}/markets`, {
      params,
      timeout: 10000
    });

    res.status(200).json({
      success: true,
      message: 'Markets retrieved successfully from Kalshi',
      count: response.data?.markets?.length || 0,
      data: response.data,
      meta: {
        timestamp: new Date().toISOString(),
        source: 'Kalshi API',
        endpoint: '/markets',
        filters: params
      }
    });

  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        error: 'Kalshi API Error',
        message: error.response.data?.message || 'Failed to fetch markets',
        details: error.response.data
      });
    } else if (error.request) {
      return res.status(503).json({
        success: false,
        error: 'Service Unavailable',
        message: 'Unable to connect to Kalshi API'
      });
    } else {
      next(error);
    }
  }
});

// @desc    Get specific market details
// @route   GET /api/kalshi/markets/:marketTicker
// @access  Public
exports.getMarket = asyncHandler(async (req, res, next) => {
  try {
    const { marketTicker } = req.params;

    if (!marketTicker) {
      return res.status(400).json({
        success: false,
        error: 'Market ticker is required',
        message: 'Please provide a market ticker parameter'
      });
    }

    const response = await axios.get(`${KALSHI_BASE_URL}/markets/${marketTicker}`, {
      timeout: 10000
    });

    res.status(200).json({
      success: true,
      message: `Market details retrieved successfully for ${marketTicker}`,
      data: response.data,
      meta: {
        timestamp: new Date().toISOString(),
        source: 'Kalshi API',
        endpoint: `/markets/${marketTicker}`
      }
    });

  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        error: 'Kalshi API Error',
        message: error.response.data?.message || 'Failed to fetch market details',
        details: error.response.data
      });
    } else if (error.request) {
      return res.status(503).json({
        success: false,
        error: 'Service Unavailable',
        message: 'Unable to connect to Kalshi API'
      });
    } else {
      next(error);
    }
  }
});

// @desc    Get market orderbook
// @route   GET /api/kalshi/markets/:marketTicker/orderbook
// @access  Public
exports.getMarketOrderbook = asyncHandler(async (req, res, next) => {
  try {
    const { marketTicker } = req.params;

    if (!marketTicker) {
      return res.status(400).json({
        success: false,
        error: 'Market ticker is required',
        message: 'Please provide a market ticker parameter'
      });
    }

    const response = await axios.get(`${KALSHI_BASE_URL}/markets/${marketTicker}/orderbook`, {
      timeout: 10000
    });

    res.status(200).json({
      success: true,
      message: `Orderbook retrieved successfully for ${marketTicker}`,
      data: response.data,
      meta: {
        timestamp: new Date().toISOString(),
        source: 'Kalshi API',
        endpoint: `/markets/${marketTicker}/orderbook`
      }
    });

  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        error: 'Kalshi API Error',
        message: error.response.data?.message || 'Failed to fetch orderbook',
        details: error.response.data
      });
    } else if (error.request) {
      return res.status(503).json({
        success: false,
        error: 'Service Unavailable',
        message: 'Unable to connect to Kalshi API'
      });
    } else {
      next(error);
    }
  }
});

// @desc    Get events with filters
// @route   GET /api/kalshi/events
// @access  Public
exports.getEvents = asyncHandler(async (req, res, next) => {
  try {
    // Extract query parameters
    const {
      series_ticker,
      status,
      limit,
      cursor
    } = req.query;

    // Build query parameters object
    const params = {};
    if (series_ticker) params.series_ticker = series_ticker;
    if (status) params.status = status;
    if (limit) params.limit = limit;
    if (cursor) params.cursor = cursor;

    const response = await axios.get(`${KALSHI_BASE_URL}/events`, {
      params,
      timeout: 10000
    });

    res.status(200).json({
      success: true,
      message: 'Events retrieved successfully from Kalshi',
      count: response.data?.events?.length || 0,
      data: response.data,
      meta: {
        timestamp: new Date().toISOString(),
        source: 'Kalshi API',
        endpoint: '/events',
        filters: params
      }
    });

  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        error: 'Kalshi API Error',
        message: error.response.data?.message || 'Failed to fetch events',
        details: error.response.data
      });
    } else if (error.request) {
      return res.status(503).json({
        success: false,
        error: 'Service Unavailable',
        message: 'Unable to connect to Kalshi API'
      });
    } else {
      next(error);
    }
  }
});

// @desc    Get specific event details
// @route   GET /api/kalshi/events/:eventTicker
// @access  Public
exports.getEvent = asyncHandler(async (req, res, next) => {
  try {
    const { eventTicker } = req.params;

    if (!eventTicker) {
      return res.status(400).json({
        success: false,
        error: 'Event ticker is required',
        message: 'Please provide an event ticker parameter'
      });
    }

    const response = await axios.get(`${KALSHI_BASE_URL}/events/${eventTicker}`, {
      timeout: 10000
    });

    res.status(200).json({
      success: true,
      message: `Event details retrieved successfully for ${eventTicker}`,
      data: response.data,
      meta: {
        timestamp: new Date().toISOString(),
        source: 'Kalshi API',
        endpoint: `/events/${eventTicker}`
      }
    });

  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        error: 'Kalshi API Error',
        message: error.response.data?.message || 'Failed to fetch event details',
        details: error.response.data
      });
    } else if (error.request) {
      return res.status(503).json({
        success: false,
        error: 'Service Unavailable',
        message: 'Unable to connect to Kalshi API'
      });
    } else {
      next(error);
    }
  }
}); 