// Debug version of contract service for troubleshooting
import { writeContract, readContract, waitForTransactionReceipt } from '@wagmi/core';

// Simplified ABI with just the functions we need
const MARKET_CONTRACT_ABI = [
  {
    "type": "function",
    "name": "createMarket",
    "inputs": [
      {"name": "_question", "type": "string"},
      {"name": "_platform", "type": "string"},
      {"name": "_category", "type": "string"},
      {"name": "_endDate", "type": "uint256"},
      {"name": "_liquidityThreshold", "type": "uint256"}
    ],
    "outputs": [{"name": "marketId", "type": "uint256"}],
    "stateMutability": "nonpayable"
  },
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
  },
  {
    "type": "event",
    "name": "MarketCreated",
    "inputs": [
      {"name": "marketId", "type": "uint256", "indexed": true},
      {"name": "question", "type": "string", "indexed": false},
      {"name": "platform", "type": "string", "indexed": false},
      {"name": "creator", "type": "address", "indexed": true},
      {"name": "category", "type": "string", "indexed": false},
      {"name": "endDate", "type": "uint256", "indexed": false}
    ]
  }
] as const;

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3" as const;

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

export class DebugContractService {
  /**
   * Test if we can read from the contract
   */
  static async testConnection(config: any): Promise<boolean> {
    try {
      console.log('🔍 Testing contract connection...');
      console.log('Contract address:', CONTRACT_ADDRESS);
      console.log('Config:', config);

      const totalMarkets = await readContract(config, {
        address: CONTRACT_ADDRESS,
        abi: MARKET_CONTRACT_ABI,
        functionName: 'totalMarketsCreated'
      });

      console.log('✅ Contract connection successful!');
      console.log('Total markets:', totalMarkets.toString());
      return true;
    } catch (error) {
      console.error('❌ Contract connection failed:', error);
      return false;
    }
  }

  /**
   * Create a market with detailed logging
   */
  static async createMarket(
    formData: MarketFormData,
    config: any
  ): Promise<{ marketId: string; contractDetails: ContractDetails }> {
    try {
      console.log('🚀 Starting market creation...');
      console.log('Form data:', formData);

      // Test connection first
      const canConnect = await this.testConnection(config);
      if (!canConnect) {
        throw new Error('Cannot connect to smart contract');
      }

      // Convert end date to timestamp
      const endTimestamp = Math.floor(new Date(formData.endDate).getTime() / 1000);
      console.log('End timestamp:', endTimestamp);
      
      // Prepare transaction parameters
      const txParams = {
        address: CONTRACT_ADDRESS,
        abi: MARKET_CONTRACT_ABI,
        functionName: 'createMarket',
        args: [
          formData.question,
          "polymarket", // hardcode platform for now
          formData.category,
          BigInt(endTimestamp),
          BigInt(formData.liquidityThreshold)
        ]
      };

      console.log('📝 Transaction parameters:', txParams);

      // Send transaction
      console.log('📤 Sending transaction...');
      const txHash = await writeContract(config, txParams);
      console.log('✅ Transaction sent! Hash:', txHash);

      // Wait for confirmation
      console.log('⏳ Waiting for transaction confirmation...');
      const receipt = await waitForTransactionReceipt(config, {
        hash: txHash
      });

      console.log('✅ Transaction confirmed! Receipt:', receipt);

      // Get the new market ID
      const totalMarkets = await readContract(config, {
        address: CONTRACT_ADDRESS,
        abi: MARKET_CONTRACT_ABI,
        functionName: 'totalMarketsCreated'
      }) as bigint;

      const marketId = totalMarkets.toString();
      console.log('🆔 New market ID:', marketId);

      const contractDetails: ContractDetails = {
        address: CONTRACT_ADDRESS,
        transactionHash: txHash,
        blockNumber: Number(receipt.blockNumber),
        network: "Anvil Local (Chain ID: 31337)"
      };

      console.log('🎉 Market creation successful!');
      return { marketId, contractDetails };
      
    } catch (error) {
      console.error('❌ Market creation failed:', error);
      
      // More detailed error logging
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      throw new Error(`Failed to create market: ${error}`);
    }
  }

  /**
   * Check if user is on the correct network
   */
  static isCorrectNetwork(chainId: number): boolean {
    const isCorrect = chainId === 31337;
    console.log(`🌐 Network check: ${chainId} === 31337? ${isCorrect}`);
    return isCorrect;
  }

  /**
   * Get the expected network details
   */
  static getExpectedNetwork() {
    return {
      id: 31337,
      name: "Anvil Local",
      rpcUrl: "http://127.0.0.1:8545"
    };
  }
}
