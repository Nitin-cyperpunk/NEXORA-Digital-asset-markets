export type MarketAsset = { symbol: string; name: string; price: number; change: number; volume: string; color: string; mark: string; points: string };

export const marketData: MarketAsset[] = [
  { symbol:"BTC", name:"Bitcoin", price:67432.18, change:2.41, volume:"$1.24B", color:"#f7931a", mark:"₿", points:"0,38 12,34 24,37 36,25 48,31 60,18 72,21 84,13 96,16 108,5 120,9" },
  { symbol:"ETH", name:"Ethereum", price:3521.64, change:1.18, volume:"$842.6M", color:"#8b7cff", mark:"◆", points:"0,29 12,34 24,26 36,30 48,19 60,24 72,16 84,22 96,12 108,15 120,7" },
  { symbol:"SOL", name:"Solana", price:184.72, change:-0.86, volume:"$316.2M", color:"#9b83ff", mark:"S", points:"0,11 12,18 24,13 36,27 48,22 60,33 72,24 84,32 96,27 108,39 120,35" },
  { symbol:"XRP", name:"XRP", price:0.6248, change:4.52, volume:"$208.4M", color:"#929baa", mark:"X", points:"0,35 12,30 24,33 36,24 48,28 60,16 72,22 84,13 96,17 108,8 120,4" },
  { symbol:"BNB", name:"BNB", price:36.19, change:-1.27, volume:"$97.8M", color:"#f0b90b", mark:"B", points:"0,10 12,15 24,12 36,22 48,19 60,29 72,23 84,35 96,30 108,40 120,34" }
];

export const marketMeta = Object.fromEntries(marketData.map((asset) => [asset.symbol, asset])) as Record<string, MarketAsset>;
