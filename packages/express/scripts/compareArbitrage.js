const fs = require('fs');
const path = require('path');

// Configuration
const INPUT_DIR = './';

function compareArbitrage() {
  console.log('🔍 Looking for processed events files to compare...\n');

  try {
    // Find the most recent processed files
    const polymarketFiles = fs.readdirSync(INPUT_DIR)
      .filter(file => file.startsWith('processed-polymarket-offset(') && file.endsWith('.json'))
      .sort()
      .reverse();

    const kalshiFiles = fs.readdirSync(INPUT_DIR)
      .filter(file => file.startsWith('processed-kalshi-offset(') && file.endsWith('.json'))
      .sort()
      .reverse();

    if (polymarketFiles.length === 0) {
      console.error('❌ No processed Polymarket files found!');
      console.log('💡 Run the Polymarket fetch and process scripts first');
      return;
    }

    if (kalshiFiles.length === 0) {
      console.error('❌ No processed Kalshi files found!');
      console.log('💡 Run the Kalshi fetch and process scripts first');
      return;
    }

    const latestPolymarketFile = polymarketFiles[0];
    const latestKalshiFile = kalshiFiles[0];

    console.log(`📁 Polymarket file: ${latestPolymarketFile}`);
    console.log(`📁 Kalshi file: ${latestKalshiFile}\n`);

    // Read the data
    const polymarketData = JSON.parse(fs.readFileSync(latestPolymarketFile, 'utf8'));
    const kalshiData = JSON.parse(fs.readFileSync(latestKalshiFile, 'utf8'));

    const polymarketEvents = polymarketData.events || [];
    const kalshiEvents = kalshiData.events || [];

    console.log(`📊 Polymarket events: ${polymarketEvents.length}`);
    console.log(`📊 Kalshi events: ${kalshiEvents.length}\n`);

    // Debug: Show sample titles
    console.log('🔍 Sample Polymarket titles:');
    polymarketEvents.slice(0, 3).forEach((event, i) => {
      console.log(`   ${i + 1}. ${event.title}`);
    });

    console.log('\n🔍 Sample Kalshi titles:');
    kalshiEvents.slice(0, 3).forEach((event, i) => {
      console.log(`   ${i + 1}. ${event.title}`);
    });
    console.log('');

    // Function to normalize text for comparison
    function normalizeText(text) {
      return text
        .toLowerCase()
        .replace(/[^\w\s]/g, '') // Remove special characters
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
    }

    // Function to calculate similarity score
    function calculateSimilarity(text1, text2) {
      const normalized1 = normalizeText(text1);
      const normalized2 = normalizeText(text2);
      
      if (normalized1 === normalized2) return 1.0;
      
      const words1 = normalized1.split(' ');
      const words2 = normalized2.split(' ');
      
      const commonWords = words1.filter(word => words2.includes(word));
      const totalWords = new Set([...words1, ...words2]).size;
      
      return commonWords.length / totalWords;
    }

    // Find potential matches
    const potentialMatches = [];
    const similarityThreshold = 0.6; // Adjust this threshold as needed

    console.log('🔍 Comparing events for potential arbitrage opportunities...\n');

    polymarketEvents.forEach(polyEvent => {
      kalshiEvents.forEach(kalshiEvent => {
        // Compare titles
        const titleSimilarity = calculateSimilarity(polyEvent.title || '', kalshiEvent.title || '');
        
        // Compare descriptions
        const descSimilarity = calculateSimilarity(polyEvent.description || '', kalshiEvent.title || '');
        
        // Use the higher similarity score
        const maxSimilarity = Math.max(titleSimilarity, descSimilarity);
        
        if (maxSimilarity >= similarityThreshold) {
          potentialMatches.push({
            similarity: maxSimilarity,
            polymarket: {
              id: polyEvent.id,
              title: polyEvent.title,
              description: polyEvent.description,
              slug: polyEvent.slug,
              markets: polyEvent.markets || []
            },
            kalshi: {
              event_ticker: kalshiEvent.event_ticker,
              title: kalshiEvent.title,
              sub_title: kalshiEvent.sub_title,
              category: kalshiEvent.category,
              markets: kalshiEvent.markets || []
            }
          });
        }
      });
    });

    // Sort by similarity score (highest first)
    potentialMatches.sort((a, b) => b.similarity - a.similarity);

    console.log(`✅ Found ${potentialMatches.length} potential arbitrage opportunities!\n`);

    // Save comparison results
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFile = `arbitrage-opportunities-${timestamp}.json`;
    
    const outputData = {
      metadata: {
        comparedAt: new Date().toISOString(),
        polymarketFile: latestPolymarketFile,
        kalshiFile: latestKalshiFile,
        polymarketEvents: polymarketEvents.length,
        kalshiEvents: kalshiEvents.length,
        similarityThreshold: similarityThreshold,
        totalMatches: potentialMatches.length
      },
      opportunities: potentialMatches
    };

    fs.writeFileSync(outputFile, JSON.stringify(outputData, null, 2));
    console.log(`💾 Comparison results saved to: ${outputFile}`);

    // Display top matches
    if (potentialMatches.length > 0) {
      console.log('\n🏆 Top Arbitrage Opportunities:');
      console.log('================================');
      
      potentialMatches.slice(0, 10).forEach((match, index) => {
        console.log(`\n${index + 1}. Similarity: ${(match.similarity * 100).toFixed(1)}%`);
        console.log(`📊 Polymarket: ${match.polymarket.title}`);
        console.log(`   ID: ${match.polymarket.id} | Slug: ${match.polymarket.slug}`);
        console.log(`   Markets: ${match.polymarket.markets.length}`);
        
        console.log(`🎯 Kalshi: ${match.kalshi.title}`);
        console.log(`   Ticker: ${match.kalshi.event_ticker} | Category: ${match.kalshi.category}`);
        console.log(`   Markets: ${match.kalshi.markets.length}`);
        
        // Show market details if available
        if (match.polymarket.markets.length > 0 && match.kalshi.markets.length > 0) {
          console.log(`   💰 Potential arbitrage between:`);
          console.log(`      PolyMarket: ${match.polymarket.markets[0].question}`);
          console.log(`      Kalshi: ${match.kalshi.markets[0].yes_sub_title} vs ${match.kalshi.markets[0].no_sub_title}`);
        }
      });
    }

    // Generate summary report
    console.log('\n📊 Summary Report:');
    console.log('==================');
    console.log(`📁 Polymarket: ${latestPolymarketFile}`);
    console.log(`📁 Kalshi: ${latestKalshiFile}`);
    console.log(`🔍 Similarity threshold: ${similarityThreshold * 100}%`);
    console.log(`🎯 Potential opportunities: ${potentialMatches.length}`);
    console.log(`💾 Output: ${outputFile}`);

    // Show similarity distribution
    if (potentialMatches.length > 0) {
      const highSimilarity = potentialMatches.filter(m => m.similarity >= 0.8).length;
      const mediumSimilarity = potentialMatches.filter(m => m.similarity >= 0.6 && m.similarity < 0.8).length;
      const lowSimilarity = potentialMatches.filter(m => m.similarity < 0.6).length;
      
      console.log(`\n📈 Similarity Distribution:`);
      console.log(`   High (≥80%): ${highSimilarity}`);
      console.log(`   Medium (60-79%): ${mediumSimilarity}`);
      console.log(`   Low (<60%): ${lowSimilarity}`);
    }

  } catch (error) {
    console.error('💥 Error comparing events:', error.message);
    if (error.code === 'ENOENT') {
      console.log('💡 Make sure you have run the fetch and process scripts first!');
    }
  }
}

// Run the script
if (require.main === module) {
  compareArbitrage();
}

module.exports = { compareArbitrage }; 