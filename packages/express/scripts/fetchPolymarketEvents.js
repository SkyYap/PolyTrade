const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/polymarket/events';
const LIMIT = 100;
const MAX_REQUESTS = 10; // Maximum number of API requests to prevent infinite loops
const PARAMS = {
  active: true,
  closed: false,
  limit: LIMIT
};

async function fetchAllEvents() {
  let offset = 0;
  let allEvents = [];
  let hasMoreData = true;
  let totalRequests = 0;

  console.log('🚀 Starting to fetch all events from Polymarket API...\n');

  try {
    while (hasMoreData) {
      totalRequests++;
      
      // Check if we've reached the maximum number of requests
      if (totalRequests > MAX_REQUESTS) {
        console.log(`⚠️  Reached maximum requests limit (${MAX_REQUESTS}). Stopping...`);
        hasMoreData = false;
        break;
      }
      
      const currentParams = { ...PARAMS, offset };
      
      console.log(`📡 Request #${totalRequests}: Fetching events with offset=${offset}, limit=${LIMIT}`);
      
      const response = await axios.get(BASE_URL, { params: currentParams });
      
      if (response.data.success) {
        const events = response.data.data;
        const count = events.length;
        
        console.log(`✅ Received ${count} events`);
        
        if (count === 0) {
          console.log('📭 No more events found. Stopping...');
          hasMoreData = false;
        } else {
          allEvents.push(...events);
          console.log(`📊 Total events collected so far: ${allEvents.length}`);
          
          // If we got fewer results than the limit, we've reached the end
          if (count < LIMIT) {
            console.log(`🏁 Reached end of data (${count} < ${LIMIT}). Stopping...`);
            hasMoreData = false;
          } else {
            offset += LIMIT;
            console.log(`⏭️  Moving to next page (offset=${offset})\n`);
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
    console.log(`📈 Total events collected: ${allEvents.length}`);
    console.log(`🔄 Total API requests made: ${totalRequests}`);
    if (totalRequests >= MAX_REQUESTS) {
      console.log(`⚠️  Note: Stopped due to maximum requests limit (${MAX_REQUESTS})`);
    }
    
    // Save results to file
    const fs = require('fs');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const offsetRange = `offset(0-${allEvents.length})`;
    const filename = `polymarket-events-${offsetRange}-${timestamp}.json`;
    
    fs.writeFileSync(filename, JSON.stringify({
      metadata: {
        totalEvents: allEvents.length,
        totalRequests: totalRequests,
        fetchedAt: new Date().toISOString(),
        parameters: PARAMS,
        offsetRange: offsetRange
      },
      events: allEvents
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

// Run the script
if (require.main === module) {
  fetchAllEvents();
}

module.exports = { fetchAllEvents }; 