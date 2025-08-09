// Service for fetching markets from our smart contract
import { readContract } from '@wagmi/core';
import { wagmiConfig } from './web3/wagmiConfig';

// ABI for reading market data
const MARKET_CONTRACT_ABI = [
  {
    "type": "function",
    "name": "totalMarketsCreated",
    "inputs": [],
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getMarket",
    "inputs": [{"name": "_marketId", "type": "uint256"}],
    "outputs": [
      {
        "type": "tuple",
        "components": [
          {"name": "id", "type": "uint256"},
          {"name": "question", "type": "string"},
          {"name": "platform", "type": "string"},
          {"name": "creator", "type": "address"},
          {"name": "createdAt", "type": "uint256"},
          {"name": "isActive", "type": "bool"},
          {"name": "liquidityThreshold", "type": "uint256"},
          {"name": "category", "type": "string"},
          {"name": "endDate", "type": "uint256"}
        ]
      }
    ],
    "stateMutability": "view"
  }
] as const;

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3" as const;

export interface SmartContractMarket {
  id: string;
  question: string;
  platform: string;
  creator: string;
  createdAt: number;
  isActive: boolean;
  liquidityThreshold: string;
  category: string;
  endDate: number;
  // Additional computed fields
  timeRemaining: number;
  isExpired: boolean;
  formattedEndDate: string;
  createdAtFormatted: string;
}

export class SmartContractMarketsService {
  /**
   * Get total number of markets created
   */
  static async getTotalMarketsCount(): Promise<number> {
    try {
      const total = await readContract(wagmiConfig, {
        address: CONTRACT_ADDRESS,
        abi: MARKET_CONTRACT_ABI,
        functionName: 'totalMarketsCreated'
      }) as bigint;

      return Number(total);
    } catch (error) {
      console.error('Error getting total markets count:', error);
      return 0;
    }
  }

  /**
   * Get a specific market by ID
   */
  static async getMarket(marketId: number): Promise<SmartContractMarket | null> {
    try {
      const marketData = await readContract(wagmiConfig, {
        address: CONTRACT_ADDRESS,
        abi: MARKET_CONTRACT_ABI,
        functionName: 'getMarket',
        args: [BigInt(marketId)]
      }) as any;

      if (!marketData || !marketData.question) {
        return null;
      }

      return this.formatMarketData(marketData);
    } catch (error) {
      console.error(`Error getting market ${marketId}:`, error);
      return null;
    }
  }

  /**
   * Get all markets created in the smart contract
   */
  static async getAllMarkets(): Promise<SmartContractMarket[]> {
    try {
      const totalCount = await this.getTotalMarketsCount();
      console.log(`Fetching ${totalCount} markets from smart contract...`);

      if (totalCount === 0) {
        return [];
      }

      const markets: SmartContractMarket[] = [];
      
      // Fetch all markets (starting from 1, as market IDs start from 1)
      for (let i = 1; i <= totalCount; i++) {
        const market = await this.getMarket(i);
        if (market) {
          markets.push(market);
        }
      }

      return markets.sort((a, b) => b.createdAt - a.createdAt); // Sort by newest first
    } catch (error) {
      console.error('Error getting all markets:', error);
      return [];
    }
  }

  /**
   * Format raw market data from contract
   */
  private static formatMarketData(rawData: any): SmartContractMarket {
    const now = Math.floor(Date.now() / 1000);
    const endDate = Number(rawData.endDate);
    const createdAt = Number(rawData.createdAt);
    
    return {
      id: rawData.id.toString(),
      question: rawData.question,
      platform: rawData.platform,
      creator: rawData.creator,
      createdAt,
      isActive: rawData.isActive,
      liquidityThreshold: rawData.liquidityThreshold.toString(),
      category: rawData.category,
      endDate,
      timeRemaining: Math.max(0, endDate - now),
      isExpired: endDate <= now,
      formattedEndDate: new Date(endDate * 1000).toLocaleDateString(),
      createdAtFormatted: new Date(createdAt * 1000).toLocaleDateString()
    };
  }

  /**
   * Get markets by category
   */
  static async getMarketsByCategory(category: string): Promise<SmartContractMarket[]> {
    const allMarkets = await this.getAllMarkets();
    return allMarkets.filter(market => 
      market.category.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Get markets by creator address
   */
  static async getMarketsByCreator(creator: string): Promise<SmartContractMarket[]> {
    const allMarkets = await this.getAllMarkets();
    return allMarkets.filter(market => 
      market.creator.toLowerCase() === creator.toLowerCase()
    );
  }

  /**
   * Search markets by question text
   */
  static async searchMarkets(searchTerm: string): Promise<SmartContractMarket[]> {
    const allMarkets = await this.getAllMarkets();
    const term = searchTerm.toLowerCase();
    
    return allMarkets.filter(market =>
      market.question.toLowerCase().includes(term) ||
      market.category.toLowerCase().includes(term)
    );
  }

  /**
   * Get active markets only
   */
  static async getActiveMarkets(): Promise<SmartContractMarket[]> {
    const allMarkets = await this.getAllMarkets();
    return allMarkets.filter(market => market.isActive && !market.isExpired);
  }

  /**
   * Get contract information
   */
  static getContractInfo() {
    return {
      address: CONTRACT_ADDRESS,
      network: "Anvil Local (Chain ID: 31337)",
      abi: MARKET_CONTRACT_ABI
    };
  }
}
