import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TransactionHistory } from "@/components/wallet/transaction-history";
import { Badge } from "@/components/ui/badge";
export default function OrdersPage(){return <main className="page"><div className="mb-6"><Link href="/dashboard" className="mb-4 inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)]"><ArrowLeft size={14}/>Overview</Link><div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-semibold tracking-tight">Orders &amp; activity</h1><Badge className="border-[rgba(139,124,255,.25)] text-[var(--violet)]">DEMO PREVIEW</Badge></div><p className="mt-1 text-xs text-[var(--muted)]">Review example activity, with filters and transaction details.</p></div><TransactionHistory/></main>}
