# 📈 PolyTrade

<h4 align="center">
  <a href="#documentation">Documentation</a> |
  <a href="https://github.com/SkyYap/PolyTrade">GitHub</a> |
  <a href="#features">Features</a> |
  <a href="#quickstart">Quick Start</a>
</h4>


![Debug Contracts tab](packages\nextjs\components\assets\dashboard.png)


🎯 **Cross-Platform Prediction Market Arbitrage Platform** - An advanced DeFi application that identifies and executes arbitrage opportunities across multiple prediction market platforms including Polymarket, Kalshi, and PredictIt.

⚙️ Built using NextJS, RainbowKit, Foundry, Wagmi, Viem, and Typescript.

## ✨ Features

- 🔄 **Real-time Arbitrage Detection**: Continuously monitors price differences across prediction markets
- 📊 **Multi-Platform Integration**: Supports Polymarket, Kalshi, and PredictIt APIs
- ⚡ **Automated Execution**: Smart contracts for seamless arbitrage execution
- 📈 **Live Market Data**: Real-time event fetching and processing
- 💰 **Profit Analytics**: Track arbitrage opportunities and profit margins
- 🔐 **Secure Trading**: Blockchain-based execution with wallet integration
- 📱 **Responsive UI**: Modern interface built with Next.js and Tailwind CSS

## 🏛️ Supported Platforms

- **Polymarket**: Decentralized prediction markets on Polygon
- **Kalshi**: CFTC-regulated prediction market exchange  
- **PredictIt**: Political and event prediction markets

## 🎯 How It Works

1. **Data Aggregation**: Continuously fetches market data from multiple platforms
2. **Price Analysis**: Advanced algorithms identify price discrepancies 
3. **Opportunity Detection**: Real-time monitoring for profitable arbitrage situations
4. **Smart Execution**: Automated trade execution via smart contracts
5. **Profit Tracking**: Comprehensive analytics and performance monitoring  

## 🧱 Technical Stack

**Frontend:**
- ⚛️ **Next.js 14**: React framework with App Router
- 🎨 **Tailwind CSS**: Utility-first CSS framework  
- 🌈 **RainbowKit**: Wallet connection interface
- 🔗 **Wagmi & Viem**: Ethereum interaction libraries

**Backend:**
- 🚀 **Express.js**: RESTful API server
- 🗄️ **Supabase**: Database and real-time subscriptions
- 📊 **Custom Arbitrage Engine**: Proprietary detection algorithms

**Blockchain:**
- ⚒️ **Foundry**: Smart contract development and testing
- 🔐 **Solidity**: Smart contract programming language
- 🔗 **Multi-chain Support**: Ethereum, Polygon, and more

**Development Tools:**

- ✅ **Contract Hot Reload**: Your frontend auto-adapts to your smart contract as you edit it.
- 🪝 **[Custom hooks](https://docs.scaffoldeth.io/hooks/)**: Collection of React hooks wrapper around [wagmi](https://wagmi.sh/) to simplify interactions with smart contracts with typescript autocompletion.
- 🧱 **Components**: Collection of common web3 components to quickly build your frontend.
- 🔥 **Burner Wallet & Local Faucet**: Quickly test your application with a burner wallet and local faucet.
- 🔐 **Integration with Wallet Providers**: Connect to different wallet providers and interact with the Ethereum network.

## 🚀 Quick Demo

PolyTrade automatically detects arbitrage opportunities like this:

```
📊 Arbitrage Opportunity Found!
Event: "2024 Presidential Election"
Polymarket: $0.52 (BUY)  →  Kalshi: $0.58 (SELL)
Potential Profit: 11.5% 💰
```

## 📸 Screenshots

### Dashboard Overview
- Real-time arbitrage opportunities dashboard
- Live market data from multiple platforms
- Profit/loss analytics and charts

### Market Analysis
- Cross-platform price comparison
- Historical arbitrage data
- Risk assessment metrics

### Trade Execution  
- One-click arbitrage execution
- Transaction history and status
- Portfolio performance tracking

## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v20.18.3)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## Quickstart

To get started with PolyTrade, follow the steps below:

1. Clone the repository and install dependencies:

```bash
git clone https://github.com/SkyYap/PolyTrade.git
cd PolyTrade
yarn install
```

2. Set up environment variables:

```bash
# Copy example env file
cp packages/nextjs/.env.example packages/nextjs/.env.local

# Add your API keys:
# - Polymarket API key
# - Kalshi credentials  
# - PredictIt API key
# - Supabase credentials
```

3. Run a local blockchain network:

```bash
yarn chain
```

4. Deploy the smart contracts:

```bash
yarn deploy
```

5. Start the application:

```bash
yarn start
```

Visit your app on: `http://localhost:3000`. 

## 🔧 Development Guide

### Running Arbitrage Detection

```bash
# Fetch latest events from all platforms
yarn fetch:events

# Process and analyze arbitrage opportunities  
yarn analyze:arbitrage

# Run continuous monitoring
yarn monitor
```

### Testing

```bash
# Run smart contract tests
yarn foundry:test

# Run integration tests
yarn test:integration
```

### Project Structure

- **`packages/express/`** - Backend API and arbitrage detection engine
- **`packages/nextjs/`** - Frontend React application  
- **`packages/foundry/`** - Smart contracts and blockchain deployment
- **`packages/express/scripts/`** - Data fetching and processing scripts

## 📊 API Endpoints

### Market Data
- `GET /api/arbitrage` - Current arbitrage opportunities
- `GET /api/markets/polymarket` - Polymarket events and prices
- `GET /api/markets/kalshi` - Kalshi events and prices  
- `GET /api/markets/predictit` - PredictIt events and prices

### Trading
- `POST /api/execute` - Execute arbitrage trade
- `GET /api/positions` - Current trading positions
- `GET /api/history` - Trading history and performance

### Analytics  
- `GET /api/stats` - Platform statistics and metrics
- `GET /api/opportunities/history` - Historical arbitrage data
- `GET /api/profits` - Profit and loss analytics

## 🔒 Security Features

- **Smart Contract Auditing**: Thoroughly tested contracts
- **Multi-signature Wallets**: Enhanced fund security
- **Rate Limiting**: API protection against abuse
- **Encrypted Communications**: Secure data transmission
- **Access Controls**: Role-based permissions

## Documentation

### Core Components

- **Arbitrage Detector**: Advanced algorithm for identifying profitable opportunities
- **Market Data Processor**: Real-time data normalization across platforms
- **Smart Contract Integration**: Automated execution and fund management
- **Risk Management**: Position sizing and profit optimization

### Configuration

Edit your configuration in:
- `packages/nextjs/scaffold.config.ts` - Frontend settings
- `packages/express/config/` - API and database configuration  
- `packages/foundry/foundry.toml` - Blockchain network settings

## 🚀 Deployment

### Production Deployment

```bash
# Build the application
yarn build

# Deploy to Vercel (Frontend)
vercel --prod

# Deploy smart contracts to mainnet
yarn deploy:mainnet

# Start production API server
yarn start:prod
```

### Environment Setup

Create `.env.local` files with the following variables:

```bash
# Blockchain
PRIVATE_KEY=your_private_key
ALCHEMY_API_KEY=your_alchemy_key

# APIs  
POLYMARKET_API_KEY=your_polymarket_key
KALSHI_USERNAME=your_kalshi_username
KALSHI_PASSWORD=your_kalshi_password
PREDICTIT_API_KEY=your_predictit_key

# Database
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key

# Security
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key
```

## 🤝 Community & Support

- **Discord**: Join our [Discord server](https://discord.gg/polytrade) for real-time discussions
- **Twitter**: Follow [@PolyTradeApp](https://twitter.com/polytradeapp) for updates
- **Issues**: Report bugs and request features on [GitHub Issues](https://github.com/SkyYap/PolyTrade/issues)
- **Documentation**: Comprehensive guides at [docs.polytrade.io](https://docs.polytrade.io)

## 📈 Roadmap

### Q1 2025
- [x] Core arbitrage detection engine
- [x] Polymarket and Kalshi integration
- [x] Basic web interface
- [ ] PredictIt integration
- [ ] Advanced analytics dashboard

### Q2 2025  
- [ ] Mobile application
- [ ] Additional prediction market platforms
- [ ] Advanced trading strategies
- [ ] Social trading features

### Q3 2025
- [ ] Institutional trading tools
- [ ] API marketplace
- [ ] Cross-chain arbitrage
- [ ] AI-powered market analysis

## ⚖️ Legal & Compliance

- Ensure compliance with local regulations regarding prediction markets
- Users are responsible for understanding their jurisdiction's laws
- Platform operates as a tool for market analysis and trade execution
- No investment advice is provided - use at your own risk

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing to PolyTrade

We welcome contributions to PolyTrade! Whether it's:

- 🐛 Bug fixes
- ✨ New features  
- 📚 Documentation improvements
- 🔧 Platform integrations

Please see [CONTRIBUTING.MD](CONTRIBUTING.md) for guidelines.