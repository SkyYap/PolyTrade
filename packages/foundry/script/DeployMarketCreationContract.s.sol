// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../contracts/MarketCreationContract.sol";

contract DeployMarketCreationContract is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy the MarketCreationContract with deployer as owner
        MarketCreationContract marketContract = new MarketCreationContract(deployer);

        console.log("MarketCreationContract deployed to:", address(marketContract));
        console.log("Contract owner:", deployer);
        console.log("Deployer balance:", deployer.balance);

        // Optional: Create a test market to verify deployment
        if (block.chainid == 31337) { // Only on local anvil
            console.log("\n--- Creating test market on local network ---");
            
            uint256 testEndDate = block.timestamp + 30 days;
            uint256 testMarketId = marketContract.createMarket(
                "Will Bitcoin reach $100,000 by end of 2025?",
                "polymarket",
                "cryptocurrency",
                testEndDate,
                10000 // $10,000 liquidity threshold
            );
            
            console.log("Test market created with ID:", testMarketId);
            
            // Create another test market on Kalshi
            uint256 testMarketId2 = marketContract.createMarket(
                "Will BTC hit $100k before 2026?",
                "kalshi",
                "cryptocurrency",
                testEndDate,
                5000 // $5,000 liquidity threshold
            );
            
            console.log("Second test market created with ID:", testMarketId2);
            
            // Create a test arbitrage opportunity
            uint256 opportunityId = marketContract.createArbitrageOpportunity(
                testMarketId,
                testMarketId2,
                350, // 3.5% profit potential
                85,  // 85% similarity score
                "price_discrepancy"
            );
            
            console.log("Test arbitrage opportunity created with ID:", opportunityId);
            
            // Get contract stats
            uint256[3] memory stats = marketContract.getContractStats();
            console.log("Contract stats:");
            console.log("  Total Markets:", stats[0]);
            console.log("  Total Opportunities:", stats[1]);
            console.log("  Contract Balance (wei):", stats[2]);
        }

        vm.stopBroadcast();
    }
}
