// Optional enrichment hook. Binance remains the source of exchange-pair prices.
export type CoinGeckoMarket = { id: string; symbol: string; name: string; market_cap_rank: number | null; market_cap: number | null };

export async function fetchCoinGeckoDiscovery(perPage = 25) {
  const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${Math.min(Math.max(Math.floor(perPage), 1), 100)}&page=1`, { next: { revalidate: 300 } });
  if (!response.ok) throw new Error(`CoinGecko request failed (${response.status})`);
  return response.json() as Promise<CoinGeckoMarket[]>;
}
