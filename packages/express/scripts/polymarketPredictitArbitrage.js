const axios = require('axios');
const fs = require('fs');

// Configuration
const POLYMARKET_HOST = "https://clob.polymarket.com";
const PREDICTIT_API_URL = 'https://www.predictit.org/api/marketdata/all/';

// You'll need to set your Polymarket API key
const POLYMARKET_API_KEY = process.env.POLYMARKET_API_KEY || "YOUR_POLYMARKET_KEY_HERE";

// Simple sentence similarity using basic text comparison
// For production, you might want to use a proper NLP library
function calculateSimilarity(str1, str2) {
  const words1 = str1.toLowerCase().split(/\s+/);
  const words2 = str2.toLowerCase().split(/\s+/);
  const intersection = words1.filter(word => words2.includes(word));
  const union = [...new Set([...words1, ...words2])];
  return intersection.length / union.length;
}

function findSimilarQuestion(inputQuestion, marketsData, similarityThreshold = 0.7) {
  let bestMatch = null;
  let bestScore = 0;

  for (const market of marketsData) {
    const score = calculateSimilarity(inputQuestion, market.question);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = market;
    }
  }

  if (bestScore >= similarityThreshold) {
    return {
      question: bestMatch.question,
      tokens: bestMatch.tokens,
      conditionId: bestMatch.condition_id,
      similarityScore: bestScore
    };
  }

  return null;
}

function timeDifferenceFromNow(dateString) {
  const targetDate = new Date(dateString);
  const currentTime = new Date();
  const timeDifference = currentTime - targetDate;
  const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  return days;
}

async function getPolymarketValues(inputQuestion, marketsData, client) {
  const match = findSimilarQuestion(inputQuestion, marketsData);
  
  if (!match) {
    return { question: null, daysTillEnd: null, bestSellYes: null, bestSellNo: null };
  }

  let bestSellYes = null;
  let bestSellNo = null;

  // Get prices for Yes/No tokens
  for (const token of match.tokens) {
    try {
      if (token.outcome === 'Yes') {
        const response = await client.get(`/price?token_id=${token.token_id}&side=SELL`);
        bestSellYes = response.data.price;
      } else {
        const response = await client.get(`/price?token_id=${token.token_id}&side=SELL`);
        bestSellNo = response.data.price;
      }
    } catch (error) {
      console.error(`Error fetching price for token ${token.token_id}:`, error.message);
    }
  }

  let daysTillEnd = null;
  try {
    const marketResponse = await client.get(`/market/${match.conditionId}`);
    daysTillEnd = timeDifferenceFromNow(marketResponse.data.end_date_iso);
  } catch (error) {
    console.error(`Error fetching market data:`, error.message);
  }

  return {
    question: match.question,
    daysTillEnd,
    bestSellYes,
    bestSellNo
  };
}

function checkForArbitrage(bestYesPolymarket, bestNoPolymarket, bestYesPredictit, bestNoPredictit) {
  // Check for buying yes polymarket, buying no predictit
  if (bestYesPolymarket + bestNoPredictit < 1) {
    const sharesPurchased = 1000 * (1 / (bestYesPolymarket + bestNoPredictit));
    const polymarketInvestment = sharesPurchased * bestYesPolymarket;
    const predictitInvestment = sharesPurchased * bestNoPredictit;

    // If no_predictit wins (remove 10% predictit cap gains fee)
    const noProfit = 0.99 * sharesPurchased - 0.1 * (0.99 - bestNoPredictit) * sharesPurchased - 1000;
    
    // If yes_polymarket wins
    const yesProfit = 0.01 * sharesPurchased + sharesPurchased - 1000;

    if (yesProfit > 0 && noProfit > 0) {
      return { yesProfit, noProfit, sharesPurchased };
    }
  } else if (bestYesPredictit + bestNoPolymarket < 1) {
    const sharesPurchased = 1000 * (1 / (bestYesPredictit + bestNoPolymarket));
    const polymarketInvestment = sharesPurchased * bestYesPredictit;
    const predictitInvestment = sharesPurchased * bestNoPolymarket;

    // If no_polymarket wins
    const noProfit = 0.01 * sharesPurchased + sharesPurchased - 1000;
    
    // If yes_predictit wins (remove 10% predictit cap gains fee)
    const yesProfit = 0.99 * sharesPurchased - 0.1 * (0.99 - bestYesPredictit) * sharesPurchased - 1000;

    if (yesProfit > 0 && noProfit > 0) {
      return { yesProfit, noProfit, sharesPurchased };
    }
  }

  return null;
}

async function getAllPolymarketMarkets(client) {
  let allMarkets = [];
  let cursor = "";

  console.log("🔍 Fetching all Polymarket markets...");

  while (true) {
    try {
      const response = await client.get('/sampling_markets', {
        params: { next_cursor: cursor }
      });

      const markets = response.data.data || [];
      allMarkets.push(...markets);
      
      cursor = response.data.next_cursor;
      
      if (!cursor) {
        break;
      }

      console.log(`📊 Fetched ${markets.length} markets, total: ${allMarkets.length}`);
      
      // Add delay to be respectful to API
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error("Error fetching Polymarket markets:", error.message);
      break;
    }
  }

  // Filter active markets
  const activeMarkets = allMarkets.filter(market => market.active === true);
  console.log(`✅ Total active markets: ${activeMarkets.length}`);

  return activeMarkets.map(market => ({
    condition_id: market.condition_id,
    question_id: market.question_id,
    question: market.question,
    tokens: market.tokens
  }));
}

async function getPredictitMarkets() {
  console.log("🔍 Fetching PredictIt markets...");
  
  try {
    const response = await axios.get(PREDICTIT_API_URL);
    
    if (response.status === 200) {
      const data = response.data;
      console.log(`✅ Fetched ${data.markets?.length || 0} PredictIt markets`);
      return data.markets || [];
    } else {
      console.error(`Failed to retrieve PredictIt data: Status code ${response.status}`);
      return [];
    }
  } catch (error) {
    console.error("Error fetching PredictIt markets:", error.message);
    return [];
  }
}

async function findArbitrageOpportunities() {
  if (POLYMARKET_API_KEY === "YOUR_POLYMARKET_KEY_HERE") {
    console.error("❌ Please set your POLYMARKET_API_KEY environment variable");
    return;
  }

  // Create Polymarket client
  const polymarketClient = axios.create({
    baseURL: POLYMARKET_HOST,
    headers: {
      'Authorization': `Bearer ${POLYMARKET_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  try {
    // Get all markets from both platforms
    const [polymarketMarkets, predictitMarkets] = await Promise.all([
      getAllPolymarketMarkets(polymarketClient),
      getPredictitMarkets()
    ]);

    console.log("\n🔍 Starting arbitrage analysis...\n");

    const arbitrageOpportunities = [];

    // Analyze each PredictIt market
    for (const market of predictitMarkets) {
      for (const contract of market.contracts) {
        let question;
        
        // Construct question similar to Python version
        if (market.name.toLowerCase() !== contract.name.toLowerCase()) {
          const winIndex = market.name.toLowerCase().indexOf("win");
          if (winIndex !== -1) {
            question = "Will " + contract.name + " " + market.name.substring(winIndex);
          } else {
            continue; // Skip markets without "win" in name
          }
        } else {
          question = contract.name;
        }

        // Get Polymarket values
        const polymarketData = await getPolymarketValues(question, polymarketMarkets, polymarketClient);

        if (polymarketData.question) {
          const bestYesPolymarket = parseFloat(polymarketData.bestSellYes);
          const bestNoPolymarket = parseFloat(polymarketData.bestSellNo);
          const bestYesPredictit = contract.bestBuyYesCost;
          const bestNoPredictit = contract.bestBuyNoCost;

          if (bestYesPredictit && bestNoPredictit && !isNaN(bestYesPolymarket) && !isNaN(bestNoPolymarket)) {
            const arbitrage = checkForArbitrage(
              bestYesPolymarket, 
              bestNoPolymarket, 
              bestYesPredictit, 
              bestNoPredictit
            );

            if (arbitrage) {
              const opportunity = {
                question,
                bestYesPolymarket,
                bestNoPolymarket,
                bestYesPredictit,
                bestNoPredictit,
                sharesPurchased: arbitrage.sharesPurchased,
                yesProfit: arbitrage.yesProfit,
                noProfit: arbitrage.noProfit,
                daysTillEnd: polymarketData.daysTillEnd
              };

              arbitrageOpportunities.push(opportunity);

              // Print opportunity details
              console.log(`💰 Found arbitrage in: ${question}`);
              console.log(`  Best YES Polymarket: $${bestYesPolymarket.toFixed(3)}`);
              console.log(`  Best NO  Polymarket: $${bestNoPolymarket.toFixed(3)}`);
              console.log(`  Best YES Predictit:  $${bestYesPredictit.toFixed(3)}`);
              console.log(`  Best NO  Predictit:  $${bestNoPredictit.toFixed(3)}`);
              console.log(`  Shares   Purchased:   ${arbitrage.sharesPurchased.toFixed(2)}`);

              if (polymarketData.daysTillEnd !== null) {
                const daysTillEnd = parseFloat(polymarketData.daysTillEnd);
                const yesYearlyReturn = Math.pow(1 + arbitrage.yesProfit / 1000, 365.25 / daysTillEnd) - 1;
                const noYearlyReturn = Math.pow(1 + arbitrage.noProfit / 1000, 365.25 / daysTillEnd) - 1;

                console.log(`  YES Profit: $${arbitrage.yesProfit.toFixed(2)}. Implied yearly return: ${(yesYearlyReturn * 100).toFixed(2)}%`);
                console.log(`  NO  Profit: $${arbitrage.noProfit.toFixed(2)}. Implied yearly return: ${(noYearlyReturn * 100).toFixed(2)}%`);

                // Account for 5% withdrawal fee
                if (bestYesPolymarket > bestYesPredictit) {
                  const yesProfitAfterFee = arbitrage.yesProfit - 50;
                  const noProfitAfterFee = arbitrage.noProfit;
                  const yesYearlyReturnAfterFee = Math.pow(1 + yesProfitAfterFee / 1000, 365.25 / daysTillEnd) - 1;
                  const noYearlyReturnAfterFee = Math.pow(1 + noProfitAfterFee / 1000, 365.25 / daysTillEnd) - 1;
                  
                  console.log(`    YES Profit % after 5% withdrawal fee: ${(yesYearlyReturnAfterFee * 100).toFixed(2)}%`);
                  console.log(`    NO  Profit % after 5% withdrawal fee: ${(noYearlyReturnAfterFee * 100).toFixed(2)}%`);
                } else {
                  const yesProfitAfterFee = arbitrage.yesProfit;
                  const noProfitAfterFee = arbitrage.noProfit - 50;
                  const yesYearlyReturnAfterFee = Math.pow(1 + yesProfitAfterFee / 1000, 365.25 / daysTillEnd) - 1;
                  const noYearlyReturnAfterFee = Math.pow(1 + noProfitAfterFee / 1000, 365.25 / daysTillEnd) - 1;
                  
                  console.log(`    YES Profit % after 5% withdrawal fee: ${(yesYearlyReturnAfterFee * 100).toFixed(2)}%`);
                  console.log(`    NO  Profit % after 5% withdrawal fee: ${(noYearlyReturnAfterFee * 100).toFixed(2)}%`);
                }
              } else {
                console.log(`  YES Profit: $${arbitrage.yesProfit.toFixed(2)}`);
                console.log(`  NO  Profit: $${arbitrage.noProfit.toFixed(2)}`);
              }
              console.log("");
            }
          }
        }
      }
    }

    // Save results
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `arbitrage-opportunities-${timestamp}.json`;
    
    fs.writeFileSync(filename, JSON.stringify({
      metadata: {
        totalOpportunities: arbitrageOpportunities.length,
        analyzedAt: new Date().toISOString(),
        polymarketMarkets: polymarketMarkets.length,
        predictitMarkets: predictitMarkets.length
      },
      opportunities: arbitrageOpportunities
    }, null, 2));

    console.log(`\n🎉 Analysis complete!`);
    console.log(`📊 Found ${arbitrageOpportunities.length} arbitrage opportunities`);
    console.log(`💾 Results saved to: ${filename}`);

  } catch (error) {
    console.error("💥 Error during arbitrage analysis:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
  }
}

// Main function
async function main() {
  console.log("🚀 Starting Polymarket-PredictIt Arbitrage Analysis\n");
  await findArbitrageOpportunities();
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { findArbitrageOpportunities }; 