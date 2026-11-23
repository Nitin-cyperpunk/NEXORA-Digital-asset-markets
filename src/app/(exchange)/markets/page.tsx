import { Badge } from "@/components/ui/badge";
import { LiveMarketList } from "@/components/markets/live-market-list";

export default function MarketsPage() {
  return <main className="page mx-auto max-w-[1380px]"><div className="mb-7"><Badge className="border-[rgba(0,214,163,.2)] bg-[rgba(0,214,163,.08)] text-[var(--accent)]">MARKET OVERVIEW</Badge><h1 className="mt-3 text-2xl font-semibold">Markets</h1><p className="mt-1 text-xs text-[var(--muted)]">External spot market data with transparent source and quote currency.</p></div><LiveMarketList/></main>;
}
