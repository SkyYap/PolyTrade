// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../contracts/MarketCreationContract.sol";

contract InteractWithMarket is Script {
    MarketCreationContract public marketContract;
    
    function setUp() public {
        // Use the deployed contract address
        marketContract = MarketCreationContract(payable(0x5FbDB2315678afecb367f032d93F642f64180aa3));
    }

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("=== Interacting with MarketCreationContract ===");
        console.log("Contract Address:", address(marketContract));
        
        // Get contract stats
        uint256[3] memory stats = marketContract.getContractStats();
        console.log("Total Markets Created:", stats[0]);
        console.log("Total Arbitrage Opportunities:", stats[1]);
        console.log("Contract Balance (wei):", stats[2]);
        
        // Get market details
        console.log("\n=== Market Details ===");
        MarketCreationContract.Market memory market1 = marketContract.getMarket(1);
        console.log("Market 1 Question:", market1.question);
        console.log("Market 1 Platform:", market1.platform);
        console.log("Market 1 Category:", market1.category);
        console.log("Market 1 Creator:", market1.creator);
        console.log("Market 1 Active:", market1.isActive);
        
        // Get arbitrage opportunity
        console.log("\n=== Arbitrage Opportunity ===");
        MarketCreationContract.ArbitrageOpportunity memory opp = marketContract.getArbitrageOpportunity(1);
        console.log("Opportunity 1 Profit Potential:", opp.profitPotential, "basis points");
        console.log("Opportunity 1 Risk Level:", opp.riskLevel);
        console.log("Opportunity 1 Similarity Score:", opp.similarityScore);
        console.log("Opportunity 1 Type:", opp.arbitrageType);
        
        // Create a new market
        console.log("\n=== Creating New Market ===");
        uint256 newEndDate = block.timestamp + 60 days;
        uint256 newMarketId = marketContract.createMarket(
            "Will Ethereum reach $10,000 by 2026?",
            "polymarket", 
            "cryptocurrency",
            newEndDate,
            15000 // $15,000 liquidity threshold
        );
        console.log("New market created with ID:", newMarketId);
        
        // Get updated stats
        stats = marketContract.getContractStats();
        console.log("\n=== Updated Stats ===");
        console.log("Total Markets Created:", stats[0]);
        console.log("Total Arbitrage Opportunities:", stats[1]);

        vm.stopBroadcast();
    }
}
