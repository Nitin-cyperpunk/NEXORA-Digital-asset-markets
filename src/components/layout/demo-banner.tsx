"use client";

import { useState } from "react";
import { Info, X } from "lucide-react";

export function DemoBanner() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return <div className="flex items-start gap-2 border-b border-[rgba(0,214,163,.14)] bg-[rgba(0,214,163,.055)] px-4 py-2.5 text-xs text-[var(--muted)] sm:items-center sm:px-6"><Info size={15} className="mt-0.5 shrink-0 text-[var(--accent)] sm:mt-0"/><p className="flex-1"><span className="font-medium text-[var(--text)]">Demo mode.</span> You’re exploring NEXORA in Demo Mode. Transactions and balances are simulated. No real funds are involved.</p><button type="button" onClick={()=>setVisible(false)} className="rounded p-1 text-[var(--muted)] hover:bg-[var(--raised)] hover:text-[var(--text)]" aria-label="Dismiss demo mode message"><X size={15}/></button></div>;
}
