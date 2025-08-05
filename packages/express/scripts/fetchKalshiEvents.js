const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/kalshi';
const KALSHI_API_URL = 'https://api.elections.kalshi.com/trade-api/v2';
const LIMIT = 100;
const MAX_REQUESTS = 1000;

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

      // Build parameters - try simpler approach first
      const params = {
        limit: LIMIT,
        with_nested_markets: true,
        status: 'open'
      };
      
      // Add optional filters
      if (filters.series_ticker) {
        params.series_ticker = filters.series_ticker;
      }
      
      if (cursor) {
        params.cursor = cursor;
      }

      console.log(`📡 Request #${totalRequests}: Fetching events with cursor=${cursor || 'initial'}, limit=${LIMIT}, with_nested_markets=true, status=open`);
      console.log(`🔗 URL: ${KALSHI_API_URL}/events`);
      console.log(`📋 Params:`, params);
      
      // Make direct request to Kalshi API
      const response = await axios.get(`${KALSHI_API_URL}/events`, { 
        params,
        timeout: 10000 
      });
      
      if (response.data) {
        const data = response.data.events || [];
        const count = data.length;
        
        console.log(`✅ Received ${count} events`);
        console.log(`🔍 Response keys:`, Object.keys(response.data));
        console.log(`🔍 Cursor in response:`, response.data.cursor);
        
        if (count === 0) {
          console.log('📭 No more data found. Stopping...');
          hasMoreData = false;
        } else {
          allData.push(...data);
          console.log(`📊 Total events collected so far: ${allData.length}`);
          
          // Check for next cursor in the response
          if (response.data.cursor) {
            cursor = response.data.cursor;
            console.log(`⏭️  Moving to next page (cursor=${cursor})\n`);
          } else {
            console.log(`🏁 No more pages available. Stopping...`);
            hasMoreData = false;
          }
        }
      } else {
        console.error('❌ API returned no data');
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
        source: 'Kalshi API',
        offsetRange: offsetRange
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