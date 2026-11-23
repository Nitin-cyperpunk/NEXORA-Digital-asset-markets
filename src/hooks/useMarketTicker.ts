"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { fetch24hTickers, fetchExchangeSymbols, normalizeTicker, tickerStreamUrl } from "@/lib/market/binance";
import type { MarketStatus, MarketTicker } from "@/lib/market/types";

export const DEFAULT_MARKET_PAIRS = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT"];
type MarketTickerState = { markets: MarketTicker[]; status: MarketStatus; lastUpdated: number | null };
const MarketTickerContext = createContext<MarketTickerState | null>(null);

function useMarketTickerSource(pairs: string[], enabled: boolean): MarketTickerState {
  const pairsKey = pairs.join(",");
  const [markets, setMarkets] = useState<MarketTicker[]>([]);
  const [status, setStatus] = useState<MarketStatus>("loading");
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const hasData = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    const requestedPairs = pairsKey.split(",").filter(Boolean);
    let stopped = false;
    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let offlineTimer: ReturnType<typeof setTimeout> | undefined;
    let retry = 0;

    const refresh = async () => {
      try {
        const [available, tickers] = await Promise.all([fetchExchangeSymbols(), fetch24hTickers(requestedPairs)]);
        const next = tickers.filter((ticker) => available.has(ticker.symbol)).map(normalizeTicker).filter((ticker): ticker is MarketTicker => ticker !== null);
        if (!next.length) throw new Error("No valid Binance market pairs were returned");
        if (!stopped) { setMarkets(next); hasData.current = true; setStatus("live"); setLastUpdated(Date.now()); }
      } catch {
        if (!stopped && !hasData.current) setStatus("offline");
        else if (!stopped) setStatus("reconnecting");
      }
    };

    const connect = () => {
      if (stopped) return;
      try { socket = new WebSocket(tickerStreamUrl(requestedPairs)); }
      catch { setStatus("offline"); return; }
      socket.onopen = () => {
        retry = 0;
        if (offlineTimer) clearTimeout(offlineTimer);
        if (!stopped) setStatus("live");
      };
      socket.onmessage = (event) => {
        try {
          const frame = JSON.parse(event.data) as { data?: { s?: string; c?: string; P?: string; v?: string; q?: string; h?: string; l?: string; b?: string; a?: string } };
          const row = frame.data;
          if (!row?.s || !requestedPairs.includes(row.s)) return;
          const ticker = normalizeTicker({ symbol: row.s, lastPrice: row.c ?? "", priceChangePercent: row.P ?? "", volume: row.v ?? "", quoteVolume: row.q ?? "", highPrice: row.h ?? "", lowPrice: row.l ?? "", bidPrice: row.b ?? "", askPrice: row.a ?? "" });
          if (!ticker || stopped) return;
          setMarkets((current) => current.some((item) => item.pair === ticker.pair) ? current.map((item) => item.pair === ticker.pair ? ticker : item) : [...current, ticker]);
          hasData.current = true; setStatus("live"); setLastUpdated(Date.now());
        } catch { /* Ignore malformed frames; the REST refresh remains the recovery path. */ }
      };
      socket.onclose = () => {
        if (stopped) return;
        setStatus(hasData.current ? "reconnecting" : "offline");
        offlineTimer = setTimeout(() => { if (!stopped) setStatus("offline"); }, 60_000);
        reconnectTimer = setTimeout(connect, Math.min(1000 * 2 ** retry++, 30_000));
      };
      socket.onerror = () => socket?.close();
    };

    const refreshInterval = setInterval(() => void refresh(), 60_000);
    const start = setTimeout(() => { void refresh(); connect(); }, 0);
    return () => { stopped = true; clearTimeout(start); clearInterval(refreshInterval); clearTimeout(reconnectTimer); clearTimeout(offlineTimer); socket?.close(); };
  }, [pairsKey, enabled]);

  return { markets, status, lastUpdated };
}

export function MarketTickerProvider({ children }: { children: ReactNode }) {
  const state = useMarketTickerSource(DEFAULT_MARKET_PAIRS, true);
  return <MarketTickerContext.Provider value={state}>{children}</MarketTickerContext.Provider>;
}

export function useMarketTicker(pairs: string[] = DEFAULT_MARKET_PAIRS) {
  const shared = useContext(MarketTickerContext);
  const local = useMarketTickerSource(pairs, shared === null);
  return shared ?? local;
}
