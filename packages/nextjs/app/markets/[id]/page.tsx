"use client";

import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  ClipboardDocumentIcon,
  ArrowTopRightOnSquareIcon,
  InformationCircleIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  UserGroupIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

interface MarketDetails {
  id: string;
  question: string;
  category: string;
  description: string;
  endDate: string;
  liquidityThreshold: number;
  tags: string[];
  outcomeType: "binary" | "multiple" | "scalar";
  status: "active" | "resolved" | "cancelled";
  contractAddress: string;
  transactionHash: string;
  blockNumber: number;
  network: string;
  createdAt: string;
  volume: number;
  traders: number;
}

interface MarketDetailPageProps {
  params: { id: string };
}

const MarketDetailPage: NextPage<MarketDetailPageProps> = ({ params }) => {
  const router = useRouter();
  const [market, setMarket] = useState<MarketDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching market data
    const fetchMarketDetails = async () => {
      try {
        // In a real app, you'd fetch this from your API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - replace with actual API call
        const mockMarket: MarketDetails = {
          id: params.id,
          question: "Will Bitcoin reach $100,000 by December 31, 2025?",
          category: "cryptocurrency",
          description: "This market will resolve to YES if Bitcoin (BTC) reaches or exceeds $100,000 USD on any major exchange by 11:59 PM UTC on December 31, 2025.",
          endDate: "2025-12-31T23:59:59Z",
          liquidityThreshold: 5000,
          tags: ["bitcoin", "cryptocurrency", "price"],
          outcomeType: "binary",
          status: "active",
          contractAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
          transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
          blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
          network: "Ethereum Mainnet",
          createdAt: new Date().toISOString(),
          volume: 25000,
          traders: 142
        };
        
        setMarket(mockMarket);
      } catch (error) {
        console.error("Failed to fetch market details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketDetails();
  }, [params.id]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "badge-success";
      case "resolved": return "badge-info";
      case "cancelled": return "badge-error";
      default: return "badge-ghost";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
          <h2 className="text-xl font-semibold">Loading Market Details...</h2>
        </div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Market Not Found</h2>
          <p className="text-base-content/70 mb-6">The market you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => router.push("/markets")} className="btn btn-primary">
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Markets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/markets")}
            className="btn btn-ghost btn-sm mb-4 hover:btn-primary transition-all duration-200"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Markets
          </button>
          
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg">
              <ChartBarIcon className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{market.question}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge badge-primary">PolyTrade</span>
                <span className="badge badge-outline">{market.category}</span>
                <span className={`badge ${getStatusColor(market.status)}`}>
                  {market.status.charAt(0).toUpperCase() + market.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Market Overview */}
            <div className="card bg-gradient-to-br from-base-100 to-base-200 shadow-xl border border-base-300">
              <div className="card-body">
                <h2 className="card-title mb-4">Market Overview</h2>
                
                {market.description && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-base-content/80 leading-relaxed">{market.description}</p>
                  </div>
                )}

                {/* Market Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="stat bg-base-200 rounded-lg p-3">
                    <div className="stat-figure text-primary">
                      <CurrencyDollarIcon className="w-6 h-6" />
                    </div>
                    <div className="stat-title text-xs">Volume</div>
                    <div className="stat-value text-lg">${market.volume.toLocaleString()}</div>
                  </div>

                  <div className="stat bg-base-200 rounded-lg p-3">
                    <div className="stat-figure text-secondary">
                      <UserGroupIcon className="w-6 h-6" />
                    </div>
                    <div className="stat-title text-xs">Traders</div>
                    <div className="stat-value text-lg">{market.traders}</div>
                  </div>

                  <div className="stat bg-base-200 rounded-lg p-3">
                    <div className="stat-figure text-accent">
                      <CurrencyDollarIcon className="w-6 h-6" />
                    </div>
                    <div className="stat-title text-xs">Liquidity</div>
                    <div className="stat-value text-lg">${market.liquidityThreshold.toLocaleString()}</div>
                  </div>

                  <div className="stat bg-base-200 rounded-lg p-3">
                    <div className="stat-figure text-info">
                      <CalendarIcon className="w-6 h-6" />
                    </div>
                    <div className="stat-title text-xs">Ends</div>
                    <div className="stat-value text-lg">
                      {Math.ceil((new Date(market.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}d
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {market.tags.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {market.tags.map((tag, index) => (
                        <span key={index} className="badge badge-outline">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Trading Interface Placeholder */}
            <div className="card bg-gradient-to-br from-base-100 to-base-200 shadow-xl border border-base-300">
              <div className="card-body">
                <h2 className="card-title mb-4">Trading</h2>
                <div className="text-center py-8">
                  <ChartBarIcon className="w-16 h-16 text-base-content/40 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Trading Interface Coming Soon</h3>
                  <p className="text-base-content/60">
                    The trading interface will be available once the market is fully integrated.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Smart Contract Details */}
            <div className="card bg-gradient-to-br from-base-100 to-base-200 shadow-xl border border-base-300">
              <div className="card-body">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-primary text-xs">📋</span>
                  </span>
                  Smart Contract
                </h3>
                
                <div className="space-y-4 text-sm">
                  {/* Contract Address */}
                  <div>
                    <label className="text-xs font-medium text-base-content/60 uppercase tracking-wide">Contract Address</label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="bg-base-200 px-2 py-1 rounded text-xs flex-1 break-all">
                        {market.contractAddress}
                      </code>
                      <button 
                        onClick={() => copyToClipboard(market.contractAddress)}
                        className="btn btn-ghost btn-xs"
                        title="Copy address"
                      >
                        <ClipboardDocumentIcon className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Transaction Hash */}
                  <div>
                    <label className="text-xs font-medium text-base-content/60 uppercase tracking-wide">Deploy Transaction</label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="bg-base-200 px-2 py-1 rounded text-xs flex-1 break-all">
                        {market.transactionHash}
                      </code>
                      <button 
                        onClick={() => copyToClipboard(market.transactionHash)}
                        className="btn btn-ghost btn-xs"
                        title="Copy transaction hash"
                      >
                        <ClipboardDocumentIcon className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Network & Block */}
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <label className="text-xs font-medium text-base-content/60 uppercase tracking-wide">Network</label>
                      <div className="bg-base-200 px-2 py-1 rounded text-xs mt-1">
                        {market.network}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-base-content/60 uppercase tracking-wide">Block Number</label>
                      <div className="bg-base-200 px-2 py-1 rounded text-xs mt-1">
                        #{market.blockNumber.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Explorer Links */}
                  <div className="pt-3 border-t border-base-300">
                    <label className="text-xs font-medium text-base-content/60 uppercase tracking-wide mb-2 block">Blockchain Explorers</label>
                    <div className="flex flex-col gap-2">
                      <a 
                        href={`https://etherscan.io/address/${market.contractAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline btn-xs justify-start"
                      >
                        <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                        View on Etherscan
                      </a>
                      <a 
                        href={`https://etherscan.io/tx/${market.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline btn-xs justify-start"
                      >
                        <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                        Deployment Transaction
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Market Info */}
            <div className="card bg-gradient-to-br from-info/5 to-info/10 border border-info/20 shadow-xl">
              <div className="card-body">
                <h3 className="font-bold flex items-center gap-2 mb-4">
                  <InformationCircleIcon className="w-5 h-5 text-info" />
                  Market Information
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-base-content/70">Created:</span>
                    <span className="font-medium">{formatDate(market.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/70">Ends:</span>
                    <span className="font-medium">{formatDate(market.endDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/70">Type:</span>
                    <span className="font-medium capitalize">{market.outcomeType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/70">Market ID:</span>
                    <span className="font-mono text-xs">{market.id}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketDetailPage;
