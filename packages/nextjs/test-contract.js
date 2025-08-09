// Quick test script to verify contract interaction
import { createWalletClient, http, createPublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { foundry } from 'viem/chains';

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const account = privateKeyToAccount(PRIVATE_KEY);

const publicClient = createPublicClient({
  chain: foundry,
  transport: http('http://127.0.0.1:8545')
});

const walletClient = createWalletClient({
  account,
  chain: foundry,
  transport: http('http://127.0.0.1:8545')
});

const MARKET_ABI = [
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
  }
];

async function testContract() {
  try {
    console.log('🔍 Testing contract connection...');
    
    // Read total markets
    const totalMarkets = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: MARKET_ABI,
      functionName: 'totalMarketsCreated'
    });
    
    console.log('✅ Current total markets:', totalMarkets.toString());
    
    // Create a new market
    console.log('🚀 Creating new market...');
    
    const endDate = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60); // 30 days from now
    
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: MARKET_ABI,
      functionName: 'createMarket',
      args: [
        "Test market from script - Will crypto moon?",
        "polymarket",
        "cryptocurrency",
        BigInt(endDate),
        BigInt(5000)
      ]
    });
    
    console.log('📝 Transaction hash:', hash);
    
    // Wait for transaction
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
    
    // Check new total
    const newTotal = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: MARKET_ABI,
      functionName: 'totalMarketsCreated'
    });
    
    console.log('🎉 New total markets:', newTotal.toString());
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testContract();
