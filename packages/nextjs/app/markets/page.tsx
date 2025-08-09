"use client";

import { useCallback, useEffect, useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import Link from "next/link";
import {
  AdjustmentsHorizontalIcon,
  ArrowPathRoundedSquareIcon,
  ArrowTopRightOnSquareIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  ArrowsRightLeftIcon,
  BoltIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  FireIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { ArbitrageOpportunity, arbitrageService } from "~~/services/api/arbitrage";
import { KalshiEvent, KalshiMarket, kalshiAPI } from "~~/services/api/kalshi";
import { PolymarketEvent, PolymarketMarket, polymarketAPI } from "~~/services/api/polymarket";

type Platform = "all" | "polymarket" | "kalshi";
type ViewMode = "markets" | "events" | "arbitrage";
type MarketData = (PolymarketMarket | KalshiMarket) & { platform: "polymarket" | "kalshi" };
type EventData = (PolymarketEvent | KalshiEvent) & { platform: "polymarket" | "kalshi" };

const Markets: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [events, setEvents] = useState<EventData[]>([]);
  const [arbitrageOpportunities, setArbitrageOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState<Platform>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"volume" | "activity" | "ending" | "profit">("volume");
  const [viewMode, setViewMode] = useState<ViewMode>("markets");
  const [riskFilter, setRiskFilter] = useState<"all" | "low" | "medium" | "high">("all");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      if (viewMode === "markets" || viewMode === "arbitrage") {
        const [polymarkets, kalshiResponse] = await Promise.all([
          polymarketAPI.getMarkets(50),
          kalshiAPI.getMarkets(50),
        ]);

        const kalshiMarkets = kalshiResponse.markets || [];

        // Combine and format markets
        const combinedMarkets: MarketData[] = [
          ...polymarkets.map((market: PolymarketMarket) => ({ ...market, platform: "polymarket" as const })),
          ...kalshiMarkets.map((market: KalshiMarket) => ({ ...market, platform: "kalshi" as const })),
        ];

        setMarkets(combinedMarkets);

        // Calculate arbitrage opportunities if in arbitrage mode
        if (viewMode === "arbitrage") {
          const opportunities = arbitrageService.findArbitrageOpportunities(polymarkets, kalshiMarkets);
          setArbitrageOpportunities(opportunities);
        }
      }

      if (viewMode === "events") {
        const [polyEvents, kalshiEventsResponse] = await Promise.all([
          polymarketAPI.getEvents(30),
          kalshiAPI.getEvents(30),
        ]);

        const kalshiEvents = kalshiEventsResponse.events || [];

        const combinedEvents: EventData[] = [
          ...polyEvents.map((event: PolymarketEvent) => ({ ...event, platform: "polymarket" as const })),
          ...kalshiEvents.map((event: KalshiEvent) => ({ ...event, platform: "kalshi" as const })),
        ];

        setEvents(combinedEvents);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [viewMode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getAvailableCategories = () => {
    const categories = new Set<string>();
    if (viewMode === "markets" || viewMode === "arbitrage") {
      markets.forEach(market => {
        if (market.platform === "polymarket") {
          const polymarket = market as PolymarketMarket;
          if (polymarket.category && typeof polymarket.category === "string") {
            categories.add(polymarket.category);
          }
          polymarket.tags?.forEach((tag: any) => {
            if (typeof tag === "string") {
              categories.add(tag);
            } else if (tag && typeof tag === "object" && tag.label) {
              categories.add(tag.label);
            }
          });
        } else {
          (market as KalshiMarket).tags?.forEach((tag: any) => {
            if (typeof tag === "string") {
              categories.add(tag);
            } else if (tag && typeof tag === "object" && tag.label) {
              categories.add(tag.label);
            }
          });
        }
      });
    } else if (viewMode === "events") {
      events.forEach(event => {
        if (event.platform === "polymarket") {
          const polyEvent = event as PolymarketEvent;
          polyEvent.tags?.forEach((tag: any) => {
            if (typeof tag === "string") {
              categories.add(tag);
            } else if (tag && typeof tag === "object" && tag.label) {
              categories.add(tag.label);
            }
          });
        } else {
          const kalshiEvent = event as KalshiEvent;
          if (kalshiEvent.category && typeof kalshiEvent.category === "string") {
            categories.add(kalshiEvent.category);
          }
          kalshiEvent.tags?.forEach((tag: any) => {
            if (typeof tag === "string") {
              categories.add(tag);
            } else if (tag && typeof tag === "object" && tag.label) {
              categories.add(tag.label);
            }
          });
        }
      });
    }
    return Array.from(categories).sort();
  };

  const filteredMarkets = markets
    .filter(market => {
      // Platform filter
      if (platformFilter !== "all" && market.platform !== platformFilter) {
        return false;
      }

      // Search filter
      if (searchTerm) {
        const title =
          market.platform === "polymarket" ? (market as PolymarketMarket).question : (market as KalshiMarket).title;
        if (!title.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
      }

      // Category filter
      if (categoryFilter !== "all") {
        const tags =
          market.platform === "polymarket"
            ? (market as PolymarketMarket).tags || []
            : (market as KalshiMarket).tags || [];

        const stringTags = tags
          .map((tag: any) =>
            typeof tag === "string" ? tag : tag && typeof tag === "object" && tag.label ? tag.label : "",
          )
          .filter(Boolean);

        if (!stringTags.includes(categoryFilter)) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "volume":
          const aVolume =
            a.platform === "polymarket"
              ? (a as PolymarketMarket).volume24hr || 0
              : (a as KalshiMarket).dollar_volume_24h || 0;
          const bVolume =
            b.platform === "polymarket"
              ? (b as PolymarketMarket).volume24hr || 0
              : (b as KalshiMarket).dollar_volume_24h || 0;
          return bVolume - aVolume;
        case "activity":
          const aTime =
            a.platform === "polymarket"
              ? new Date((a as PolymarketMarket).createdAt).getTime()
              : new Date((a as KalshiMarket).updated_time || (a as KalshiMarket).created_time).getTime();
          const bTime =
            b.platform === "polymarket"
              ? new Date((b as PolymarketMarket).createdAt).getTime()
              : new Date((b as KalshiMarket).updated_time || (b as KalshiMarket).created_time).getTime();
          return bTime - aTime;
        case "ending":
          const aEnd =
            a.platform === "polymarket"
              ? new Date((a as PolymarketMarket).endDate).getTime()
              : new Date((a as KalshiMarket).close_date).getTime();
          const bEnd =
            b.platform === "polymarket"
              ? new Date((b as PolymarketMarket).endDate).getTime()
              : new Date((b as KalshiMarket).close_date).getTime();
          return aEnd - bEnd;
        default:
          return 0;
      }
    });

  const filteredEvents = events
    .filter(event => {
      // Platform filter
      if (platformFilter !== "all" && event.platform !== platformFilter) {
        return false;
      }

      // Search filter
      if (searchTerm) {
        const title = event.platform === "polymarket" ? (event as PolymarketEvent).title : (event as KalshiEvent).title;
        if (!title.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
      }

      // Category filter
      if (categoryFilter !== "all") {
        const tags =
          event.platform === "polymarket" ? (event as PolymarketEvent).tags || [] : (event as KalshiEvent).tags || [];

        const stringTags = tags
          .map((tag: any) =>
            typeof tag === "string" ? tag : tag && typeof tag === "object" && tag.label ? tag.label : "",
          )
          .filter(Boolean);

        if (!stringTags.includes(categoryFilter)) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "volume":
          const aVolume = a.platform === "polymarket" ? (a as PolymarketEvent).volume_num || 0 : 0;
          const bVolume = b.platform === "polymarket" ? (b as PolymarketEvent).volume_num || 0 : 0;
          return bVolume - aVolume;
        case "activity":
          const aTime =
            a.platform === "polymarket"
              ? new Date((a as PolymarketEvent).updated_at).getTime()
              : new Date((a as KalshiEvent).updated_time).getTime();
          const bTime =
            b.platform === "polymarket"
              ? new Date((b as PolymarketEvent).updated_at).getTime()
              : new Date((b as KalshiEvent).updated_time).getTime();
          return bTime - aTime;
        case "ending":
          const aEnd =
            a.platform === "polymarket"
              ? new Date((a as PolymarketEvent).end_date).getTime()
              : new Date((a as KalshiEvent).close_date).getTime();
          const bEnd =
            b.platform === "polymarket"
              ? new Date((b as PolymarketEvent).end_date).getTime()
              : new Date((b as KalshiEvent).close_date).getTime();
          return aEnd - bEnd;
        default:
          return 0;
      }
    });

  const filteredArbitrage = arbitrageOpportunities
    .filter(opportunity => {
      // Search filter
      if (searchTerm) {
        const polyTitle = opportunity.polymarketMarket?.question || "";
        const kalshiTitle = opportunity.kalshiMarket?.title || "";
        const searchLower = searchTerm.toLowerCase();
        if (!polyTitle.toLowerCase().includes(searchLower) && !kalshiTitle.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Risk filter
      if (riskFilter !== "all" && opportunity.riskLevel !== riskFilter) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "profit":
          return b.profitPotential - a.profitPotential;
        case "volume":
          const aVolume = (a.polymarketMarket?.volume24hr || 0) + (a.kalshiMarket?.dollar_volume_24h || 0);
          const bVolume = (b.polymarketMarket?.volume24hr || 0) + (b.kalshiMarket?.dollar_volume_24h || 0);
          return bVolume - aVolume;
        case "ending":
          return a.timeToExpiry - b.timeToExpiry;
        default:
          return b.confidence - a.confidence;
      }
    });

  const formatVolume = (volume: any) => {
    const numVolume = Number(volume) || 0;
    if (numVolume >= 1000000) return `$${(numVolume / 1000000).toFixed(1)}M`;
    if (numVolume >= 1000) return `$${(numVolume / 1000).toFixed(0)}K`;
    return `$${numVolume.toFixed(0)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const MarketCard = ({ market }: { market: MarketData }) => {
    const isPolymarket = market.platform === "polymarket";
    const polymarket = market as PolymarketMarket;
    const kalshi = market as KalshiMarket;

    const title = isPolymarket ? polymarket.question : kalshi.title;
    const endDate = isPolymarket ? polymarket.endDate : kalshi.close_date;
    const volume24h = isPolymarket ? Number(polymarket.volume24hr) || 0 : Number(kalshi.dollar_volume_24h) || 0;
    const rawTags = isPolymarket ? polymarket.tags || [polymarket.category] : kalshi.tags || [];
    const tags = rawTags
      .map((tag: any) => (typeof tag === "string" ? tag : tag && typeof tag === "object" && tag.label ? tag.label : ""))
      .filter(Boolean);

    // Get prices - Parse from string format for Polymarket
    let yesPrice = 0,
      noPrice = 0;
    if (isPolymarket) {
      // Parse outcomePrices which is a string like "[\"0.5\", \"0.5\"]"
      try {
        const prices = JSON.parse(polymarket.outcomePrices || "[0, 0]");
        yesPrice = Number(prices[0]) || 0;
        noPrice = Number(prices[1]) || 0;
        // If only one price provided, calculate the other
        if (noPrice === 0 && yesPrice > 0) {
          noPrice = 1 - yesPrice;
        }
      } catch {
        yesPrice = polymarket.lastTradePrice || 0.5;
        noPrice = 1 - yesPrice;
      }
    } else {
      yesPrice = kalshi.last_price ? Number(kalshi.last_price) / 100 : 0.5;
      noPrice = 1 - yesPrice;
    }

    return (
      <div
        className={`card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 border ${
          isPolymarket ? "border-primary/20 hover:border-primary/40" : "border-secondary/20 hover:border-secondary/40"
        }`}
      >
        <div className="card-body p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <span className={`badge ${isPolymarket ? "badge-primary" : "badge-secondary"}`}>
                {isPolymarket ? "POLYMARKET" : "KALSHI"}
              </span>
              {tags[0] && <span className="badge badge-outline badge-sm">{tags[0]}</span>}
              {volume24h > 50000 && (
                <span className="badge badge-error gap-1 badge-sm">
                  <FireIcon className="h-3 w-3" />
                  HOT
                </span>
              )}
            </div>
            <ClockIcon className="h-5 w-5 text-gray-400" />
          </div>

          {/* Market Title */}
          <h3 className="card-title text-lg mb-3 line-clamp-2 min-h-[3.5rem]">{title}</h3>

          {/* Market Info */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm">
              <span className="text-gray-500">Ends: </span>
              <span className="font-medium">{formatDate(endDate)}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <CurrencyDollarIcon className="h-4 w-4" />
              <span>{formatVolume(volume24h)}</span>
            </div>
          </div>

          {/* Price Display */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div
              className={`${isPolymarket ? "bg-primary/10 border-primary/20" : "bg-success/10 border-success/20"} p-3 rounded-lg border`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${isPolymarket ? "text-primary" : "text-success"}`}>YES</span>
                <ArrowTrendingUpIcon className={`h-4 w-4 ${isPolymarket ? "text-primary" : "text-success"}`} />
              </div>
              <div className={`text-lg font-bold ${isPolymarket ? "text-primary" : "text-success"}`}>
                ${yesPrice.toFixed(2)}
              </div>
              <div className={`text-xs ${isPolymarket ? "text-primary/70" : "text-success/70"}`}>
                {(yesPrice * 100).toFixed(0)}%
              </div>
            </div>

            <div className="bg-error/10 p-3 rounded-lg border border-error/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-error">NO</span>
                <ArrowTrendingDownIcon className="h-4 w-4 text-error" />
              </div>
              <div className="text-lg font-bold text-error">${noPrice.toFixed(2)}</div>
              <div className="text-xs text-error/70">{(noPrice * 100).toFixed(0)}%</div>
            </div>
          </div>

          {/* Additional Market Info */}
          {isPolymarket && (
            <div className="text-xs text-gray-500 mb-4">
              <div>Liquidity: {formatVolume(polymarket.liquidityNum || 0)}</div>
              <div>Last: ${Number(polymarket.lastTradePrice)?.toFixed(2) || "N/A"}</div>
            </div>
          )}

          {!isPolymarket && (
            <div className="text-xs text-gray-500 mb-4">
              <div>Open Interest: {kalshi.open_interest || 0}</div>
              <div>Last: ${(Number(kalshi.last_price) / 100).toFixed(2)}</div>
            </div>
          )}

          {/* Actions */}
          <div className="card-actions justify-between items-center">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() =>
                window.open(
                  isPolymarket
                    ? `https://polymarket.com/event/${polymarket.slug}`
                    : `https://kalshi.com/markets/${kalshi.event_ticker}`,
                  "_blank",
                )
              }
            >
              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
              View on {isPolymarket ? "Polymarket" : "Kalshi"}
            </button>

            <div className="flex gap-2">
              <button className="btn btn-outline btn-sm" disabled={!connectedAddress}>
                Analyze
              </button>
              <button
                className={`btn btn-sm ${isPolymarket ? "btn-primary" : "btn-secondary"}`}
                disabled={!connectedAddress}
              >
                Trade
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ArbitrageCard = ({ opportunity }: { opportunity: ArbitrageOpportunity }) => {
    const riskColors = {
      low: "text-success",
      medium: "text-warning",
      high: "text-error",
    };

    return (
      <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 border border-accent/20 hover:border-accent/40">
        <div className="card-body p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <span className="badge badge-accent">ARBITRAGE</span>
              <span className={`badge badge-outline ${riskColors[opportunity.riskLevel]}`}>
                {opportunity.riskLevel.toUpperCase()} RISK
              </span>
              <span className="badge badge-success">
                {arbitrageService.formatProfit(opportunity.profitPotential)} PROFIT
              </span>
            </div>
            <BoltIcon className="h-5 w-5 text-accent" />
          </div>

          {/* Markets Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {opportunity.polymarketMarket && (
              <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge badge-primary badge-sm">POLYMARKET</span>
                  <span className="text-xs text-gray-500">{(opportunity.similarityScore * 100).toFixed(0)}% match</span>
                </div>
                <h4 className="font-medium text-sm line-clamp-2 mb-2">{opportunity.polymarketMarket.question}</h4>
                <div className="text-xs text-gray-500">
                  Last: ${opportunity.polymarketMarket.lastTradePrice?.toFixed(2)}
                </div>
              </div>
            )}

            {opportunity.kalshiMarket && (
              <div className="bg-secondary/10 p-3 rounded-lg border border-secondary/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge badge-secondary badge-sm">KALSHI</span>
                  <span className="text-xs text-gray-500">
                    ${(Number(opportunity.kalshiMarket.last_price) / 100).toFixed(2)}
                  </span>
                </div>
                <h4 className="font-medium text-sm line-clamp-2 mb-2">{opportunity.kalshiMarket.title}</h4>
                <div className="text-xs text-gray-500">
                  Vol: ${Number(opportunity.kalshiMarket.dollar_volume_24h || 0).toLocaleString()}
                </div>
              </div>
            )}
          </div>

          {/* Strategy */}
          <div className="bg-accent/10 p-3 rounded-lg border border-accent/20 mb-4">
            <h5 className="font-medium text-sm mb-2 text-accent">Recommended Strategy:</h5>
            <p className="text-sm">{opportunity.strategy.action}</p>
            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
              <div>
                <span className="text-gray-500">Expected Profit: </span>
                <span className="font-medium text-success">
                  {arbitrageService.formatProfit(opportunity.strategy.expectedProfit)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Max Risk: </span>
                <span className={`font-medium ${riskColors[opportunity.riskLevel]}`}>
                  {arbitrageService.formatRisk(opportunity.strategy.maxRisk)}
                </span>
              </div>
            </div>
          </div>

          {/* Warnings */}
          {opportunity.warnings.length > 0 && (
            <div className="alert alert-warning py-2 mb-4">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <div className="text-xs">
                {opportunity.warnings.slice(0, 2).map((warning, index) => (
                  <div key={`warning-${opportunity.id || "unknown"}-${index}`}>{warning}</div>
                ))}
              </div>
            </div>
          )}

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
            <div className="text-center">
              <div className="text-gray-500">Confidence</div>
              <div className="font-medium">{(opportunity.confidence * 100).toFixed(0)}%</div>
            </div>
            <div className="text-center">
              <div className="text-gray-500">Time Left</div>
              <div className="font-medium">{opportunity.timeToExpiry.toFixed(0)}d</div>
            </div>
            <div className="text-center">
              <div className="text-gray-500">Type</div>
              <div className="font-medium text-xs">{opportunity.arbitrageType}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="card-actions justify-between items-center">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                // Open both markets
                if (opportunity.polymarketMarket) {
                  window.open(`https://polymarket.com/market/${opportunity.polymarketMarket.id}`, "_blank");
                }
                if (opportunity.kalshiMarket) {
                  window.open(`https://kalshi.com/markets/${opportunity.kalshiMarket.ticker}`, "_blank");
                }
              }}
            >
              <EyeIcon className="h-4 w-4" />
              View Markets
            </button>

            <div className="flex gap-2">
              <button className="btn btn-outline btn-sm" disabled={!connectedAddress}>
                Analyze
              </button>
              <button className="btn btn-accent btn-sm" disabled={!connectedAddress}>
                Execute Arbitrage
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const EventCard = ({ event }: { event: EventData }) => {
    const isPolymarket = event.platform === "polymarket";
    const polyEvent = event as PolymarketEvent;
    const kalshiEvent = event as KalshiEvent;

    const title = isPolymarket ? polyEvent.title : kalshiEvent.title;
    const description = isPolymarket ? polyEvent.description : kalshiEvent.subtitle || "";
    const endDate = isPolymarket ? polyEvent.end_date : kalshiEvent.close_date;
    const volume = isPolymarket ? polyEvent.volume_num || 0 : 0;
    const marketCount = isPolymarket ? polyEvent.markets?.length || 0 : kalshiEvent.markets?.length || 0;

    return (
      <div
        className={`card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 border ${
          isPolymarket ? "border-primary/20 hover:border-primary/40" : "border-secondary/20 hover:border-secondary/40"
        }`}
      >
        <div className="card-body p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <span className={`badge ${isPolymarket ? "badge-primary" : "badge-secondary"}`}>
                {isPolymarket ? "POLYMARKET" : "KALSHI"} EVENT
              </span>
              <span className="badge badge-outline badge-sm">{marketCount} Markets</span>
            </div>
            <ClockIcon className="h-5 w-5 text-gray-400" />
          </div>

          {/* Event Title & Description */}
          <h3 className="card-title text-lg mb-2 line-clamp-2">{title}</h3>
          {description && <p className="text-sm text-gray-600 mb-4 line-clamp-3">{description}</p>}

          {/* Event Info */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm">
              <span className="text-gray-500">Ends: </span>
              <span className="font-medium">{formatDate(endDate)}</span>
            </div>
            {volume > 0 && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <CurrencyDollarIcon className="h-4 w-4" />
                <span>{formatVolume(volume)}</span>
              </div>
            )}
          </div>

          {/* Markets Preview */}
          {marketCount > 0 && (
            <div className="space-y-2 mb-4">
              <h4 className="text-sm font-medium">Top Markets:</h4>
              <div className="space-y-1">
                {(isPolymarket ? polyEvent.markets : kalshiEvent.markets)
                  ?.slice(0, 3)
                  .map((market: any, index: number) => {
                    const marketId = isPolymarket
                      ? market.id || `poly-market-${index}`
                      : market.ticker || `kalshi-market-${index}`;
                    const eventId = isPolymarket ? polyEvent.id : kalshiEvent.event_ticker;
                    return (
                      <div key={`${eventId}-market-${marketId}-${index}`} className="text-xs bg-base-200 p-2 rounded">
                        <div className="font-medium line-clamp-1">{isPolymarket ? market.question : market.title}</div>
                        <div className="text-gray-500">
                          Volume: {formatVolume(isPolymarket ? market.volume24hr || 0 : market.dollar_volume_24h || 0)}
                        </div>
                      </div>
                    );
                  })}
                {marketCount > 3 && (
                  <div className="text-xs text-gray-500 text-center">+{marketCount - 3} more markets</div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="card-actions justify-between items-center">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() =>
                window.open(
                  isPolymarket
                    ? `https://polymarket.com/event/${polyEvent.slug}`
                    : `https://kalshi.com/events/${kalshiEvent.event_ticker}`,
                  "_blank",
                )
              }
            >
              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
              View Event
            </button>

            <div className="flex gap-2">
              <button className="btn btn-outline btn-sm" disabled={!connectedAddress}>
                Explore Markets
              </button>
              <button
                className={`btn btn-sm ${isPolymarket ? "btn-primary" : "btn-secondary"}`}
                disabled={!connectedAddress}
              >
                Trade
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading loading-spinner loading-lg text-primary"></div>
        <span className="ml-4 text-lg">Loading markets from Polymarket and Kalshi...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Prediction Markets</h1>
          <p className="text-gray-600">Trade on real-world events across Polymarket and Kalshi</p>
        </div>

        <div className="flex items-center gap-4 mt-4 md:mt-0">
          {/* Create Market Button */}
          {connectedAddress && (
            <Link href="/markets/create" className="btn btn-primary">
              <PlusIcon className="h-5 w-5" />
              Create Market
            </Link>
          )}

          <div className="stats shadow">
            <div className="stat">
              <div className="stat-figure text-primary">
                <ChartBarIcon className="h-8 w-8" />
              </div>
              <div className="stat-title">
                {viewMode === "events" ? "Total Events" : viewMode === "arbitrage" ? "Opportunities" : "Total Markets"}
              </div>
              <div className="stat-value text-primary">
                {viewMode === "events"
                  ? events.length
                  : viewMode === "arbitrage"
                    ? arbitrageOpportunities.length
                    : markets.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs tabs-boxed mb-8 justify-center">
        <button
          className={`tab tab-lg ${viewMode === "markets" ? "tab-active" : ""}`}
          onClick={() => setViewMode("markets")}
        >
          <ChartBarIcon className="h-5 w-5 mr-2" />
          Markets
        </button>
        <button
          className={`tab tab-lg ${viewMode === "events" ? "tab-active" : ""}`}
          onClick={() => setViewMode("events")}
        >
          <UserGroupIcon className="h-5 w-5 mr-2" />
          Events
        </button>
        <button
          className={`tab tab-lg ${viewMode === "arbitrage" ? "tab-active" : ""}`}
          onClick={() => setViewMode("arbitrage")}
        >
          <ArrowsRightLeftIcon className="h-5 w-5 mr-2" />
          Arbitrage
          {arbitrageOpportunities.length > 0 && (
            <span className="badge badge-accent badge-sm ml-2">{arbitrageOpportunities.length}</span>
          )}
        </button>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="stat bg-base-100 rounded-lg shadow border border-primary/20">
          <div className="stat-figure text-primary">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-primary">P</span>
            </div>
          </div>
          <div className="stat-title text-xs">Polymarket</div>
          <div className="stat-value text-xl text-primary">
            {viewMode === "events"
              ? events.filter(e => e.platform === "polymarket").length
              : markets.filter(m => m.platform === "polymarket").length}
          </div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow border border-secondary/20">
          <div className="stat-figure text-secondary">
            <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-secondary">K</span>
            </div>
          </div>
          <div className="stat-title text-xs">Kalshi</div>
          <div className="stat-value text-xl text-secondary">
            {viewMode === "events"
              ? events.filter(e => e.platform === "kalshi").length
              : markets.filter(m => m.platform === "kalshi").length}
          </div>
        </div>

        {viewMode === "arbitrage" ? (
          <>
            <div className="stat bg-base-100 rounded-lg shadow border border-accent/20">
              <div className="stat-figure text-accent">
                <BoltIcon className="h-8 w-8" />
              </div>
              <div className="stat-title text-xs">High Profit</div>
              <div className="stat-value text-xl text-accent">
                {arbitrageOpportunities.filter(opp => opp.profitPotential > 0.05).length}
              </div>
            </div>

            <div className="stat bg-base-100 rounded-lg shadow border border-success/20">
              <div className="stat-figure text-success">
                <CheckCircleIcon className="h-8 w-8" />
              </div>
              <div className="stat-title text-xs">Low Risk</div>
              <div className="stat-value text-xl text-success">
                {arbitrageOpportunities.filter(opp => opp.riskLevel === "low").length}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="stat bg-base-100 rounded-lg shadow border border-base-300">
              <div className="stat-figure text-accent">
                <FireIcon className="h-8 w-8" />
              </div>
              <div className="stat-title text-xs">High Volume</div>
              <div className="stat-value text-xl text-accent">
                {viewMode === "events"
                  ? events.filter(e => {
                      const volume = e.platform === "polymarket" ? (e as PolymarketEvent).volume_num || 0 : 0;
                      return volume > 50000;
                    }).length
                  : markets.filter(m => {
                      const volume =
                        m.platform === "polymarket"
                          ? (m as PolymarketMarket).volume24hr || 0
                          : (m as KalshiMarket).dollar_volume_24h || 0;
                      return volume > 50000;
                    }).length}
              </div>
            </div>

            <div className="stat bg-base-100 rounded-lg shadow border border-base-300">
              <div className="stat-figure text-success">
                <ClockIcon className="h-8 w-8" />
              </div>
              <div className="stat-title text-xs">Ending Soon</div>
              <div className="stat-value text-xl text-success">
                {viewMode === "events"
                  ? events.filter(e => {
                      const endDate =
                        e.platform === "polymarket" ? (e as PolymarketEvent).end_date : (e as KalshiEvent).close_date;
                      const daysUntilEnd = (new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
                      return daysUntilEnd <= 7;
                    }).length
                  : markets.filter(m => {
                      const endDate =
                        m.platform === "polymarket" ? (m as PolymarketMarket).endDate : (m as KalshiMarket).close_date;
                      const daysUntilEnd = (new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
                      return daysUntilEnd <= 7;
                    }).length}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Filters */}
      <div className="card bg-base-100 shadow-lg mb-8 border border-base-300">
        <div className="card-body p-6">
          <div className="flex items-center gap-2 mb-4">
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
            <h3 className="font-semibold">Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-sm">
                  Search {viewMode === "events" ? "Events" : viewMode === "arbitrage" ? "Opportunities" : "Markets"}
                </span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={`Search ${viewMode}...`}
                  className="input input-bordered input-sm w-full pl-8"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <MagnifyingGlassIcon className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Platform Filter - Hide for arbitrage mode */}
            {viewMode !== "arbitrage" && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-sm">Platform</span>
                </label>
                <select
                  className="select select-bordered select-sm"
                  value={platformFilter}
                  onChange={e => setPlatformFilter(e.target.value as Platform)}
                >
                  <option value="all">All Platforms</option>
                  <option value="polymarket">Polymarket Only</option>
                  <option value="kalshi">Kalshi Only</option>
                </select>
              </div>
            )}

            {/* Category Filter */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-sm">Category</span>
              </label>
              <select
                className="select select-bordered select-sm"
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {getAvailableCategories().map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Risk Filter - Only for arbitrage mode */}
            {viewMode === "arbitrage" && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-sm">Risk Level</span>
                </label>
                <select
                  className="select select-bordered select-sm"
                  value={riskFilter}
                  onChange={e => setRiskFilter(e.target.value as any)}
                >
                  <option value="all">All Risk Levels</option>
                  <option value="low">Low Risk Only</option>
                  <option value="medium">Medium Risk Only</option>
                  <option value="high">High Risk Only</option>
                </select>
              </div>
            )}

            {/* Sort By */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-sm">Sort By</span>
              </label>
              <select
                className="select select-bordered select-sm"
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
              >
                {viewMode === "arbitrage" ? (
                  <>
                    <option value="profit">Profit Potential</option>
                    <option value="volume">Combined Volume</option>
                    <option value="ending">Time to Expiry</option>
                  </>
                ) : (
                  <>
                    <option value="volume">24h Volume</option>
                    <option value="activity">Recent Activity</option>
                    <option value="ending">Ending Soon</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Warning */}
      {!connectedAddress && (
        <div className="alert alert-warning mb-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <span>Connect your wallet to start trading on prediction markets.</span>
        </div>
      )}

      {/* Content Grid */}
      {viewMode === "markets" && (
        <>
          {filteredMarkets.length === 0 ? (
            <div className="text-center py-12">
              <ChartBarIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">No markets found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters or search terms.</p>
              <button onClick={fetchData} className="btn btn-primary">
                Refresh Markets
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">{filteredMarkets.length} Markets Found</h2>
                <button onClick={fetchData} className="btn btn-outline btn-sm">
                  <ArrowTrendingUpIcon className="h-4 w-4" />
                  Refresh
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredMarkets.map((market, index) => {
                  const marketId =
                    market.platform === "polymarket"
                      ? (market as PolymarketMarket).id || `poly-${index}`
                      : (market as KalshiMarket).ticker || `kalshi-${index}`;
                  return <MarketCard key={`market-${market.platform}-${marketId}-${index}`} market={market} />;
                })}
              </div>
            </>
          )}
        </>
      )}

      {viewMode === "events" && (
        <>
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <UserGroupIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">No events found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters or search terms.</p>
              <button onClick={fetchData} className="btn btn-primary">
                Refresh Events
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">{filteredEvents.length} Events Found</h2>
                <button onClick={fetchData} className="btn btn-outline btn-sm">
                  <ArrowTrendingUpIcon className="h-4 w-4" />
                  Refresh
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredEvents.map((event, index) => {
                  const eventId =
                    event.platform === "polymarket"
                      ? (event as PolymarketEvent).id || `poly-event-${index}`
                      : (event as KalshiEvent).event_ticker || `kalshi-event-${index}`;
                  return <EventCard key={`event-${event.platform}-${eventId}`} event={event} />;
                })}
              </div>
            </>
          )}
        </>
      )}

      {viewMode === "arbitrage" && (
        <>
          {/* Arbitrage Summary */}
          {arbitrageOpportunities.length > 0 && (
            <div className="alert alert-info mb-6">
              <BoltIcon className="h-6 w-6" />
              <div>
                <h3 className="font-bold">Arbitrage Opportunities Available!</h3>
                <div className="text-sm">
                  Found {arbitrageOpportunities.length} potential arbitrage opportunities. Best opportunity:{" "}
                  {arbitrageService.formatProfit(Math.max(...arbitrageOpportunities.map(o => o.profitPotential)))}{" "}
                  profit potential.
                </div>
              </div>
            </div>
          )}

          {filteredArbitrage.length === 0 ? (
            <div className="text-center py-12">
              <ArrowsRightLeftIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">
                {arbitrageOpportunities.length === 0
                  ? "No arbitrage opportunities found"
                  : "No opportunities match your filters"}
              </h3>
              <p className="text-gray-500 mb-6">
                {arbitrageOpportunities.length === 0
                  ? "Markets are currently well-aligned. Check back later for new opportunities."
                  : "Try adjusting your filters to see more opportunities."}
              </p>
              <button onClick={fetchData} className="btn btn-accent">
                <ArrowPathRoundedSquareIcon className="h-4 w-4" />
                Refresh Analysis
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">{filteredArbitrage.length} Arbitrage Opportunities</h2>
                <div className="flex gap-2">
                  <div className="stats stats-horizontal shadow">
                    <div className="stat py-2 px-4">
                      <div className="stat-title text-xs">Avg Profit</div>
                      <div className="stat-value text-sm text-success">
                        {arbitrageService.formatProfit(
                          filteredArbitrage.reduce((sum, opp) => sum + opp.profitPotential, 0) /
                            filteredArbitrage.length,
                        )}
                      </div>
                    </div>
                  </div>
                  <button onClick={fetchData} className="btn btn-outline btn-sm">
                    <ArrowPathRoundedSquareIcon className="h-4 w-4" />
                    Refresh
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredArbitrage.map((opportunity, index) => {
                  const opportunityId = opportunity.id || `${opportunity.arbitrageType}-${index}`;
                  return <ArbitrageCard key={`arbitrage-${opportunityId}`} opportunity={opportunity} />;
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Markets;
