// Arbitrage Service
import { KalshiMarket } from "./kalshi";
import { PolymarketMarket } from "./polymarket";

export interface ArbitrageOpportunity {
  id: string;
  polymarketMarket?: PolymarketMarket;
  kalshiMarket?: KalshiMarket;
  similarityScore: number;
  arbitrageType: "price_discrepancy" | "spread_arbitrage" | "cross_platform";
  profitPotential: number;
  profitPercentage: number;
  riskLevel: "low" | "medium" | "high";
  strategy: {
    action: string;
    platform1: "polymarket" | "kalshi";
    platform2: "polymarket" | "kalshi";
    position1: "yes" | "no";
    position2: "yes" | "no";
    expectedProfit: number;
    maxRisk: number;
  };
  confidence: number;
  timeToExpiry: number; // in days
  description: string;
  warnings: string[];
  polymarketOutcome?: "yes" | "no";
  kalshiOutcome?: "yes" | "no";
  polymarketPrice?: number;
  kalshiPrice?: number;
  priceDifference?: number;
  category?: string;
  matchScore?: number;
}

export interface MarketComparison {
  polymarketPrice: { yes: number; no: number };
  kalshiPrice: { yes: number; no: number };
  priceDifference: { yes: number; no: number };
  volumeComparison: { polymarket: number; kalshi: number };
  liquidityComparison: { polymarket: number; kalshi: number };
}

class ArbitrageService {
  private readonly SIMILARITY_THRESHOLD = 0.3; // Lowered from 0.7 to find more opportunities
  private readonly MIN_PROFIT_THRESHOLD = 0.01; // Lowered from 0.02 to 1% minimum profit
  private readonly MAX_RISK_THRESHOLD = 0.95; // 95% max risk

  calculateSimilarity(polymarketQuestion: string, kalshiTitle: string): number {
    // Enhanced text similarity using multiple methods
    const normalize = (text: string) =>
      text
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter(word => word.length > 2);

    const words1 = new Set(normalize(polymarketQuestion));
    const words2 = new Set(normalize(kalshiTitle));

    // Jaccard similarity (intersection over union)
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    const jaccardSimilarity = intersection.size / union.size;

    // Simple substring matching for common phrases
    const normalizedPoly = polymarketQuestion.toLowerCase();
    const normalizedKalshi = kalshiTitle.toLowerCase();

    let substringBonus = 0;
    if (normalizedPoly.includes("trump") && normalizedKalshi.includes("trump")) substringBonus += 0.3;
    if (normalizedPoly.includes("election") && normalizedKalshi.includes("election")) substringBonus += 0.3;
    if (normalizedPoly.includes("biden") && normalizedKalshi.includes("biden")) substringBonus += 0.3;
    if (normalizedPoly.includes("2024") && normalizedKalshi.includes("2024")) substringBonus += 0.2;
    if (normalizedPoly.includes("president") && normalizedKalshi.includes("president")) substringBonus += 0.2;

    return Math.min(1, jaccardSimilarity + substringBonus);
  }

  findArbitrageOpportunities(polymarkets: PolymarketMarket[], kalshiMarkets: KalshiMarket[]): ArbitrageOpportunity[] {
    console.log(
      `Starting arbitrage analysis with ${polymarkets.length} Polymarket and ${kalshiMarkets.length} Kalshi markets`,
    );
    const opportunities: ArbitrageOpportunity[] = [];
    let comparisonCount = 0;
    let similarityMatches = 0;

    // Find similar markets between platforms
    for (const polymarket of polymarkets) {
      for (const kalshi of kalshiMarkets) {
        comparisonCount++;
        const similarity = this.calculateSimilarity(polymarket.question, kalshi.title);

        if (similarity >= this.SIMILARITY_THRESHOLD) {
          similarityMatches++;
          console.log(
            `Similarity match found: ${similarity.toFixed(3)} between "${polymarket.question}" and "${kalshi.title}"`,
          );

          const comparison = this.compareMarkets(polymarket, kalshi);
          const arbitrage = this.analyzeArbitrage(polymarket, kalshi, comparison, similarity);

          if (arbitrage && arbitrage.profitPotential >= this.MIN_PROFIT_THRESHOLD) {
            console.log(`Profitable arbitrage found: ${arbitrage.profitPotential.toFixed(4)} profit potential`);
            opportunities.push(arbitrage);
          } else if (arbitrage) {
            console.log(
              `Arbitrage found but below profit threshold: ${arbitrage.profitPotential.toFixed(4)} < ${this.MIN_PROFIT_THRESHOLD}`,
            );
          }
        }
      }
    }

    console.log(
      `Analysis complete: ${comparisonCount} comparisons, ${similarityMatches} similarity matches, ${opportunities.length} profitable opportunities`,
    );

    // Sort by profit potential
    return opportunities.sort((a, b) => b.profitPotential - a.profitPotential);
  }

  private compareMarkets(polymarket: PolymarketMarket, kalshi: KalshiMarket): MarketComparison {
    // Parse Polymarket prices
    let polyYes = 0.5,
      polyNo = 0.5;
    try {
      const prices = JSON.parse(polymarket.outcomePrices || "[0.5, 0.5]");
      polyYes = Number(prices[0]) || 0.5;
      polyNo = Number(prices[1]) || 1 - polyYes;
    } catch {
      polyYes = polymarket.lastTradePrice || 0.5;
      polyNo = 1 - polyYes;
    }

    // Parse Kalshi prices (convert from cents to dollars)
    const kalshiYes = kalshi.last_price ? Number(kalshi.last_price) / 100 : 0.5;
    const kalshiNo = 1 - kalshiYes;

    return {
      polymarketPrice: { yes: polyYes, no: polyNo },
      kalshiPrice: { yes: kalshiYes, no: kalshiNo },
      priceDifference: {
        yes: Math.abs(polyYes - kalshiYes),
        no: Math.abs(polyNo - kalshiNo),
      },
      volumeComparison: {
        polymarket: polymarket.volume24hr || 0,
        kalshi: kalshi.dollar_volume_24h || 0,
      },
      liquidityComparison: {
        polymarket: polymarket.liquidityNum || 0,
        kalshi: kalshi.liquidity || 0,
      },
    };
  }

  private analyzeArbitrage(
    polymarket: PolymarketMarket,
    kalshi: KalshiMarket,
    comparison: MarketComparison,
    similarity: number,
  ): ArbitrageOpportunity | null {
    const { polymarketPrice, kalshiPrice, priceDifference } = comparison;

    // Find the biggest price discrepancy
    const yesDiff = priceDifference.yes;
    const noDiff = priceDifference.no;

    let strategy;
    let profitPotential = 0;
    let riskLevel: "low" | "medium" | "high" = "medium";
    const arbitrageType: "price_discrepancy" | "spread_arbitrage" | "cross_platform" = "price_discrepancy";

    if (yesDiff > noDiff && yesDiff > this.MIN_PROFIT_THRESHOLD) {
      // Arbitrage on YES position
      if (polymarketPrice.yes < kalshiPrice.yes) {
        // Buy YES on Polymarket, Sell YES on Kalshi
        strategy = {
          action: "Buy YES on Polymarket, Sell YES on Kalshi",
          platform1: "polymarket" as const,
          platform2: "kalshi" as const,
          position1: "yes" as const,
          position2: "yes" as const,
          expectedProfit: yesDiff,
          maxRisk: Math.max(polymarketPrice.yes, 1 - kalshiPrice.yes),
        };
        profitPotential = yesDiff;
      } else {
        // Buy YES on Kalshi, Sell YES on Polymarket
        strategy = {
          action: "Buy YES on Kalshi, Sell YES on Polymarket",
          platform1: "kalshi" as const,
          platform2: "polymarket" as const,
          position1: "yes" as const,
          position2: "yes" as const,
          expectedProfit: yesDiff,
          maxRisk: Math.max(kalshiPrice.yes, 1 - polymarketPrice.yes),
        };
        profitPotential = yesDiff;
      }
    } else if (noDiff > this.MIN_PROFIT_THRESHOLD) {
      // Arbitrage on NO position
      if (polymarketPrice.no < kalshiPrice.no) {
        strategy = {
          action: "Buy NO on Polymarket, Sell NO on Kalshi",
          platform1: "polymarket" as const,
          platform2: "kalshi" as const,
          position1: "no" as const,
          position2: "no" as const,
          expectedProfit: noDiff,
          maxRisk: Math.max(polymarketPrice.no, 1 - kalshiPrice.no),
        };
        profitPotential = noDiff;
      } else {
        strategy = {
          action: "Buy NO on Kalshi, Sell NO on Polymarket",
          platform1: "kalshi" as const,
          platform2: "polymarket" as const,
          position1: "no" as const,
          position2: "no" as const,
          expectedProfit: noDiff,
          maxRisk: Math.max(kalshiPrice.no, 1 - polymarketPrice.no),
        };
        profitPotential = noDiff;
      }
    } else {
      return null; // No profitable arbitrage found
    }

    // Determine risk level
    if (strategy.maxRisk > 0.8) riskLevel = "high";
    else if (strategy.maxRisk > 0.5) riskLevel = "medium";
    else riskLevel = "low";

    // Calculate time to expiry
    const polyEndTime = new Date(polymarket.endDate).getTime();
    const kalshiEndTime = new Date(kalshi.close_date).getTime();
    const earliestEnd = Math.min(polyEndTime, kalshiEndTime);
    const timeToExpiry = Math.max(0, (earliestEnd - Date.now()) / (1000 * 60 * 60 * 24));

    // Generate warnings
    const warnings: string[] = [];
    if (similarity < 0.9) warnings.push("Markets may not be perfectly aligned");
    if (timeToExpiry < 1) warnings.push("Market expires very soon - high time risk");
    if (comparison.volumeComparison.polymarket < 1000 || comparison.volumeComparison.kalshi < 1000) {
      warnings.push("Low volume markets - execution risk");
    }
    if (riskLevel === "high") warnings.push("High risk strategy - significant potential losses");

    return {
      id: `${polymarket.id}-${kalshi.ticker}`,
      polymarketMarket: polymarket,
      kalshiMarket: kalshi,
      similarityScore: similarity,
      arbitrageType,
      profitPotential,
      profitPercentage: profitPotential * 100, // Convert to percentage
      riskLevel,
      strategy,
      confidence: similarity * (1 - strategy.maxRisk) * Math.min(1, timeToExpiry / 7),
      timeToExpiry,
      description: `Arbitrage opportunity between "${polymarket.question}" on Polymarket and "${kalshi.title}" on Kalshi`,
      warnings,
      polymarketOutcome: strategy.position1 === "yes" ? "yes" : "no",
      kalshiOutcome: strategy.position2 === "yes" ? "yes" : "no",
      polymarketPrice: strategy.position1 === "yes" ? comparison.polymarketPrice.yes : comparison.polymarketPrice.no,
      kalshiPrice: strategy.position2 === "yes" ? comparison.kalshiPrice.yes : comparison.kalshiPrice.no,
      priceDifference:
        Math.abs(comparison.priceDifference.yes) > Math.abs(comparison.priceDifference.no)
          ? Math.abs(comparison.priceDifference.yes)
          : Math.abs(comparison.priceDifference.no),
      category: polymarket.category || "General",
      matchScore: Math.round(similarity * 100),
    };
  }

  calculatePortfolioRisk(opportunities: ArbitrageOpportunity[]): {
    totalExposure: number;
    diversificationScore: number;
    riskAdjustedReturn: number;
  } {
    if (opportunities.length === 0) {
      return { totalExposure: 0, diversificationScore: 0, riskAdjustedReturn: 0 };
    }

    const totalExposure = opportunities.reduce((sum, opp) => sum + opp.strategy.maxRisk, 0);

    // Simple diversification: number of different categories
    const categories = new Set();
    opportunities.forEach(opp => {
      if (opp.polymarketMarket?.category) categories.add(opp.polymarketMarket.category);
      if (opp.kalshiMarket?.tags) opp.kalshiMarket.tags.forEach(tag => categories.add(tag));
    });
    const diversificationScore = Math.min(1, categories.size / 5); // Normalized to max 5 categories

    const totalPotentialProfit = opportunities.reduce((sum, opp) => sum + opp.profitPotential, 0);
    const riskAdjustedReturn = totalPotentialProfit / Math.max(totalExposure, 0.01);

    return {
      totalExposure,
      diversificationScore,
      riskAdjustedReturn,
    };
  }

  filterOpportunitiesByRisk(
    opportunities: ArbitrageOpportunity[],
    maxRisk: "low" | "medium" | "high" = "medium",
  ): ArbitrageOpportunity[] {
    const riskLevels = { low: 1, medium: 2, high: 3 };
    const maxRiskLevel = riskLevels[maxRisk];

    return opportunities.filter(opp => riskLevels[opp.riskLevel] <= maxRiskLevel);
  }

  formatProfit(profit: number): string {
    return `${(profit * 100).toFixed(2)}%`;
  }

  formatRisk(risk: number): string {
    return `${(risk * 100).toFixed(1)}%`;
  }
}

export const arbitrageService = new ArbitrageService();
