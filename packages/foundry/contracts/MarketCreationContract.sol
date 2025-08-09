//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "forge-std/console.sol";

/**
 * @title MarketCreationContract
 * @author PolyTrade Platform
 * @notice Smart contract for managing market creation, validation, and arbitrage tracking
 * @dev This contract is triggered when creating markets in the PolyTrade platform
 */
contract MarketCreationContract {
    // State Variables
    address public immutable owner;
    uint256 public totalMarketsCreated;
    uint256 public totalArbitrageOpportunities;
    uint256 public constant MINIMUM_PROFIT_THRESHOLD = 200; // 2% in basis points
    uint256 public constant MAXIMUM_RISK_THRESHOLD = 9500; // 95% in basis points
    
    // Structs
    struct Market {
        uint256 id;
        string question;
        string platform; // "polymarket" or "kalshi"
        address creator;
        uint256 createdAt;
        bool isActive;
        uint256 liquidityThreshold;
        string category;
        uint256 endDate;
    }
    
    struct ArbitrageOpportunity {
        uint256 id;
        uint256 polymarketMarketId;
        uint256 kalshiMarketId;
        uint256 profitPotential; // in basis points (100 = 1%)
        uint256 riskLevel; // 1=low, 2=medium, 3=high
        uint256 similarityScore; // 0-100
        bool isActive;
        uint256 createdAt;
        string arbitrageType; // "price_discrepancy", "spread_arbitrage", "cross_platform"
    }
    
    struct MarketValidation {
        bool isValid;
        string[] issues;
        uint256 confidenceScore;
        bool meetsLiquidityRequirement;
        bool hasReasonableTimeframe;
    }
    
    // Mappings
    mapping(uint256 => Market) public markets;
    mapping(uint256 => ArbitrageOpportunity) public arbitrageOpportunities;
    mapping(address => uint256[]) public userMarkets;
    mapping(string => uint256[]) public categoryMarkets;
    mapping(bytes32 => bool) public marketHashes; // prevent duplicate questions
    
    // Events
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
    
    event MarketValidated(
        uint256 indexed marketId,
        bool isValid,
        uint256 confidenceScore
    );
    
    event ArbitrageExecuted(
        uint256 indexed opportunityId,
        address indexed executor,
        uint256 amount,
        uint256 actualProfit
    );
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized: Owner only");
        _;
    }
    
    modifier validMarket(uint256 _marketId) {
        require(_marketId > 0 && _marketId <= totalMarketsCreated, "Invalid market ID");
        require(markets[_marketId].isActive, "Market is not active");
        _;
    }
    
    modifier nonEmptyString(string memory _str) {
        require(bytes(_str).length > 0, "String cannot be empty");
        _;
    }
    
    modifier futureDate(uint256 _endDate) {
        require(_endDate > block.timestamp, "End date must be in the future");
        _;
    }
    
    // Constructor
    constructor(address _owner) {
        owner = _owner;
        totalMarketsCreated = 0;
        totalArbitrageOpportunities = 0;
        
        console.log("MarketCreationContract deployed by:", _owner);
    }
    
    /**
     * @notice Create a new market in the platform
     * @param _question The market question
     * @param _platform Platform where market exists ("polymarket" or "kalshi")
     * @param _category Market category
     * @param _endDate Market end date timestamp
     * @param _liquidityThreshold Minimum liquidity required
     * @return marketId The ID of the created market
     */
    function createMarket(
        string memory _question,
        string memory _platform,
        string memory _category,
        uint256 _endDate,
        uint256 _liquidityThreshold
    ) 
        external 
        nonEmptyString(_question)
        nonEmptyString(_platform)
        nonEmptyString(_category)
        futureDate(_endDate)
        returns (uint256 marketId) 
    {
        // Validate platform
        require(
            keccak256(abi.encodePacked(_platform)) == keccak256(abi.encodePacked("polymarket")) ||
            keccak256(abi.encodePacked(_platform)) == keccak256(abi.encodePacked("kalshi")),
            "Invalid platform: must be 'polymarket' or 'kalshi'"
        );
        
        // Check for duplicate questions
        bytes32 questionHash = keccak256(abi.encodePacked(_question, _platform));
        require(!marketHashes[questionHash], "Market with this question already exists");
        
        // Validate market parameters
        MarketValidation memory validation = validateMarket(_question, _endDate, _liquidityThreshold);
        require(validation.isValid, "Market validation failed");
        
        // Increment counter and create market
        totalMarketsCreated++;
        marketId = totalMarketsCreated;
        
        markets[marketId] = Market({
            id: marketId,
            question: _question,
            platform: _platform,
            creator: msg.sender,
            createdAt: block.timestamp,
            isActive: true,
            liquidityThreshold: _liquidityThreshold,
            category: _category,
            endDate: _endDate
        });
        
        // Update mappings
        userMarkets[msg.sender].push(marketId);
        categoryMarkets[_category].push(marketId);
        marketHashes[questionHash] = true;
        
        // Emit events
        emit MarketCreated(marketId, _question, _platform, msg.sender, _category, _endDate);
        emit MarketValidated(marketId, true, validation.confidenceScore);
        
        console.log("Market created:", _question);
        console.log("Market ID:", marketId);
        console.log("Platform:", _platform);
        
        return marketId;
    }
    
    /**
     * @notice Detect and register arbitrage opportunities between markets
     * @param _polymarketId Polymarket market ID
     * @param _kalshiId Kalshi market ID
     * @param _profitPotential Profit potential in basis points
     * @param _similarityScore Similarity score 0-100
     * @param _arbitrageType Type of arbitrage opportunity
     * @return opportunityId The ID of the created arbitrage opportunity
     */
    function createArbitrageOpportunity(
        uint256 _polymarketId,
        uint256 _kalshiId,
        uint256 _profitPotential,
        uint256 _similarityScore,
        string memory _arbitrageType
    ) 
        external
        validMarket(_polymarketId)
        validMarket(_kalshiId)
        returns (uint256 opportunityId)
    {
        require(_profitPotential >= MINIMUM_PROFIT_THRESHOLD, "Profit below minimum threshold");
        require(_similarityScore <= 100, "Similarity score must be 0-100");
        
        // Validate that markets are on different platforms
        require(
            keccak256(abi.encodePacked(markets[_polymarketId].platform)) != 
            keccak256(abi.encodePacked(markets[_kalshiId].platform)),
            "Markets must be on different platforms"
        );
        
        // Calculate risk level based on profit potential and similarity
        uint256 riskLevel = calculateRiskLevel(_profitPotential, _similarityScore);
        
        totalArbitrageOpportunities++;
        opportunityId = totalArbitrageOpportunities;
        
        arbitrageOpportunities[opportunityId] = ArbitrageOpportunity({
            id: opportunityId,
            polymarketMarketId: _polymarketId,
            kalshiMarketId: _kalshiId,
            profitPotential: _profitPotential,
            riskLevel: riskLevel,
            similarityScore: _similarityScore,
            isActive: true,
            createdAt: block.timestamp,
            arbitrageType: _arbitrageType
        });
        
        emit ArbitrageOpportunityDetected(
            opportunityId,
            _polymarketId,
            _kalshiId,
            _profitPotential,
            riskLevel,
            _arbitrageType
        );
        
        console.log("Arbitrage opportunity created with ID:", opportunityId);
        console.log("Profit potential:", _profitPotential, "basis points");
        
        return opportunityId;
    }
    
    /**
     * @notice Validate market parameters before creation
     * @param _question Market question
     * @param _endDate Market end date
     * @param _liquidityThreshold Liquidity threshold
     * @return validation MarketValidation struct with validation results
     */
    function validateMarket(
        string memory _question,
        uint256 _endDate,
        uint256 _liquidityThreshold
    ) public view returns (MarketValidation memory validation) {
        string[] memory issues = new string[](10);
        uint256 issueCount = 0;
        uint256 score = 100;
        
        // Check question length
        if (bytes(_question).length < 10) {
            issues[issueCount] = "Question too short (minimum 10 characters)";
            issueCount++;
            score -= 20;
        }
        
        if (bytes(_question).length > 200) {
            issues[issueCount] = "Question too long (maximum 200 characters)";
            issueCount++;
            score -= 10;
        }
        
        // Check timeframe
        bool reasonableTimeframe = false;
        if (_endDate > block.timestamp) {
            uint256 timeToEnd = _endDate - block.timestamp;
            reasonableTimeframe = timeToEnd >= 1 days && timeToEnd <= 365 days;
            
            if (!reasonableTimeframe) {
                if (timeToEnd < 1 days) {
                    issues[issueCount] = "Market duration too short (minimum 1 day)";
                } else {
                    issues[issueCount] = "Market duration too long (maximum 1 year)";
                }
                issueCount++;
                score -= 30;
            }
        } else {
            issues[issueCount] = "End date must be in the future";
            issueCount++;
            score -= 30;
        }
        
        // Check liquidity threshold
        bool meetsLiquidity = _liquidityThreshold >= 1000; // Minimum $1000
        if (!meetsLiquidity) {
            issues[issueCount] = "Liquidity threshold too low (minimum $1000)";
            issueCount++;
            score -= 15;
        }
        
        // Trim issues array
        string[] memory finalIssues = new string[](issueCount);
        for (uint256 i = 0; i < issueCount; i++) {
            finalIssues[i] = issues[i];
        }
        
        validation = MarketValidation({
            isValid: score >= 70, // Minimum 70% score to be valid
            issues: finalIssues,
            confidenceScore: score,
            meetsLiquidityRequirement: meetsLiquidity,
            hasReasonableTimeframe: reasonableTimeframe
        });
        
        return validation;
    }
    
    /**
     * @notice Calculate risk level based on profit potential and similarity score
     * @param _profitPotential Profit potential in basis points
     * @param _similarityScore Similarity score 0-100
     * @return riskLevel 1=low, 2=medium, 3=high
     */
    function calculateRiskLevel(
        uint256 _profitPotential,
        uint256 _similarityScore
    ) public pure returns (uint256 riskLevel) {
        // Higher profit with lower similarity = higher risk
        // Lower similarity means markets might not be perfectly aligned
        
        if (_similarityScore >= 90 && _profitPotential <= 500) {
            return 1; // Low risk: high similarity, modest profit
        } else if (_similarityScore >= 70 && _profitPotential <= 1000) {
            return 2; // Medium risk: good similarity, reasonable profit
        } else {
            return 3; // High risk: low similarity or very high profit (suspicious)
        }
    }
    
    /**
     * @notice Execute an arbitrage opportunity (placeholder for future integration)
     * @param _opportunityId The arbitrage opportunity ID
     * @param _amount Amount to invest
     */
    function executeArbitrage(
        uint256 _opportunityId,
        uint256 _amount
    ) external payable {
        require(_opportunityId > 0 && _opportunityId <= totalArbitrageOpportunities, "Invalid opportunity ID");
        require(arbitrageOpportunities[_opportunityId].isActive, "Opportunity is not active");
        require(_amount > 0, "Amount must be greater than 0");
        require(msg.value >= _amount, "Insufficient ETH sent");
        
        ArbitrageOpportunity storage opportunity = arbitrageOpportunities[_opportunityId];
        
        // Calculate expected profit (simplified calculation)
        uint256 expectedProfit = (_amount * opportunity.profitPotential) / 10000;
        
        // In a real implementation, this would interact with Polymarket and Kalshi APIs
        // For now, we'll emit an event and mark as executed
        
        emit ArbitrageExecuted(_opportunityId, msg.sender, _amount, expectedProfit);
        
        console.log("Arbitrage executed by:", msg.sender);
        console.log("Amount invested:", _amount);
        console.log("Expected profit:", expectedProfit);
        
        // Transfer any excess ETH back to sender
        if (msg.value > _amount) {
            payable(msg.sender).transfer(msg.value - _amount);
        }
    }
    
    /**
     * @notice Deactivate a market (only owner or creator)
     * @param _marketId Market ID to deactivate
     */
    function deactivateMarket(uint256 _marketId) external validMarket(_marketId) {
        require(
            msg.sender == owner || msg.sender == markets[_marketId].creator,
            "Not authorized to deactivate this market"
        );
        
        markets[_marketId].isActive = false;
        console.log("Market deactivated:", _marketId);
    }
    
    /**
     * @notice Deactivate an arbitrage opportunity
     * @param _opportunityId Opportunity ID to deactivate
     */
    function deactivateArbitrageOpportunity(uint256 _opportunityId) external {
        require(_opportunityId > 0 && _opportunityId <= totalArbitrageOpportunities, "Invalid opportunity ID");
        require(arbitrageOpportunities[_opportunityId].isActive, "Already inactive");
        
        arbitrageOpportunities[_opportunityId].isActive = false;
        console.log("Arbitrage opportunity deactivated:", _opportunityId);
    }
    
    // View Functions
    
    /**
     * @notice Get market details
     * @param _marketId Market ID
     * @return market Market struct
     */
    function getMarket(uint256 _marketId) external view returns (Market memory market) {
        require(_marketId > 0 && _marketId <= totalMarketsCreated, "Invalid market ID");
        return markets[_marketId];
    }
    
    /**
     * @notice Get arbitrage opportunity details
     * @param _opportunityId Opportunity ID
     * @return opportunity ArbitrageOpportunity struct
     */
    function getArbitrageOpportunity(uint256 _opportunityId) 
        external 
        view 
        returns (ArbitrageOpportunity memory opportunity) 
    {
        require(_opportunityId > 0 && _opportunityId <= totalArbitrageOpportunities, "Invalid opportunity ID");
        return arbitrageOpportunities[_opportunityId];
    }
    
    /**
     * @notice Get markets created by a user
     * @param _user User address
     * @return marketIds Array of market IDs
     */
    function getUserMarkets(address _user) external view returns (uint256[] memory marketIds) {
        return userMarkets[_user];
    }
    
    /**
     * @notice Get markets in a category
     * @param _category Category name
     * @return marketIds Array of market IDs
     */
    function getCategoryMarkets(string memory _category) external view returns (uint256[] memory marketIds) {
        return categoryMarkets[_category];
    }
    
    /**
     * @notice Get active arbitrage opportunities
     * @return activeOpportunities Array of active opportunity IDs
     */
    function getActiveArbitrageOpportunities() external view returns (uint256[] memory activeOpportunities) {
        uint256 activeCount = 0;
        
        // Count active opportunities
        for (uint256 i = 1; i <= totalArbitrageOpportunities; i++) {
            if (arbitrageOpportunities[i].isActive) {
                activeCount++;
            }
        }
        
        // Create array with active opportunities
        activeOpportunities = new uint256[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= totalArbitrageOpportunities; i++) {
            if (arbitrageOpportunities[i].isActive) {
                activeOpportunities[index] = i;
                index++;
            }
        }
        
        return activeOpportunities;
    }
    
    /**
     * @notice Emergency withdrawal (owner only)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success,) = owner.call{value: balance}("");
        require(success, "Withdrawal failed");
        
        console.log("Emergency withdrawal completed:", balance);
    }
    
    /**
     * @notice Get contract statistics
     * @return stats Array containing [totalMarkets, totalOpportunities, contractBalance]
     */
    function getContractStats() external view returns (uint256[3] memory stats) {
        stats[0] = totalMarketsCreated;
        stats[1] = totalArbitrageOpportunities;
        stats[2] = address(this).balance;
        return stats;
    }
    
    /**
     * @notice Receive ETH
     */
    receive() external payable {
        console.log("Contract received ETH:", msg.value);
    }
    
    /**
     * @notice Fallback function
     */
    fallback() external payable {
        console.log("Fallback function called");
    }
}
