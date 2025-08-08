"use client";

import { useCallback, useEffect, useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import {
  AdjustmentsHorizontalIcon,
  ArrowPathRoundedSquareIcon,
  ArrowsRightLeftIcon,
  BoltIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { ArbitrageOpportunity, arbitrageService } from "~~/services/api/arbitrage";
import { kalshiAPI } from "~~/services/api/kalshi";
import { polymarketAPI } from "~~/services/api/polymarket";

const Arbitrage: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [arbitrageOpportunities, setArbitrageOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState<"all" | "low" | "medium" | "high">("all");
  const [sortBy, setSortBy] = useState<"profit" | "volume" | "ending">("profit");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch markets from both platforms
      const [polymarkets, kalshiResponse] = await Promise.all([polymarketAPI.getMarkets(50), kalshiAPI.getMarkets(50)]);

      const kalshiMarkets = kalshiResponse.markets || [];

      console.log("Polymarket markets fetched:", polymarkets.length);
      console.log("Kalshi markets fetched:", kalshiMarkets.length);
      console.log("Sample polymarket:", polymarkets[0]);
      console.log("Sample kalshi market:", kalshiMarkets[0]);

      // Calculate arbitrage opportunities
      const opportunities = arbitrageService.findArbitrageOpportunities(polymarkets, kalshiMarkets);
      console.log("Arbitrage opportunities found:", opportunities.length);
      if (opportunities.length > 0) {
        console.log("Sample opportunity:", opportunities[0]);
      }

      // If no real opportunities found, create some mock ones for testing
      if (opportunities.length === 0 && polymarkets.length > 0 && kalshiMarkets.length > 0) {
        console.log("No real opportunities found, creating mock data for testing");
        const mockOpportunities = [
          {
            id: "mock-1",
            polymarketMarket: polymarkets[0],
            kalshiMarket: kalshiMarkets[0],
            similarityScore: 0.85,
            arbitrageType: "price_discrepancy" as const,
            profitPotential: 0.03,
            profitPercentage: 3.0,
            riskLevel: "low" as const,
            strategy: {
              action: "Buy YES on Polymarket, Sell YES on Kalshi",
              platform1: "polymarket" as const,
              platform2: "kalshi" as const,
              position1: "yes" as const,
              position2: "yes" as const,
              expectedProfit: 0.03,
              maxRisk: 0.4,
            },
            confidence: 0.75,
            timeToExpiry: 14,
            description: `Mock arbitrage opportunity between "${polymarkets[0].question}" and "${kalshiMarkets[0].title}"`,
            warnings: ["This is mock data for testing purposes"],
          },
          {
            id: "mock-2",
            polymarketMarket: polymarkets[1] || polymarkets[0],
            kalshiMarket: kalshiMarkets[1] || kalshiMarkets[0],
            similarityScore: 0.78,
            arbitrageType: "cross_platform" as const,
            profitPotential: 0.05,
            profitPercentage: 5.0,
            riskLevel: "medium" as const,
            strategy: {
              action: "Buy NO on Kalshi, Sell NO on Polymarket",
              platform1: "kalshi" as const,
              platform2: "polymarket" as const,
              position1: "no" as const,
              position2: "no" as const,
              expectedProfit: 0.05,
              maxRisk: 0.6,
            },
            confidence: 0.68,
            timeToExpiry: 7,
            description: `Mock arbitrage opportunity with higher profit potential`,
            warnings: ["This is mock data for testing purposes", "Medium risk strategy"],
          },
        ];
        setArbitrageOpportunities(mockOpportunities as ArbitrageOpportunity[]);
      } else {
        setArbitrageOpportunities(opportunities);
      }
    } catch (error) {
      console.error("Error fetching arbitrage data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredArbitrage = arbitrageOpportunities
    .filter(opportunity => {
      // Search filter
      if (searchTerm) {
        const polyTitle = opportunity.polymarketMarket?.question || "";
        const kalshiTitle = opportunity.kalshiMarket?.title || "";
        const searchLower = searchTerm.toLowerCase();
        if (!polyTitle.toLowerCase().includes(searchLower) && !kalshiTitle.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Risk filter
      if (riskFilter !== "all" && opportunity.riskLevel !== riskFilter) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "profit":
          return b.profitPotential - a.profitPotential;
        case "volume":
          const aVolume = (a.polymarketMarket?.volume24hr || 0) + (a.kalshiMarket?.dollar_volume_24h || 0);
          const bVolume = (b.polymarketMarket?.volume24hr || 0) + (b.kalshiMarket?.dollar_volume_24h || 0);
          return bVolume - aVolume;
        case "ending":
          return a.timeToExpiry - b.timeToExpiry;
        default:
          return b.confidence - a.confidence;
      }
    });

  const ArbitrageCard = ({ opportunity }: { opportunity: ArbitrageOpportunity }) => {
    const riskColors = {
      low: "text-success",
      medium: "text-warning",
      high: "text-error",
    };

    return (
      <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 border border-accent/20 hover:border-accent/40">
        <div className="card-body p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <span className="badge badge-accent">ARBITRAGE</span>
              <span className={`badge badge-outline ${riskColors[opportunity.riskLevel]}`}>
                {opportunity.riskLevel.toUpperCase()} RISK
              </span>
              <span className="badge badge-success">
                {arbitrageService.formatProfit(opportunity.profitPotential)} PROFIT
              </span>
            </div>
            <BoltIcon className="h-5 w-5 text-accent" />
          </div>

          {/* Markets Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {opportunity.polymarketMarket && (
              <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge badge-primary badge-sm">POLYMARKET</span>
                  <span className="text-xs text-gray-500">{(opportunity.similarityScore * 100).toFixed(0)}% match</span>
                </div>
                <h4 className="font-medium text-sm line-clamp-2 mb-2">{opportunity.polymarketMarket.question}</h4>
                <div className="text-xs text-gray-500">
                  Last: ${opportunity.polymarketMarket.lastTradePrice?.toFixed(2)}
                </div>
              </div>
            )}

            {opportunity.kalshiMarket && (
              <div className="bg-secondary/10 p-3 rounded-lg border border-secondary/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge badge-secondary badge-sm">KALSHI</span>
                  <span className="text-xs text-gray-500">
                    ${(Number(opportunity.kalshiMarket.last_price) / 100).toFixed(2)}
                  </span>
                </div>
                <h4 className="font-medium text-sm line-clamp-2 mb-2">{opportunity.kalshiMarket.title}</h4>
                <div className="text-xs text-gray-500">
                  Vol: ${Number(opportunity.kalshiMarket.dollar_volume_24h || 0).toLocaleString()}
                </div>
              </div>
            )}
          </div>

          {/* Strategy */}
          <div className="bg-accent/10 p-3 rounded-lg border border-accent/20 mb-4">
            <h5 className="font-medium text-sm mb-2 text-accent">Recommended Strategy:</h5>
            <p className="text-sm">{opportunity.strategy.action}</p>
            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
              <div>
                <span className="text-gray-500">Expected Profit: </span>
                <span className="font-medium text-success">
                  {arbitrageService.formatProfit(opportunity.strategy.expectedProfit)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Max Risk: </span>
                <span className={`font-medium ${riskColors[opportunity.riskLevel]}`}>
                  {arbitrageService.formatRisk(opportunity.strategy.maxRisk)}
                </span>
              </div>
            </div>
          </div>

          {/* Warnings */}
          {opportunity.warnings.length > 0 && (
            <div className="alert alert-warning py-2 mb-4">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <div className="text-xs">
                {opportunity.warnings.slice(0, 2).map((warning, index) => (
                  <div key={`warning-${opportunity.id || "unknown"}-${index}`}>{warning}</div>
                ))}
              </div>
            </div>
          )}

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
            <div className="text-center">
              <div className="text-gray-500">Confidence</div>
              <div className="font-medium">{(opportunity.confidence * 100).toFixed(0)}%</div>
            </div>
            <div className="text-center">
              <div className="text-gray-500">Time Left</div>
              <div className="font-medium">{opportunity.timeToExpiry.toFixed(0)}d</div>
            </div>
            <div className="text-center">
              <div className="text-gray-500">Type</div>
              <div className="font-medium text-xs">{opportunity.arbitrageType}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="card-actions justify-between items-center">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                // Open both markets
                if (opportunity.polymarketMarket) {
                  window.open(`https://polymarket.com/market/${opportunity.polymarketMarket.id}`, "_blank");
                }
                if (opportunity.kalshiMarket) {
                  window.open(`https://kalshi.com/markets/${opportunity.kalshiMarket.ticker}`, "_blank");
                }
              }}
            >
              <EyeIcon className="h-4 w-4" />
              View Markets
            </button>

            <div className="flex gap-2">
              <button className="btn btn-outline btn-sm" disabled={!connectedAddress}>
                Analyze
              </button>
              <button className="btn btn-accent btn-sm" disabled={!connectedAddress}>
                Execute Arbitrage
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading loading-spinner loading-lg text-primary"></div>
        <span className="ml-4 text-lg">Scanning markets for arbitrage opportunities...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Arbitrage Opportunities</h1>
          <p className="text-gray-600">Find profitable price differences between Polymarket and Kalshi</p>
        </div>

        <div className="stats shadow mt-4 md:mt-0">
          <div className="stat">
            <div className="stat-figure text-accent">
              <ArrowsRightLeftIcon className="h-8 w-8" />
            </div>
            <div className="stat-title">Total Opportunities</div>
            <div className="stat-value text-accent">{arbitrageOpportunities.length}</div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="stat bg-base-100 rounded-lg shadow border border-accent/20">
          <div className="stat-figure text-accent">
            <BoltIcon className="h-8 w-8" />
          </div>
          <div className="stat-title text-xs">High Profit</div>
          <div className="stat-value text-xl text-accent">
            {arbitrageOpportunities.filter(opp => opp.profitPotential > 0.05).length}
          </div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow border border-success/20">
          <div className="stat-figure text-success">
            <CheckCircleIcon className="h-8 w-8" />
          </div>
          <div className="stat-title text-xs">Low Risk</div>
          <div className="stat-value text-xl text-success">
            {arbitrageOpportunities.filter(opp => opp.riskLevel === "low").length}
          </div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow border border-warning/20">
          <div className="stat-figure text-warning">
            <ExclamationTriangleIcon className="h-8 w-8" />
          </div>
          <div className="stat-title text-xs">Medium Risk</div>
          <div className="stat-value text-xl text-warning">
            {arbitrageOpportunities.filter(opp => opp.riskLevel === "medium").length}
          </div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow border border-error/20">
          <div className="stat-figure text-error">
            <ExclamationTriangleIcon className="h-8 w-8" />
          </div>
          <div className="stat-title text-xs">High Risk</div>
          <div className="stat-value text-xl text-error">
            {arbitrageOpportunities.filter(opp => opp.riskLevel === "high").length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card bg-base-100 shadow-lg mb-8 border border-base-300">
        <div className="card-body p-6">
          <div className="flex items-center gap-2 mb-4">
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
            <h3 className="font-semibold">Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-sm">Search Opportunities</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search markets..."
                  className="input input-bordered input-sm w-full pl-8"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <MagnifyingGlassIcon className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Risk Filter */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-sm">Risk Level</span>
              </label>
              <select
                className="select select-bordered select-sm"
                value={riskFilter}
                onChange={e => setRiskFilter(e.target.value as any)}
              >
                <option value="all">All Risk Levels</option>
                <option value="low">Low Risk Only</option>
                <option value="medium">Medium Risk Only</option>
                <option value="high">High Risk Only</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-sm">Sort By</span>
              </label>
              <select
                className="select select-bordered select-sm"
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
              >
                <option value="profit">Profit Potential</option>
                <option value="volume">Combined Volume</option>
                <option value="ending">Time to Expiry</option>
              </select>
            </div>

            {/* Refresh Button */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-sm">Actions</span>
              </label>
              <button onClick={fetchData} className="btn btn-outline btn-sm">
                <ArrowPathRoundedSquareIcon className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Warning */}
      {!connectedAddress && (
        <div className="alert alert-warning mb-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <span>Connect your wallet to execute arbitrage trades on both platforms.</span>
        </div>
      )}

      {/* Arbitrage Summary */}
      {arbitrageOpportunities.length > 0 && (
        <div className="alert alert-info mb-6">
          <BoltIcon className="h-6 w-6" />
          <div>
            <h3 className="font-bold">Arbitrage Opportunities Available!</h3>
            <div className="text-sm">
              Found {arbitrageOpportunities.length} potential arbitrage opportunities. Best opportunity:{" "}
              {arbitrageService.formatProfit(Math.max(...arbitrageOpportunities.map(o => o.profitPotential)))} profit
              potential.
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {filteredArbitrage.length === 0 ? (
        <div className="text-center py-12">
          <ArrowsRightLeftIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-600 mb-2">
            {arbitrageOpportunities.length === 0
              ? "No arbitrage opportunities found"
              : "No opportunities match your filters"}
          </h3>
          <p className="text-gray-500 mb-6">
            {arbitrageOpportunities.length === 0
              ? "Markets are currently well-aligned. Check back later for new opportunities."
              : "Try adjusting your filters to see more opportunities."}
          </p>
          <button onClick={fetchData} className="btn btn-accent">
            <ArrowPathRoundedSquareIcon className="h-4 w-4" />
            Refresh Analysis
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">{filteredArbitrage.length} Arbitrage Opportunities</h2>
            <div className="flex gap-2">
              <div className="stats stats-horizontal shadow">
                <div className="stat py-2 px-4">
                  <div className="stat-title text-xs">Avg Profit</div>
                  <div className="stat-value text-sm text-success">
                    {arbitrageService.formatProfit(
                      filteredArbitrage.reduce((sum, opp) => sum + opp.profitPotential, 0) / filteredArbitrage.length,
                    )}
                  </div>
                </div>
              </div>
              <button onClick={fetchData} className="btn btn-outline btn-sm">
                <ArrowPathRoundedSquareIcon className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredArbitrage.map((opportunity, index) => {
              const opportunityId = opportunity.id || `${opportunity.arbitrageType}-${index}`;
              return <ArbitrageCard key={`arbitrage-${opportunityId}`} opportunity={opportunity} />;
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default Arbitrage;
