// Smart Contract Integration for PolyTrade Platform
// This service connects the MarketCreationContract with the platform

import { ethers } from 'ethers';
import { MarketCreationContract } from '../contracts/deployedContracts';

// Types for the smart contract integration
export interface ContractMarket {
  id: number;
  question: string;
  platform: 'polymarket' | 'kalshi';
  creator: string;
  createdAt: number;
  isActive: boolean;
  liquidityThreshold: number;
  category: string;
  endDate: number;
}

export interface ContractArbitrageOpportunity {
  id: number;
  polymarketMarketId: number;
  kalshiMarketId: number;
  profitPotential: number; // in basis points
  riskLevel: 1 | 2 | 3; // 1=low, 2=medium, 3=high
  similarityScore: number; // 0-100
  isActive: boolean;
  createdAt: number;
  arbitrageType: string;
}

export interface MarketValidation {
  isValid: boolean;
  issues: string[];
  confidenceScore: number;
  meetsLiquidityRequirement: boolean;
  hasReasonableTimeframe: boolean;
}

export interface ContractStats {
  totalMarkets: number;
  totalOpportunities: number;
  contractBalance: string; // in ETH
}

export class SmartContractService {
  private contract: ethers.Contract;
  private provider: ethers.Provider;
  private signer?: ethers.Signer;

  constructor(
    contractAddress: string,
    provider: ethers.Provider,
    signer?: ethers.Signer
  ) {
    this.provider = provider;
    this.signer = signer;

    // ABI for the MarketCreationContract
    const contractABI = [
      // Read functions
      "function getMarket(uint256 _marketId) external view returns (tuple(uint256 id, string question, string platform, address creator, uint256 createdAt, bool isActive, uint256 liquidityThreshold, string category, uint256 endDate))",
      "function getArbitrageOpportunity(uint256 _opportunityId) external view returns (tuple(uint256 id, uint256 polymarketMarketId, uint256 kalshiMarketId, uint256 profitPotential, uint256 riskLevel, uint256 similarityScore, bool isActive, uint256 createdAt, string arbitrageType))",
      "function validateMarket(string memory _question, uint256 _endDate, uint256 _liquidityThreshold) public view returns (tuple(bool isValid, string[] issues, uint256 confidenceScore, bool meetsLiquidityRequirement, bool hasReasonableTimeframe))",
      "function getUserMarkets(address _user) external view returns (uint256[])",
      "function getCategoryMarkets(string memory _category) external view returns (uint256[])",
      "function getActiveArbitrageOpportunities() external view returns (uint256[])",
      "function getContractStats() external view returns (uint256[3])",
      "function calculateRiskLevel(uint256 _profitPotential, uint256 _similarityScore) public pure returns (uint256)",
      "function totalMarketsCreated() external view returns (uint256)",
      "function totalArbitrageOpportunities() external view returns (uint256)",
      "function owner() external view returns (address)",

      // Write functions
      "function createMarket(string memory _question, string memory _platform, string memory _category, uint256 _endDate, uint256 _liquidityThreshold) external returns (uint256)",
      "function createArbitrageOpportunity(uint256 _polymarketId, uint256 _kalshiId, uint256 _profitPotential, uint256 _similarityScore, string memory _arbitrageType) external returns (uint256)",
      "function executeArbitrage(uint256 _opportunityId, uint256 _amount) external payable",
      "function deactivateMarket(uint256 _marketId) external",
      "function deactivateArbitrageOpportunity(uint256 _opportunityId) external",

      // Events
      "event MarketCreated(uint256 indexed marketId, string question, string platform, address indexed creator, string category, uint256 endDate)",
      "event ArbitrageOpportunityDetected(uint256 indexed opportunityId, uint256 polymarketMarketId, uint256 kalshiMarketId, uint256 profitPotential, uint256 riskLevel, string arbitrageType)",
      "event MarketValidated(uint256 indexed marketId, bool isValid, uint256 confidenceScore)",
      "event ArbitrageExecuted(uint256 indexed opportunityId, address indexed executor, uint256 amount, uint256 actualProfit)"
    ];

    this.contract = new ethers.Contract(
      contractAddress,
      contractABI,
      signer || provider
    );
  }

  /**
   * Create a new market on the blockchain
   */
  async createMarket(
    question: string,
    platform: 'polymarket' | 'kalshi',
    category: string,
    endDate: Date,
    liquidityThreshold: number
  ): Promise<{ marketId: number; txHash: string }> {
    if (!this.signer) {
      throw new Error('Signer required for creating markets');
    }

    try {
      const endDateTimestamp = Math.floor(endDate.getTime() / 1000);
      
      const tx = await this.contract.createMarket(
        question,
        platform,
        category,
        endDateTimestamp,
        liquidityThreshold
      );

      const receipt = await tx.wait();
      
      // Find the MarketCreated event
      const marketCreatedEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = this.contract.interface.parseLog(log);
          return parsed?.name === 'MarketCreated';
        } catch {
          return false;
        }
      });

      if (marketCreatedEvent) {
        const parsed = this.contract.interface.parseLog(marketCreatedEvent);
        return {
          marketId: parsed?.args.marketId.toNumber(),
          txHash: receipt.transactionHash
        };
      }

      throw new Error('MarketCreated event not found');
    } catch (error) {
      console.error('Error creating market:', error);
      throw error;
    }
  }

  /**
   * Create an arbitrage opportunity on the blockchain
   */
  async createArbitrageOpportunity(
    polymarketMarketId: number,
    kalshiMarketId: number,
    profitPotential: number, // in basis points
    similarityScore: number, // 0-100
    arbitrageType: string
  ): Promise<{ opportunityId: number; txHash: string }> {
    if (!this.signer) {
      throw new Error('Signer required for creating arbitrage opportunities');
    }

    try {
      const tx = await this.contract.createArbitrageOpportunity(
        polymarketMarketId,
        kalshiMarketId,
        profitPotential,
        similarityScore,
        arbitrageType
      );

      const receipt = await tx.wait();
      
      // Find the ArbitrageOpportunityDetected event
      const opportunityEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = this.contract.interface.parseLog(log);
          return parsed?.name === 'ArbitrageOpportunityDetected';
        } catch {
          return false;
        }
      });

      if (opportunityEvent) {
        const parsed = this.contract.interface.parseLog(opportunityEvent);
        return {
          opportunityId: parsed?.args.opportunityId.toNumber(),
          txHash: receipt.transactionHash
        };
      }

      throw new Error('ArbitrageOpportunityDetected event not found');
    } catch (error) {
      console.error('Error creating arbitrage opportunity:', error);
      throw error;
    }
  }

  /**
   * Validate market parameters before creation
   */
  async validateMarket(
    question: string,
    endDate: Date,
    liquidityThreshold: number
  ): Promise<MarketValidation> {
    try {
      const endDateTimestamp = Math.floor(endDate.getTime() / 1000);
      const result = await this.contract.validateMarket(
        question,
        endDateTimestamp,
        liquidityThreshold
      );

      return {
        isValid: result.isValid,
        issues: result.issues,
        confidenceScore: result.confidenceScore.toNumber(),
        meetsLiquidityRequirement: result.meetsLiquidityRequirement,
        hasReasonableTimeframe: result.hasReasonableTimeframe
      };
    } catch (error) {
      console.error('Error validating market:', error);
      throw error;
    }
  }

  /**
   * Get market details from the blockchain
   */
  async getMarket(marketId: number): Promise<ContractMarket> {
    try {
      const result = await this.contract.getMarket(marketId);
      return {
        id: result.id.toNumber(),
        question: result.question,
        platform: result.platform as 'polymarket' | 'kalshi',
        creator: result.creator,
        createdAt: result.createdAt.toNumber(),
        isActive: result.isActive,
        liquidityThreshold: result.liquidityThreshold.toNumber(),
        category: result.category,
        endDate: result.endDate.toNumber()
      };
    } catch (error) {
      console.error('Error getting market:', error);
      throw error;
    }
  }

  /**
   * Get arbitrage opportunity details from the blockchain
   */
  async getArbitrageOpportunity(opportunityId: number): Promise<ContractArbitrageOpportunity> {
    try {
      const result = await this.contract.getArbitrageOpportunity(opportunityId);
      return {
        id: result.id.toNumber(),
        polymarketMarketId: result.polymarketMarketId.toNumber(),
        kalshiMarketId: result.kalshiMarketId.toNumber(),
        profitPotential: result.profitPotential.toNumber(),
        riskLevel: result.riskLevel.toNumber() as 1 | 2 | 3,
        similarityScore: result.similarityScore.toNumber(),
        isActive: result.isActive,
        createdAt: result.createdAt.toNumber(),
        arbitrageType: result.arbitrageType
      };
    } catch (error) {
      console.error('Error getting arbitrage opportunity:', error);
      throw error;
    }
  }

  /**
   * Get all markets created by a user
   */
  async getUserMarkets(userAddress: string): Promise<number[]> {
    try {
      const result = await this.contract.getUserMarkets(userAddress);
      return result.map((id: any) => id.toNumber());
    } catch (error) {
      console.error('Error getting user markets:', error);
      throw error;
    }
  }

  /**
   * Get all markets in a category
   */
  async getCategoryMarkets(category: string): Promise<number[]> {
    try {
      const result = await this.contract.getCategoryMarkets(category);
      return result.map((id: any) => id.toNumber());
    } catch (error) {
      console.error('Error getting category markets:', error);
      throw error;
    }
  }

  /**
   * Get all active arbitrage opportunities
   */
  async getActiveArbitrageOpportunities(): Promise<number[]> {
    try {
      const result = await this.contract.getActiveArbitrageOpportunities();
      return result.map((id: any) => id.toNumber());
    } catch (error) {
      console.error('Error getting active arbitrage opportunities:', error);
      throw error;
    }
  }

  /**
   * Get contract statistics
   */
  async getContractStats(): Promise<ContractStats> {
    try {
      const result = await this.contract.getContractStats();
      return {
        totalMarkets: result[0].toNumber(),
        totalOpportunities: result[1].toNumber(),
        contractBalance: ethers.utils.formatEther(result[2])
      };
    } catch (error) {
      console.error('Error getting contract stats:', error);
      throw error;
    }
  }

  /**
   * Calculate risk level for given parameters
   */
  async calculateRiskLevel(profitPotential: number, similarityScore: number): Promise<number> {
    try {
      const result = await this.contract.calculateRiskLevel(profitPotential, similarityScore);
      return result.toNumber();
    } catch (error) {
      console.error('Error calculating risk level:', error);
      throw error;
    }
  }

  /**
   * Execute an arbitrage opportunity
   */
  async executeArbitrage(
    opportunityId: number,
    amount: string // in ETH
  ): Promise<{ txHash: string }> {
    if (!this.signer) {
      throw new Error('Signer required for executing arbitrage');
    }

    try {
      const amountWei = ethers.utils.parseEther(amount);
      const tx = await this.contract.executeArbitrage(
        opportunityId,
        amountWei,
        { value: amountWei }
      );

      const receipt = await tx.wait();
      return { txHash: receipt.transactionHash };
    } catch (error) {
      console.error('Error executing arbitrage:', error);
      throw error;
    }
  }

  /**
   * Deactivate a market
   */
  async deactivateMarket(marketId: number): Promise<{ txHash: string }> {
    if (!this.signer) {
      throw new Error('Signer required for deactivating markets');
    }

    try {
      const tx = await this.contract.deactivateMarket(marketId);
      const receipt = await tx.wait();
      return { txHash: receipt.transactionHash };
    } catch (error) {
      console.error('Error deactivating market:', error);
      throw error;
    }
  }

  /**
   * Deactivate an arbitrage opportunity
   */
  async deactivateArbitrageOpportunity(opportunityId: number): Promise<{ txHash: string }> {
    if (!this.signer) {
      throw new Error('Signer required for deactivating arbitrage opportunities');
    }

    try {
      const tx = await this.contract.deactivateArbitrageOpportunity(opportunityId);
      const receipt = await tx.wait();
      return { txHash: receipt.transactionHash };
    } catch (error) {
      console.error('Error deactivating arbitrage opportunity:', error);
      throw error;
    }
  }

  /**
   * Listen to contract events
   */
  setupEventListeners(callbacks: {
    onMarketCreated?: (marketId: number, question: string, platform: string, creator: string, category: string, endDate: number) => void;
    onArbitrageDetected?: (opportunityId: number, polymarketMarketId: number, kalshiMarketId: number, profitPotential: number, riskLevel: number, arbitrageType: string) => void;
    onArbitrageExecuted?: (opportunityId: number, executor: string, amount: string, actualProfit: string) => void;
  }) {
    if (callbacks.onMarketCreated) {
      this.contract.on('MarketCreated', (marketId, question, platform, creator, category, endDate, event) => {
        callbacks.onMarketCreated!(
          marketId.toNumber(),
          question,
          platform,
          creator,
          category,
          endDate.toNumber()
        );
      });
    }

    if (callbacks.onArbitrageDetected) {
      this.contract.on('ArbitrageOpportunityDetected', (opportunityId, polymarketMarketId, kalshiMarketId, profitPotential, riskLevel, arbitrageType, event) => {
        callbacks.onArbitrageDetected!(
          opportunityId.toNumber(),
          polymarketMarketId.toNumber(),
          kalshiMarketId.toNumber(),
          profitPotential.toNumber(),
          riskLevel.toNumber(),
          arbitrageType
        );
      });
    }

    if (callbacks.onArbitrageExecuted) {
      this.contract.on('ArbitrageExecuted', (opportunityId, executor, amount, actualProfit, event) => {
        callbacks.onArbitrageExecuted!(
          opportunityId.toNumber(),
          executor,
          ethers.utils.formatEther(amount),
          ethers.utils.formatEther(actualProfit)
        );
      });
    }
  }

  /**
   * Remove all event listeners
   */
  removeAllListeners() {
    this.contract.removeAllListeners();
  }
}

// Helper function to create a smart contract service instance
export function createSmartContractService(
  contractAddress: string,
  provider: ethers.Provider,
  signer?: ethers.Signer
): SmartContractService {
  return new SmartContractService(contractAddress, provider, signer);
}

// Integration with existing arbitrage service
export class ArbitrageSmartContractIntegration {
  private smartContractService: SmartContractService;

  constructor(smartContractService: SmartContractService) {
    this.smartContractService = smartContractService;
  }

  /**
   * Sync arbitrage opportunity from platform to blockchain
   */
  async syncArbitrageOpportunityToBlockchain(
    polymarketMarket: any, // Your existing PolymarketMarket type
    kalshiMarket: any, // Your existing KalshiMarket type
    profitPercentage: number,
    similarityScore: number,
    arbitrageType: string
  ): Promise<number> {
    try {
      // First, create or get the market IDs on the blockchain
      const polymarketId = await this.ensureMarketOnBlockchain(
        polymarketMarket.question,
        'polymarket',
        polymarketMarket.category || 'general',
        new Date(polymarketMarket.endDate),
        polymarketMarket.liquidityNum || 1000
      );

      const kalshiId = await this.ensureMarketOnBlockchain(
        kalshiMarket.title,
        'kalshi',
        kalshiMarket.category || 'general',
        new Date(kalshiMarket.close_date),
        kalshiMarket.liquidity || 1000
      );

      // Convert profit percentage to basis points
      const profitBasisPoints = Math.floor(profitPercentage * 100);

      // Create the arbitrage opportunity on the blockchain
      const result = await this.smartContractService.createArbitrageOpportunity(
        polymarketId,
        kalshiId,
        profitBasisPoints,
        Math.floor(similarityScore * 100), // Convert to 0-100 scale
        arbitrageType
      );

      return result.opportunityId;
    } catch (error) {
      console.error('Error syncing arbitrage opportunity to blockchain:', error);
      throw error;
    }
  }

  /**
   * Ensure a market exists on the blockchain, create if it doesn't
   */
  private async ensureMarketOnBlockchain(
    question: string,
    platform: 'polymarket' | 'kalshi',
    category: string,
    endDate: Date,
    liquidityThreshold: number
  ): Promise<number> {
    try {
      // In a real implementation, you might want to check if the market already exists
      // For now, we'll create a new market each time
      const result = await this.smartContractService.createMarket(
        question,
        platform,
        category,
        endDate,
        liquidityThreshold
      );

      return result.marketId;
    } catch (error) {
      console.error('Error ensuring market on blockchain:', error);
      throw error;
    }
  }

  /**
   * Get blockchain data for dashboard
   */
  async getBlockchainDashboardData() {
    try {
      const stats = await this.smartContractService.getContractStats();
      const activeOpportunities = await this.smartContractService.getActiveArbitrageOpportunities();

      return {
        totalMarkets: stats.totalMarkets,
        totalOpportunities: stats.totalOpportunities,
        contractBalance: stats.contractBalance,
        activeOpportunitiesCount: activeOpportunities.length
      };
    } catch (error) {
      console.error('Error getting blockchain dashboard data:', error);
      throw error;
    }
  }
}
