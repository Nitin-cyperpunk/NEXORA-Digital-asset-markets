import type { MarketTicker } from "@/lib/market/types";

export type MarketFilter = "all" | "gainers" | "losers" | "favorites";
export type MarketSort = "symbol" | "price" | "changePercent" | "quoteVolume";

export function filterMarkets(markets: MarketTicker[], query: string, filter: MarketFilter, favorites: string[]) {
  const needle = query.trim().toLowerCase();
  return markets.filter((market) => {
    const matchesSearch = !needle || market.symbol.toLowerCase().includes(needle) || market.pair.toLowerCase().includes(needle);
    const matchesFilter = filter === "all" || (filter === "gainers" && market.changePercent > 0) || (filter === "losers" && market.changePercent < 0) || (filter === "favorites" && favorites.includes(market.symbol));
    return matchesSearch && matchesFilter;
  });
}

export function sortMarkets(markets: MarketTicker[], sort: MarketSort, direction: "asc" | "desc" = "desc") {
  const multiplier = direction === "asc" ? 1 : -1;
  return [...markets].sort((a, b) => sort === "symbol" ? a.symbol.localeCompare(b.symbol) * multiplier : (a[sort] - b[sort]) * multiplier);
}
