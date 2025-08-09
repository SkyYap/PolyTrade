// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../contracts/MarketCreationContract.sol";

contract MarketCreationContractTest is Test {
    MarketCreationContract public marketContract;
    address public owner;
    address public user1;
    address public user2;

    // Events to test
    event MarketCreated(
        uint256 indexed marketId,
        string question,
        string platform,
        address indexed creator,
        string category,
        uint256 endDate
    );

    event ArbitrageOpportunityDetected(
        uint256 indexed opportunityId,
        uint256 polymarketMarketId,
        uint256 kalshiMarketId,
        uint256 profitPotential,
        uint256 riskLevel,
        string arbitrageType
    );

    function setUp() public {
        owner = makeAddr("owner");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        vm.prank(owner);
        marketContract = new MarketCreationContract(owner);

        // Give some ETH to test accounts
        vm.deal(user1, 10 ether);
        vm.deal(user2, 10 ether);
        vm.deal(owner, 10 ether);
    }

    function testInitialState() public {
        assertEq(marketContract.owner(), owner);
        assertEq(marketContract.totalMarketsCreated(), 0);
        assertEq(marketContract.totalArbitrageOpportunities(), 0);
    }

    function testCreateMarket() public {
        vm.prank(user1);
        
        string memory question = "Will ETH reach $5000 by end of 2025?";
        uint256 endDate = block.timestamp + 365 days;
        
        vm.expectEmit(true, true, true, true);
        emit MarketCreated(1, question, "polymarket", user1, "cryptocurrency", endDate);
        
        uint256 marketId = marketContract.createMarket(
            question,
            "polymarket",
            "cryptocurrency",
            endDate,
            5000
        );

        assertEq(marketId, 1);
        assertEq(marketContract.totalMarketsCreated(), 1);

        // Check market details
        MarketCreationContract.Market memory market = marketContract.getMarket(1);
        assertEq(market.id, 1);
        assertEq(market.question, question);
        assertEq(market.platform, "polymarket");
        assertEq(market.creator, user1);
        assertEq(market.isActive, true);
        assertEq(market.category, "cryptocurrency");
        assertEq(market.endDate, endDate);
    }

    function testCreateMarketWithInvalidPlatform() public {
        vm.prank(user1);
        
        vm.expectRevert("Invalid platform: must be 'polymarket' or 'kalshi'");
        marketContract.createMarket(
            "Test question?",
            "invalid_platform",
            "test",
            block.timestamp + 30 days,
            1000
        );
    }

    function testCreateMarketWithPastEndDate() public {
        // Warp to a specific time to ensure we have a known current timestamp
        vm.warp(1700000000); // November 2023
        
        vm.prank(user1);
        
        // Use a date that's definitely in the past relative to our warped time
        uint256 pastEndDate = 1600000000; // September 2020
        
        vm.expectRevert("End date must be in the future");
        marketContract.createMarket(
            "Test question with minimum required length?",
            "polymarket",
            "test",
            pastEndDate,
            1000
        );
    }

    function testCreateMarketWithEmptyQuestion() public {
        vm.prank(user1);
        
        vm.expectRevert("String cannot be empty");
        marketContract.createMarket(
            "",
            "polymarket",
            "test",
            block.timestamp + 30 days,
            1000
        );
    }

    function testCreateDuplicateMarket() public {
        vm.startPrank(user1);
        
        string memory question = "Duplicate question?";
        uint256 endDate = block.timestamp + 30 days;
        
        // Create first market
        marketContract.createMarket(
            question,
            "polymarket",
            "test",
            endDate,
            1000
        );
        
        // Try to create duplicate
        vm.expectRevert("Market with this question already exists");
        marketContract.createMarket(
            question,
            "polymarket",
            "test",
            endDate,
            1000
        );
        
        vm.stopPrank();
    }

    function testMarketValidation() public {
        // Test short question (less than 10 characters) - should still be valid with score 80
        MarketCreationContract.MarketValidation memory validation = marketContract.validateMarket(
            "Short?", // 6 characters - too short but still above 70% threshold
            block.timestamp + 30 days,
            1000
        );
        
        assertEq(validation.isValid, true); // 80 score is still above 70 threshold
        assertGt(validation.issues.length, 0); // Should have issues
        assertEq(validation.confidenceScore, 80); // 100 - 20 = 80
        assertEq(validation.meetsLiquidityRequirement, true); // 1000 meets minimum
        assertEq(validation.hasReasonableTimeframe, true); // 30 days is reasonable

        // Test very short question to make it invalid
        validation = marketContract.validateMarket(
            "?", // 1 character - very short
            block.timestamp + 1 hours, // Very short timeframe
            500 // Below liquidity minimum
        );
        
        assertEq(validation.isValid, false); // Should be false due to multiple issues
        assertGt(validation.issues.length, 2); // Should have multiple issues
        assertLt(validation.confidenceScore, 70); // Should be below threshold

        // Test valid market with proper length question
        validation = marketContract.validateMarket(
            "Will Bitcoin reach $100,000 by the end of 2025?", // 49 characters - good length
            block.timestamp + 30 days,
            2000
        );
        
        assertEq(validation.isValid, true);
        assertEq(validation.meetsLiquidityRequirement, true);
        assertEq(validation.hasReasonableTimeframe, true);
        assertEq(validation.confidenceScore, 100); // Should be perfect score
    }

    function testCreateArbitrageOpportunity() public {
        // First create two markets on different platforms
        vm.prank(user1);
        uint256 polymarketId = marketContract.createMarket(
            "Will BTC reach $100k?",
            "polymarket",
            "crypto",
            block.timestamp + 60 days,
            5000
        );

        vm.prank(user2);
        uint256 kalshiId = marketContract.createMarket(
            "Will Bitcoin hit $100,000?",
            "kalshi",
            "crypto",
            block.timestamp + 60 days,
            3000
        );

        // Create arbitrage opportunity
        vm.prank(user1);
        vm.expectEmit(true, true, true, true);
        emit ArbitrageOpportunityDetected(1, polymarketId, kalshiId, 250, 1, "price_discrepancy");
        
        uint256 opportunityId = marketContract.createArbitrageOpportunity(
            polymarketId,
            kalshiId,
            250, // 2.5% profit
            90,  // 90% similarity
            "price_discrepancy"
        );

        assertEq(opportunityId, 1);
        assertEq(marketContract.totalArbitrageOpportunities(), 1);

        // Check opportunity details
        MarketCreationContract.ArbitrageOpportunity memory opportunity = 
            marketContract.getArbitrageOpportunity(1);
        
        assertEq(opportunity.id, 1);
        assertEq(opportunity.polymarketMarketId, polymarketId);
        assertEq(opportunity.kalshiMarketId, kalshiId);
        assertEq(opportunity.profitPotential, 250);
        assertEq(opportunity.riskLevel, 1); // Low risk
        assertEq(opportunity.similarityScore, 90);
        assertEq(opportunity.isActive, true);
    }

    function testCreateArbitrageOpportunityWithSamePlatform() public {
        // Create two markets on the same platform
        vm.prank(user1);
        uint256 market1 = marketContract.createMarket(
            "Question 1?",
            "polymarket",
            "test",
            block.timestamp + 30 days,
            1000
        );

        uint256 market2 = marketContract.createMarket(
            "Question 2?",
            "polymarket", // Same platform
            "test",
            block.timestamp + 30 days,
            1000
        );

        vm.expectRevert("Markets must be on different platforms");
        marketContract.createArbitrageOpportunity(
            market1,
            market2,
            300,
            80,
            "price_discrepancy"
        );
    }

    function testRiskLevelCalculation() public {
        // Test low risk: high similarity, low profit
        uint256 lowRisk = marketContract.calculateRiskLevel(400, 95);
        assertEq(lowRisk, 1);

        // Test medium risk: good similarity, medium profit
        uint256 mediumRisk = marketContract.calculateRiskLevel(800, 80);
        assertEq(mediumRisk, 2);

        // Test high risk: low similarity or high profit
        uint256 highRisk1 = marketContract.calculateRiskLevel(1500, 90);
        assertEq(highRisk1, 3);

        uint256 highRisk2 = marketContract.calculateRiskLevel(500, 60);
        assertEq(highRisk2, 3);
    }

    function testExecuteArbitrage() public {
        // Setup: Create markets and arbitrage opportunity
        vm.prank(user1);
        uint256 polymarketId = marketContract.createMarket(
            "Test arbitrage market 1?",
            "polymarket",
            "test",
            block.timestamp + 30 days,
            1000
        );

        vm.prank(user2);
        uint256 kalshiId = marketContract.createMarket(
            "Test arbitrage market 2?",
            "kalshi",
            "test",
            block.timestamp + 30 days,
            1000
        );

        vm.prank(user1);
        uint256 opportunityId = marketContract.createArbitrageOpportunity(
            polymarketId,
            kalshiId,
            500, // 5% profit
            85,
            "price_discrepancy"
        );

        // Execute arbitrage
        uint256 investmentAmount = 1 ether;
        uint256 initialBalance = user2.balance;

        vm.prank(user2);
        marketContract.executeArbitrage{value: investmentAmount}(
            opportunityId,
            investmentAmount
        );

        // Check that user's balance decreased by investment amount
        assertEq(user2.balance, initialBalance - investmentAmount);
    }

    function testExecuteArbitrageWithInsufficientFunds() public {
        // Setup arbitrage opportunity (simplified setup)
        vm.prank(user1);
        uint256 polymarketId = marketContract.createMarket(
            "Test market 1?",
            "polymarket",
            "test",
            block.timestamp + 30 days,
            1000
        );

        uint256 kalshiId = marketContract.createMarket(
            "Test market 2?",
            "kalshi",
            "test",
            block.timestamp + 30 days,
            1000
        );

        uint256 opportunityId = marketContract.createArbitrageOpportunity(
            polymarketId,
            kalshiId,
            300,
            80,
            "price_discrepancy"
        );

        // Try to execute with insufficient ETH
        vm.prank(user2);
        vm.expectRevert("Insufficient ETH sent");
        marketContract.executeArbitrage{value: 0.5 ether}(
            opportunityId,
            1 ether // Requesting more than sent
        );
    }

    function testDeactivateMarket() public {
        vm.prank(user1);
        uint256 marketId = marketContract.createMarket(
            "Market to deactivate?",
            "polymarket",
            "test",
            block.timestamp + 30 days,
            1000
        );

        // Creator should be able to deactivate
        vm.prank(user1);
        marketContract.deactivateMarket(marketId);

        MarketCreationContract.Market memory market = marketContract.getMarket(marketId);
        assertEq(market.isActive, false);
    }

    function testDeactivateMarketUnauthorized() public {
        vm.prank(user1);
        uint256 marketId = marketContract.createMarket(
            "Market to deactivate?",
            "polymarket",
            "test",
            block.timestamp + 30 days,
            1000
        );

        // Different user should not be able to deactivate
        vm.prank(user2);
        vm.expectRevert("Not authorized to deactivate this market");
        marketContract.deactivateMarket(marketId);
    }

    function testOwnerCanDeactivateMarket() public {
        vm.prank(user1);
        uint256 marketId = marketContract.createMarket(
            "Market to deactivate?",
            "polymarket",
            "test",
            block.timestamp + 30 days,
            1000
        );

        // Owner should be able to deactivate any market
        vm.prank(owner);
        marketContract.deactivateMarket(marketId);

        MarketCreationContract.Market memory market = marketContract.getMarket(marketId);
        assertEq(market.isActive, false);
    }

    function testGetUserMarkets() public {
        vm.startPrank(user1);
        
        // Create multiple markets
        marketContract.createMarket(
            "User1 Market 1?",
            "polymarket",
            "test",
            block.timestamp + 30 days,
            1000
        );

        marketContract.createMarket(
            "User1 Market 2?",
            "kalshi",
            "test",
            block.timestamp + 60 days,
            2000
        );

        vm.stopPrank();

        uint256[] memory userMarkets = marketContract.getUserMarkets(user1);
        assertEq(userMarkets.length, 2);
        assertEq(userMarkets[0], 1);
        assertEq(userMarkets[1], 2);
    }

    function testGetCategoryMarkets() public {
        vm.prank(user1);
        marketContract.createMarket(
            "Crypto Market 1?",
            "polymarket",
            "cryptocurrency",
            block.timestamp + 30 days,
            1000
        );

        vm.prank(user2);
        marketContract.createMarket(
            "Crypto Market 2?",
            "kalshi",
            "cryptocurrency",
            block.timestamp + 60 days,
            2000
        );

        uint256[] memory cryptoMarkets = marketContract.getCategoryMarkets("cryptocurrency");
        assertEq(cryptoMarkets.length, 2);
        assertEq(cryptoMarkets[0], 1);
        assertEq(cryptoMarkets[1], 2);
    }

    function testGetActiveArbitrageOpportunities() public {
        // Create markets and arbitrage opportunities
        vm.prank(user1);
        uint256 poly1 = marketContract.createMarket("Q1?", "polymarket", "test", block.timestamp + 30 days, 1000);
        uint256 kalshi1 = marketContract.createMarket("Q2?", "kalshi", "test", block.timestamp + 30 days, 1000);
        uint256 poly2 = marketContract.createMarket("Q3?", "polymarket", "test", block.timestamp + 30 days, 1000);
        uint256 kalshi2 = marketContract.createMarket("Q4?", "kalshi", "test", block.timestamp + 30 days, 1000);

        uint256 opp1 = marketContract.createArbitrageOpportunity(poly1, kalshi1, 300, 80, "price_discrepancy");
        uint256 opp2 = marketContract.createArbitrageOpportunity(poly2, kalshi2, 400, 85, "spread_arbitrage");

        uint256[] memory activeOpportunities = marketContract.getActiveArbitrageOpportunities();
        assertEq(activeOpportunities.length, 2);
        assertEq(activeOpportunities[0], 1);
        assertEq(activeOpportunities[1], 2);

        // Deactivate one opportunity
        marketContract.deactivateArbitrageOpportunity(opp1);

        activeOpportunities = marketContract.getActiveArbitrageOpportunities();
        assertEq(activeOpportunities.length, 1);
        assertEq(activeOpportunities[0], 2);
    }

    function testEmergencyWithdraw() public {
        // Send some ETH to contract
        vm.deal(address(marketContract), 5 ether);

        uint256 initialOwnerBalance = owner.balance;
        uint256 contractBalance = address(marketContract).balance;

        vm.prank(owner);
        marketContract.emergencyWithdraw();

        assertEq(address(marketContract).balance, 0);
        assertEq(owner.balance, initialOwnerBalance + contractBalance);
    }

    function testEmergencyWithdrawUnauthorized() public {
        vm.deal(address(marketContract), 1 ether);

        vm.prank(user1);
        vm.expectRevert("Not authorized: Owner only");
        marketContract.emergencyWithdraw();
    }

    function testGetContractStats() public {
        // Initially should be [0, 0, 0]
        uint256[3] memory stats = marketContract.getContractStats();
        assertEq(stats[0], 0); // totalMarkets
        assertEq(stats[1], 0); // totalOpportunities
        assertEq(stats[2], 0); // contractBalance

        // Create some data
        vm.prank(user1);
        uint256 poly = marketContract.createMarket("Test?", "polymarket", "test", block.timestamp + 30 days, 1000);
        uint256 kalshi = marketContract.createMarket("Test2?", "kalshi", "test", block.timestamp + 30 days, 1000);
        marketContract.createArbitrageOpportunity(poly, kalshi, 300, 80, "price_discrepancy");

        // Send some ETH to contract
        vm.deal(address(marketContract), 2 ether);

        stats = marketContract.getContractStats();
        assertEq(stats[0], 2); // 2 markets created
        assertEq(stats[1], 1); // 1 arbitrage opportunity
        assertEq(stats[2], 2 ether); // 2 ETH balance
    }

    function testReceiveEther() public {
        uint256 initialBalance = address(marketContract).balance;
        
        // Send ETH to contract
        vm.prank(user1);
        (bool success,) = address(marketContract).call{value: 1 ether}("");
        
        assertTrue(success);
        assertEq(address(marketContract).balance, initialBalance + 1 ether);
    }

    // Fuzz testing
    function testFuzzCreateMarket(
        uint32 endDateOffset,
        uint32 liquidityThreshold
    ) public {
        // Use smaller ranges that are more likely to pass
        endDateOffset = uint32(bound(endDateOffset, 86400, 31536000)); // 1 day to 1 year
        liquidityThreshold = uint32(bound(liquidityThreshold, 1000, 100000)); // $1k to $100k
        
        string memory platform = endDateOffset % 2 == 0 ? "polymarket" : "kalshi";
        uint256 endDate = block.timestamp + endDateOffset;
        
        vm.prank(user1);
        uint256 marketId = marketContract.createMarket(
            "Valid fuzz test market question for testing?", // Ensure it's long enough (44 chars)
            platform,
            "test",
            endDate,
            liquidityThreshold
        );
        
        assertGt(marketId, 0);
        assertEq(marketContract.totalMarketsCreated(), 1);
    }

    function testFuzzRiskCalculation(uint256 profit, uint256 similarity) public {
        // Make assumptions less restrictive and more reasonable
        profit = bound(profit, 200, 5000); // 2% to 50%
        similarity = bound(similarity, 0, 100); // 0% to 100%
        
        uint256 risk = marketContract.calculateRiskLevel(profit, similarity);
        assertTrue(risk >= 1 && risk <= 3);
    }
}
