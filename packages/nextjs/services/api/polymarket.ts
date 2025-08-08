// Polymarket API Service
export interface PolymarketMarket {
  id: string;
  question: string;
  description: string;
  endDate: string;
  createdAt: string;
  category: string;
  tags: string[];
  outcomes: string[];
  outcomePrices: string; // JSON string array of prices
  volume24hr: number;
  liquidityNum: number;
  lastTradePrice: number;
  active: boolean;
  closed: boolean;
  accepting_orders: boolean;
  minimum_order_size: number;
  minimum_tick_size: number;
  neg_risk: boolean;
  slug: string;
  image?: string;
  icon?: string;
  enable_order_book: boolean;
  orderPriceMinTickSize: number;
  orderSizeMinTickSize: number;
  fpmm?: string;
  maker_base_fee: number;
  taker_base_fee: number;
  umaAddress?: string;
  questionID?: string;
  resolutionSource?: string;
  endDateIso?: string;
  startDate?: string;
  volume?: number;
  liquidity?: number;
}

export interface PolymarketEvent {
  id: string;
  title: string;
  description: string;
  image: string;
  icon: string;
  slug: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  active: boolean;
  closed: boolean;
  archived: boolean;
  enable_order_book: boolean;
  liquidity: number;
  volume: number;
  comment_count: number;
  markets: PolymarketMarket[];
  tags: string[];
  cyom_eligible: boolean;
  liquidity_num: number;
  volume_num: number;
  ready: boolean;
  featured: boolean;
  competitive: number;
  restricted: boolean;
  accepting_order_timestamp: string | null;
  cyom_end_date: string | null;
}

export interface PolymarketResponse<T> {
  data: T;
  next_cursor?: string;
  count?: number;
}

class PolymarketAPI {
  private baseURL = "http://localhost:5000/api/polymarket";

  private async fetchFromBackend(endpoint: string): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.success ? result.data : result;
  }

  async getMarkets(limit: number = 20, offset: number = 0): Promise<PolymarketMarket[]> {
    try {
      const endpoint = `/markets?limit=${limit}&offset=${offset}&active=true&closed=false&order=volume24hr&ascending=false`;
      const response = await this.fetchFromBackend(endpoint);

      // The response might be an array directly or wrapped in a data property
      const markets = Array.isArray(response) ? response : response.data || response.markets || [];

      return markets.map((market: any) => ({
        id: market.id || market.condition_id,
        question: market.question || market.description,
        description: market.description || market.question,
        endDate: market.end_date_iso || market.endDate || market.end_date,
        createdAt: market.created_at || market.createdAt || new Date().toISOString(),
        category: market.category || "Uncategorized",
        tags: market.tags || [],
        outcomes: market.outcomes || ["Yes", "No"],
        outcomePrices: market.outcome_prices || market.outcomePrices || '["0.5", "0.5"]',
        volume24hr: Number(market.volume24hr || market.volume_24h || market.volume || 0),
        liquidityNum: Number(market.liquidity_num || market.liquidity || 0),
        lastTradePrice: Number(market.last_trade_price || market.lastTradePrice || 0.5),
        active: market.active !== false,
        closed: market.closed || false,
        accepting_orders: market.accepting_orders !== false,
        minimum_order_size: Number(market.minimum_order_size || 0.01),
        minimum_tick_size: Number(market.minimum_tick_size || 0.01),
        neg_risk: market.neg_risk || false,
        slug: market.slug || "",
        image: market.image,
        icon: market.icon,
        enable_order_book: market.enable_order_book !== false,
        orderPriceMinTickSize: Number(market.order_price_min_tick_size || 0.01),
        orderSizeMinTickSize: Number(market.order_size_min_tick_size || 0.01),
        fpmm: market.fpmm,
        maker_base_fee: Number(market.maker_base_fee || 0),
        taker_base_fee: Number(market.taker_base_fee || 0),
        umaAddress: market.uma_address,
        questionID: market.question_id,
        resolutionSource: market.resolution_source,
        endDateIso: market.end_date_iso,
        startDate: market.start_date,
        volume: Number(market.volume || 0),
        liquidity: Number(market.liquidity || 0),
      }));
    } catch (error) {
      console.error("Error fetching Polymarket markets:", error);
      // Return sample data for demo purposes
      return this.getSampleMarkets();
    }
  }

  async getEvents(limit: number = 20, offset: number = 0): Promise<PolymarketEvent[]> {
    try {
      const endpoint = `/events?limit=${limit}&offset=${offset}&active=true&closed=false&archived=false&order=volume&ascending=false`;
      const response = await this.fetchFromBackend(endpoint);

      const events = Array.isArray(response) ? response : response.data || response.events || [];

      return events.map((event: any) => ({
        id: event.id,
        title: event.title,
        description: event.description || "",
        image: event.image || "",
        icon: event.icon || "",
        slug: event.slug || "",
        start_date: event.start_date,
        end_date: event.end_date,
        created_at: event.created_at,
        updated_at: event.updated_at,
        active: event.active !== false,
        closed: event.closed || false,
        archived: event.archived || false,
        enable_order_book: event.enable_order_book !== false,
        liquidity: Number(event.liquidity || 0),
        volume: Number(event.volume || 0),
        comment_count: Number(event.comment_count || 0),
        markets:
          event.markets?.map((market: any) => ({
            id: market.id || market.condition_id,
            question: market.question || market.description,
            description: market.description || market.question,
            endDate: market.end_date_iso || market.endDate || market.end_date,
            createdAt: market.created_at || market.createdAt || new Date().toISOString(),
            category: market.category || event.title || "Uncategorized",
            tags: market.tags || event.tags || [],
            outcomes: market.outcomes || ["Yes", "No"],
            outcomePrices: market.outcome_prices || market.outcomePrices || '["0.5", "0.5"]',
            volume24hr: Number(market.volume24hr || market.volume_24h || market.volume || 0),
            liquidityNum: Number(market.liquidity_num || market.liquidity || 0),
            lastTradePrice: Number(market.last_trade_price || market.lastTradePrice || 0.5),
            active: market.active !== false,
            closed: market.closed || false,
            accepting_orders: market.accepting_orders !== false,
            minimum_order_size: Number(market.minimum_order_size || 0.01),
            minimum_tick_size: Number(market.minimum_tick_size || 0.01),
            neg_risk: market.neg_risk || false,
            slug: market.slug || "",
            image: market.image,
            icon: market.icon,
            enable_order_book: market.enable_order_book !== false,
            orderPriceMinTickSize: Number(market.order_price_min_tick_size || 0.01),
            orderSizeMinTickSize: Number(market.order_size_min_tick_size || 0.01),
            fpmm: market.fpmm,
            maker_base_fee: Number(market.maker_base_fee || 0),
            taker_base_fee: Number(market.taker_base_fee || 0),
          })) || [],
        tags: event.tags || [],
        cyom_eligible: event.cyom_eligible || false,
        liquidity_num: Number(event.liquidity_num || event.liquidity || 0),
        volume_num: Number(event.volume_num || event.volume || 0),
        ready: event.ready !== false,
        featured: event.featured || false,
        competitive: Number(event.competitive || 0),
        restricted: event.restricted || false,
        accepting_order_timestamp: event.accepting_order_timestamp,
        cyom_end_date: event.cyom_end_date,
      }));
    } catch (error) {
      console.error("Error fetching Polymarket events:", error);
      return [];
    }
  }

  private getSampleMarkets(): PolymarketMarket[] {
    return [
      {
        id: "sample-1",
        question: "Will Bitcoin reach $100,000 by the end of 2025?",
        description:
          'This market resolves to "Yes" if Bitcoin (BTC) reaches $100,000 USD on any major exchange by December 31, 2025.',
        endDate: "2025-12-31T23:59:59Z",
        createdAt: "2025-01-01T00:00:00Z",
        category: "Crypto",
        tags: ["Bitcoin", "Cryptocurrency", "Price"],
        outcomes: ["Yes", "No"],
        outcomePrices: '["0.65", "0.35"]',
        volume24hr: 125000,
        liquidityNum: 45000,
        lastTradePrice: 0.65,
        active: true,
        closed: false,
        accepting_orders: true,
        minimum_order_size: 0.01,
        minimum_tick_size: 0.01,
        neg_risk: false,
        slug: "bitcoin-100k-2025",
        enable_order_book: true,
        orderPriceMinTickSize: 0.01,
        orderSizeMinTickSize: 0.01,
        maker_base_fee: 0.005,
        taker_base_fee: 0.01,
      },
      {
        id: "sample-2",
        question: "Will there be a major AI breakthrough announced in 2025?",
        description:
          'This market resolves to "Yes" if a significant AI advancement is announced by a major tech company in 2025.',
        endDate: "2025-12-31T23:59:59Z",
        createdAt: "2025-01-15T00:00:00Z",
        category: "Technology",
        tags: ["AI", "Technology", "Innovation"],
        outcomes: ["Yes", "No"],
        outcomePrices: '["0.72", "0.28"]',
        volume24hr: 89000,
        liquidityNum: 32000,
        lastTradePrice: 0.72,
        active: true,
        closed: false,
        accepting_orders: true,
        minimum_order_size: 0.01,
        minimum_tick_size: 0.01,
        neg_risk: false,
        slug: "ai-breakthrough-2025",
        enable_order_book: true,
        orderPriceMinTickSize: 0.01,
        orderSizeMinTickSize: 0.01,
        maker_base_fee: 0.005,
        taker_base_fee: 0.01,
      },
    ];
  }
}

export const polymarketAPI = new PolymarketAPI();
