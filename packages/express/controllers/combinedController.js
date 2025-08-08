const axios = require('axios');
const asyncHandler = require('../middleware/asyncHandler');

const POLYMARKET_BASE_URL = 'https://gamma-api.polymarket.com';
const KALSHI_BASE_URL = 'https://demo-api.kalshi.co/trade-api/v2';

// @desc    Get all predictions from both Polymarket and Kalshi
// @route   GET /api/predictions
// @access  Public
exports.getAllPredictions = asyncHandler(async (req, res, next) => {
  try {
    const { 
      limit = 50, 
      offset = 0, 
      platform = 'all',
      category = 'all',
      sortBy = 'volume',
      search = ''
    } = req.query;

    const predictions = [];

    // Fetch from both platforms in parallel
    const fetchPromises = [];

    // Fetch Polymarket data if requested
    if (platform === 'all' || platform === 'polymarket') {
      fetchPromises.push(
        axios.get(`${POLYMARKET_BASE_URL}/markets`, { timeout: 10000 })
          .then(response => ({
            platform: 'polymarket',
            data: response.data || [],
            success: true
          }))
          .catch(error => ({
            platform: 'polymarket',
            data: [],
            success: false,
            error: error.message
          }))
      );
    }

    // Fetch Kalshi data if requested
    if (platform === 'all' || platform === 'kalshi') {
      fetchPromises.push(
        axios.get(`${KALSHI_BASE_URL}/markets`, { 
          params: { limit: 200, status: 'open' },
          timeout: 10000 
        })
          .then(response => ({
            platform: 'kalshi',
            data: response.data?.markets || [],
            success: true
          }))
          .catch(error => ({
            platform: 'kalshi',
            data: [],
            success: false,
            error: error.message
          }))
      );
    }

    const results = await Promise.all(fetchPromises);

    // Process Polymarket data
    const polymarketResult = results.find(r => r.platform === 'polymarket');
    if (polymarketResult && polymarketResult.success) {
      const polymarkets = polymarketResult.data
        .filter(market => market.active && !market.closed)
        .map(market => ({
          id: market.id,
          platform: 'polymarket',
          title: market.question || market.description,
          description: market.description,
          category: market.category || 'Other',
          volume: parseFloat(market.volume) || 0,
          volume24h: market.volume24hr || 0,
          liquidity: parseFloat(market.liquidity) || 0,
          endDate: market.endDate,
          prices: {
            yes: market.outcomePrices ? JSON.parse(market.outcomePrices)[0] : null,
            no: market.outcomePrices ? JSON.parse(market.outcomePrices)[1] : null
          },
          outcomes: market.outcomes ? JSON.parse(market.outcomes) : [],
          slug: market.slug,
          image: market.image,
          active: market.active,
          url: `https://polymarket.com/event/${market.slug}`,
          createdAt: market.createdAt,
          updatedAt: market.updatedAt
        }));
      
      predictions.push(...polymarkets);
    }

    // Process Kalshi data
    const kalshiResult = results.find(r => r.platform === 'kalshi');
    if (kalshiResult && kalshiResult.success) {
      const kalshiMarkets = kalshiResult.data.map(market => ({
        id: market.ticker,
        platform: 'kalshi',
        title: market.title,
        description: market.subtitle || market.title,
        category: market.event_ticker ? market.event_ticker.split('-')[0] : 'Other',
        volume: market.dollar_volume || 0,
        volume24h: market.dollar_volume_24h || 0,
        liquidity: market.liquidity || 0,
        endDate: market.close_date,
        prices: {
          yes: market.yes_ask || market.last_price,
          no: market.no_ask || (100 - (market.last_price || 0))
        },
        outcomes: ['Yes', 'No'],
        slug: market.ticker,
        ticker: market.ticker,
        active: market.status === 'open',
        url: `https://kalshi.com/events/${market.event_ticker}/markets/${market.ticker}`,
        createdAt: market.created_time,
        updatedAt: market.updated_time,
        openInterest: market.open_interest || 0,
        lastPrice: market.last_price,
        previousPrice: market.previous_price
      }));
      
      predictions.push(...kalshiMarkets);
    }

    // Apply filters
    let filteredPredictions = predictions;

    // Search filter
    if (search && search.trim()) {
      const searchTerm = search.toLowerCase().trim();
      filteredPredictions = filteredPredictions.filter(prediction =>
        prediction.title.toLowerCase().includes(searchTerm) ||
        prediction.description.toLowerCase().includes(searchTerm) ||
        prediction.category.toLowerCase().includes(searchTerm)
      );
    }

    // Category filter
    if (category && category !== 'all') {
      filteredPredictions = filteredPredictions.filter(prediction =>
        prediction.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Platform filter (already handled in fetch logic, but keeping for consistency)
    if (platform && platform !== 'all') {
      filteredPredictions = filteredPredictions.filter(prediction =>
        prediction.platform === platform
      );
    }

    // Sort predictions
    switch (sortBy) {
      case 'volume':
        filteredPredictions.sort((a, b) => (b.volume || 0) - (a.volume || 0));
        break;
      case 'volume24h':
        filteredPredictions.sort((a, b) => (b.volume24h || 0) - (a.volume24h || 0));
        break;
      case 'liquidity':
        filteredPredictions.sort((a, b) => (b.liquidity || 0) - (a.liquidity || 0));
        break;
      case 'endDate':
        filteredPredictions.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
        break;
      case 'newest':
        filteredPredictions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        filteredPredictions.sort((a, b) => (b.volume || 0) - (a.volume || 0));
    }

    // Apply pagination
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedPredictions = filteredPredictions.slice(startIndex, endIndex);

    // Get unique categories for filtering
    const categories = [...new Set(predictions.map(p => p.category))].sort();

    // Calculate statistics
    const stats = {
      total: filteredPredictions.length,
      polymarket: predictions.filter(p => p.platform === 'polymarket').length,
      kalshi: predictions.filter(p => p.platform === 'kalshi').length,
      totalVolume: predictions.reduce((sum, p) => sum + (p.volume || 0), 0),
      totalVolume24h: predictions.reduce((sum, p) => sum + (p.volume24h || 0), 0),
      categories: categories.length
    };

    res.status(200).json({
      success: true,
      predictions: paginatedPredictions,
      meta: {
        total: filteredPredictions.length,
        count: paginatedPredictions.length,
        offset: parseInt(offset),
        limit: parseInt(limit),
        hasMore: endIndex < filteredPredictions.length,
        platforms: results.map(r => ({
          platform: r.platform,
          success: r.success,
          error: r.error || null
        })),
        filters: {
          platform,
          category,
          search,
          sortBy
        },
        categories,
        stats,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching combined predictions:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to fetch predictions from both platforms'
    });
  }
});

// @desc    Get prediction statistics from both platforms
// @route   GET /api/predictions/stats
// @access  Public
exports.getPredictionStats = asyncHandler(async (req, res, next) => {
  try {
    // Fetch basic stats from both platforms
    const [polymarketResponse, kalshiResponse] = await Promise.allSettled([
      axios.get(`${POLYMARKET_BASE_URL}/markets`, { 
        timeout: 10000,
        params: { limit: 1000 } 
      }),
      axios.get(`${KALSHI_BASE_URL}/markets`, { 
        timeout: 10000,
        params: { limit: 1000, status: 'open' }
      })
    ]);

    const stats = {
      polymarket: {
        available: polymarketResponse.status === 'fulfilled',
        totalMarkets: 0,
        totalVolume: 0,
        totalVolume24h: 0,
        activeMarkets: 0,
        categories: []
      },
      kalshi: {
        available: kalshiResponse.status === 'fulfilled',
        totalMarkets: 0,
        totalVolume: 0,
        totalVolume24h: 0,
        activeMarkets: 0,
        categories: []
      },
      combined: {
        totalMarkets: 0,
        totalVolume: 0,
        totalVolume24h: 0,
        activeMarkets: 0,
        platforms: 0
      }
    };

    // Process Polymarket stats
    if (polymarketResponse.status === 'fulfilled') {
      const markets = polymarketResponse.value.data || [];
      const activeMarkets = markets.filter(m => m.active && !m.closed);
      
      stats.polymarket.totalMarkets = markets.length;
      stats.polymarket.activeMarkets = activeMarkets.length;
      stats.polymarket.totalVolume = markets.reduce((sum, m) => sum + (parseFloat(m.volume) || 0), 0);
      stats.polymarket.totalVolume24h = markets.reduce((sum, m) => sum + (m.volume24hr || 0), 0);
      stats.polymarket.categories = [...new Set(markets.map(m => m.category).filter(Boolean))];
      stats.combined.platforms++;
    }

    // Process Kalshi stats
    if (kalshiResponse.status === 'fulfilled') {
      const markets = kalshiResponse.value.data?.markets || [];
      const activeMarkets = markets.filter(m => m.status === 'open');
      
      stats.kalshi.totalMarkets = markets.length;
      stats.kalshi.activeMarkets = activeMarkets.length;
      stats.kalshi.totalVolume = markets.reduce((sum, m) => sum + (m.dollar_volume || 0), 0);
      stats.kalshi.totalVolume24h = markets.reduce((sum, m) => sum + (m.dollar_volume_24h || 0), 0);
      stats.kalshi.categories = [...new Set(markets.map(m => {
        return m.event_ticker ? m.event_ticker.split('-')[0] : 'Other';
      }).filter(Boolean))];
      stats.combined.platforms++;
    }

    // Calculate combined stats
    stats.combined.totalMarkets = stats.polymarket.totalMarkets + stats.kalshi.totalMarkets;
    stats.combined.activeMarkets = stats.polymarket.activeMarkets + stats.kalshi.activeMarkets;
    stats.combined.totalVolume = stats.polymarket.totalVolume + stats.kalshi.totalVolume;
    stats.combined.totalVolume24h = stats.polymarket.totalVolume24h + stats.kalshi.totalVolume24h;

    res.status(200).json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching prediction stats:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to fetch prediction statistics'
    });
  }
});
