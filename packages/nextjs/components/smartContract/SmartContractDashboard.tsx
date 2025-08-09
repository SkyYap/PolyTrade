import React, { useState, useEffect } from 'react';
import { useAccount, useProvider, useSigner } from 'wagmi';
import { SmartContractService, ContractStats, ContractMarket, ContractArbitrageOpportunity } from '../../services/smartContract/marketCreationService';
import { BoltIcon, ChartBarIcon, CurrencyDollarIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface SmartContractDashboardProps {
  contractAddress: string;
}

export const SmartContractDashboard: React.FC<SmartContractDashboardProps> = ({ contractAddress }) => {
  const { address } = useAccount();
  const provider = useProvider();
  const { data: signer } = useSigner();
  
  const [smartContractService, setSmartContractService] = useState<SmartContractService | null>(null);
  const [stats, setStats] = useState<ContractStats | null>(null);
  const [userMarkets, setUserMarkets] = useState<ContractMarket[]>([]);
  const [activeOpportunities, setActiveOpportunities] = useState<ContractArbitrageOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Market creation form state
  const [showCreateMarket, setShowCreateMarket] = useState(false);
  const [marketForm, setMarketForm] = useState({
    question: '',
    platform: 'polymarket' as 'polymarket' | 'kalshi',
    category: '',
    endDate: '',
    liquidityThreshold: 1000
  });
  const [creatingMarket, setCreatingMarket] = useState(false);

  // Initialize smart contract service
  useEffect(() => {
    if (provider) {
      const service = new SmartContractService(contractAddress, provider, signer || undefined);
      setSmartContractService(service);
      
      // Setup event listeners
      service.setupEventListeners({
        onMarketCreated: (marketId, question, platform, creator, category, endDate) => {
          console.log('New market created:', { marketId, question, platform, creator, category });
          loadData(); // Refresh data
        },
        onArbitrageDetected: (opportunityId, polymarketMarketId, kalshiMarketId, profitPotential, riskLevel, arbitrageType) => {
          console.log('New arbitrage opportunity:', { opportunityId, profitPotential, riskLevel });
          loadData(); // Refresh data
        },
        onArbitrageExecuted: (opportunityId, executor, amount, actualProfit) => {
          console.log('Arbitrage executed:', { opportunityId, executor, amount, actualProfit });
        }
      });

      return () => {
        service.removeAllListeners();
      };
    }
  }, [provider, signer, contractAddress]);

  // Load contract data
  const loadData = async () => {
    if (!smartContractService) return;

    try {
      setLoading(true);
      setError(null);

      // Load contract stats
      const contractStats = await smartContractService.getContractStats();
      setStats(contractStats);

      // Load user markets if connected
      if (address) {
        const userMarketIds = await smartContractService.getUserMarkets(address);
        const userMarketsData = await Promise.all(
          userMarketIds.map(id => smartContractService.getMarket(id))
        );
        setUserMarkets(userMarketsData);
      }

      // Load active arbitrage opportunities
      const activeOpportunityIds = await smartContractService.getActiveArbitrageOpportunities();
      const opportunitiesData = await Promise.all(
        activeOpportunityIds.slice(0, 10).map(id => smartContractService.getArbitrageOpportunity(id)) // Limit to first 10
      );
      setActiveOpportunities(opportunitiesData);

    } catch (err) {
      console.error('Error loading contract data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load contract data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (smartContractService) {
      loadData();
    }
  }, [smartContractService, address]);

  // Create market
  const handleCreateMarket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smartContractService || !signer) return;

    try {
      setCreatingMarket(true);
      setError(null);

      // Validate form
      if (!marketForm.question || !marketForm.category || !marketForm.endDate) {
        throw new Error('Please fill in all required fields');
      }

      const endDate = new Date(marketForm.endDate);
      if (endDate <= new Date()) {
        throw new Error('End date must be in the future');
      }

      // Validate market before creating
      const validation = await smartContractService.validateMarket(
        marketForm.question,
        endDate,
        marketForm.liquidityThreshold
      );

      if (!validation.isValid) {
        throw new Error(`Market validation failed: ${validation.issues.join(', ')}`);
      }

      // Create market
      const result = await smartContractService.createMarket(
        marketForm.question,
        marketForm.platform,
        marketForm.category,
        endDate,
        marketForm.liquidityThreshold
      );

      console.log('Market created:', result);
      
      // Reset form and close modal
      setMarketForm({
        question: '',
        platform: 'polymarket',
        category: '',
        endDate: '',
        liquidityThreshold: 1000
      });
      setShowCreateMarket(false);
      
      // Refresh data
      await loadData();

    } catch (err) {
      console.error('Error creating market:', err);
      setError(err instanceof Error ? err.message : 'Failed to create market');
    } finally {
      setCreatingMarket(false);
    }
  };

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  // Format profit potential
  const formatProfitPotential = (basisPoints: number) => {
    return (basisPoints / 100).toFixed(2) + '%';
  };

  // Get risk level color
  const getRiskColor = (riskLevel: number) => {
    switch (riskLevel) {
      case 1: return 'text-green-600 bg-green-100';
      case 2: return 'text-yellow-600 bg-yellow-100';
      case 3: return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Get risk level text
  const getRiskText = (riskLevel: number) => {
    switch (riskLevel) {
      case 1: return 'Low';
      case 2: return 'Medium';
      case 3: return 'High';
      default: return 'Unknown';
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="loading loading-spinner loading-lg text-primary"></div>
        <span className="ml-4 text-lg">Loading smart contract data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Smart Contract Dashboard</h1>
        {address && (
          <button
            onClick={() => setShowCreateMarket(true)}
            className="btn btn-primary"
          >
            <BoltIcon className="h-5 w-5" />
            Create Market
          </button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error">
          <ExclamationTriangleIcon className="h-6 w-6" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="btn btn-sm btn-ghost">
            ×
          </button>
        </div>
      )}

      {/* Contract Stats */}
      {stats && (
        <div className="stats stats-vertical lg:stats-horizontal shadow">
          <div className="stat">
            <div className="stat-figure text-primary">
              <ChartBarIcon className="h-8 w-8" />
            </div>
            <div className="stat-title">Total Markets</div>
            <div className="stat-value text-primary">{stats.totalMarkets}</div>
            <div className="stat-desc">Created on blockchain</div>
          </div>

          <div className="stat">
            <div className="stat-figure text-secondary">
              <BoltIcon className="h-8 w-8" />
            </div>
            <div className="stat-title">Arbitrage Opportunities</div>
            <div className="stat-value text-secondary">{stats.totalOpportunities}</div>
            <div className="stat-desc">Detected and registered</div>
          </div>

          <div className="stat">
            <div className="stat-figure text-accent">
              <CurrencyDollarIcon className="h-8 w-8" />
            </div>
            <div className="stat-title">Contract Balance</div>
            <div className="stat-value text-accent">{parseFloat(stats.contractBalance).toFixed(4)} ETH</div>
            <div className="stat-desc">Available for arbitrage</div>
          </div>
        </div>
      )}

      {/* User Markets */}
      {address && userMarkets.length > 0 && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Your Markets</h2>
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Question</th>
                    <th>Platform</th>
                    <th>Category</th>
                    <th>End Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {userMarkets.map((market) => (
                    <tr key={market.id}>
                      <td>{market.id}</td>
                      <td className="max-w-xs truncate">{market.question}</td>
                      <td>
                        <span className={`badge ${market.platform === 'polymarket' ? 'badge-primary' : 'badge-secondary'}`}>
                          {market.platform}
                        </span>
                      </td>
                      <td>{market.category}</td>
                      <td>{formatDate(market.endDate)}</td>
                      <td>
                        <span className={`badge ${market.isActive ? 'badge-success' : 'badge-error'}`}>
                          {market.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Active Arbitrage Opportunities */}
      {activeOpportunities.length > 0 && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Active Arbitrage Opportunities</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeOpportunities.map((opportunity) => (
                <div key={opportunity.id} className="card bg-base-200 shadow">
                  <div className="card-body p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium">Opportunity #{opportunity.id}</span>
                      <span className={`badge badge-sm ${getRiskColor(opportunity.riskLevel)}`}>
                        {getRiskText(opportunity.riskLevel)} Risk
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Profit Potential:</span>
                        <span className="font-bold text-success">
                          {formatProfitPotential(opportunity.profitPotential)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Similarity:</span>
                        <span>{opportunity.similarityScore}%</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span className="text-xs">{opportunity.arbitrageType}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span>{formatDate(opportunity.createdAt)}</span>
                      </div>
                    </div>

                    <div className="card-actions justify-end mt-4">
                      <button className="btn btn-xs btn-primary">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Market Modal */}
      {showCreateMarket && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Create New Market</h3>
            
            <form onSubmit={handleCreateMarket} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Market Question *</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  placeholder="Enter your market question..."
                  value={marketForm.question}
                  onChange={(e) => setMarketForm({ ...marketForm, question: e.target.value })}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Platform *</span>
                </label>
                <select
                  className="select select-bordered"
                  value={marketForm.platform}
                  onChange={(e) => setMarketForm({ ...marketForm, platform: e.target.value as 'polymarket' | 'kalshi' })}
                >
                  <option value="polymarket">Polymarket</option>
                  <option value="kalshi">Kalshi</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Category *</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  placeholder="e.g., cryptocurrency, politics, sports"
                  value={marketForm.category}
                  onChange={(e) => setMarketForm({ ...marketForm, category: e.target.value })}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">End Date *</span>
                </label>
                <input
                  type="datetime-local"
                  className="input input-bordered"
                  value={marketForm.endDate}
                  onChange={(e) => setMarketForm({ ...marketForm, endDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Liquidity Threshold ($)</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered"
                  placeholder="1000"
                  min="1000"
                  value={marketForm.liquidityThreshold}
                  onChange={(e) => setMarketForm({ ...marketForm, liquidityThreshold: parseInt(e.target.value) || 1000 })}
                />
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowCreateMarket(false)}
                  disabled={creatingMarket}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={creatingMarket}
                >
                  {creatingMarket ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Creating...
                    </>
                  ) : (
                    'Create Market'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Connection Required */}
      {!address && (
        <div className="alert alert-info">
          <ClockIcon className="h-6 w-6" />
          <span>Connect your wallet to create markets and interact with the smart contract.</span>
        </div>
      )}
    </div>
  );
};

export default SmartContractDashboard;
