const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/kalshi';
const KALSHI_API_URL = 'https://api.elections.kalshi.com/trade-api/v2';
const LIMIT = 10;
const MAX_REQUESTS = 10;

// Configuration for different data types
const DATA_TYPES = {
  MARKETS: 'markets',
  EVENTS: 'events'
};

async function fetchKalshiEvents(filters = {}) {
  let allData = [];
  let hasMoreData = true;
  let totalRequests = 0;
  let cursor = null;

  console.log(`🚀 Starting to fetch Kalshi events...\n`);

  try {
    while (hasMoreData) {
      totalRequests++;
      
      // Check if we've reached the maximum number of requests
      if (totalRequests > MAX_REQUESTS) {
        console.log(`⚠️  Reached maximum requests limit (${MAX_REQUESTS}). Stopping...`);
        hasMoreData = false;
        break;
      }

      // Build parameters
      const params = {
        limit: LIMIT,
        with_nested_markets: true,
        status: 'open'
      };
      
      // Add optional filters
      if (filters.series_ticker) {
        params.series_ticker = filters.series_ticker;
        console.log(`📊 Filtering by series: ${filters.series_ticker}`);
      }
      
      if (cursor) {
        params.cursor = cursor;
      }

      console.log(`📡 Request #${totalRequests}: Fetching events with cursor=${cursor || 'initial'}, limit=${LIMIT}`);
      
      // Make request through local API
      const response = await axios.get(`${BASE_URL}/events`, { 
        params,
        timeout: 10000 
      });
      
      if (response.data.success) {
        const data = response.data.data || [];
        const count = data.length;
        const responseCursor = response.data.meta?.cursor;
        
        console.log(`✅ Received ${count} events`);
        
        if (count === 0) {
          console.log('📭 No more data found. Stopping...');
          hasMoreData = false;
        } else {
          allData.push(...data);
          console.log(`📊 Total events collected so far: ${allData.length}`);
          
          // Check if there's a cursor for pagination
          if (responseCursor) {
            cursor = responseCursor;
            console.log(`📄 Next cursor: ${cursor}`);
            hasMoreData = true;
          } else {
            console.log(`📄 No more cursor available. Stopping pagination.`);
            hasMoreData = false;
          }
        }
      } else {
        console.error('❌ API returned error:', response.data.error);
        hasMoreData = false;
      }
      
      // Add a small delay to be respectful to the API
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n🎉 Fetch completed!');
    console.log(`📈 Total events collected: ${allData.length}`);
    console.log(`🔄 Total API requests made: ${totalRequests}`);
    
    // Save results to file
    const fs = require('fs');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const offsetRange = `offset(0-${allData.length})`;
    const filename = `kalshi-events-${offsetRange}-${timestamp}.json`;
    
    fs.writeFileSync(filename, JSON.stringify({
      metadata: {
        dataType: 'events',
        totalItems: allData.length,
        totalRequests: totalRequests,
        fetchedAt: new Date().toISOString(),
        filters: filters,
        source: 'Kalshi API via PolyTrade',
        offsetRange: offsetRange,
        parameters: {
          limit: LIMIT,
          with_nested_markets: true,
          status: 'open',
          ...filters
        }
      },
      events: allData
    }, null, 2));
    
    console.log(`💾 Results saved to: ${filename}`);

  } catch (error) {
    console.error('💥 Error occurred:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Main function to run fetch operations
async function main() {
  const args = process.argv.slice(2);
  
  console.log(`🎯 Fetching Kalshi events with required parameters\n`);
  
  const filters = {};
  
  // Add series filter if provided
  if (args[0]) {
    filters.series_ticker = args[0];
    console.log(`📊 Filtering by series: ${args[0]}`);
  }
  
  await fetchKalshiEvents(filters);
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { fetchKalshiEvents }; 