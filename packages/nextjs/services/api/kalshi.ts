// Kalshi API Service
export interface KalshiMarket {
  ticker: string;
  title: string;
  subtitle?: string;
  event_ticker: string;
  series_ticker: string;
  tags: string[];
  created_time: string;
  updated_time: string;
  close_date: string;
  expiration_date: string;
  settlement_date?: string;
  type: string;
  status: string;
  yes_ask?: number;
  yes_bid?: number;
  no_ask?: number;
  no_bid?: number;
  last_price?: number;
  previous_yes_ask?: number;
  previous_yes_bid?: number;
  previous_no_ask?: number;
  previous_no_bid?: number;
  previous_price?: number;
  dollar_volume_24h?: number;
  dollar_open_interest?: number;
  open_interest?: number;
  liquidity?: number;
  can_close_early?: boolean;
  capped?: boolean;
  notional_value?: number;
  strike_type?: string;
  floor_strike?: number;
  cap_strike?: number;
  functional_strike?: number;
  custom_strike?: string;
  settlement_value?: number;
  resolution_value?: string;
  result?: string;
  ts?: number;
}

export interface KalshiEvent {
  event_ticker: string;
  title: string;
  subtitle?: string;
  category: string;
  sub_category?: string;
  status: string;
  created_time: string;
  updated_time: string;
  close_date: string;
  settlement_date: string;
  mutually_exclusive?: boolean;
  description?: string;
  markets: KalshiMarket[];
  tags: string[];
}

export interface KalshiResponse<T> {
  markets?: T;
  events?: T;
  cursor?: string;
  count?: number;
}

class KalshiAPI {
  private baseURL = "http://localhost:5000/api/kalshi";

  private async fetchFromBackend(endpoint: string): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;

    try {
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
    } catch (error) {
      console.error("Backend API fetch error:", error);
      throw error;
    }
  }

  async getMarkets(limit: number = 20, cursor?: string, status?: string): Promise<KalshiResponse<KalshiMarket[]>> {
    try {
      let endpoint = `/markets?limit=${limit}`;
      if (cursor) endpoint += `&cursor=${cursor}`;
      if (status) endpoint += `&status=${status}`;
      else endpoint += `&status=open`;

      const response = await this.fetchFromBackend(endpoint);

      return {
        markets:
          response.markets?.map((market: any) => ({
            ticker: market.ticker,
            title: market.title,
            subtitle: market.subtitle,
            event_ticker: market.event_ticker,
            series_ticker: market.series_ticker,
            tags: Array.isArray(market.tags)
              ? market.tags
                  .map((tag: any) =>
                    typeof tag === "string"
                      ? tag
                      : tag && typeof tag === "object" && tag.label
                        ? tag.label
                        : tag?.toString() || "",
                  )
                  .filter(Boolean)
              : [],
            created_time: market.created_time,
            updated_time: market.updated_time,
            close_date: market.close_date,
            expiration_date: market.expiration_date,
            settlement_date: market.settlement_date,
            type: market.type,
            status: market.status,
            yes_ask: market.yes_ask ? Number(market.yes_ask) : undefined,
            yes_bid: market.yes_bid ? Number(market.yes_bid) : undefined,
            no_ask: market.no_ask ? Number(market.no_ask) : undefined,
            no_bid: market.no_bid ? Number(market.no_bid) : undefined,
            last_price: market.last_price ? Number(market.last_price) : undefined,
            previous_yes_ask: market.previous_yes_ask ? Number(market.previous_yes_ask) : undefined,
            previous_yes_bid: market.previous_yes_bid ? Number(market.previous_yes_bid) : undefined,
            previous_no_ask: market.previous_no_ask ? Number(market.previous_no_ask) : undefined,
            previous_no_bid: market.previous_no_bid ? Number(market.previous_no_bid) : undefined,
            previous_price: market.previous_price ? Number(market.previous_price) : undefined,
            dollar_volume_24h: market.dollar_volume_24h ? Number(market.dollar_volume_24h) : undefined,
            dollar_open_interest: market.dollar_open_interest ? Number(market.dollar_open_interest) : undefined,
            open_interest: market.open_interest ? Number(market.open_interest) : undefined,
            liquidity: market.liquidity ? Number(market.liquidity) : undefined,
            can_close_early: market.can_close_early,
            capped: market.capped,
            notional_value: market.notional_value ? Number(market.notional_value) : undefined,
            strike_type: market.strike_type,
            floor_strike: market.floor_strike ? Number(market.floor_strike) : undefined,
            cap_strike: market.cap_strike ? Number(market.cap_strike) : undefined,
            functional_strike: market.functional_strike ? Number(market.functional_strike) : undefined,
            custom_strike: market.custom_strike,
            settlement_value: market.settlement_value ? Number(market.settlement_value) : undefined,
            resolution_value: market.resolution_value,
            result: market.result,
            ts: market.ts ? Number(market.ts) : undefined,
          })) || this.getSampleMarkets(),
        cursor: response.cursor,
        count: response.count,
      };
    } catch (error) {
      console.error("Error fetching Kalshi markets:", error);
      // Return sample data for demo purposes
      return {
        markets: this.getSampleMarkets(),
      };
    }
  }

  async getEvents(limit: number = 20, cursor?: string, status?: string): Promise<KalshiResponse<KalshiEvent[]>> {
    try {
      let endpoint = `/events?limit=${limit}`;
      if (cursor) endpoint += `&cursor=${cursor}`;
      if (status) endpoint += `&status=${status}`;

      const response = await this.fetchFromBackend(endpoint);
      console.log("Kalshi Events Response:", response);

      return {
        events:
          response?.map((event: any) => ({
            event_ticker: event.event_ticker,
            title: event.title,
            subtitle: event.subtitle,
            category: event.category,
            sub_category: event.sub_category,
            status: event.status,
            created_time: event.created_time,
            updated_time: event.updated_time,
            close_date: event.close_date,
            settlement_date: event.settlement_date,
            mutually_exclusive: event.mutually_exclusive,
            description: event.description,
            markets:
              event.markets?.map((market: any) => ({
                ticker: market.ticker,
                title: market.title,
                subtitle: market.subtitle,
                event_ticker: market.event_ticker,
                series_ticker: market.series_ticker,
                tags: Array.isArray(market.tags)
                  ? market.tags
                      .map((tag: any) =>
                        typeof tag === "string"
                          ? tag
                          : tag && typeof tag === "object" && tag.label
                            ? tag.label
                            : tag?.toString() || "",
                      )
                      .filter(Boolean)
                  : [],
                created_time: market.created_time,
                updated_time: market.updated_time,
                close_date: market.close_date,
                expiration_date: market.expiration_date,
                settlement_date: market.settlement_date,
                type: market.type,
                status: market.status,
                yes_ask: market.yes_ask ? Number(market.yes_ask) : undefined,
                yes_bid: market.yes_bid ? Number(market.yes_bid) : undefined,
                no_ask: market.no_ask ? Number(market.no_ask) : undefined,
                no_bid: market.no_bid ? Number(market.no_bid) : undefined,
                last_price: market.last_price ? Number(market.last_price) : undefined,
                dollar_volume_24h: market.dollar_volume_24h ? Number(market.dollar_volume_24h) : undefined,
                open_interest: market.open_interest ? Number(market.open_interest) : undefined,
              })) || [],
            tags: Array.isArray(event.tags)
              ? event.tags
                  .map((tag: any) =>
                    typeof tag === "string"
                      ? tag
                      : tag && typeof tag === "object" && tag.label
                        ? tag.label
                        : tag?.toString() || "",
                  )
                  .filter(Boolean)
              : [],
          })) || [],
        cursor: response.cursor,
        count: response.count,
      };
    } catch (error) {
      console.error("Error fetching Kalshi events:", error);
      return {
        events: this.getSampleEvents(),
      };
    }
  }

  async getMarketDetails(ticker: string): Promise<KalshiMarket | null> {
    try {
      const endpoint = `/markets/${ticker}`;
      const response = await this.fetchFromBackend(endpoint);

      const market = response.market;
      if (!market) return null;

      return {
        ticker: market.ticker,
        title: market.title,
        subtitle: market.subtitle,
        event_ticker: market.event_ticker,
        series_ticker: market.series_ticker,
        tags: Array.isArray(market.tags)
          ? market.tags
              .map((tag: any) =>
                typeof tag === "string"
                  ? tag
                  : tag && typeof tag === "object" && tag.label
                    ? tag.label
                    : tag?.toString() || "",
              )
              .filter(Boolean)
          : [],
        created_time: market.created_time,
        updated_time: market.updated_time,
        close_date: market.close_date,
        expiration_date: market.expiration_date,
        settlement_date: market.settlement_date,
        type: market.type,
        status: market.status,
        yes_ask: market.yes_ask ? Number(market.yes_ask) : undefined,
        yes_bid: market.yes_bid ? Number(market.yes_bid) : undefined,
        no_ask: market.no_ask ? Number(market.no_ask) : undefined,
        no_bid: market.no_bid ? Number(market.no_bid) : undefined,
        last_price: market.last_price ? Number(market.last_price) : undefined,
        previous_yes_ask: market.previous_yes_ask ? Number(market.previous_yes_ask) : undefined,
        previous_yes_bid: market.previous_yes_bid ? Number(market.previous_yes_bid) : undefined,
        previous_no_ask: market.previous_no_ask ? Number(market.previous_no_ask) : undefined,
        previous_no_bid: market.previous_no_bid ? Number(market.previous_no_bid) : undefined,
        previous_price: market.previous_price ? Number(market.previous_price) : undefined,
        dollar_volume_24h: market.dollar_volume_24h ? Number(market.dollar_volume_24h) : undefined,
        dollar_open_interest: market.dollar_open_interest ? Number(market.dollar_open_interest) : undefined,
        open_interest: market.open_interest ? Number(market.open_interest) : undefined,
        liquidity: market.liquidity ? Number(market.liquidity) : undefined,
        can_close_early: market.can_close_early,
        capped: market.capped,
        notional_value: market.notional_value ? Number(market.notional_value) : undefined,
        strike_type: market.strike_type,
        floor_strike: market.floor_strike ? Number(market.floor_strike) : undefined,
        cap_strike: market.cap_strike ? Number(market.cap_strike) : undefined,
        functional_strike: market.functional_strike ? Number(market.functional_strike) : undefined,
        custom_strike: market.custom_strike,
        settlement_value: market.settlement_value ? Number(market.settlement_value) : undefined,
        resolution_value: market.resolution_value,
        result: market.result,
        ts: market.ts ? Number(market.ts) : undefined,
      };
    } catch (error) {
      console.error("Error fetching Kalshi market details:", error);
      return null;
    }
  }

  private getSampleMarkets(): KalshiMarket[] {
    return [
      {
        ticker: "POTUS25",
        title: "Will Donald Trump win the 2024 presidential election?",
        event_ticker: "POTUS",
        series_ticker: "POTUS25",
        tags: ["Politics", "Election", "President"],
        created_time: "2024-01-01T00:00:00Z",
        updated_time: "2025-08-08T12:00:00Z",
        close_date: "2024-11-05T23:59:59Z",
        expiration_date: "2024-11-06T00:00:00Z",
        type: "binary",
        status: "open",
        yes_ask: 5520,
        yes_bid: 5500,
        no_ask: 4500,
        no_bid: 4480,
        last_price: 5510,
        dollar_volume_24h: 89500,
        open_interest: 25000,
      },
      {
        ticker: "BTCPRICE",
        title: "Will Bitcoin close above $75,000 on December 31, 2025?",
        event_ticker: "CRYPTO",
        series_ticker: "BTC25",
        tags: ["Crypto", "Bitcoin", "Price"],
        created_time: "2025-01-01T00:00:00Z",
        updated_time: "2025-08-08T12:00:00Z",
        close_date: "2025-12-31T23:59:59Z",
        expiration_date: "2026-01-01T00:00:00Z",
        type: "binary",
        status: "open",
        yes_ask: 6800,
        yes_bid: 6750,
        no_ask: 3250,
        no_bid: 3200,
        last_price: 6775,
        dollar_volume_24h: 156000,
        open_interest: 45000,
      },
      {
        ticker: "AIBREAK",
        title: "Will GPT-5 or equivalent be released by OpenAI in 2025?",
        event_ticker: "TECH",
        series_ticker: "AI25",
        tags: ["AI", "Technology", "OpenAI"],
        created_time: "2025-01-01T00:00:00Z",
        updated_time: "2025-08-08T12:00:00Z",
        close_date: "2025-12-31T23:59:59Z",
        expiration_date: "2026-01-01T00:00:00Z",
        type: "binary",
        status: "open",
        yes_ask: 7200,
        yes_bid: 7150,
        no_ask: 2850,
        no_bid: 2800,
        last_price: 7175,
        dollar_volume_24h: 78000,
        open_interest: 18000,
      },
    ];
  }

  private getSampleEvents(): KalshiEvent[] {
    return [
      {
        event_ticker: "POTUS",
        title: "2024 Presidential Election",
        subtitle: "Who will win the 2024 US Presidential Election?",
        category: "Politics",
        sub_category: "Elections",
        status: "open",
        created_time: "2024-01-01T00:00:00Z",
        updated_time: "2025-08-08T12:00:00Z",
        close_date: "2024-11-05T23:59:59Z",
        settlement_date: "2024-11-06T00:00:00Z",
        mutually_exclusive: true,
        description: "This event will resolve based on the winner of the 2024 US Presidential Election.",
        markets: [
          {
            ticker: "POTUS25",
            title: "Will Donald Trump win the 2024 presidential election?",
            event_ticker: "POTUS",
            series_ticker: "POTUS25",
            tags: ["Politics", "Election", "President"],
            created_time: "2024-01-01T00:00:00Z",
            updated_time: "2025-08-08T12:00:00Z",
            close_date: "2024-11-05T23:59:59Z",
            expiration_date: "2024-11-06T00:00:00Z",
            type: "binary",
            status: "open",
            yes_ask: 5500,
            yes_bid: 5450,
            no_ask: 4550,
            no_bid: 4500,
            last_price: 5475,
            dollar_volume_24h: 125000,
            open_interest: 45000,
          },
        ],
        tags: ["Politics", "Election", "President"],
      },
      {
        event_ticker: "CRYPTO",
        title: "Cryptocurrency Markets 2025",
        subtitle: "Price movements and milestones for major cryptocurrencies",
        category: "Finance",
        sub_category: "Cryptocurrency",
        status: "open",
        created_time: "2024-12-01T00:00:00Z",
        updated_time: "2025-08-08T12:00:00Z",
        close_date: "2025-12-31T23:59:59Z",
        settlement_date: "2026-01-01T00:00:00Z",
        mutually_exclusive: false,
        description: "Markets related to cryptocurrency price movements and adoption milestones in 2025.",
        markets: [
          {
            ticker: "BTC100K",
            title: "Will Bitcoin reach $100,000 by end of 2025?",
            event_ticker: "CRYPTO",
            series_ticker: "BTC100K",
            tags: ["Crypto", "Bitcoin", "Price"],
            created_time: "2024-12-01T00:00:00Z",
            updated_time: "2025-08-08T12:00:00Z",
            close_date: "2025-12-31T23:59:59Z",
            expiration_date: "2026-01-01T00:00:00Z",
            type: "binary",
            status: "open",
            yes_ask: 6800,
            yes_bid: 6750,
            no_ask: 3250,
            no_bid: 3200,
            last_price: 6775,
            dollar_volume_24h: 89000,
            open_interest: 32000,
          },
        ],
        tags: ["Crypto", "Bitcoin", "Finance"],
      },
      {
        event_ticker: "TECH",
        title: "Technology Breakthroughs 2025",
        subtitle: "Major AI and technology developments",
        category: "Technology",
        sub_category: "AI",
        status: "open",
        created_time: "2024-11-01T00:00:00Z",
        updated_time: "2025-08-08T12:00:00Z",
        close_date: "2025-12-31T23:59:59Z",
        settlement_date: "2026-01-01T00:00:00Z",
        mutually_exclusive: false,
        description: "Markets related to AI breakthroughs and technology developments in 2025.",
        markets: [
          {
            ticker: "AIBREAK",
            title: "Will there be a major AI breakthrough announced in 2025?",
            event_ticker: "TECH",
            series_ticker: "AIBREAK",
            tags: ["AI", "Technology", "OpenAI"],
            created_time: "2024-11-01T00:00:00Z",
            updated_time: "2025-08-08T12:00:00Z",
            close_date: "2025-12-31T23:59:59Z",
            expiration_date: "2026-01-01T00:00:00Z",
            type: "binary",
            status: "open",
            yes_ask: 7200,
            yes_bid: 7150,
            no_ask: 2850,
            no_bid: 2800,
            last_price: 7175,
            dollar_volume_24h: 78000,
            open_interest: 18000,
          },
        ],
        tags: ["AI", "Technology", "Innovation"],
      },
    ];
  }
}

export const kalshiAPI = new KalshiAPI();
