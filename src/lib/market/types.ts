export type BinanceTicker24h = {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  volume: string;
  quoteVolume: string;
  highPrice: string;
  lowPrice: string;
  bidPrice: string;
  askPrice: string;
};

export type MarketTicker = {
  symbol: string;
  pair: string;
  price: number;
  changePercent: number;
  baseVolume: number;
  quoteVolume: number;
  high: number;
  low: number;
  bid: number;
  ask: number;
};

export type MarketStatus = "loading" | "live" | "reconnecting" | "offline";
