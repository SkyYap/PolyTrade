const axios = require('axios');
const asyncHandler = require('../middleware/asyncHandler');

const KALSHI_BASE_URL = 'https://api.elections.kalshi.com/trade-api/v2';

// @desc    Get events from Kalshi API
// @route   GET /api/kalshi/events
// @access  Public
exports.getEvents = asyncHandler(async (req, res, next) => {
  try {
    const { 
      limit = 200, 
      status = 'open',
      with_nested_markets,
      cursor,
      series_ticker
    } = req.query;

    const params = {
      limit,
      status
    };

    // Add optional parameters if provided
    if (with_nested_markets !== undefined) {
      params.with_nested_markets = with_nested_markets;
    }
    
    if (cursor) {
      params.cursor = cursor;
    }
    
    if (series_ticker) {
      params.series_ticker = series_ticker;
    }

    const response = await axios.get(`${KALSHI_BASE_URL}/events`, {
      params,
      timeout: 10000
    });

    res.status(200).json({
      success: true,
      message: 'Events retrieved successfully from Kalshi',
      data: response.data?.events || [],
      meta: {
        count: response.data?.events?.length || 0,
        timestamp: new Date().toISOString(),
        cursor: response.data?.cursor || null
      }
    });

  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        error: 'Kalshi API Error',
        message: error.response.data?.message || 'Failed to fetch events from Kalshi'
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

// @desc    Get single event from Kalshi API
// @route   GET /api/kalshi/events/:ticker
// @access  Public
exports.getEvent = asyncHandler(async (req, res, next) => {
  try {
    const { ticker } = req.params;

    const response = await axios.get(`${KALSHI_BASE_URL}/events/${ticker}`, {
      timeout: 10000
    });

    res.status(200).json({
      success: true,
      event: response.data?.event || null,
      meta: {
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        error: 'Kalshi API Error',
        message: error.response.data?.message || 'Failed to fetch event from Kalshi'
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

// @desc    Get markets from Kalshi API
// @route   GET /api/kalshi/markets
// @access  Public
exports.getMarkets = asyncHandler(async (req, res, next) => {
  try {
    const { 
      limit = 100, 
      status = 'open',
      cursor
    } = req.query;

    const params = {
      limit,
      status
    };

    if (cursor) {
      params.cursor = cursor;
    }

    const response = await axios.get(`${KALSHI_BASE_URL}/markets`, {
      params,
      timeout: 10000
    });

    res.status(200).json({
      success: true,
      data: {
        markets: response.data?.markets || [],
        cursor: response.data?.cursor
      },
      meta: {
        count: response.data?.markets?.length || 0,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        error: 'Kalshi API Error',
        message: error.response.data?.message || 'Failed to fetch markets from Kalshi'
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

// @desc    Get single market from Kalshi API
// @route   GET /api/kalshi/markets/:ticker
// @access  Public
exports.getMarket = asyncHandler(async (req, res, next) => {
  try {
    const { ticker } = req.params;

    const response = await axios.get(`${KALSHI_BASE_URL}/markets/${ticker}`, {
      timeout: 10000
    });

    res.status(200).json({
      success: true,
      market: response.data?.market || null,
      meta: {
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        error: 'Kalshi API Error',
        message: error.response.data?.message || 'Failed to fetch market from Kalshi'
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

// @desc    Get order book from Kalshi API
// @route   GET /api/kalshi/markets/:ticker/orderbook
// @access  Public
exports.getOrderBook = asyncHandler(async (req, res, next) => {
  try {
    const { ticker } = req.params;
    const { depth = 10 } = req.query;

    const response = await axios.get(`${KALSHI_BASE_URL}/markets/${ticker}/orderbook`, {
      params: { depth },
      timeout: 10000
    });

    res.status(200).json({
      success: true,
      orderbook: response.data?.orderbook || null,
      meta: {
        ticker,
        depth,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        error: 'Kalshi API Error',
        message: error.response.data?.message || 'Failed to fetch order book from Kalshi'
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

// @desc    Get series from Kalshi API
// @route   GET /api/kalshi/series
// @access  Public
exports.getSeries = asyncHandler(async (req, res, next) => {
  try {
    const { 
      limit = 100,
      cursor
    } = req.query;

    const params = { limit };
    
    if (cursor) {
      params.cursor = cursor;
    }

    const response = await axios.get(`${KALSHI_BASE_URL}/series`, {
      params,
      timeout: 10000
    });

    res.status(200).json({
      success: true,
      series: response.data?.series || [],
      cursor: response.data?.cursor,
      meta: {
        count: response.data?.series?.length || 0,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        error: 'Kalshi API Error',
        message: error.response.data?.message || 'Failed to fetch series from Kalshi'
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

// @desc    Get trades from Kalshi API
// @route   GET /api/kalshi/markets/:ticker/trades
// @access  Public
exports.getTrades = asyncHandler(async (req, res, next) => {
  try {
    const { ticker } = req.params;
    const { 
      limit = 100,
      cursor
    } = req.query;

    const params = { limit };
    
    if (cursor) {
      params.cursor = cursor;
    }

    const response = await axios.get(`${KALSHI_BASE_URL}/markets/${ticker}/trades`, {
      params,
      timeout: 10000
    });

    res.status(200).json({
      success: true,
      trades: response.data?.trades || [],
      cursor: response.data?.cursor,
      meta: {
        ticker,
        count: response.data?.trades?.length || 0,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        error: 'Kalshi API Error',
        message: error.response.data?.message || 'Failed to fetch trades from Kalshi'
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

// @desc    Search markets from Kalshi API
// @route   GET /api/kalshi/search
// @access  Public
exports.searchMarkets = asyncHandler(async (req, res, next) => {
  try {
    const { 
      query,
      limit = 50
    } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'query parameter is required'
      });
    }

    // Kalshi doesn't have a direct search endpoint, so we'll get markets and filter
    const response = await axios.get(`${KALSHI_BASE_URL}/markets`, {
      params: { 
        limit: Math.min(limit * 2, 200), // Get more to filter
        status: 'open'
      },
      timeout: 10000
    });

    const markets = response.data?.markets || [];
    const filteredMarkets = markets.filter(market => 
      market.title?.toLowerCase().includes(query.toLowerCase()) ||
      market.subtitle?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, limit);

    res.status(200).json({
      success: true,
      markets: filteredMarkets,
      meta: {
        query,
        count: filteredMarkets.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        error: 'Kalshi API Error',
        message: error.response.data?.message || 'Failed to search markets from Kalshi'
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
