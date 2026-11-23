"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { useMarketTicker } from "@/hooks/useMarketTicker";
import { useWatchlist } from "@/hooks/useWatchlist";
import { marketMeta } from "@/data/markets";
import { formatPercent, formatVolume } from "@/lib/market/formatters";

export function MarketHighlights() {
  const { markets } = useMarketTicker();
  const { symbols, ready } = useWatchlist();
  const gainer = [...markets].filter((m) => m.changePercent >= 0).sort((a, b) => b.changePercent - a.changePercent)[0];
  const loser = [...markets].filter((m) => m.changePercent < 0).sort((a, b) => a.changePercent - b.changePercent)[0];
  const volume = [...markets].sort((a, b) => b.quoteVolume - a.quoteVolume)[0];
  const highlights = [{ title: "Top gainer", market: gainer, value: gainer ? formatPercent(gainer.changePercent) : "—", positive: true }, { title: "Top loser", market: loser, value: loser ? formatPercent(loser.changePercent) : "—", positive: false }, { title: "Highest volume", market: volume, value: volume ? `${formatVolume(volume.quoteVolume)} USDT` : "—", positive: true }];
  return <div className="grid gap-3 xl:grid-cols-[1fr_1fr_1fr_1.2fr]">{highlights.map((item) => <Card key={item.title} className="p-4"><p className="text-[10px] text-[var(--muted)]">{item.title}</p>{item.market ? <Link href={`/trade/${item.market.symbol}-USD`} className="mt-2 flex items-center justify-between gap-2"><span className="text-sm font-semibold">{item.market.symbol}</span><span className={`text-xs tabular-nums ${item.positive ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>{item.value}</span></Link> : <p className="mt-2 text-sm text-[var(--muted)]">Waiting for Binance data…</p>}</Card>)}<Card className="p-4"><div className="flex items-center justify-between"><p className="text-[10px] text-[var(--muted)]">Watchlist</p><Link href="/markets" className="text-[10px] text-[var(--accent)]">Manage</Link></div>{ready && symbols.length ? <div className="mt-2 flex flex-wrap gap-2">{symbols.slice(0, 4).map((symbol) => <Link key={symbol} href={`/trade/${symbol}-USD`} className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[10px]">{marketMeta[symbol]?.name ?? symbol}</Link>)}</div> : <p className="mt-2 text-[11px] text-[var(--muted)]">Star a market to save it here. Saved locally for this demo.</p>}</Card></div>;
}
