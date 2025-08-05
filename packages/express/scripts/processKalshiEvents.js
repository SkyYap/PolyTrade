const fs = require('fs');
const path = require('path');

// Configuration
const INPUT_DIR = './'; // Directory containing the JSON files

function processKalshiEvents() {
  console.log('🔍 Looking for Kalshi events files...\n');

  try {
    // Find the most recent kalshi events file
    const files = fs.readdirSync(INPUT_DIR)
      .filter(file => file.startsWith('kalshi-events-offset(') && file.endsWith('.json'))
      .sort()
      .reverse(); // Most recent first

    if (files.length === 0) {
      console.error('❌ No Kalshi events files found!');
      console.log('💡 Run the fetch script first: node scripts/fetchKalshiData.js');
      return;
    }

    const latestFile = files[0];
    console.log(`📁 Processing file: ${latestFile}`);

    // Extract offset range from filename
    const offsetMatch = latestFile.match(/kalshi-events-offset\((\d+)-(\d+)\)/);
    let offsetRange = '';
    if (offsetMatch) {
      const startOffset = offsetMatch[1];
      const endOffset = offsetMatch[2];
      offsetRange = `-offset(${startOffset}-${endOffset})`;
    }

    // Read the raw data
    const rawData = JSON.parse(fs.readFileSync(latestFile, 'utf8'));
    const events = rawData.events || rawData;

    console.log(`📊 Found ${events.length} events to process\n`);

    // Process and filter events
    const processedEvents = events.map(event => {
      // Extract basic event fields
      const processedEvent = {
        event_ticker: event.event_ticker,
        sub_title: event.sub_title,
        title: event.title,
        category: event.category
      };

      // Filter and process markets
      if (event.markets && Array.isArray(event.markets)) {
        processedEvent.markets = event.markets.map(market => ({
          ticker: market.ticker,
          yes_sub_title: market.yes_sub_title,
          no_sub_title: market.no_sub_title,
          close_time: market.close_time,
          yes_ask: market.yes_ask,
          no_ask: market.no_ask,
          liquidity: market.liquidity,
          rules_primary: market.rules_primary,
          rules_secondary: market.rules_secondary
        }));
      } else {
        processedEvent.markets = [];
      }

      return processedEvent;
    });

    // Filter out events with no markets (optional - remove if you want all events)
    const eventsWithMarkets = processedEvents.filter(event => event.markets.length > 0);

    console.log(`✅ Processing complete!`);
    console.log(`📈 Original events: ${events.length}`);
    console.log(`📊 Events with markets: ${eventsWithMarkets.length}`);

    // Calculate statistics
    const totalMarkets = eventsWithMarkets.reduce((sum, event) => sum + event.markets.length, 0);
    const categories = [...new Set(eventsWithMarkets.map(event => event.category))];

    console.log(`🎯 Total markets: ${totalMarkets}`);
    console.log(`📂 Categories found: ${categories.length}`);

    // Save processed data
    const outputData = {
      metadata: {
        processedAt: new Date().toISOString(),
        sourceFile: latestFile,
        originalEvents: events.length,
        processedEvents: eventsWithMarkets.length,
        totalMarkets: totalMarkets,
        categories: categories,
        filters: {
          eventFields: 'event_ticker, sub_title, title, category',
          marketFields: 'ticker, yes_sub_title, no_sub_title, close_time, yes_ask, no_ask, liquidity, rules_primary, rules_secondary'
        }
      },
      events: eventsWithMarkets
    };

    // Generate output filename with offset range
    const outputFile = `processed-kalshi${offsetRange}.json`;
    
    fs.writeFileSync(outputFile, JSON.stringify(outputData, null, 2));
    console.log(`💾 Processed data saved to: ${outputFile}`);

    // Show sample data
    if (eventsWithMarkets.length > 0) {
      console.log('\n📋 Sample processed events:');
      eventsWithMarkets.slice(0, 2).forEach((event, index) => {
        console.log(`\n${index + 1}. Event: ${event.event_ticker} - ${event.title}`);
        console.log(`   Sub Title: ${event.sub_title}`);
        console.log(`   Category: ${event.category}`);
        console.log(`   Markets: ${event.markets.length}`);
        
        if (event.markets.length > 0) {
          console.log(`   Sample Market: ${event.markets[0].ticker}`);
          console.log(`     Yes: ${event.markets[0].yes_sub_title}`);
          console.log(`     No: ${event.markets[0].no_sub_title}`);
          console.log(`     Close Time: ${event.markets[0].close_time}`);
          console.log(`     Yes Ask: ${event.markets[0].yes_ask}¢ | No Ask: ${event.markets[0].no_ask}¢`);
          console.log(`     Liquidity: $${event.markets[0].liquidity?.toLocaleString() || 'N/A'}`);
        }
      });
    }

    // Generate summary report
    console.log('\n📊 Summary Report:');
    console.log('==================');
    console.log(`📁 Source: ${latestFile}`);
    console.log(`📈 Events processed: ${eventsWithMarkets.length}/${events.length}`);
    console.log(`🎯 Total markets found: ${totalMarkets}`);
    console.log(`📂 Categories: ${categories.join(', ')}`);
    console.log(`💾 Output: ${outputFile}`);

  } catch (error) {
    console.error('💥 Error processing events:', error.message);
    if (error.code === 'ENOENT') {
      console.log('💡 Make sure you have run the fetch script first!');
    }
  }
}

// Run the script
if (require.main === module) {
  processKalshiEvents();
}

module.exports = { processKalshiEvents }; 