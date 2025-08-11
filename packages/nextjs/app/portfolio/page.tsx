"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { useAccount, useBalance } from "wagmi";
import {
  ChartBarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  EyeIcon,
  PlusIcon,
  TrophyIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { portfolioService, type PortfolioPosition, type ArbitrageExecution } from "~~/services/api/portfolio";

interface Position {
  id: string;
  marketId: string;
  question: string;
  category: string;
  position: "YES" | "NO";
  shares: number;
  avgPrice: number;
  currentPrice: number;
  value: number;
  pnl: number;
  pnlPercent: number;
  status: "active" | "resolved" | "expired";
}

interface Transaction {
  id: string;
  type: "buy" | "sell";
  marketQuestion: string;
  position: "YES" | "NO";
  shares: number;
  price: number;
  total: number;
  timestamp: string;
  status: "completed" | "pending" | "failed";
}

// Mock data - replace with API calls to your Express backend
const mockPositions: Position[] = [
  {
    id: "1",
    marketId: "1",
    question: "Will Bitcoin reach $100,000 by end of 2025?",
    category: "Crypto",
    position: "YES",
    shares: 100,
    avgPrice: 0.6,
    currentPrice: 0.65,
    value: 65,
    pnl: 5,
    pnlPercent: 8.33,
    status: "active",
  },
  {
    id: "2",
    marketId: "2",
    question: "Will there be a US recession in 2025?",
    category: "Economics",
    position: "NO",
    shares: 150,
    avgPrice: 0.7,
    currentPrice: 0.68,
    value: 102,
    pnl: -3,
    pnlPercent: -2.86,
    status: "active",
  },
  {
    id: "3",
    marketId: "3",
    question: "Will SpaceX launch humans to Mars by 2026?",
    category: "Technology",
    position: "YES",
    shares: 50,
    avgPrice: 0.25,
    currentPrice: 0.28,
    value: 14,
    pnl: 1.5,
    pnlPercent: 12,
    status: "active",
  },
];

const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "buy",
    marketQuestion: "Will Bitcoin reach $100,000 by end of 2025?",
    position: "YES",
    shares: 100,
    price: 0.6,
    total: 60,
    timestamp: "2025-08-07T10:30:00Z",
    status: "completed",
  },
  {
    id: "2",
    type: "buy",
    marketQuestion: "Will there be a US recession in 2025?",
    position: "NO",
    shares: 150,
    price: 0.7,
    total: 105,
    timestamp: "2025-08-06T14:15:00Z",
    status: "completed",
  },
  {
    id: "3",
    type: "buy",
    marketQuestion: "Will SpaceX launch humans to Mars by 2026?",
    position: "YES",
    shares: 50,
    price: 0.25,
    total: 12.5,
    timestamp: "2025-08-05T09:45:00Z",
    status: "completed",
  },
];

const Portfolio: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { data: balance } = useBalance({ address: connectedAddress });
  const [positions, setPositions] = useState<PortfolioPosition[]>([]);
  const [executions, setExecutions] = useState<ArbitrageExecution[]>([]);
  const [activeTab, setActiveTab] = useState<"positions" | "arbitrage" | "history">("positions");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch portfolio data
    const fetchPortfolioData = async () => {
      setLoading(true);
      try {
        if (connectedAddress) {
          // Load positions from portfolio service
          const portfolioPositions = portfolioService.getPositions();
          setPositions(portfolioPositions);
          
          // Load execution history
          const executionHistory = await portfolioService.getExecutionHistory();
          setExecutions(executionHistory);
        }
      } catch (error) {
        console.error("Error loading portfolio data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, [connectedAddress]);

  const refreshPortfolio = async () => {
    setLoading(true);
    try {
      const portfolioPositions = portfolioService.getPositions();
      setPositions(portfolioPositions);
      
      const executionHistory = await portfolioService.getExecutionHistory();
      setExecutions(executionHistory);
    } catch (error) {
      console.error("Error refreshing portfolio:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearPortfolio = () => {
    if (confirm("Are you sure you want to clear all portfolio data? This action cannot be undone.")) {
      portfolioService.clearPortfolio();
      setPositions([]);
      setExecutions([]);
    }
  };

  const resetExecution = async (opportunityId: string) => {
    if (confirm("Are you sure you want to reset this execution? This will remove related positions.")) {
      try {
        await portfolioService.removeExecutionFromPortfolio(opportunityId);
        await refreshPortfolio();
        alert("Execution reset successfully!");
      } catch (error) {
        console.error("Error resetting execution:", error);
        alert("Failed to reset execution. Please try again.");
      }
    }
  };

  const totalValue = positions.reduce((sum, pos) => sum + pos.value, 0);
  const totalPnL = positions.reduce((sum, pos) => sum + pos.pnl, 0);
  const totalPnLPercent = totalValue > 0 ? (totalPnL / (totalValue - totalPnL)) * 100 : 0;
  const activePositions = positions.filter(p => p.status === "active").length;
  const arbitragePositions = positions.filter(p => p.strategy?.arbitrageType).length;
  const totalArbitrageProfit = executions.reduce((sum, exec) => sum + exec.expectedProfit, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!connectedAddress) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-12">
          <CurrencyDollarIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-500 mb-6">Connect your wallet to view your portfolio and trading history.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Portfolio</h1>
          <div className="flex items-center gap-2 text-gray-600">
            <Address address={connectedAddress} />
          </div>
        </div>

        <div className="flex gap-2 mt-4 md:mt-0">
          <button onClick={refreshPortfolio} className="btn btn-outline" disabled={loading}>
            <ArrowPathIcon className="h-4 w-4" />
            Refresh
          </button>
          <button onClick={clearPortfolio} className="btn btn-error btn-outline" disabled={loading}>
            Clear Portfolio
          </button>
          <Link href="/arbitrage" className="btn btn-secondary">
            Arbitrage
          </Link>
          <Link href="/markets" className="btn btn-primary">
            <PlusIcon className="h-4 w-4" />
            Browse Markets
          </Link>
        </div>
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="stat bg-base-100 rounded-lg shadow-lg">
          <div className="stat-figure text-primary">
            <CurrencyDollarIcon className="h-8 w-8" />
          </div>
          <div className="stat-title">Wallet Balance</div>
          <div className="stat-value text-primary">
            {balance ? `${(Number(balance.formatted) || 0).toFixed(4)} ${balance.symbol}` : "0.0000"}
          </div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow-lg">
          <div className="stat-figure text-secondary">
            <ChartBarIcon className="h-8 w-8" />
          </div>
          <div className="stat-title">Portfolio Value</div>
          <div className="stat-value text-secondary">{formatCurrency(totalValue)}</div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow-lg">
          <div className="stat-figure text-success">
            <TrophyIcon className="h-8 w-8" />
          </div>
          <div className="stat-title">Total P&L</div>
          <div className={`stat-value ${totalPnL >= 0 ? "text-success" : "text-error"}`}>
            {formatCurrency(totalPnL)}
          </div>
          <div className={`stat-desc ${totalPnL >= 0 ? "text-success" : "text-error"}`}>
            {totalPnLPercent >= 0 ? "+" : ""}
            {(Number(totalPnLPercent) || 0).toFixed(2)}%
          </div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow-lg">
          <div className="stat-figure text-accent">
            <ClockIcon className="h-8 w-8" />
          </div>
          <div className="stat-title">Active Positions</div>
          <div className="stat-value text-accent">{activePositions}</div>
          <div className="stat-desc">{arbitragePositions} arbitrage</div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow-lg">
          <div className="stat-figure text-warning">
            <ArrowPathIcon className="h-8 w-8" />
          </div>
          <div className="stat-title">Arbitrage Profit</div>
          <div className="stat-value text-warning">{formatCurrency(totalArbitrageProfit)}</div>
          <div className="stat-desc">{executions.length} executions</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed w-fit mb-6">
        <button
          className={`tab ${activeTab === "positions" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("positions")}
        >
          Positions
        </button>
        <button
          className={`tab ${activeTab === "arbitrage" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("arbitrage")}
        >
          Arbitrage History
        </button>
        <button
          className={`tab ${activeTab === "history" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          Trading History
        </button>
      </div>

      {/* Positions Tab */}
      {activeTab === "positions" && (
        <div>
          {positions.length === 0 ? (
            <div className="text-center py-12">
              <ChartBarIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">No positions yet</h3>
              <p className="text-gray-500 mb-6">Start trading to build your portfolio.</p>
              <Link href="/markets" className="btn btn-primary">
                Browse Markets
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Market</th>
                    <th>Platform</th>
                    <th>Position</th>
                    <th>Shares</th>
                    <th>Avg Price</th>
                    <th>Current Price</th>
                    <th>Value</th>
                    <th>P&L</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map(position => (
                    <tr key={position.id}>
                      <td>
                        <div>
                          <div className="font-medium line-clamp-1" title={position.question}>
                            {position.question}
                          </div>
                          <div className="text-sm text-gray-500">{position.category}</div>
                          {position.strategy && (
                            <div className="badge badge-xs badge-outline mt-1">
                              {position.strategy.arbitrageType}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${position.platform === "polymarket" ? "badge-primary" : "badge-secondary"}`}>
                          {position.platform.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${position.position === "YES" ? "badge-success" : "badge-error"}`}>
                          {position.position}
                        </span>
                      </td>
                      <td>{position.shares}</td>
                      <td>${(Number(position.avgPrice) || 0).toFixed(2)}</td>
                      <td>${(Number(position.currentPrice) || 0).toFixed(2)}</td>
                      <td>{formatCurrency(position.value)}</td>
                      <td>
                        <div className={position.pnl >= 0 ? "text-success" : "text-error"}>
                          <div>{formatCurrency(position.pnl)}</div>
                          <div className="text-xs">
                            {position.pnlPercent >= 0 ? "+" : ""}
                            {(Number(position.pnlPercent) || 0).toFixed(2)}%
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn btn-xs btn-ghost">
                            <EyeIcon className="h-3 w-3" />
                          </button>
                          <button 
                            className="btn btn-xs btn-error btn-outline"
                            onClick={() => portfolioService.removePosition(position.id).then(() => refreshPortfolio())}
                          >
                            Close
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Arbitrage History Tab */}
      {activeTab === "arbitrage" && (
        <div>
          {executions.length === 0 ? (
            <div className="text-center py-12">
              <ArrowPathIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">No arbitrage executions yet</h3>
              <p className="text-gray-500 mb-6">Your arbitrage executions will appear here.</p>
              <Link href="/arbitrage" className="btn btn-primary">
                Browse Arbitrage Opportunities
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Opportunity ID</th>
                    <th>Investment</th>
                    <th>Expected Profit</th>
                    <th>Status</th>
                    <th>Executed At</th>
                    <th>Positions</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {executions.map(execution => (
                    <tr key={execution.id}>
                      <td>
                        <div className="font-mono text-xs">{execution.opportunityId}</div>
                      </td>
                      <td>{formatCurrency(execution.totalInvestment)}</td>
                      <td className="text-success">{formatCurrency(execution.expectedProfit)}</td>
                      <td>
                        <span
                          className={`badge badge-sm ${
                            execution.status === "completed"
                              ? "badge-success"
                              : execution.status === "executing"
                                ? "badge-warning"
                                : execution.status === "failed"
                                  ? "badge-error"
                                  : "badge-info"
                          }`}
                        >
                          {execution.status}
                        </span>
                      </td>
                      <td>{formatDate(execution.executedAt)}</td>
                      <td>
                        <div className="space-y-1">
                          {execution.polymarketPosition && (
                            <div className="badge badge-primary badge-xs">
                              PM: {execution.polymarketPosition.position} {execution.polymarketPosition.shares}
                            </div>
                          )}
                          {execution.kalshiPosition && (
                            <div className="badge badge-secondary badge-xs">
                              Kalshi: {execution.kalshiPosition.position} {execution.kalshiPosition.shares}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <button 
                          className="btn btn-xs btn-warning"
                          onClick={() => resetExecution(execution.opportunityId)}
                        >
                          Reset
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Trading History Tab */}
      {activeTab === "history" && (
        <div>
          {mockTransactions.length === 0 ? (
            <div className="text-center py-12">
              <ClockIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">No trading history</h3>
              <p className="text-gray-500">Your trades will appear here once you start trading.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Market</th>
                    <th>Position</th>
                    <th>Shares</th>
                    <th>Price</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTransactions.map((tx: any) => (
                    <tr key={tx.id}>
                      <td>
                        <span className={`badge ${tx.type === "buy" ? "badge-success" : "badge-warning"}`}>
                          {tx.type.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div className="font-medium line-clamp-1" title={tx.marketQuestion}>
                          {tx.marketQuestion}
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-sm ${tx.position === "YES" ? "badge-success" : "badge-error"}`}>
                          {tx.position}
                        </span>
                      </td>
                      <td>{tx.shares}</td>
                      <td>${(Number(tx.price) || 0).toFixed(2)}</td>
                      <td>{formatCurrency(tx.total)}</td>
                      <td>{formatDate(tx.timestamp)}</td>
                      <td>
                        <span
                          className={`badge badge-sm ${
                            tx.status === "completed"
                              ? "badge-success"
                              : tx.status === "pending"
                                ? "badge-warning"
                                : "badge-error"
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Portfolio;
