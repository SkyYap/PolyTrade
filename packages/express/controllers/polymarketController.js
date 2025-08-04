const axios = require('axios');
const asyncHandler = require('../middleware/asyncHandler');

const POLYMARKET_BASE_URL = 'https://gamma-api.polymarket.com';

// @desc    Get events from Polymarket API
// @route   GET /api/polymarket/events
// @access  Public
exports.getEvents = asyncHandler(async (req, res, next) => {
  try {
    // Extract query parameters
    const {
      limit,
      offset,
      order,
      ascending,
      id,
      slug,
      archived,
      active,
      closed,
      liquidity_min,
      liquidity_max,
      volume_min,
      volume_max,
      start_date_min,
      start_date_max,
      end_date_min,
      end_date_max,
      tag,
      tag_id,
      related_tags,
      tag_slug
    } = req.query;

    // Build query parameters object
    const params = {};
    
    if (limit) params.limit = limit;
    if (offset) params.offset = offset;
    if (order) params.order = order;
    if (ascending !== undefined) params.ascending = ascending;
    if (id) params.id = id;
    if (slug) params.slug = slug;
    if (archived !== undefined) params.archived = archived;
    if (active !== undefined) params.active = active;
    if (closed !== undefined) params.closed = closed;
    if (liquidity_min) params.liquidity_min = liquidity_min;
    if (liquidity_max) params.liquidity_max = liquidity_max;
    if (volume_min) params.volume_min = volume_min;
    if (volume_max) params.volume_max = volume_max;
    if (start_date_min) params.start_date_min = start_date_min;
    if (start_date_max) params.start_date_max = start_date_max;
    if (end_date_min) params.end_date_min = end_date_min;
    if (end_date_max) params.end_date_max = end_date_max;
    if (tag) params.tag = tag;
    if (tag_id) params.tag_id = tag_id;
    if (related_tags !== undefined) params.related_tags = related_tags;
    if (tag_slug) params.tag_slug = tag_slug;

    // Make request to Polymarket API
    const response = await axios.get(`${POLYMARKET_BASE_URL}/events`, {
      params,
      timeout: 10000 // 10 second timeout
    });

    res.status(200).json({
      success: true,
      message: 'Events retrieved successfully from Polymarket',
      count: response.data?.length || 0,
      data: response.data,
      meta: {
        timestamp: new Date().toISOString(),
        source: 'Polymarket Gamma API',
        endpoint: '/events'
      }
    });

  } catch (error) {
    // Handle different types of errors
    if (error.response) {
      // API responded with error status
      return res.status(error.response.status).json({
        success: false,
        error: 'Polymarket API Error',
        message: error.response.data?.message || 'Failed to fetch events from Polymarket',
        details: error.response.data
      });
    } else if (error.request) {
      // Request was made but no response received
      return res.status(503).json({
        success: false,
        error: 'Service Unavailable',
        message: 'Unable to connect to Polymarket API'
      });
    } else {
      // Something else happened
      next(error);
    }
  }
});

