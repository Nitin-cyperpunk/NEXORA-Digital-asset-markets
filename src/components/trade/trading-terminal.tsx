"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, CandlestickChart, Clock3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

type Candle = { time: number; open: number; high: number; low: number; close: number };
type Trade = { price: string; qty: string; time: number; isBuyerMaker: boolean };
type SimOrder = { id: string; side: "Buy" | "Sell"; price: number; quantity: number; total: number; time: string; status: "Filled" };
const intervals = ["15m", "1h", "4h", "1d", "1w"];

export function TradingTerminal({ pair }: { pair: string }) {
  const base = pair.split("-")[0]?.toUpperCase() || "BTC";
  const market = `${base}USDT`;
  const [price, setPrice] = useState<number | null>(null);
  const [change, setChange] = useState<number | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [book, setBook] = useState<{ bids: string[][]; asks: string[][] }>({ bids: [], asks: [] });
  const [timeframe, setTimeframe] = useState("1h");
  const [side, setSide] = useState<"Buy" | "Sell">("Buy");
  const [type, setType] = useState<"Market" | "Limit">("Market");
  const [limitPrice, setLimitPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [quoteBalance, setQuoteBalance] = useState(12480);
  const [baseBalance, setBaseBalance] = useState(0.8421);
  const [orders, setOrders] = useState<SimOrder[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [connected, setConnected] = useState(false);
  const hasPrice = useRef(false);

  const loadCandles = useCallback(async () => {
    const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${market}&interval=${timeframe}&limit=80`, { cache: "no-store" });
    if (!response.ok) throw new Error(`Candlestick request failed (${response.status})`);
    const rows = await response.json() as (string | number)[][];
    setCandles(rows.map((r) => ({ time: Number(r[0]), open: Number(r[1]), high: Number(r[2]), low: Number(r[3]), close: Number(r[4]) })));
  }, [market, timeframe]);

  useEffect(() => {
    let cancelled = false;
    const hydrate = setTimeout(() => {
      try {
        const saved = localStorage.getItem("nexora-simulated-account");
        if (saved && !cancelled) {
          const state = JSON.parse(saved) as { quoteBalance: number; baseBalance: number; orders: SimOrder[] };
          if (Number.isFinite(state.quoteBalance) && Number.isFinite(state.baseBalance) && Array.isArray(state.orders)) {
            setQuoteBalance(state.quoteBalance); setBaseBalance(state.baseBalance); setOrders(state.orders);
          }
        }
      } catch { /* Keep demo starting balances if saved browser data is unavailable. */ }
    }, 0);
    return () => { cancelled = true; clearTimeout(hydrate); };
  }, []);

  useEffect(() => {
    let stopped = false;
    let socket: WebSocket | null = null;
    let retry = 0;
    let reconnect: ReturnType<typeof setTimeout>;
    const refresh = setInterval(() => { void loadSnapshot(); void loadExtras(); }, 15000);
    const initialLoad = setTimeout(() => { void loadSnapshot(); void loadExtras(); void loadCandles(); }, 0);
    const loadSnapshot = async () => {
      try {
        const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${market}`, { cache: "no-store" });
        if (!response.ok) throw new Error("Binance market data is unavailable.");
        const ticker = await response.json() as { lastPrice: string; priceChangePercent: string };
        if (!stopped) { hasPrice.current = true; setPrice(Number(ticker.lastPrice)); setChange(Number(ticker.priceChangePercent)); setError(""); }
      } catch { if (!stopped && !hasPrice.current) setError("Binance reference market data is unavailable. Retry when your connection is restored."); }
    };
    const loadExtras = async () => {
      try {
        const [tradeRes, depthRes] = await Promise.all([
          fetch(`https://api.binance.com/api/v3/trades?symbol=${market}&limit=16`, { cache: "no-store" }),
          fetch(`https://api.binance.com/api/v3/depth?symbol=${market}&limit=12`, { cache: "no-store" }),
        ]);
        if (!tradeRes.ok || !depthRes.ok) throw new Error("Order book or recent trades unavailable.");
        const [tradeRows, depth] = await Promise.all([tradeRes.json(), depthRes.json()]);
        if (!stopped) { setTrades(tradeRows); setBook(depth); }
      } catch { if (!stopped) setError((current) => current || "Some market details could not be loaded."); }
    };
    const openSocket = () => {
      if (stopped) return;
      socket = new WebSocket(`wss://stream.binance.com:9443/ws/${market.toLowerCase()}@ticker`);
      socket.onopen = () => { retry = 0; if (!stopped) setConnected(true); };
      socket.onmessage = (event) => {
        try { const data = JSON.parse(event.data) as { c: string; P: string }; if (!stopped) { hasPrice.current = true; setPrice(Number(data.c)); setChange(Number(data.P)); } }
        catch { /* Ignore malformed frames. */ }
      };
      socket.onclose = () => { if (!stopped) { setConnected(false); reconnect = setTimeout(openSocket, Math.min(1000 * 2 ** retry++, 30000)); } };
      socket.onerror = () => socket?.close();
    };
    openSocket();
    return () => { stopped = true; clearInterval(refresh); clearTimeout(initialLoad); clearTimeout(reconnect); socket?.close(); };
  }, [market, loadCandles]);

  const orderPrice = type === "Limit" ? Number(limitPrice) : (price ?? 0);
  const amount = Number(quantity);
  const total = useMemo(() => amount > 0 && orderPrice > 0 ? amount * orderPrice : 0, [amount, orderPrice]);
  function setAllocation(percent: number) {
    if (side === "Buy") setQuantity(price ? ((quoteBalance * percent / 100) / orderPrice).toFixed(6) : "");
    else setQuantity((baseBalance * percent / 100).toFixed(6));
  }

  function submitOrder() {
    setNotice("");
    if (!Number.isFinite(amount) || amount <= 0 || !Number.isFinite(orderPrice) || orderPrice <= 0) { setNotice("Enter a valid price and a quantity greater than zero."); return; }
    if (side === "Buy" && total > quoteBalance) { setNotice("Insufficient demo USDT balance for this order."); return; }
    if (side === "Sell" && amount > baseBalance) { setNotice(`You can sell up to ${baseBalance.toFixed(6)} ${base}.`); return; }
    const order: SimOrder = { id: crypto.randomUUID(), side, price: orderPrice, quantity: amount, total, time: new Date().toISOString(), status: "Filled" };
    const nextOrders = [order, ...orders].slice(0, 50);
    const nextQuote = side === "Buy" ? quoteBalance - total : quoteBalance + total;
    const nextBase = side === "Buy" ? baseBalance + amount : baseBalance - amount;
    setQuoteBalance(nextQuote); setBaseBalance(nextBase); setOrders(nextOrders); setQuantity("");
    try { localStorage.setItem("nexora-simulated-account", JSON.stringify({ quoteBalance: nextQuote, baseBalance: nextBase, orders: nextOrders })); } catch { /* The in-memory simulation remains usable. */ }
    setNotice(`${side} order filled in simulation at ${formatCurrency(orderPrice)}. No real trade was placed.`);
  }

  const minLow = Math.min(...candles.map((c) => c.low));
  const maxHigh = Math.max(...candles.map((c) => c.high));
  const span = maxHigh - minLow || 1;
  return <main className="page">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-full bg-[#f7931a] font-bold text-white">₿</div><div><h1 className="text-lg font-semibold">{base} / USDT</h1><p className="text-[10px] text-[var(--muted)]">Binance spot reference market</p></div><div className="ml-3"><p className="text-lg font-semibold tabular-nums">{price === null ? "—" : formatCurrency(price)}</p><p className={`text-[10px] ${change !== null && change >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>{change === null ? "Waiting for ticker…" : `${change >= 0 ? "+" : ""}${change.toFixed(2)}% · 24h`}</p></div></div><Badge><span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${connected ? "bg-[var(--positive)]" : "bg-[var(--muted)]"}`}/>{connected ? "External data · Live" : "External data · Reconnecting"}</Badge></div>
    {error && <p role="status" className="mb-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-xs text-[var(--muted)]">{error}</p>}
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]"><div className="space-y-4"><Card className="overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3"><div className="flex gap-1">{intervals.map((item) => <button key={item} onClick={() => setTimeframe(item)} className={`min-h-8 rounded-md px-2.5 text-[10px] ${timeframe === item ? "bg-[var(--raised)]" : "text-[var(--muted)]"}`}>{item}</button>)}</div><span className="flex items-center gap-1 text-[10px] text-[var(--muted)]"><Clock3 size={13}/>UTC · Binance klines</span></div><div className="min-h-[300px] p-3 sm:min-h-[400px]">{candles.length ? <svg role="img" aria-label={`${base} ${timeframe} candlestick chart from Binance`} viewBox="0 0 800 330" preserveAspectRatio="none" className="h-[280px] w-full sm:h-[380px]">{candles.map((candle, index) => { const x = 8 + index * (784 / candles.length); const y = (value: number) => 12 + (maxHigh - value) / span * 294; const up = candle.close >= candle.open; const color = up ? "#16c784" : "#ea3943"; const bodyTop = Math.min(y(candle.open), y(candle.close)); const bodyHeight = Math.max(1.5, Math.abs(y(candle.open) - y(candle.close))); return <g key={candle.time} stroke={color} fill={color}><line x1={x + 4} x2={x + 4} y1={y(candle.high)} y2={y(candle.low)} strokeWidth="1"/><rect x={x} y={bodyTop} width={Math.max(2, 784 / candles.length - 2)} height={bodyHeight} opacity=".9"/></g>; })}</svg> : <div className="grid h-[280px] place-items-center text-xs text-[var(--muted)] sm:h-[380px]">Loading Binance candlesticks…</div>}</div></Card>
      <div className="grid gap-4 lg:grid-cols-2"><Card className="p-4"><div className="mb-3 flex justify-between"><div><h2 className="text-xs font-semibold">Order book</h2><p className="mt-1 text-[10px] text-[var(--muted)]">Binance snapshot · {base}/USDT</p></div><span className="text-[10px] text-[var(--muted)]">Price / Amount</span></div><div className="grid grid-cols-2 gap-4"><div>{book.asks.slice().reverse().slice(0, 7).map(([p, q], i) => <p key={i} className="flex justify-between py-1 text-[10px]"><span className="text-[var(--negative)]">{Number(p).toLocaleString()}</span><span className="text-[var(--muted)]">{Number(q).toFixed(4)}</span></p>)}</div><div>{book.bids.slice(0, 7).map(([p, q], i) => <p key={i} className="flex justify-between py-1 text-[10px]"><span className="text-[var(--positive)]">{Number(p).toLocaleString()}</span><span className="text-[var(--muted)]">{Number(q).toFixed(4)}</span></p>)}</div></div></Card><Card className="p-4"><div className="mb-3"><h2 className="text-xs font-semibold">Recent trades</h2><p className="mt-1 text-[10px] text-[var(--muted)]">Latest Binance executions</p></div>{trades.slice(0, 8).map((trade, i) => <div key={`${trade.time}-${i}`} className="grid grid-cols-3 border-t border-[var(--border)] py-1.5 text-[10px]"><span className={trade.isBuyerMaker ? "text-[var(--negative)]" : "text-[var(--positive)]"}>{Number(trade.price).toLocaleString()}</span><span className="text-center">{Number(trade.qty).toFixed(4)}</span><span className="text-right text-[var(--muted)]">{new Date(trade.time).toLocaleTimeString()}</span></div>)}</Card></div></div>
      <Card className="h-fit p-4"><div className="mb-3 rounded-md border border-[rgba(139,124,255,.22)] bg-[rgba(139,124,255,.07)] p-2 text-center text-[10px] font-medium text-[var(--violet)]">SIMULATED TRADING · No real orders</div><div className="mb-4 flex gap-1 rounded-lg bg-[var(--surface)] p-1"><Button type="button" variant={side === "Buy" ? "primary" : "ghost"} size="sm" className="flex-1" onClick={() => setSide("Buy")}><ArrowUp size={14}/>Buy</Button><Button type="button" variant={side === "Sell" ? "primary" : "ghost"} size="sm" className="flex-1" onClick={() => setSide("Sell")}><ArrowDown size={14}/>Sell</Button></div><div className="mb-3 flex gap-2">{(["Market", "Limit"] as const).map((item) => <button key={item} type="button" onClick={() => setType(item)} className={`flex-1 border-b-2 py-2 text-xs ${type === item ? "border-[var(--accent)]" : "border-transparent text-[var(--muted)]"}`}>{item}</button>)}</div>{type === "Limit" && <label className="mb-3 block text-[11px] text-[var(--muted)]">Limit price (USDT)<input aria-label="Limit price" inputMode="decimal" type="number" min="0" step="any" value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-xs text-[var(--text)]" placeholder={price?.toString() ?? "0.00"}/></label>}<label className="mb-2 block text-[11px] text-[var(--muted)]">Quantity ({base})</label><input aria-label="Quantity" inputMode="decimal" type="number" min="0" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-xs text-[var(--text)]" placeholder="0.000000"/><div className="mt-2 grid grid-cols-4 gap-1">{[25, 50, 75, 100].map((p) => <button key={p} type="button" onClick={() => setAllocation(p)} className="min-h-8 rounded-md border border-[var(--border)] text-[10px] text-[var(--muted)] hover:bg-[var(--raised)]">{p}%</button>)}</div><div className="mt-4 space-y-2 text-[10px]"><p className="flex justify-between text-[var(--muted)]"><span>Available {side === "Buy" ? "USDT" : base}</span><span>{side === "Buy" ? quoteBalance.toFixed(2) : baseBalance.toFixed(6)}</span></p><p className="flex justify-between"><span className="text-[var(--muted)]">Estimated total</span><span>{formatCurrency(total)}</span></p></div>{notice && <p role="status" className="mt-3 rounded-lg border border-[var(--border)] p-2 text-[10px] text-[var(--muted)]">{notice}</p>}<Button type="button" variant="primary" onClick={submitOrder} className="mt-4 w-full" disabled={!price}>{side} {base}</Button><p className="mt-3 text-center text-[10px] leading-4 text-[var(--muted)]">Paper fills use the selected price. Demo balances and activity are saved in this browser.</p></Card></div>
    <Card className="mt-4 overflow-hidden"><div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3"><div><h2 className="text-xs font-semibold">Order history</h2><p className="mt-1 text-[10px] text-[var(--muted)]">Simulated fills · stored locally</p></div><CandlestickChart size={16} className="text-[var(--muted)]"/></div>{orders.length ? <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left text-[10px]"><thead className="text-[var(--muted)]"><tr><th className="px-4 py-3 font-medium">Side</th><th className="px-4 py-3 text-right font-medium">Price</th><th className="px-4 py-3 text-right font-medium">Amount</th><th className="px-4 py-3 text-right font-medium">Total</th><th className="px-4 py-3 text-right font-medium">Status</th></tr></thead><tbody>{orders.slice(0, 8).map((o) => <tr key={o.id} className="border-t border-[var(--border)]"><td className={`px-4 py-3 ${o.side === "Buy" ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>{o.side}</td><td className="px-4 py-3 text-right">{formatCurrency(o.price)}</td><td className="px-4 py-3 text-right">{o.quantity.toFixed(6)} {base}</td><td className="px-4 py-3 text-right">{formatCurrency(o.total)}</td><td className="px-4 py-3 text-right text-[var(--muted)]">{o.status}</td></tr>)}</tbody></table></div> : <p className="px-4 py-8 text-center text-xs text-[var(--muted)]">No simulated orders yet. Place a paper order above to see it here.</p>}</Card>
  </main>;
}
