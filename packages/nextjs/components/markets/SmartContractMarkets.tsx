"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import {
  ClockIcon,
  UserIcon,
  TagIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { SmartContractMarket, SmartContractMarketsService } from "~~/services/smartContractMarkets";

interface SmartContractMarketsProps {
  searchTerm?: string;
  categoryFilter?: string;
  showOnlyUserMarkets?: boolean;
}

const SmartContractMarkets = ({ 
  searchTerm = "", 
  categoryFilter = "all",
  showOnlyUserMarkets = false 
}: SmartContractMarketsProps) => {
  const { address } = useAccount();
  const [markets, setMarkets] = useState<SmartContractMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMarkets();
  }, [searchTerm, categoryFilter, showOnlyUserMarkets, address]);

  const fetchMarkets = async () => {
    try {
      setLoading(true);
      setError(null);

      let fetchedMarkets: SmartContractMarket[] = [];

      if (showOnlyUserMarkets && address) {
        fetchedMarkets = await SmartContractMarketsService.getMarketsByCreator(address);
      } else if (searchTerm) {
        fetchedMarkets = await SmartContractMarketsService.searchMarkets(searchTerm);
      } else {
        fetchedMarkets = await SmartContractMarketsService.getAllMarkets();
      }

      // Apply category filter
      if (categoryFilter !== "all") {
        fetchedMarkets = fetchedMarkets.filter(market => 
          market.category.toLowerCase() === categoryFilter.toLowerCase()
        );
      }

      setMarkets(fetchedMarkets);
    } catch (err) {
      console.error('Error fetching smart contract markets:', err);
      setError('Failed to load markets from smart contract');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeRemaining = (seconds: number): string => {
    if (seconds <= 0) return "Expired";
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    
    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    } else if (hours > 0) {
      return `${hours}h remaining`;
    } else {
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${minutes}m remaining`;
    }
  };

  const formatLiquidityThreshold = (threshold: string): string => {
    const value = parseInt(threshold);
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return `$${value}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="loading loading-spinner loading-lg text-primary"></div>
        <p className="mt-4 text-base-content/60">Loading smart contract markets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <ArrowTopRightOnSquareIcon className="h-6 w-6" />
        <div>
          <h3 className="font-bold">Connection Error</h3>
          <p>{error}</p>
          <p className="text-sm mt-1">Make sure Anvil is running and you're connected to the correct network.</p>
        </div>
        <button onClick={fetchMarkets} className="btn btn-sm btn-outline">
          Retry
        </button>
      </div>
    );
  }

  if (markets.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-bold mb-2">No Smart Contract Markets Found</h3>
          <p className="text-base-content/60 mb-6">
            {showOnlyUserMarkets 
              ? "You haven't created any markets yet." 
              : "No markets have been created on the smart contract yet."
            }
          </p>
          <Link href="/markets/create" className="btn btn-primary">
            Create Your First Market
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Smart Contract Markets</h2>
          <p className="text-base-content/60">
            {markets.length} market{markets.length !== 1 ? 's' : ''} found on blockchain
          </p>
        </div>
        <div className="badge badge-primary">
          Chain ID: 31337
        </div>
      </div>

      {/* Markets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {markets.map((market) => (
          <div key={market.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="card-body">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="badge badge-secondary text-xs">
                  Market #{market.id}
                </div>
                <div className="flex items-center gap-2">
                  {market.isActive ? (
                    <div className="badge badge-success badge-sm">
                      <CheckCircleIcon className="h-3 w-3 mr-1" />
                      Active
                    </div>
                  ) : (
                    <div className="badge badge-error badge-sm">
                      <XCircleIcon className="h-3 w-3 mr-1" />
                      Inactive
                    </div>
                  )}
                  {market.isExpired && (
                    <div className="badge badge-warning badge-sm">Expired</div>
                  )}
                </div>
              </div>

              {/* Question */}
              <h3 className="card-title text-lg leading-tight mb-3 line-clamp-2">
                {market.question}
              </h3>

              {/* Details */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <TagIcon className="h-4 w-4 text-primary" />
                  <span className="text-base-content/70">Category:</span>
                  <span className="badge badge-outline badge-xs">{market.category}</span>
                </div>

                <div className="flex items-center gap-2">
                  <CurrencyDollarIcon className="h-4 w-4 text-success" />
                  <span className="text-base-content/70">Min. Liquidity:</span>
                  <span className="font-medium">{formatLiquidityThreshold(market.liquidityThreshold)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <ClockIcon className="h-4 w-4 text-warning" />
                  <span className="text-base-content/70">Status:</span>
                  <span className={`font-medium ${market.isExpired ? 'text-error' : 'text-success'}`}>
                    {formatTimeRemaining(market.timeRemaining)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-info" />
                  <span className="text-base-content/70">Creator:</span>
                  <span className="font-mono text-xs">
                    {market.creator === address ? (
                      <span className="text-primary font-medium">You</span>
                    ) : (
                      `${market.creator.slice(0, 6)}...${market.creator.slice(-4)}`
                    )}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="card-actions justify-between items-center mt-4 pt-4 border-t border-base-300">
                <div className="text-xs text-base-content/50">
                  Created: {market.createdAtFormatted}
                </div>
                <Link 
                  href={`/markets/${market.id}/smart-contract`}
                  className="btn btn-primary btn-sm"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Contract Info */}
      <div className="alert alert-info">
        <div className="flex items-center gap-2">
          <ArrowTopRightOnSquareIcon className="h-5 w-5" />
          <div>
            <h4 className="font-medium">Smart Contract Information</h4>
            <p className="text-sm">
              Contract: <code className="bg-base-300 px-1 rounded text-xs">{SmartContractMarketsService.getContractInfo().address}</code>
            </p>
            <p className="text-sm">Network: Anvil Local (Chain ID: 31337)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export { SmartContractMarkets };