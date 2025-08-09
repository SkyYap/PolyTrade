const fs = require('fs');
const path = require('path');

// Configuration
const SIMILARITY_THRESHOLDS = {
  EXACT_MATCH: 0.95,
  HIGH_SIMILARITY: 0.8,
  MEDIUM_SIMILARITY: 0.6,
  LOW_SIMILARITY: 0.4
};

// Category mapping between platforms
const CATEGORY_MAPPING = {
  // Polymarket categories -> Kalshi categories
  'business': ['Economics', 'Financials', 'Companies'],
  'politics': ['Politics', 'Elections'],
  'sports': ['Sports'],
  'entertainment': ['Entertainment'],
  'technology': ['Science and Technology'],
  'health': ['Health'],
  'climate': ['Climate and Weather'],
  'world': ['World'],
  'economics': ['Economics', 'Financials'],
  'fed': ['Economics', 'Financials'],
  'elections': ['Elections', 'Politics'],
  'companies': ['Companies', 'Financials']
};

// Keywords that indicate similar markets
const ARBITRAGE_KEYWORDS = {
  'fed': ['federal reserve', 'fed rate', 'jerome powell', 'interest rate'],
  'election': ['election', 'president', 'presidential', 'vote', 'candidate'],
  'economy': ['gdp', 'recession', 'inflation', 'unemployment', 'economic'],
  'technology': ['ai', 'artificial intelligence', 'spacex', 'tesla', 'apple'],
  'politics': ['congress', 'senate', 'house', 'government', 'policy'],
  'sports': ['championship', 'playoff', 'final', 'champion', 'winner'],
  'entertainment': ['movie', 'film', 'album', 'award', 'oscar', 'grammy'],
  'climate': ['climate', 'weather', 'temperature', 'global warming', 'co2'],
  'health': ['fda', 'vaccine', 'cure', 'disease', 'medical', 'healthcare']
};

// Utility functions
function normalizeText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

function extractKeywords(text) {
  const normalized = normalizeText(text);
  const words = normalized.split(' ');
  return words.filter(word => word.length > 2); // Filter out short words
}

function calculateWordOverlap(text1, text2) {
  const words1 = new Set(extractKeywords(text1));
  const words2 = new Set(extractKeywords(text2));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return union.size > 0 ? intersection.size / union.size : 0;
}

function calculateSimilarity(text1, text2) {
  const normalized1 = normalizeText(text1);
  const normalized2 = normalizeText(text2);
  
  // Exact match
  if (normalized1 === normalized2) return 1.0;
  
  // Word overlap
  const wordOverlap = calculateWordOverlap(normalized1, normalized2);
  
  // Check for keyword matches
  let keywordBonus = 0;
  for (const [category, keywords] of Object.entries(ARBITRAGE_KEYWORDS)) {
    const hasKeyword1 = keywords.some(keyword => normalized1.includes(keyword));
    const hasKeyword2 = keywords.some(keyword => normalized2.includes(keyword));
    if (hasKeyword1 && hasKeyword2) {
      keywordBonus += 0.1;
    }
  }
  
  return Math.min(1.0, wordOverlap + keywordBonus);
}

function extractEntities(text) {
  const entities = {
    people: [],
    companies: [],
    dates: [],
    numbers: []
  };
  
  // Extract dates (YYYY, YYYY-MM, etc.)
  const dateMatches = text.match(/\b(20\d{2}(?:-\d{2})?)\b/g);
  if (dateMatches) entities.dates = dateMatches;
  
  // Extract numbers
  const numberMatches = text.match(/\b(\d+(?:\.\d+)?%?)\b/g);
  if (numberMatches) entities.numbers = numberMatches;
  
  // Extract potential company names (capitalized words)
  const companyMatches = text.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g);
  if (companyMatches) entities.companies = companyMatches;
  
  return entities;
}

function compareEntities(entities1, entities2) {
  let score = 0;
  let totalComparisons = 0;
  
  // Compare dates
  if (entities1.dates.length > 0 && entities2.dates.length > 0) {
    const dateMatches = entities1.dates.filter(date1 => 
      entities2.dates.some(date2 => date1 === date2)
    );
    score += dateMatches.length / Math.max(entities1.dates.length, entities2.dates.length);
    totalComparisons++;
  }
  
  // Compare numbers
  if (entities1.numbers.length > 0 && entities2.numbers.length > 0) {
    const numberMatches = entities1.numbers.filter(num1 => 
      entities2.numbers.some(num2 => num1 === num2)
    );
    score += numberMatches.length / Math.max(entities1.numbers.length, entities2.numbers.length);
    totalComparisons++;
  }
  
  // Compare companies
  if (entities1.companies.length > 0 && entities2.companies.length > 0) {
    const companyMatches = entities1.companies.filter(company1 => 
      entities2.companies.some(company2 => 
        calculateSimilarity(company1, company2) > 0.8
      )
    );
    score += companyMatches.length / Math.max(entities1.companies.length, entities2.companies.length);
    totalComparisons++;
  }
  
  return totalComparisons > 0 ? score / totalComparisons : 0;
}

function categorizeMarket(polymarketEvent, kalshiEvent) {
  // Extract categories from Polymarket tags
  const polyCategories = polymarketEvent.tags?.map(tag => tag.slug) || [];
  
  // Get Kalshi category
  const kalshiCategory = kalshiEvent.category;
  
  // Check category mapping
  for (const polyCategory of polyCategories) {
    const mappedCategories = CATEGORY_MAPPING[polyCategory];
    if (mappedCategories && mappedCategories.includes(kalshiCategory)) {
      return true;
    }
  }
  
  return false;
}

function calculateArbitrageScore(polymarketMarket, kalshiMarket, polymarketEvent, kalshiEvent) {
  let score = 0;
  let factors = [];
  
  // 1. Title/Question similarity
  const titleSimilarity = calculateSimilarity(
    polymarketMarket.question || polymarketEvent.description,
    kalshiMarket.yes_sub_title || kalshiEvent.title
  );
  score += titleSimilarity * 0.4;
  factors.push(`Title similarity: ${(titleSimilarity * 100).toFixed(1)}%`);
  
  // 2. Entity matching
  const polyEntities = extractEntities(polymarketMarket.question || polymarketEvent.description);
  const kalshiEntities = extractEntities(kalshiMarket.yes_sub_title || kalshiEvent.title);
  const entityScore = compareEntities(polyEntities, kalshiEntities);
  score += entityScore * 0.3;
  factors.push(`Entity matching: ${(entityScore * 100).toFixed(1)}%`);
  
  // 3. Category matching
  const categoryMatch = categorizeMarket(polymarketEvent, kalshiEvent);
  score += categoryMatch * 0.2;
  factors.push(`Category match: ${categoryMatch ? 'Yes' : 'No'}`);
  
  // 4. Date proximity (if available)
  if (polymarketMarket.endDate && kalshiMarket.close_time) {
    const polyDate = new Date(polymarketMarket.endDate);
    const kalshiDate = new Date(kalshiMarket.close_time);
    const dateDiff = Math.abs(polyDate - kalshiDate) / (1000 * 60 * 60 * 24 * 30); // months
    const dateScore = dateDiff < 3 ? 1.0 : dateDiff < 6 ? 0.5 : 0.1;
    score += dateScore * 0.1;
    factors.push(`Date proximity: ${dateDiff.toFixed(1)} months`);
  }
  
  return { score, factors };
}

function findArbitrageOpportunities(polymarketData, kalshiData) {
  const opportunities = [];
  
  console.log('🔍 Analyzing markets for arbitrage opportunities...');
  console.log(`📊 Polymarket events: ${polymarketData.events.length}`);
  console.log(`📊 Kalshi events: ${kalshiData.events.length}`);
  
  let totalComparisons = 0;
  
  for (const polyEvent of polymarketData.events) {
    for (const polyMarket of polyEvent.markets || []) {
      for (const kalshiEvent of kalshiData.events) {
        for (const kalshiMarket of kalshiEvent.markets || []) {
          totalComparisons++;
          
          const { score, factors } = calculateArbitrageScore(
            polyMarket, kalshiMarket, polyEvent, kalshiEvent
          );
          
          if (score >= SIMILARITY_THRESHOLDS.LOW_SIMILARITY) {
            opportunities.push({
              score,
              factors,
              polymarket: {
                eventId: polyEvent.id,
                eventSlug: polyEvent.slug,
                eventDescription: polyEvent.description,
                marketId: polyMarket.id,
                marketQuestion: polyMarket.question,
                marketSlug: polyMarket.slug,
                endDate: polyMarket.endDate,
                liquidity: polyMarket.liquidityClob,
                tags: polyEvent.tags?.map(t => t.slug) || []
              },
              kalshi: {
                eventTicker: kalshiEvent.event_ticker,
                eventTitle: kalshiEvent.title,
                eventSubTitle: kalshiEvent.sub_title,
                eventCategory: kalshiEvent.category,
                marketTicker: kalshiMarket.ticker,
                yesSubTitle: kalshiMarket.yes_sub_title,
                noSubTitle: kalshiMarket.no_sub_title,
                closeTime: kalshiMarket.close_time,
                yesAsk: kalshiMarket.yes_ask,
                noAsk: kalshiMarket.no_ask,
                liquidity: kalshiMarket.liquidity,
                rules: kalshiMarket.rules_primary
              }
            });
          }
        }
      }
    }
  }
  
  console.log(`🔍 Total comparisons made: ${totalComparisons.toLocaleString()}`);
  
  // Sort by score (highest first)
  opportunities.sort((a, b) => b.score - a.score);
  
  return opportunities;
}

function categorizeOpportunities(opportunities) {
  const categories = {
    exact: [],
    high: [],
    medium: [],
    low: []
  };
  
  for (const opp of opportunities) {
    if (opp.score >= SIMILARITY_THRESHOLDS.EXACT_MATCH) {
      categories.exact.push(opp);
    } else if (opp.score >= SIMILARITY_THRESHOLDS.HIGH_SIMILARITY) {
      categories.high.push(opp);
    } else if (opp.score >= SIMILARITY_THRESHOLDS.MEDIUM_SIMILARITY) {
      categories.medium.push(opp);
    } else if (opp.score >= SIMILARITY_THRESHOLDS.LOW_SIMILARITY) {
      categories.low.push(opp);
    }
  }
  
  return categories;
}

function generateReport(opportunities) {
  const categories = categorizeOpportunities(opportunities);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  const report = {
    metadata: {
      generatedAt: new Date().toISOString(),
      totalOpportunities: opportunities.length,
      categories: {
        exact: categories.exact.length,
        high: categories.high.length,
        medium: categories.medium.length,
        low: categories.low.length
      },
      thresholds: SIMILARITY_THRESHOLDS
    },
    opportunities: categories
  };
  
  // Save detailed report
  const filename = `arbitrage-opportunities-${timestamp}.json`;
  fs.writeFileSync(filename, JSON.stringify(report, null, 2));
  
  // Print summary
  console.log('\n🎯 ARBITRAGE OPPORTUNITIES SUMMARY');
  console.log('=====================================');
  console.log(`📈 Total opportunities found: ${opportunities.length}`);
  console.log(`🎯 Exact matches (≥${SIMILARITY_THRESHOLDS.EXACT_MATCH * 100}%): ${categories.exact.length}`);
  console.log(`🔥 High similarity (≥${SIMILARITY_THRESHOLDS.HIGH_SIMILARITY * 100}%): ${categories.high.length}`);
  console.log(`⚡ Medium similarity (≥${SIMILARITY_THRESHOLDS.MEDIUM_SIMILARITY * 100}%): ${categories.medium.length}`);
  console.log(`💡 Low similarity (≥${SIMILARITY_THRESHOLDS.LOW_SIMILARITY * 100}%): ${categories.low.length}`);
  console.log(`💾 Detailed report saved to: ${filename}`);
  
  // Show top opportunities
  if (opportunities.length > 0) {
    console.log('\n🏆 TOP 5 ARBITRAGE OPPORTUNITIES:');
    console.log('==================================');
    
    opportunities.slice(0, 5).forEach((opp, index) => {
      console.log(`\n${index + 1}. Score: ${(opp.score * 100).toFixed(1)}%`);
      console.log(`   Polymarket: ${opp.polymarket.marketQuestion}`);
      console.log(`   Kalshi: ${opp.kalshi.yesSubTitle}`);
      console.log(`   Factors: ${opp.factors.join(', ')}`);
    });
  }
  
  return report;
}

// Main function
async function main() {
  try {
    console.log('🚀 Advanced Arbitrage Detection System');
    console.log('=====================================\n');
    
    // Find latest processed files
    const files = fs.readdirSync('.');
    const polyFiles = files.filter(f => f.startsWith('processed-polymarket-offset'));
    const kalshiFiles = files.filter(f => f.startsWith('processed-kalshi-offset'));
    
    if (polyFiles.length === 0 || kalshiFiles.length === 0) {
      console.error('❌ No processed data files found. Please run the processing scripts first.');
      return;
    }
    
    // Get latest files
    const latestPolyFile = polyFiles.sort().pop();
    const latestKalshiFile = kalshiFiles.sort().pop();
    
    console.log(`📁 Loading Polymarket data: ${latestPolyFile}`);
    console.log(`📁 Loading Kalshi data: ${latestKalshiFile}\n`);
    
    const polymarketData = JSON.parse(fs.readFileSync(latestPolyFile, 'utf8'));
    const kalshiData = JSON.parse(fs.readFileSync(latestKalshiFile, 'utf8'));
    
    // Find arbitrage opportunities
    const opportunities = findArbitrageOpportunities(polymarketData, kalshiData);
    
    // Generate report
    generateReport(opportunities);
    
  } catch (error) {
    console.error('💥 Error:', error.message);
    console.error(error.stack);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  findArbitrageOpportunities,
  calculateArbitrageScore,
  categorizeOpportunities,
  generateReport
};
