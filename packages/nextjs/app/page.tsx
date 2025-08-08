"use client";

import { useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import {
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  BoltIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  MinusIcon,
  PlusIcon,
  QuestionMarkCircleIcon,
  ShieldCheckIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: "What is arbitrage trading in prediction markets?",
    answer:
      "Arbitrage trading involves simultaneously buying and selling identical or similar assets on different markets to profit from price differences. In prediction markets, this means finding the same event priced differently on Polymarket vs Kalshi and trading both sides for guaranteed profit.",
  },
  {
    question: "How does PolyTrade find arbitrage opportunities?",
    answer:
      "Our advanced algorithm continuously monitors Polymarket and Kalshi APIs, comparing thousands of markets in real-time. We use AI-powered matching to identify similar events and calculate price discrepancies that create profitable arbitrage opportunities.",
  },
  {
    question: "What are the risks involved?",
    answer:
      "Main risks include: market resolution differences, execution timing, liquidity constraints, and platform-specific rules. We provide risk ratings (Low/Medium/High) for each opportunity and recommend starting with low-risk, high-confidence trades.",
  },
  {
    question: "How much capital do I need to start?",
    answer:
      "You can start with as little as $100, though $1000+ allows for better diversification. Remember you'll need funds on both platforms. Our platform shows the minimum trade size for each opportunity.",
  },
  {
    question: "What fees should I expect?",
    answer:
      "Costs include: Polymarket fees (2% on winnings), Kalshi fees (varies by market), gas fees for blockchain transactions, and potential withdrawal fees. Our profit calculations show net returns after estimated fees.",
  },
  {
    question: "How fast do I need to execute trades?",
    answer:
      "Arbitrage opportunities can disappear within minutes as markets adjust. We provide real-time alerts and show the 'freshness' of each opportunity. Manual execution is possible but automated trading is recommended for best results.",
  },
  {
    question: "Are there any regulatory considerations?",
    answer:
      "Prediction market trading regulations vary by jurisdiction. Both Polymarket and Kalshi have geographic restrictions. Ensure you comply with local laws and platform terms of service before trading.",
  },
  {
    question: "Can I automate my arbitrage trading?",
    answer:
      "Yes! Our platform provides API access and webhook notifications. You can connect trading bots or use our automated execution features (coming soon) to capitalize on opportunities 24/7.",
  },
];

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full blur-xl"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-secondary/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-accent/20 rounded-full blur-xl"></div>
        </div>

        <div className="relative container mx-auto px-4 py-20 max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <BoltIcon className="h-4 w-4" />
              Real-time Arbitrage Detection
            </div>

            <h1 className="text-6xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                PolyTrade
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto">
              Discover profitable arbitrage opportunities between{" "}
              <span className="text-primary font-semibold">Polymarket</span> and{" "}
              <span className="text-secondary font-semibold">Kalshi</span>
            </p>

            <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
              Advanced AI-powered market analysis • Real-time opportunity detection • Risk-assessed trading signals
            </p>

            {connectedAddress ? (
              <div className="flex flex-col items-center gap-6">
                <div className="flex items-center gap-2 bg-base-200 px-4 py-2 rounded-full">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                  <span className="text-sm">Connected:</span>
                  <Address address={connectedAddress} />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/arbitrage" className="btn btn-primary btn-lg">
                    <ArrowPathIcon className="h-5 w-5" />
                    Find Arbitrage
                  </Link>
                  <Link href="/markets" className="btn btn-outline btn-lg">
                    <ChartBarIcon className="h-5 w-5" />
                    Browse Markets
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-lg mb-6">Connect your wallet to start arbitrage trading</p>
                <Link href="/arbitrage" className="btn btn-primary btn-lg">
                  View Opportunities
                </Link>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            <div className="text-center bg-base-100/60 backdrop-blur-sm rounded-2xl p-6 border border-base-300">
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <div className="text-sm text-gray-600">Market Monitoring</div>
            </div>
            <div className="text-center bg-base-100/60 backdrop-blur-sm rounded-2xl p-6 border border-base-300">
              <div className="text-3xl font-bold text-secondary mb-2">95%</div>
              <div className="text-sm text-gray-600">Accuracy Rate</div>
            </div>
            <div className="text-center bg-base-100/60 backdrop-blur-sm rounded-2xl p-6 border border-base-300">
              <div className="text-3xl font-bold text-accent mb-2">&lt;30s</div>
              <div className="text-sm text-gray-600">Alert Speed</div>
            </div>
            <div className="text-center bg-base-100/60 backdrop-blur-sm rounded-2xl p-6 border border-base-300">
              <div className="text-3xl font-bold text-success mb-2">2-15%</div>
              <div className="text-sm text-gray-600">Typical Profit</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-20 bg-base-100">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose PolyTrade?</h2>
            <p className="text-xl text-gray-600">Advanced tools for sophisticated arbitrage trading</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group bg-gradient-to-br from-primary/5 to-primary/10 p-8 rounded-2xl border border-primary/20 hover:border-primary/40 transition-all">
              <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ArrowPathIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Real-time Arbitrage Detection</h3>
              <p className="text-gray-600 mb-4">
                Our AI continuously scans thousands of markets across Polymarket and Kalshi, identifying profitable
                price discrepancies within seconds.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Live price feeds from both platforms</li>
                <li>• Smart market matching algorithms</li>
                <li>• Instant opportunity alerts</li>
              </ul>
            </div>

            <div className="group bg-gradient-to-br from-secondary/5 to-secondary/10 p-8 rounded-2xl border border-secondary/20 hover:border-secondary/40 transition-all">
              <div className="bg-secondary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheckIcon className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Risk Assessment</h3>
              <p className="text-gray-600 mb-4">
                Every opportunity comes with detailed risk analysis, helping you make informed decisions and manage your
                portfolio effectively.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Low/Medium/High risk ratings</li>
                <li>• Market similarity scoring</li>
                <li>• Time-to-expiry analysis</li>
              </ul>
            </div>

            <div className="group bg-gradient-to-br from-accent/5 to-accent/10 p-8 rounded-2xl border border-accent/20 hover:border-accent/40 transition-all">
              <div className="bg-accent/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BoltIcon className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-4">Advanced Analytics</h3>
              <p className="text-gray-600 mb-4">
                Comprehensive market data, historical performance tracking, and portfolio analytics to optimize your
                trading strategy.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Historical arbitrage data</li>
                <li>• Performance tracking</li>
                <li>• Market trend analysis</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 bg-gradient-to-r from-base-200 to-base-100">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Start arbitrage trading in four simple steps</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Connect Wallet",
                description: "Link your wallet to access both Polymarket and Kalshi markets",
                icon: <CurrencyDollarIcon className="h-8 w-8" />,
              },
              {
                step: "02",
                title: "Browse Opportunities",
                description: "View real-time arbitrage opportunities with profit calculations",
                icon: <ArrowTrendingUpIcon className="h-8 w-8" />,
              },
              {
                step: "03",
                title: "Analyze Risk",
                description: "Review market similarity, time to expiry, and risk ratings",
                icon: <ChartBarIcon className="h-8 w-8" />,
              },
              {
                step: "04",
                title: "Execute Trades",
                description: "Place simultaneous trades on both platforms for guaranteed profit",
                icon: <TrophyIcon className="h-8 w-8" />,
              },
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  {item.icon}
                </div>
                <div className="text-sm font-bold text-primary mb-2">STEP {item.step}</div>
                <h3 className="font-bold text-lg mb-3">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-20 bg-base-100">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Everything you need to know about arbitrage trading</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-base-300 rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-base-200 transition-colors"
                >
                  <span className="font-semibold text-lg pr-4">{faq.question}</span>
                  {expandedFAQ === index ? (
                    <MinusIcon className="h-5 w-5 text-primary flex-shrink-0" />
                  ) : (
                    <PlusIcon className="h-5 w-5 text-primary flex-shrink-0" />
                  )}
                </button>

                {expandedFAQ === index && (
                  <div className="px-6 pb-4 text-gray-600 border-t border-base-300 bg-base-50">
                    <div className="pt-4">{faq.answer}</div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8">
              <QuestionMarkCircleIcon className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
              <p className="text-gray-600 mb-4">Join our community or contact our support team</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="btn btn-primary">Join Discord</button>
                <button className="btn btn-outline">Contact Support</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Arbitrage Trading?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join hundreds of traders already profiting from prediction market arbitrage
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/arbitrage" className="btn btn-primary btn-lg">
              <ArrowPathIcon className="h-5 w-5" />
              View Live Opportunities
            </Link>
            <Link href="/portfolio" className="btn btn-outline btn-lg">
              <ChartBarIcon className="h-5 w-5" />
              Track Portfolio
            </Link>
          </div>

          <div className="mt-8 text-sm text-gray-500">
            ⚡ Real-time alerts • 🛡️ Risk management • 📊 Advanced analytics
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
