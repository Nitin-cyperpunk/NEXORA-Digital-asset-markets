"use client";

import { useEffect, useRef, useState } from "react";
import { marketData, type MarketAsset } from "@/data/markets";

type Ticker = { s: string; c: string; P: string; q: string };
export type LiveMarket = MarketAsset & { price: number; change: number; volume: string };

const symbols = marketData.map((asset) => `${asset.symbol}USDT`);

export function useLiveMarkets() {
  const [items, setItems] = useState<LiveMarket[]>([]);
  const [status, setStatus] = useState<"loading" | "live" | "error">("loading");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const hasData = useRef(false);

  useEffect(() => {
    let stopped = false;
    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let retry = 0;

    async function refresh() {
      try {
        const query = encodeURIComponent(JSON.stringify(symbols));
        const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${query}`, { cache: "no-store" });
        if (!response.ok) throw new Error(`Binance returned ${response.status}`);
        const tickers = await response.json() as Ticker[];
        if (stopped || !Array.isArray(tickers)) return;
        const bySymbol = new Map(tickers.map((ticker) => [ticker.s, ticker]));
        const next = marketData.flatMap((asset) => {
          const ticker = bySymbol.get(`${asset.symbol}USDT`);
          if (!ticker) return [];
          return [{ ...asset, price: Number(ticker.c), change: Number(ticker.P), volume: `$${(Number(ticker.q) / 1e9).toFixed(2)}B` }];
        });
        if (!next.length) throw new Error("No market pairs were returned");
        setItems(next);
        hasData.current = true;
        setStatus("live");
        setLastUpdated(new Date());
      } catch {
        if (!stopped && !hasData.current) setStatus("error");
      }
    }

    function connect() {
      if (stopped) return;
      socket = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${symbols.map((s) => `${s.toLowerCase()}@ticker`).join("/")}`);
      socket.onopen = () => { retry = 0; };
      socket.onmessage = (event) => {
        try {
          const ticker = (JSON.parse(event.data) as { data: Ticker }).data;
          if (stopped) return;
          setItems((current) => current.map((asset) => asset.symbol === ticker.s.replace("USDT", "")
            ? { ...asset, price: Number(ticker.c), change: Number(ticker.P), volume: `$${(Number(ticker.q) / 1e9).toFixed(2)}B` }
            : asset));
          setStatus("live");
          setLastUpdated(new Date());
        } catch { /* Ignore malformed frames; REST refresh provides recovery. */ }
      };
      socket.onclose = () => {
        if (!stopped) {
          setStatus((current) => current === "live" ? current : "loading");
          reconnectTimer = setTimeout(connect, Math.min(1000 * 2 ** retry++, 30000));
        }
      };
      socket.onerror = () => socket?.close();
    }

    void refresh();
    const interval = setInterval(() => void refresh(), 60_000);
    connect();
    return () => { stopped = true; clearInterval(interval); clearTimeout(reconnectTimer); socket?.close(); };
    // The hook intentionally initializes once; the symbol list is constant.
  }, []);

  return { items, status, lastUpdated };
}
