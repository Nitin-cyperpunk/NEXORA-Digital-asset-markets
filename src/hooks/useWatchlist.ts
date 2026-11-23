"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "nexora-demo-watchlist";
export function useWatchlist() {
  const [symbols, setSymbols] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    const task = setTimeout(() => {
      try {
        const value = localStorage.getItem(KEY);
        const parsed: unknown = value ? JSON.parse(value) : [];
        if (active && Array.isArray(parsed)) setSymbols(parsed.filter((item): item is string => typeof item === "string"));
      } catch { if (active) setSymbols([]); }
      if (active) setReady(true);
    }, 0);
    return () => { active = false; clearTimeout(task); };
  }, []);
  const toggle = useCallback((symbol: string) => {
    setSymbols((current) => {
      const next = current.includes(symbol) ? current.filter((item) => item !== symbol) : [...current, symbol];
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* Keep this preference in memory for this session. */ }
      return next;
    });
  }, []);
  return { symbols, toggle, ready, isFavorite: (symbol: string) => symbols.includes(symbol) };
}
