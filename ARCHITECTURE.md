# 🏗️ PolyTrade Architecture

## 📋 Overview

PolyTrade is a sophisticated cross-platform prediction market arbitrage platform built with a modern microservices architecture. The system continuously monitors price differences across multiple prediction markets (Polymarket, Kalshi, PredictIt) and enables automated arbitrage execution through smart contracts.

## 🏛️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         POLYTRADE PLATFORM                          │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                │                   │                   │
        ┌───────▼────────┐ ┌───────▼────────┐ ┌───────▼────────┐
        │   FRONTEND     │ │    BACKEND     │ │   BLOCKCHAIN   │
        │   (Next.js)    │ │   (Express)    │ │   (Foundry)    │
        └────────────────┘ └────────────────┘ └────────────────┘
                │                   │                   │
        ┌───────▼────────┐ ┌───────▼────────┐ ┌───────▼────────┐
        │ User Interface │ │ API Services   │ │ Smart Contracts│
        │ Portfolio Mgmt │ │ Data Fetching  │ │ Market Creation│
        │ Real-time Data │ │ Arbitrage Det. │ │ Trade Execution│
        └────────────────┘ └────────────────┘ └────────────────┘
```

## 🧩 Component Architecture

### 📱 Frontend Layer (Next.js)
```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (packages/nextjs)                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Dashboard  │  │  Arbitrage  │  │  Portfolio  │             │
│  │     UI      │  │     UI      │  │     UI      │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Markets   │  │BlockExplorer│  │    Debug    │             │
│  │     UI      │  │     UI      │  │     UI      │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                Web3 Integration Layer                     │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │ │
│  │  │ RainbowKit  │  │    Wagmi    │  │    Viem     │       │ │
│  │  │  (Wallets)  │  │   (Hooks)   │  │(Blockchain) │       │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘       │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 🔧 Backend Layer (Express.js)
```
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (packages/express)                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    API Routes Layer                         │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │ │
│  │  │   Combined  │  │   Kalshi    │  │ Polymarket  │         │ │
│  │  │  Controller │  │ Controller  │  │ Controller  │         │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘         │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                 Processing Scripts                          │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │ │
│  │  │   Arbitrage │  │   Market    │  │    Data     │         │ │
│  │  │  Detection  │  │  Fetching   │  │ Processing  │         │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘         │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                External Integrations                        │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │ │
│  │  │  Supabase   │  │   Logger    │  │    CORS     │         │ │
│  │  │ (Database)  │  │   System    │  │  Security   │         │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘         │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### ⛓️ Blockchain Layer (Foundry)
```
┌─────────────────────────────────────────────────────────────────┐
│                   BLOCKCHAIN (packages/foundry)                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                  Smart Contracts                            │ │
│  │  ┌─────────────────┐  ┌─────────────────┐                 │ │
│  │  │ MarketCreation  │  │  YourContract   │                 │ │
│  │  │   Contract      │  │   (Generic)     │                 │ │
│  │  └─────────────────┘  └─────────────────┘                 │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                Deployment & Testing                         │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │ │
│  │  │  Deploy     │  │    Test     │  │   Verify    │         │ │
│  │  │  Scripts    │  │   Suites    │  │  Scripts    │         │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘         │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                   Development Tools                         │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │ │
│  │  │  Account    │  │  Keystore   │  │   Balance   │         │ │
│  │  │ Management  │  │ Generation  │  │   Checker   │         │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘         │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         DATA FLOW                               │
└─────────────────────────────────────────────────────────────────┘

    External APIs                Backend Processing              Frontend Display
┌─────────────────┐           ┌─────────────────┐             ┌─────────────────┐
│   Polymarket    │           │     Express     │             │     Next.js     │
│      API        │───────────│      Server     │─────────────│   Application   │
└─────────────────┘           └─────────────────┘             └─────────────────┘
                                       │                               │
┌─────────────────┐                    │                               │
│    Kalshi       │────────────────────┤                               │
│      API        │                    │                               │
└─────────────────┘                    │                               │
                                       │                               │
┌─────────────────┐                    │                               │
│   PredictIt     │────────────────────┤                               │
│      API        │                    │                               │
└─────────────────┘                    │                               │
                                       │                               │
                              ┌─────────────────┐                      │
                              │    Supabase     │                      │
                              │    Database     │──────────────────────┤
                              └─────────────────┘                      │
                                       │                               │
                              ┌─────────────────┐                      │
                              │   Blockchain    │                      │
                              │ Smart Contracts │──────────────────────┘
                              └─────────────────┘
```

## 🏗️ System Flow

### 1. 📊 Data Acquisition Flow
```
External APIs → Fetch Scripts → Data Processing → Database Storage → API Endpoints → Frontend Display
```

### 2. 🔍 Arbitrage Detection Flow
```
Market Data → Price Analysis → Opportunity Detection → Alert Generation → UI Notification → Trade Execution
```

### 3. 💰 Trade Execution Flow
```
User Input → Smart Contract Interaction → Blockchain Transaction → Result Tracking → Portfolio Update
```

## 🧱 Technology Stack Details

### Frontend Technologies
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + DaisyUI
- **Web3**: RainbowKit + Wagmi + Viem
- **State Management**: React Query (@tanstack/react-query)
- **UI Components**: Custom components + Heroicons

### Backend Technologies
- **Runtime**: Node.js with Express.js
- **Database**: Supabase (PostgreSQL)
- **Security**: Helmet, CORS
- **Logging**: Morgan
- **Environment**: dotenv

### Blockchain Technologies
- **Framework**: Foundry (Forge + Cast + Anvil)
- **Language**: Solidity ^0.8.0
- **Testing**: Forge Test Framework
- **Deployment**: Custom deployment scripts

## 🔌 API Integration Points

### External APIs
1. **Polymarket API**: Prediction market data
2. **Kalshi API**: CFTC-regulated market data  
3. **PredictIt API**: Political prediction markets

### Internal APIs
1. **REST Endpoints**: Express.js API routes
2. **WebSocket**: Real-time data subscriptions
3. **Smart Contract**: Blockchain interactions

## 🗄️ Database Schema

```sql
-- Simplified database structure
Markets Table:
- id, question, platform, creator, created_at, is_active, end_date

Arbitrage_Opportunities Table:
- id, market_id, profit_margin, timestamp, executed

User_Portfolios Table:
- id, user_address, total_value, profit_loss

Transactions Table:
- id, user_address, transaction_hash, amount, status
```

## 🔐 Security Architecture

### Frontend Security
- Wallet connection validation
- Input sanitization
- HTTPS enforcement

### Backend Security
- Helmet middleware for security headers
- CORS configuration
- Rate limiting
- Input validation

### Blockchain Security
- Smart contract auditing
- Access control modifiers
- Reentrancy protection

## 🚀 Deployment Architecture

```
Development → Testing → Staging → Production

┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Local     │    │   Testnet   │    │  Mainnet    │
│ Development │ →  │  Staging    │ →  │ Production  │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 📈 Performance Considerations

1. **Caching Strategy**: Redis for API responses
2. **Database Optimization**: Indexed queries
3. **API Rate Limiting**: Prevent abuse
4. **Real-time Updates**: WebSocket connections
5. **CDN**: Static asset delivery

## 🔮 Future Architecture Enhancements

1. **Microservices**: Split into dedicated services
2. **Message Queue**: Redis/RabbitMQ for async processing
3. **Load Balancing**: Multiple server instances
4. **Monitoring**: Application performance monitoring
5. **CI/CD Pipeline**: Automated testing and deployment

---

*This architecture document provides a comprehensive overview of the PolyTrade platform's technical structure and can serve as a reference for development and scaling decisions.*
