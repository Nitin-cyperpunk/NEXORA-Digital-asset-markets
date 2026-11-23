import type { BinanceTicker24h, MarketTicker } from "@/lib/market/types";

const API = "https://api.binance.com/api/v3";
const inFlight = new Map<string, Promise<unknown>>();

async function request<T>(path: string): Promise<T> {
  const key = `${API}${path}`;
  const cached = inFlight.get(key);
  if (cached) return cached as Promise<T>;
  const requestPromise = fetch(key, { cache: "no-store" }).then(async (response) => {
    if (!response.ok) throw new Error(`Binance request failed (${response.status})`);
    return response.json() as Promise<T>;
  }).finally(() => inFlight.delete(key));
  inFlight.set(key, requestPromise);
  return requestPromise;
}

export async function fetchExchangeSymbols() {
  const info = await request<{ symbols: { symbol: string; status: string; quoteAsset: string }[] }>("/exchangeInfo");
  return new Set(info.symbols.filter((item) => item.status === "TRADING" && item.quoteAsset === "USDT").map((item) => item.symbol));
}

export async function fetch24hTickers(symbols: string[]) {
  const query = new URLSearchParams({ symbols: JSON.stringify(symbols) });
  const data = await request<BinanceTicker24h[]>(`/ticker/24hr?${query}`);
  return Array.isArray(data) ? data : [];
}

export function normalizeTicker(row: BinanceTicker24h): MarketTicker | null {
  const values = [row.lastPrice, row.priceChangePercent, row.volume, row.quoteVolume, row.highPrice, row.lowPrice, row.bidPrice, row.askPrice].map(Number);
  if (values.some((value) => !Number.isFinite(value)) || values[0] <= 0) return null;
  const symbol = row.symbol.replace(/USDT$/, "");
  if (!symbol || symbol === row.symbol) return null;
  return { symbol, pair: row.symbol, price: values[0], changePercent: values[1], baseVolume: values[2], quoteVolume: values[3], high: values[4], low: values[5], bid: values[6], ask: values[7] };
}

export function tickerStreamUrl(symbols: string[]) {
  const streams = symbols.map((symbol) => `${symbol.toLowerCase()}@ticker`).join("/");
  return `wss://stream.binance.com:9443/stream?streams=${streams}`;
}
