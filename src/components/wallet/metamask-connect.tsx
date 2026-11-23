"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

type EthereumProvider = {
  request: (args: { method: string }) => Promise<unknown>;
  on?: (event: "accountsChanged", listener: (accounts: string[]) => void) => void;
  removeListener?: (event: "accountsChanged", listener: (accounts: string[]) => void) => void;
};
declare global { interface Window { ethereum?: EthereumProvider } }

export function MetaMaskConnect() {
  const [account, setAccount] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const provider = window.ethereum;
    if (!provider) return;
    const syncAccounts = (accounts: string[]) => setAccount(accounts[0] ?? null);
    void provider.request({ method: "eth_accounts" }).then((value) => {
      if (Array.isArray(value)) syncAccounts(value as string[]);
    }).catch(() => {});
    provider.on?.("accountsChanged", syncAccounts);
    return () => provider.removeListener?.("accountsChanged", syncAccounts);
  }, []);

  async function connect() {
    setMessage("");
    const provider = window.ethereum;
    if (!provider) {
      setMessage("MetaMask isn’t detected. Install the MetaMask extension, then try again.");
      return;
    }
    setBusy(true);
    try {
      const value = await provider.request({ method: "eth_requestAccounts" });
      const accounts = Array.isArray(value) ? value as string[] : [];
      setAccount(accounts[0] ?? null);
      if (!accounts.length) setMessage("No account was shared. Unlock MetaMask and try again.");
    } catch (error) {
      const code = (error as { code?: number })?.code;
      setMessage(code === 4001 ? "Connection request was declined in MetaMask." : "Could not connect to MetaMask. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="relative flex flex-col items-end gap-1.5">
    <Button type="button" variant={account ? "secondary" : "outline"} size="sm" onClick={connect} disabled={busy || !!account} aria-label={account ? `MetaMask connected: ${account}` : "Connect MetaMask wallet"} className="border-[rgba(247,147,26,.35)] text-xs">
      {busy ? <LoaderCircle size={14} className="animate-spin"/> : <Wallet size={14} className="text-[#f7931a]"/>}
      <span className="hidden sm:inline">{account ? `${account.slice(0, 6)}…${account.slice(-4)}` : "Connect MetaMask"}</span>
      <span className="sm:hidden">{account ? `${account.slice(0, 4)}…${account.slice(-3)}` : "MetaMask"}</span>
    </Button>
    {message && <p role="alert" className="absolute right-0 top-11 z-50 w-[min(90vw,320px)] rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-[11px] leading-relaxed text-[var(--muted)] shadow-xl">{message}</p>}
  </div>;
}
