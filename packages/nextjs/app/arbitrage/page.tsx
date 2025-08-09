"use client";

import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import {
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  BoltIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  FireIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

// Define the data structure based on the JSON file
interface ArbitrageOpportunity {
  score: number;
  factors: string[];
  polymarket: {
    eventId: string;
    eventSlug: string;
    eventDescription: string;
    marketId: string;
    marketQuestion: string;
    marketSlug: string;
    endDate: string;
    liquidity: number;
    tags: string[];
  };
  kalshi: {
    eventTicker: string;
    eventTitle: string;
    // Add other kalshi fields as needed
  };
}

interface ArbitrageData {
  metadata: {
    generatedAt: string;
    totalOpportunities: number;
    categories: {
      exact: number;
      high: number;
      medium: number;
      low: number;
    };
    thresholds: {
      EXACT_MATCH: number;
      HIGH_SIMILARITY: number;
      MEDIUM_SIMILARITY: number;
      LOW_SIMILARITY: number;
    };
  };
  opportunities: {
    exact: ArbitrageOpportunity[];
    high: ArbitrageOpportunity[];
    medium: ArbitrageOpportunity[];
    low: ArbitrageOpportunity[];
  };
}

const Arbitrage: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [arbitrageData, setArbitrageData] = useState<ArbitrageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [similarityFilter, setSimilarityFilter] = useState<"all" | "exact" | "high" | "medium" | "low">("all");
  const [minScore, setMinScore] = useState(50);
  const [sortBy, setSortBy] = useState<"score" | "liquidity" | "date">("score");
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const opportunitiesPerPage = 9;

  useEffect(() => {
    loadArbitrageData();
  }, []);

  const loadArbitrageData = async () => {
    try {
      setLoading(true);
      // In a real app, you'd fetch this from an API endpoint
      // For now, we'll simulate loading the data
      const mockData: ArbitrageData = {
        metadata: {
          generatedAt: "2025-08-09T17:31:06.895Z",
          totalOpportunities: 37863,
          categories: {
            exact: 0,
            high: 0,
            medium: 599,
            low: 37264
          },
          thresholds: {
            EXACT_MATCH: 0.95,
            HIGH_SIMILARITY: 0.8,
            MEDIUM_SIMILARITY: 0.6,
            LOW_SIMILARITY: 0.4
          }
        },
        opportunities: {
          exact: [],
          high: [],
          medium: Array.from({ length: 599 }, (_, index) => {
            // Generate varied scores between 0.6 and 0.79 (medium similarity range)
            const baseScore = 0.6 + (index * 0.19) / 598; // Spreads scores evenly
            
            // Generate varied topics and content
            const topics = [
              { category: "politics", topics: ["election", "congress", "president", "senate", "house", "policy", "legislation", "voting", "campaign", "debate"] },
              { category: "economy", topics: ["recession", "inflation", "gdp", "employment", "trade", "tariffs", "interest-rates", "stock-market", "housing", "consumer-spending"] },
              { category: "technology", topics: ["ai", "quantum-computing", "blockchain", "cybersecurity", "autonomous-vehicles", "space-tech", "biotech", "renewable-energy", "metaverse", "robotics"] },
              { category: "health", topics: ["vaccine", "disease", "treatment", "medical-breakthrough", "healthcare", "pharmaceuticals", "genetics", "mental-health", "pandemic", "clinical-trials"] },
              { category: "environment", topics: ["climate-change", "carbon-emissions", "renewable-energy", "conservation", "pollution", "sustainability", "wildlife", "oceans", "forests", "clean-tech"] },
              { category: "space", topics: ["mars-mission", "space-tourism", "satellite", "space-station", "moon-landing", "asteroid", "space-mining", "space-colony", "rocket-launch", "space-exploration"] },
              { category: "sports", topics: ["olympics", "world-cup", "championship", "playoffs", "tournament", "season", "championship-game", "super-bowl", "finals", "championship-series"] },
              { category: "entertainment", topics: ["movie", "television", "music", "awards", "box-office", "streaming", "concert", "festival", "album", "series"] },
              { category: "business", topics: ["merger", "acquisition", "ipo", "earnings", "revenue", "profit", "market-share", "expansion", "innovation", "startup"] },
              { category: "science", topics: ["research", "discovery", "breakthrough", "experiment", "publication", "nobel-prize", "innovation", "invention", "theory", "hypothesis"] }
            ];
            
            const selectedCategory = topics[index % topics.length];
            const selectedTopic = selectedCategory.topics[index % selectedCategory.topics.length];
            const year = 2024 + (index % 3); // Spread across 2024-2026
            
            // Generate realistic factors
            const titleSimilarity = 20 + (index % 40); // 20-60%
            const entityMatching = 50 + (index % 40); // 50-90%
            const dateProximity = index % 18; // 0-17 months
            
            return {
              score: baseScore,
              factors: [
                `Title similarity: ${titleSimilarity.toFixed(1)}%`,
                `Entity matching: ${entityMatching.toFixed(1)}%`,
                `Category match: Yes`,
                `Date proximity: ${dateProximity.toFixed(1)} months`
              ],
              polymarket: {
                eventId: (16000 + index).toString(),
                eventSlug: `${selectedTopic}-${year}-${index}`,
                eventDescription: `${selectedCategory.category} event in ${year}`,
                marketId: (516700 + index).toString(),
                marketQuestion: `Will ${selectedTopic} happen in ${year}?`,
                marketSlug: `${selectedTopic}-${year}`,
                endDate: new Date(year, 11, 31, 12, 0, 0).toISOString(),
                liquidity: 10000 + (index % 200000), // Varied liquidity from 10k to 210k
                tags: [selectedCategory.category, selectedTopic, year.toString()]
              },
              kalshi: {
                eventTicker: `KX${selectedTopic.toUpperCase().substring(0, 8)}-${year.toString().substring(2)}`,
                eventTitle: `${selectedTopic.charAt(0).toUpperCase() + selectedTopic.slice(1)} event occurs in ${year}?`
              }
            };
          }),
          low: []
        }
      };
      
      setArbitrageData(mockData);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Error loading arbitrage data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAllOpportunities = (): ArbitrageOpportunity[] => {
    if (!arbitrageData) return [];
    
    return [
      ...arbitrageData.opportunities.exact,
      ...arbitrageData.opportunities.high,
      ...arbitrageData.opportunities.medium,
      ...arbitrageData.opportunities.low
    ];
  };

  const filteredOpportunities = getAllOpportunities()
    .filter(op => {
      // Search filter
      if (
        searchTerm &&
        !op.polymarket.marketQuestion.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !op.kalshi.eventTitle.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Similarity filter
      if (similarityFilter !== "all") {
        if (similarityFilter === "exact" && !arbitrageData?.opportunities.exact.includes(op)) return false;
        if (similarityFilter === "high" && !arbitrageData?.opportunities.high.includes(op)) return false;
        if (similarityFilter === "medium" && !arbitrageData?.opportunities.medium.includes(op)) return false;
        if (similarityFilter === "low" && !arbitrageData?.opportunities.low.includes(op)) return false;
      }

      // Score filter
      if (op.score < minScore / 100) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "score":
          return b.score - a.score;
        case "liquidity":
          return b.polymarket.liquidity - a.polymarket.liquidity;
        case "date":
          return new Date(a.polymarket.endDate).getTime() - new Date(b.polymarket.endDate).getTime();
        default:
          return b.score - a.score;
      }
    });

  // Pagination logic
  const totalPages = Math.ceil(filteredOpportunities.length / opportunitiesPerPage);
  const startIndex = (currentPage - 1) * opportunitiesPerPage;
  const endIndex = startIndex + opportunitiesPerPage;
  const currentOpportunities = filteredOpportunities.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, similarityFilter, minScore, sortBy]);

  const getSimilarityColor = (score: number) => {
    if (score >= 0.95) return "badge-success";
    if (score >= 0.8) return "badge-warning";
    if (score >= 0.6) return "badge-info";
    return "badge-neutral";
  };

  const getSimilarityLabel = (score: number) => {
    if (score >= 0.95) return "EXACT";
    if (score >= 0.8) return "HIGH";
    if (score >= 0.6) return "MEDIUM";
    return "LOW";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Expired";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 7) return `${diffDays} days`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks`;
    return `${Math.ceil(diffDays / 30)} months`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const ArbitrageCard = ({ opportunity }: { opportunity: ArbitrageOpportunity }) => (
    <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 border border-base-300 hover:border-primary/30">
      <div className="card-body p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <span className={`badge ${getSimilarityColor(opportunity.score)} gap-1`}>
              {getSimilarityLabel(opportunity.score)}
            </span>
            <span className="badge badge-primary">{(opportunity.score * 100).toFixed(1)}%</span>
            {opportunity.score >= 0.8 && (
              <span className="badge badge-error gap-1">
                <FireIcon className="h-3 w-3" />
                HOT
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500">{formatDate(opportunity.polymarket.endDate)}</div>
        </div>

        {/* Market Questions */}
        <div className="space-y-3 mb-4">
          <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-xs font-medium text-primary">POLYMARKET</span>
            </div>
            <p className="text-sm font-medium line-clamp-2">
              {opportunity.polymarket.marketQuestion}
            </p>
            <div className="flex justify-between items-center mt-2 text-xs">
              <span>ID: {opportunity.polymarket.marketId}</span>
              <span className="text-gray-500">
                Liquidity: {formatCurrency(opportunity.polymarket.liquidity)}
              </span>
            </div>
          </div>

          <div className="bg-secondary/5 p-3 rounded-lg border border-secondary/20">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 bg-secondary rounded-full"></div>
              <span className="text-xs font-medium text-secondary">KALSHI</span>
            </div>
            <p className="text-sm font-medium line-clamp-2">{opportunity.kalshi.eventTitle}</p>
            <div className="flex justify-between items-center mt-2 text-xs">
              <span>Ticker: {opportunity.kalshi.eventTicker}</span>
            </div>
          </div>
        </div>

        {/* Similarity Details */}
        <div className="bg-success/5 p-3 rounded-lg border border-success/20 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-success">Similarity Score</span>
            <span className="text-lg font-bold text-success">
              {(opportunity.score * 100).toFixed(1)}%
            </span>
          </div>
          <div className="text-xs text-gray-600 space-y-1">
            {opportunity.factors.map((factor, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-1 h-1 bg-success rounded-full"></div>
                {factor}
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-center">
          <div>
            <div className="text-xs text-gray-500">Liquidity</div>
            <div className="font-semibold">{formatCurrency(opportunity.polymarket.liquidity)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Tags</div>
            <div className="font-semibold text-xs">
              {opportunity.polymarket.tags.slice(0, 2).join(", ")}
              {opportunity.polymarket.tags.length > 2 && "..."}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="card-actions justify-between items-center">
          <button className="btn btn-ghost btn-sm">
            <InformationCircleIcon className="h-4 w-4" />
            Details
          </button>

          <div className="flex gap-2">
            <button className="btn btn-outline btn-sm" disabled={!connectedAddress}>
              Analyze
            </button>
            <button className="btn btn-primary btn-sm" disabled={!connectedAddress}>
              <BoltIcon className="h-4 w-4" />
              Execute
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <ArrowPathIcon className="h-10 w-10 text-primary" />
            Arbitrage Opportunities
          </h1>
          <p className="text-gray-600">Pre-analyzed opportunities from {arbitrageData?.metadata.generatedAt ? new Date(arbitrageData.metadata.generatedAt).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'recent data'}</p>
        </div>

        <div className="flex items-center gap-4 mt-4 lg:mt-0">
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${loading ? "bg-warning animate-pulse" : "bg-success"}`}></div>
            <span>Last updated: {lastUpdated}</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={loadArbitrageData}
              className={`btn btn-outline btn-sm ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {!loading && <ArrowPathIcon className="h-4 w-4" />}
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      {arbitrageData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="stat bg-base-100 rounded-lg shadow border border-base-300">
            <div className="stat-figure text-primary">
              <ArrowTrendingUpIcon className="h-8 w-8" />
            </div>
            <div className="stat-title text-xs">Total Opportunities</div>
            <div className="stat-value text-2xl text-primary">{arbitrageData.metadata.totalOpportunities}</div>
          </div>

          <div className="stat bg-base-100 rounded-lg shadow border border-base-300">
            <div className="stat-figure text-success">
              <CurrencyDollarIcon className="h-8 w-8" />
            </div>
            <div className="stat-title text-xs">Exact Matches</div>
            <div className="stat-value text-2xl text-success">{arbitrageData.metadata.categories.exact}</div>
          </div>

          <div className="stat bg-base-100 rounded-lg shadow border border-base-300">
            <div className="stat-figure text-warning">
              <ShieldCheckIcon className="h-8 w-8" />
            </div>
            <div className="stat-title text-xs">High Similarity</div>
            <div className="stat-value text-2xl text-warning">{arbitrageData.metadata.categories.high}</div>
          </div>

          <div className="stat bg-base-100 rounded-lg shadow border border-base-300">
            <div className="stat-figure text-error">
              <FireIcon className="h-8 w-8" />
            </div>
            <div className="stat-title text-xs">Medium Similarity</div>
            <div className="stat-value text-2xl text-error">{arbitrageData.metadata.categories.medium}</div>
          </div>
        </div>
      )}

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
                <span className="label-text text-sm">Search Markets</span>
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

            {/* Similarity Filter */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-sm">Similarity Level</span>
              </label>
              <select
                className="select select-bordered select-sm"
                value={similarityFilter}
                onChange={e => setSimilarityFilter(e.target.value as any)}
              >
                <option value="all">All Levels</option>
                <option value="exact">Exact Match</option>
                <option value="high">High Similarity</option>
                <option value="medium">Medium Similarity</option>
                <option value="low">Low Similarity</option>
              </select>
            </div>

            {/* Min Score */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-sm">Similarity Score</span>
              </label>
              <input
                type="number"
                className="input input-bordered input-sm"
                value={minScore}
                onChange={e => setMinScore(Number(e.target.value))}
                min="0"
                max="100"
                step="1"
                placeholder="50"
              />
              <label className="label">
                <span className="label-text-alt text-xs">Min: 0%, Max: 100%</span>
              </label>
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
                <option value="score">Similarity Score</option>
                <option value="liquidity">Liquidity</option>
                <option value="date">End Date</option>
              </select>
            </div>
          </div>

          {/* Reset Filters Button */}
          <div className="flex justify-end mt-4">
            <button
              onClick={() => {
                setSearchTerm("");
                setSimilarityFilter("all");
                setMinScore(50);
                setSortBy("score");
              }}
              className="btn btn-outline btn-sm"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Connection Warning */}
      {!connectedAddress && (
        <div className="alert alert-warning mb-8">
          <ExclamationTriangleIcon className="h-6 w-6" />
          <span>Connect your wallet to execute arbitrage trades on both platforms.</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <span className="ml-4 text-lg">Loading arbitrage opportunities...</span>
        </div>
      )}

      {/* Opportunities Grid */}
      {!loading && (
        <>
          {filteredOpportunities.length === 0 ? (
            <div className="text-center py-12">
              <ArrowPathIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">No opportunities found</h3>
              <p className="text-gray-500 mb-4">
                {arbitrageData?.metadata.totalOpportunities === 0
                  ? "No arbitrage opportunities were found in the data."
                  : "Try adjusting your filters to see more opportunities."}
              </p>

              <button onClick={loadArbitrageData} className="btn btn-primary">
                <ArrowPathIcon className="h-4 w-4" />
                Refresh Data
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  {filteredOpportunities.length} Opportunities Found
                  {totalPages > 1 && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      (Page {currentPage} of {totalPages})
                    </span>
                  )}
                </h2>
                <div className="text-sm text-gray-500">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredOpportunities.length)} of {filteredOpportunities.length} results
                  {minScore > 0 && (
                    <span className="ml-2 text-xs bg-base-300 px-2 py-1 rounded">
                      Filtered by score ≥ {(minScore).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {currentOpportunities.map((opportunity, index) => (
                  <ArbitrageCard key={`${opportunity.polymarket.marketId}-${index}`} opportunity={opportunity} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="join">
                    <button
                      onClick={() => setCurrentPage(1)}
                      className="join-item btn btn-sm"
                      disabled={currentPage === 1}
                    >
                      First
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className="join-item btn btn-sm"
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    
                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`join-item btn btn-sm ${currentPage === pageNum ? 'btn-primary' : ''}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className="join-item btn btn-sm"
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="join-item btn btn-sm"
                      disabled={currentPage === totalPages}
                    >
                      Last
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Arbitrage;
