// Portfolio Service
export interface PortfolioPosition {
  id: string;
  arbitrageOpportunityId: string;
  marketId: string;
  question: string;
  category: string;
  platform: "polymarket" | "kalshi";
  position: "YES" | "NO";
  shares: number;
  avgPrice: number;
  currentPrice: number;
  value: number;
  pnl: number;
  pnlPercent: number;
  status: "active" | "resolved" | "expired" | "pending";
  executedAt: string;
  strategy: {
    arbitrageType: string;
    expectedProfit: number;
    riskLevel: string;
  };
}

export interface ArbitrageExecution {
  id: string;
  opportunityId: string;
  polymarketPosition?: {
    marketId: string;
    position: "YES" | "NO";
    shares: number;
    price: number;
    total: number;
  };
  kalshiPosition?: {
    marketId: string;
    position: "YES" | "NO";
    shares: number;
    price: number;
    total: number;
  };
  totalInvestment: number;
  expectedProfit: number;
  status: "pending" | "executing" | "completed" | "failed" | "partial";
  executedAt: string;
  completedAt?: string;
  error?: string;
}

class PortfolioService {
  private readonly API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  async executeArbitrage(opportunity: any): Promise<ArbitrageExecution> {
    try {
      // Create execution record
      const execution: ArbitrageExecution = {
        id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        opportunityId: `${opportunity.polymarket.marketId}_${opportunity.kalshi.eventTicker}`,
        totalInvestment: 100, // Default investment amount
        expectedProfit: opportunity.score * 100 * 0.1, // Simplified calculation
        status: "pending",
        executedAt: new Date().toISOString(),
      };

      // Determine strategy based on arbitrage opportunity
      const strategy = this.determineStrategy(opportunity);
      
      // Execute positions on both platforms
      if (strategy.polymarketAction) {
        execution.polymarketPosition = {
          marketId: opportunity.polymarket.marketId,
          position: strategy.polymarketPosition,
          shares: strategy.shares,
          price: strategy.polymarketPrice,
          total: strategy.shares * strategy.polymarketPrice,
        };
      }

      if (strategy.kalshiAction) {
        execution.kalshiPosition = {
          marketId: opportunity.kalshi.eventTicker,
          position: strategy.kalshiPosition,
          shares: strategy.shares,
          price: strategy.kalshiPrice,
          total: strategy.shares * strategy.kalshiPrice,
        };
      }

      // Update status to executing
      execution.status = "executing";

      // Simulate execution delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update status to completed
      execution.status = "completed";
      execution.completedAt = new Date().toISOString();

      // Save to localStorage (in a real app, save to backend)
      this.saveExecution(execution);

      // Add positions to portfolio
      await this.addPositionsToPortfolio(execution, opportunity);

      return execution;
    } catch (error) {
      console.error("Error executing arbitrage:", error);
      throw error;
    }
  }

  private determineStrategy(opportunity: any) {
    // Simplified strategy determination
    const shares = 50; // Default shares
    const polymarketPrice = 0.6 + Math.random() * 0.2; // Simulated price
    const kalshiPrice = 0.7 + Math.random() * 0.2; // Simulated price

    return {
      polymarketAction: true,
      kalshiAction: true,
      polymarketPosition: "YES" as const,
      kalshiPosition: "NO" as const,
      shares,
      polymarketPrice,
      kalshiPrice,
    };
  }

  private saveExecution(execution: ArbitrageExecution) {
    const executions = this.getExecutions();
    executions.push(execution);
    localStorage.setItem("arbitrageExecutions", JSON.stringify(executions));
  }

  async addPositionsToPortfolio(execution: ArbitrageExecution, opportunity: any) {
    const positions: PortfolioPosition[] = [];

    // Add Polymarket position
    if (execution.polymarketPosition) {
      positions.push({
        id: `pos_pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        arbitrageOpportunityId: execution.opportunityId,
        marketId: execution.polymarketPosition.marketId,
        question: opportunity.polymarket.marketQuestion,
        category: opportunity.polymarket.tags[0] || "Other",
        platform: "polymarket",
        position: execution.polymarketPosition.position,
        shares: execution.polymarketPosition.shares,
        avgPrice: execution.polymarketPosition.price,
        currentPrice: execution.polymarketPosition.price + (Math.random() - 0.5) * 0.1,
        value: 0,
        pnl: 0,
        pnlPercent: 0,
        status: "active",
        executedAt: execution.executedAt,
        strategy: {
          arbitrageType: "cross_platform",
          expectedProfit: execution.expectedProfit / 2,
          riskLevel: "medium",
        },
      });
    }

    // Add Kalshi position
    if (execution.kalshiPosition) {
      positions.push({
        id: `pos_k_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        arbitrageOpportunityId: execution.opportunityId,
        marketId: execution.kalshiPosition.marketId,
        question: opportunity.kalshi.eventTitle,
        category: "Other",
        platform: "kalshi",
        position: execution.kalshiPosition.position,
        shares: execution.kalshiPosition.shares,
        avgPrice: execution.kalshiPosition.price,
        currentPrice: execution.kalshiPosition.price + (Math.random() - 0.5) * 0.1,
        value: 0,
        pnl: 0,
        pnlPercent: 0,
        status: "active",
        executedAt: execution.executedAt,
        strategy: {
          arbitrageType: "cross_platform",
          expectedProfit: execution.expectedProfit / 2,
          riskLevel: "medium",
        },
      });
    }

    // Calculate derived values
    positions.forEach(pos => {
      pos.value = pos.shares * pos.currentPrice;
      pos.pnl = pos.value - (pos.shares * pos.avgPrice);
      pos.pnlPercent = pos.pnl / (pos.shares * pos.avgPrice) * 100;
    });

    // Save positions to portfolio
    this.savePositions(positions);

    return positions;
  }

  private savePositions(positions: PortfolioPosition[]) {
    const existingPositions = this.getPositions();
    const updatedPositions = [...existingPositions, ...positions];
    localStorage.setItem("portfolioPositions", JSON.stringify(updatedPositions));
  }

  getPositions(): PortfolioPosition[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem("portfolioPositions");
    return stored ? JSON.parse(stored) : [];
  }

  getExecutions(): ArbitrageExecution[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem("arbitrageExecutions");
    return stored ? JSON.parse(stored) : [];
  }

  async getExecutionHistory(): Promise<ArbitrageExecution[]> {
    return this.getExecutions();
  }

  async updatePositionPrice(positionId: string, newPrice: number): Promise<void> {
    const positions = this.getPositions();
    const position = positions.find(p => p.id === positionId);
    
    if (position) {
      position.currentPrice = newPrice;
      position.value = position.shares * newPrice;
      position.pnl = position.value - (position.shares * position.avgPrice);
      position.pnlPercent = position.pnl / (position.shares * position.avgPrice) * 100;
      
      localStorage.setItem("portfolioPositions", JSON.stringify(positions));
    }
  }

  async removePosition(positionId: string): Promise<void> {
    const positions = this.getPositions();
    const filteredPositions = positions.filter(p => p.id !== positionId);
    localStorage.setItem("portfolioPositions", JSON.stringify(filteredPositions));
  }

  async removeExecutionFromPortfolio(opportunityId: string): Promise<void> {
    // Remove positions related to this execution
    const positions = this.getPositions();
    const filteredPositions = positions.filter(p => p.arbitrageOpportunityId !== opportunityId);
    localStorage.setItem("portfolioPositions", JSON.stringify(filteredPositions));
    
    // Remove execution from history
    const executions = this.getExecutions();
    const filteredExecutions = executions.filter(exec => exec.opportunityId !== opportunityId);
    localStorage.setItem("arbitrageExecutions", JSON.stringify(filteredExecutions));
  }

  clearPortfolio(): void {
    localStorage.removeItem("portfolioPositions");
    localStorage.removeItem("arbitrageExecutions");
  }
}

export const portfolioService = new PortfolioService();
