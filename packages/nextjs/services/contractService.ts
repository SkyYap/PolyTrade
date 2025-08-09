import { writeContract, readContract, waitForTransactionReceipt } from '@wagmi/core';
import { parseEther } from 'viem';
import { LOCAL_CONTRACTS } from '../contracts/localContracts';

export interface MarketFormData {
  question: string;
  category: string;
  endDate: string;
  liquidityThreshold: number;
  description: string;
  tags: string[];
  outcomeType: "binary" | "multiple" | "scalar";
}

export interface ContractDetails {
  address: string;
  transactionHash: string;
  blockNumber: number;
  network: string;
}

export class RealContractService {
  private static contractAddress = LOCAL_CONTRACTS.MarketCreationContract.address;
  private static contractAbi = LOCAL_CONTRACTS.MarketCreationContract.abi;

  /**
   * Create a market on the blockchain using real smart contract
   */
  static async createMarket(
    formData: MarketFormData,
    config: any // wagmi config
  ): Promise<{ marketId: string; contractDetails: ContractDetails }> {
    try {
      console.log('Creating market on blockchain:', formData);

      // Convert end date to timestamp
      const endTimestamp = Math.floor(new Date(formData.endDate).getTime() / 1000);
      
      // Since we're a standalone platform now, we'll use "polytrade" as platform
      const platform = "polymarket"; // For now, still using existing validation
      
      // Call the smart contract
      const txHash = await writeContract(config, {
        address: this.contractAddress as `0x${string}`,
        abi: this.contractAbi,
        functionName: 'createMarket',
        args: [
          formData.question,
          platform,
          formData.category,
          BigInt(endTimestamp),
          BigInt(formData.liquidityThreshold)
        ]
      });

      console.log('Transaction hash:', txHash);

      // Wait for transaction to be mined
      const receipt = await waitForTransactionReceipt(config, {
        hash: txHash
      });

      console.log('Transaction receipt:', receipt);

      // Parse the MarketCreated event to get the market ID
      let marketId = "unknown";
      if (receipt.logs && receipt.logs.length > 0) {
        // The market ID should be in the first log (MarketCreated event)
        const log = receipt.logs[0];
        if (log.topics && log.topics.length > 1) {
          // Market ID is typically the first indexed parameter
          marketId = parseInt(log.topics[1], 16).toString();
        }
      }

      // If we couldn't parse the market ID from logs, read it from contract
      if (marketId === "unknown") {
        try {
          const totalMarkets = await readContract(config, {
            address: this.contractAddress as `0x${string}`,
            abi: this.contractAbi,
            functionName: 'totalMarketsCreated'
          }) as bigint;
          marketId = totalMarkets.toString();
        } catch (err) {
          console.warn('Could not read total markets, using timestamp', err);
          marketId = `market_${Date.now()}`;
        }
      }

      const contractDetails: ContractDetails = {
        address: this.contractAddress,
        transactionHash: txHash,
        blockNumber: Number(receipt.blockNumber),
        network: "Anvil Local (Chain ID: 31337)"
      };

      return { marketId, contractDetails };
      
    } catch (error) {
      console.error('Smart contract error:', error);
      throw new Error(`Failed to create market on blockchain: ${error}`);
    }
  }

  /**
   * Validate market parameters using smart contract
   */
  static async validateMarket(
    question: string,
    endDate: string,
    liquidityThreshold: number,
    config: any
  ): Promise<{
    isValid: boolean;
    issues: string[];
    confidenceScore: number;
    meetsLiquidityRequirement: boolean;
    hasReasonableTimeframe: boolean;
  }> {
    try {
      const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);
      
      const validation = await readContract(config, {
        address: this.contractAddress as `0x${string}`,
        abi: this.contractAbi,
        functionName: 'validateMarket',
        args: [question, BigInt(endTimestamp), BigInt(liquidityThreshold)]
      }) as any;

      return {
        isValid: validation.isValid,
        issues: validation.issues,
        confidenceScore: Number(validation.confidenceScore),
        meetsLiquidityRequirement: validation.meetsLiquidityRequirement,
        hasReasonableTimeframe: validation.hasReasonableTimeframe
      };
    } catch (error) {
      console.error('Validation error:', error);
      // Return a fallback validation if contract call fails
      return {
        isValid: false,
        issues: ['Unable to validate with smart contract'],
        confidenceScore: 0,
        meetsLiquidityRequirement: false,
        hasReasonableTimeframe: false
      };
    }
  }

  /**
   * Get market details from blockchain
   */
  static async getMarket(marketId: string, config: any) {
    try {
      const market = await readContract(config, {
        address: this.contractAddress as `0x${string}`,
        abi: this.contractAbi,
        functionName: 'getMarket',
        args: [BigInt(marketId)]
      }) as any;

      return {
        id: Number(market.id),
        question: market.question,
        platform: market.platform,
        creator: market.creator,
        createdAt: Number(market.createdAt),
        isActive: market.isActive,
        liquidityThreshold: Number(market.liquidityThreshold),
        category: market.category,
        endDate: Number(market.endDate)
      };
    } catch (error) {
      console.error('Error fetching market:', error);
      throw error;
    }
  }

  /**
   * Get contract statistics
   */
  static async getContractStats(config: any) {
    try {
      const stats = await readContract(config, {
        address: this.contractAddress as `0x${string}`,
        abi: this.contractAbi,
        functionName: 'getContractStats'
      }) as [bigint, bigint, bigint];

      return {
        totalMarkets: Number(stats[0]),
        totalOpportunities: Number(stats[1]),
        contractBalance: Number(stats[2])
      };
    } catch (error) {
      console.error('Error fetching contract stats:', error);
      return {
        totalMarkets: 0,
        totalOpportunities: 0,
        contractBalance: 0
      };
    }
  }

  /**
   * Check if user is connected to the correct network
   */
  static isCorrectNetwork(chainId: number): boolean {
    return chainId === LOCAL_CONTRACTS.MarketCreationContract.chain.id;
  }

  /**
   * Get the expected network details
   */
  static getExpectedNetwork() {
    return LOCAL_CONTRACTS.MarketCreationContract.chain;
  }
}
