const fs = require('fs');
const path = require('path');

// Configuration
const INPUT_DIR = './'; // Directory containing the JSON files

function processEvents() {
  console.log('🔍 Looking for Polymarket events files...\n');

  try {
    // Find the most recent polymarket events file
    const files = fs.readdirSync(INPUT_DIR)
      .filter(file => file.startsWith('polymarket-events-') && file.endsWith('.json'))
      .sort()
      .reverse(); // Most recent first

    if (files.length === 0) {
      console.error('❌ No polymarket events files found!');
      console.log('💡 Run the fetch script first: node scripts/fetchAllEvents.js');
      return;
    }

    const latestFile = files[0];
    console.log(`📁 Processing file: ${latestFile}`);

    // Extract offset range from filename
    const offsetMatch = latestFile.match(/polymarket-events-offset\((\d+)-(\d+)\)/);
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
        id: event.id,
        slug: event.slug,
        description: event.description,
        tags: event.tags ? event.tags.map(tag => ({
          id: tag.id,
          slug: tag.slug
        })) : []
      };

      // Filter and process markets
      if (event.markets && Array.isArray(event.markets)) {
        processedEvent.markets = event.markets
          .filter(market => market.active === true && market.closed === false)
          .map(market => ({
            id: market.id,
            question: market.question,
            slug: market.slug,
            endDate: market.endDate,
            enableOrderBook: market.enableOrderBook,
            liquidityClob: market.liquidityClob
          }));
      } else {
        processedEvent.markets = [];
      }

      return processedEvent;
    });

    // Filter out events with no valid markets
    const eventsWithMarkets = processedEvents.filter(event => event.markets.length > 0);

    console.log(`✅ Processing complete!`);
    console.log(`📈 Original events: ${events.length}`);
    console.log(`📊 Events with active markets: ${eventsWithMarkets.length}`);

    // Calculate statistics
    const totalMarkets = eventsWithMarkets.reduce((sum, event) => sum + event.markets.length, 0);
    const totalTags = eventsWithMarkets.reduce((sum, event) => sum + event.tags.length, 0);

    console.log(`🎯 Total active markets: ${totalMarkets}`);
    console.log(`🏷️  Total tags: ${totalTags}`);

    // Save processed data
    const outputData = {
      metadata: {
        processedAt: new Date().toISOString(),
        sourceFile: latestFile,
        originalEvents: events.length,
        processedEvents: eventsWithMarkets.length,
        totalActiveMarkets: totalMarkets,
        totalTags: totalTags,
        filters: {
          markets: 'active: true, closed: false',
          fields: 'id, slug, description, tags.id, tags.slug, markets.id, markets.question, markets.slug, markets.endDate, markets.enableOrderBook, markets.liquidityClob'
        }
      },
      events: eventsWithMarkets
    };

    // Generate output filename with offset range
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFile = `processed-events${offsetRange}.json`;
    
    fs.writeFileSync(outputFile, JSON.stringify(outputData, null, 2));
    console.log(`💾 Processed data saved to: ${outputFile}`);

    // Show sample data
    if (eventsWithMarkets.length > 0) {
      console.log('\n📋 Sample processed events:');
      eventsWithMarkets.slice(0, 2).forEach((event, index) => {
        console.log(`\n${index + 1}. Event: ${event.slug} (ID: ${event.id})`);
        console.log(`   Description: ${event.description?.substring(0, 100)}...`);
        console.log(`   Tags: ${event.tags.map(t => t.slug).join(', ')}`);
        console.log(`   Active Markets: ${event.markets.length}`);
        
        if (event.markets.length > 0) {
          console.log(`   Sample Market: ${event.markets[0].question}`);
          console.log(`     End Date: ${event.markets[0].endDate}`);
          console.log(`     Order Book: ${event.markets[0].enableOrderBook ? 'Yes' : 'No'}`);
          console.log(`     Liquidity: $${event.markets[0].liquidityClob?.toLocaleString() || 'N/A'}`);
        }
      });
    }

    // Generate summary report
    console.log('\n📊 Summary Report:');
    console.log('==================');
    console.log(`📁 Source: ${latestFile}`);
    console.log(`📈 Events processed: ${eventsWithMarkets.length}/${events.length}`);
    console.log(`🎯 Active markets found: ${totalMarkets}`);
    console.log(`🏷️  Unique tags: ${new Set(eventsWithMarkets.flatMap(e => e.tags.map(t => t.slug))).size}`);
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
  processEvents();
}

module.exports = { processEvents }; 