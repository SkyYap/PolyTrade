"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAccount } from "wagmi";
import {
  ArrowLeftIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTopRightOnSquareIcon,
  CalendarIcon,
  FireIcon,
} from "@heroicons/react/24/outline";
import { SmartContractMarket, SmartContractMarketsService } from "~~/services/smartContractMarkets";

export default function SmartContractMarketDetail() {
  const params = useParams();
  const { address } = useAccount();
  const [market, setMarket] = useState<SmartContractMarket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const marketId = params?.id as string;

  useEffect(() => {
    if (marketId) {
      fetchMarket();
    }
  }, [marketId]);

  const fetchMarket = async () => {
    try {
      setLoading(true);
      setError(null);

      const marketData = await SmartContractMarketsService.getMarket(parseInt(marketId));
      
      if (!marketData) {
        setError(`Market #${marketId} not found`);
        return;
      }

      setMarket(marketData);
    } catch (err) {
      console.error('Error fetching market:', err);
      setError('Failed to load market data');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeRemaining = (seconds: number): string => {
    if (seconds <= 0) return "Expired";
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days} days, ${hours} hours`;
    } else if (hours > 0) {
      return `${hours} hours, ${minutes} minutes`;
    } else {
      return `${minutes} minutes`;
    }
  };

  const formatLiquidityThreshold = (threshold: string): string => {
    const value = parseInt(threshold);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-base-content/60">Loading market details...</p>
        </div>
      </div>
    );
  }

  if (error || !market) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-error max-w-2xl mx-auto">
          <XCircleIcon className="h-6 w-6" />
          <div>
            <h3 className="font-bold">Market Not Found</h3>
            <p>{error || `Market #${marketId} could not be loaded`}</p>
          </div>
          <Link href="/markets" className="btn btn-sm btn-outline">
            Back to Markets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/markets" className="btn btn-ghost btn-sm">
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Markets
        </Link>
        <div className="divider divider-horizontal"></div>
        <div className="badge badge-primary">Market #{market.id}</div>
        <div className="badge badge-secondary">{market.platform}</div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Market Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Question Card */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-start justify-between mb-4">
                <h1 className="card-title text-2xl leading-tight">
                  {market.question}
                </h1>
                <div className="flex items-center gap-2">
                  {market.isActive ? (
                    <div className="badge badge-success">
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Active
                    </div>
                  ) : (
                    <div className="badge badge-error">
                      <XCircleIcon className="h-4 w-4 mr-1" />
                      Inactive
                    </div>
                  )}
                  {market.isExpired && (
                    <div className="badge badge-warning">Expired</div>
                  )}
                </div>
              </div>

              {/* Status Alert */}
              {market.isExpired ? (
                <div className="alert alert-warning mb-4">
                  <ClockIcon className="h-5 w-5" />
                  <span>This market has expired and is no longer accepting predictions.</span>
                </div>
              ) : market.timeRemaining < 86400 ? (
                <div className="alert alert-info mb-4">
                  <FireIcon className="h-5 w-5" />
                  <span>This market expires soon! Only {formatTimeRemaining(market.timeRemaining)} remaining.</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Market Information */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-4">Market Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <TagIcon className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-base-content/70">Category</p>
                      <p className="font-medium">{market.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <CurrencyDollarIcon className="h-5 w-5 text-success" />
                    <div>
                      <p className="text-sm text-base-content/70">Minimum Liquidity</p>
                      <p className="font-medium">{formatLiquidityThreshold(market.liquidityThreshold)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="h-5 w-5 text-warning" />
                    <div>
                      <p className="text-sm text-base-content/70">End Date</p>
                      <p className="font-medium">{market.formattedEndDate}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <ClockIcon className="h-5 w-5 text-info" />
                    <div>
                      <p className="text-sm text-base-content/70">Time Remaining</p>
                      <p className={`font-medium ${market.isExpired ? 'text-error' : 'text-success'}`}>
                        {formatTimeRemaining(market.timeRemaining)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Creator Information */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-4">Creator Information</h2>
              
              <div className="flex items-center gap-3">
                <UserIcon className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <p className="text-sm text-base-content/70">Created by</p>
                  <div className="flex items-center gap-2">
                    <code className="bg-base-300 px-2 py-1 rounded text-sm font-mono">
                      {market.creator}
                    </code>
                    {market.creator.toLowerCase() === address?.toLowerCase() && (
                      <div className="badge badge-primary badge-sm">You</div>
                    )}
                  </div>
                  <p className="text-xs text-base-content/50 mt-1">
                    Created on {market.createdAtFormatted}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-lg mb-4">Quick Stats</h3>
              
              <div className="space-y-3">
                <div className="stat">
                  <div className="stat-title">Market ID</div>
                  <div className="stat-value text-2xl">#{market.id}</div>
                </div>
                
                <div className="stat">
                  <div className="stat-title">Platform</div>
                  <div className="stat-value text-lg">{market.platform}</div>
                </div>
                
                <div className="stat">
                  <div className="stat-title">Status</div>
                  <div className={`stat-value text-lg ${market.isActive ? 'text-success' : 'text-error'}`}>
                    {market.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contract Information */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-lg mb-4">Smart Contract</h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-base-content/70">Contract Address</p>
                  <code className="bg-base-300 px-2 py-1 rounded text-xs block break-all">
                    {SmartContractMarketsService.getContractInfo().address}
                  </code>
                </div>
                
                <div>
                  <p className="text-base-content/70">Network</p>
                  <p className="font-medium">Anvil Local (Chain ID: 31337)</p>
                </div>

                <div className="flex items-center gap-2 text-xs text-base-content/50">
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  <span>View on block explorer</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-lg mb-4">Actions</h3>
              
              <div className="space-y-3">
                <Link href="/markets" className="btn btn-outline btn-block">
                  Browse All Markets
                </Link>
                
                <Link href="/markets/create" className="btn btn-primary btn-block">
                  Create New Market
                </Link>
                
                {market.creator.toLowerCase() === address?.toLowerCase() && (
                  <button className="btn btn-warning btn-outline btn-block" disabled>
                    Manage Market (Coming Soon)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
