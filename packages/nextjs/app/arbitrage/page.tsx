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
import { ArbitrageOpportunity, arbitrageService } from "~~/services/api/arbitrage";
import { kalshiAPI } from "~~/services/api/kalshi";
import { polymarketAPI } from "~~/services/api/polymarket";

const Arbitrage: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState<"all" | "low" | "medium" | "high">("all");
  const [minProfit, setMinProfit] = useState(2);
  const [sortBy, setSortBy] = useState<"profit" | "confidence" | "time">("profit");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchOpportunities();

    if (autoRefresh) {
      const interval = setInterval(fetchOpportunities, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);

      // Fetch markets from both platforms
      const [polymarkets, kalshiResponse] = await Promise.all([polymarketAPI.getMarkets(50), kalshiAPI.getMarkets(50)]);

      const kalshiMarkets = kalshiResponse.markets || [];

      // Find arbitrage opportunities
      const ops = arbitrageService.findArbitrageOpportunities(polymarkets, kalshiMarkets);
      setOpportunities(ops);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching arbitrage opportunities:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOpportunities = opportunities
    .filter(op => {
      // Search filter
      if (
        searchTerm &&
        !op.polymarketMarket?.question.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !op.kalshiMarket?.title.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Risk filter
      if (riskFilter !== "all" && op.riskLevel !== riskFilter) {
        return false;
      }

      // Profit filter
      if ((op.profitPercentage || 0) < minProfit) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "profit":
          return (b.profitPercentage || 0) - (a.profitPercentage || 0);
        case "confidence":
          return b.confidence - a.confidence;
        case "time":
          return a.timeToExpiry - b.timeToExpiry;
        default:
          return (b.profitPercentage || 0) - (a.profitPercentage || 0);
      }
    });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "badge-success";
      case "medium":
        return "badge-warning";
      case "high":
        return "badge-error";
      default:
        return "badge-neutral";
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "low":
        return <ShieldCheckIcon className="h-3 w-3" />;
      case "medium":
        return <ExclamationTriangleIcon className="h-3 w-3" />;
      case "high":
        return <ExclamationTriangleIcon className="h-3 w-3" />;
      default:
        return <ShieldCheckIcon className="h-3 w-3" />;
    }
  };

  const formatTime = (hours: number) => {
    if (hours < 24) return `${Math.round(hours)}h`;
    if (hours < 168) return `${Math.round(hours / 24)}d`;
    return `${Math.round(hours / 168)}w`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(amount);
  };

  const ArbitrageCard = ({ opportunity }: { opportunity: ArbitrageOpportunity }) => (
    <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 border border-base-300 hover:border-primary/30">
      <div className="card-body p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <span className={`badge ${getRiskColor(opportunity.riskLevel)} gap-1`}>
              {getRiskIcon(opportunity.riskLevel)}
              {opportunity.riskLevel.toUpperCase()}
            </span>
            <span className="badge badge-primary">{(Number(opportunity.profitPercentage) || 0).toFixed(2)}%</span>
            {(opportunity.profitPercentage || 0) >= 10 && (
              <span className="badge badge-error gap-1">
                <FireIcon className="h-3 w-3" />
                HOT
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500">{formatTime(opportunity.timeToExpiry)} left</div>
        </div>

        {/* Market Questions */}
        <div className="space-y-3 mb-4">
          <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-xs font-medium text-primary">POLYMARKET</span>
            </div>
            <p className="text-sm font-medium line-clamp-2">
              {opportunity.polymarketMarket?.question || "Unknown market"}
            </p>
            <div className="flex justify-between items-center mt-2 text-xs">
              <span>
                {(opportunity.polymarketOutcome || "yes").toUpperCase()}:{" "}
                {formatCurrency(opportunity.polymarketPrice || 0)}
              </span>
              <span className="text-gray-500">
                Vol: {formatCurrency(opportunity.polymarketMarket?.volume24hr || 0)}
              </span>
            </div>
          </div>

          <div className="bg-secondary/5 p-3 rounded-lg border border-secondary/20">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 bg-secondary rounded-full"></div>
              <span className="text-xs font-medium text-secondary">KALSHI</span>
            </div>
            <p className="text-sm font-medium line-clamp-2">{opportunity.kalshiMarket?.title || "Unknown market"}</p>
            <div className="flex justify-between items-center mt-2 text-xs">
              <span>
                {(opportunity.kalshiOutcome || "yes").toUpperCase()}: {formatCurrency(opportunity.kalshiPrice || 0)}
              </span>
              <span className="text-gray-500">
                Vol: {formatCurrency(opportunity.kalshiMarket?.dollar_volume_24h || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Arbitrage Details */}
        <div className="bg-success/5 p-3 rounded-lg border border-success/20 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-success">Potential Profit</span>
            <span className="text-lg font-bold text-success">
              +{(Number(opportunity.profitPercentage) || 0).toFixed(2)}%
            </span>
          </div>
          <div className="text-xs text-gray-600">
            Strategy:{" "}
            {opportunity.arbitrageType === "price_discrepancy"
              ? "Price Discrepancy Arbitrage"
              : opportunity.arbitrageType === "spread_arbitrage"
                ? "Spread Arbitrage"
                : "Cross Platform Arbitrage"}
          </div>
          <div className="text-xs text-gray-600">
            Price difference: {formatCurrency(opportunity.priceDifference || 0)}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
          <div>
            <div className="text-xs text-gray-500">Confidence</div>
            <div className="font-semibold">{opportunity.confidence}%</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Category</div>
            <div className="font-semibold text-xs">{opportunity.category || "General"}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Match Score</div>
            <div className="font-semibold">{opportunity.matchScore || 0}%</div>
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
          <p className="text-gray-600">Real-time price differences between Polymarket and Kalshi</p>
        </div>

        <div className="flex items-center gap-4 mt-4 lg:mt-0">
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${loading ? "bg-warning animate-pulse" : "bg-success"}`}></div>
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={fetchOpportunities}
              className={`btn btn-outline btn-sm ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {!loading && <ArrowPathIcon className="h-4 w-4" />}
              Refresh
            </button>

            <label className="label cursor-pointer gap-2">
              <span className="label-text text-sm">Auto</span>
              <input
                type="checkbox"
                className="toggle toggle-primary toggle-sm"
                checked={autoRefresh}
                onChange={e => setAutoRefresh(e.target.checked)}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="stat bg-base-100 rounded-lg shadow border border-base-300">
          <div className="stat-figure text-primary">
            <ArrowTrendingUpIcon className="h-8 w-8" />
          </div>
          <div className="stat-title text-xs">Total Opportunities</div>
          <div className="stat-value text-2xl text-primary">{opportunities.length}</div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow border border-base-300">
          <div className="stat-figure text-success">
            <CurrencyDollarIcon className="h-8 w-8" />
          </div>
          <div className="stat-title text-xs">Avg Profit</div>
          <div className="stat-value text-2xl text-success">
            {opportunities.length > 0
              ? (opportunities.reduce((sum, op) => sum + (op.profitPercentage || 0), 0) / opportunities.length).toFixed(
                  1,
                )
              : "0"}
            %
          </div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow border border-base-300">
          <div className="stat-figure text-warning">
            <ShieldCheckIcon className="h-8 w-8" />
          </div>
          <div className="stat-title text-xs">Low Risk</div>
          <div className="stat-value text-2xl text-warning">
            {opportunities.filter(op => op.riskLevel === "low").length}
          </div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow border border-base-300">
          <div className="stat-figure text-error">
            <FireIcon className="h-8 w-8" />
          </div>
          <div className="stat-title text-xs">High Profit (10%+)</div>
          <div className="stat-value text-2xl text-error">
            {opportunities.filter(op => (op.profitPercentage || 0) >= 10).length}
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
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
              </select>
            </div>

            {/* Min Profit */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-sm">Min Profit (%)</span>
              </label>
              <input
                type="number"
                className="input input-bordered input-sm"
                value={minProfit}
                onChange={e => setMinProfit(Number(e.target.value))}
                min="0"
                step="0.5"
              />
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
                <option value="profit">Profit %</option>
                <option value="confidence">Confidence</option>
                <option value="time">Time to Expiry</option>
              </select>
            </div>
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
          <span className="ml-4 text-lg">Scanning markets for arbitrage opportunities...</span>
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
                {opportunities.length === 0
                  ? "Markets are currently in sync or have insufficient price data."
                  : "Try adjusting your filters to see more opportunities."}
              </p>

              {/* Debugging Info */}
              <div className="bg-base-200 p-4 rounded-lg mb-6 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="font-semibold text-primary">Polymarket</div>
                    <div className="text-gray-600">Historical markets with resolved outcomes</div>
                    <div className="text-xs text-gray-500">Most prices are near $0.00 or $1.00</div>
                  </div>
                  <div>
                    <div className="font-semibold text-secondary">Kalshi</div>
                    <div className="text-gray-600">Active markets with current pricing</div>
                    <div className="text-xs text-gray-500">Prices typically around $0.50</div>
                  </div>
                  <div>
                    <div className="font-semibold text-accent">Arbitrage</div>
                    <div className="text-gray-600">Requires similar active markets</div>
                    <div className="text-xs text-gray-500">Min {minProfit}% profit threshold</div>
                  </div>
                </div>
              </div>

              <button onClick={fetchOpportunities} className="btn btn-primary">
                <ArrowPathIcon className="h-4 w-4" />
                Refresh Markets
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">{filteredOpportunities.length} Opportunities Found</h2>
                <div className="text-sm text-gray-500">
                  Showing top {Math.min(50, filteredOpportunities.length)} results
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredOpportunities.map(opportunity => (
                  <ArbitrageCard key={opportunity.id} opportunity={opportunity} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Arbitrage;
