// Contract deployment information for local development
export const LOCAL_CONTRACTS = {
  MarketCreationContract: {
    address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    abi: [
      "function createMarket(string memory _question, string memory _platform, string memory _category, uint256 _endDate, uint256 _liquidityThreshold) external returns (uint256 marketId)",
      "function getMarket(uint256 _marketId) external view returns (tuple(uint256 id, string question, string platform, address creator, uint256 createdAt, bool isActive, uint256 liquidityThreshold, string category, uint256 endDate))",
      "function getContractStats() external view returns (uint256[3] memory stats)",
      "function validateMarket(string memory _question, uint256 _endDate, uint256 _liquidityThreshold) public view returns (tuple(bool isValid, string[] issues, uint256 confidenceScore, bool meetsLiquidityRequirement, bool hasReasonableTimeframe))",
      "function getUserMarkets(address _user) external view returns (uint256[] memory marketIds)",
      "function createArbitrageOpportunity(uint256 _polymarketId, uint256 _kalshiId, uint256 _profitPotential, uint256 _similarityScore, string memory _arbitrageType) external returns (uint256 opportunityId)",
      "function getArbitrageOpportunity(uint256 _opportunityId) external view returns (tuple(uint256 id, uint256 polymarketMarketId, uint256 kalshiMarketId, uint256 profitPotential, uint256 riskLevel, uint256 similarityScore, bool isActive, uint256 createdAt, string arbitrageType))",
      "function getActiveArbitrageOpportunities() external view returns (uint256[] memory)",
      "function totalMarketsCreated() external view returns (uint256)",
      "function totalArbitrageOpportunities() external view returns (uint256)",
      "event MarketCreated(uint256 indexed marketId, string question, string platform, address indexed creator, string category, uint256 endDate)",
      "event ArbitrageOpportunityDetected(uint256 indexed opportunityId, uint256 polymarketMarketId, uint256 kalshiMarketId, uint256 profitPotential, uint256 riskLevel, string arbitrageType)"
    ],
    chain: {
      id: 31337,
      name: "Anvil Local",
      rpcUrl: "http://127.0.0.1:8545"
    }
  }
} as const;

// Helper function to get contract instance
export function getMarketContract() {
  return LOCAL_CONTRACTS.MarketCreationContract;
}

// Sample market data that exists on the blockchain
export const DEPLOYED_MARKETS = [
  {
    id: 1,
    question: "Will Bitcoin reach $100,000 by end of 2025?",
    platform: "polymarket",
    category: "cryptocurrency",
    isActive: true
  },
  {
    id: 2, 
    question: "Will BTC hit $100k before 2026?",
    platform: "kalshi",
    category: "cryptocurrency", 
    isActive: true
  },
  {
    id: 3,
    question: "Will Ethereum reach $10,000 by 2026?", 
    platform: "polymarket",
    category: "cryptocurrency",
    isActive: true
  }
];

export const DEPLOYED_ARBITRAGE_OPPORTUNITIES = [
  {
    id: 1,
    polymarketMarketId: 1,
    kalshiMarketId: 2,
    profitPotential: 350, // 3.5%
    riskLevel: 2,
    similarityScore: 85,
    arbitrageType: "price_discrepancy",
    isActive: true
  }
];
