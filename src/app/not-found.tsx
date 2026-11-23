import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function NotFound(){return <main className="grid min-h-screen place-items-center p-6 text-center"><div><p className="text-xs font-semibold tracking-[.2em] text-[var(--accent)]">404 · OFF THE MAP</p><h1 className="mt-4 text-3xl font-semibold">This page isn’t in the market.</h1><p className="mt-2 text-sm text-[var(--muted)]">The address may be incorrect or the page may have moved.</p><Link href="/"><Button variant="primary" className="mt-6">Back to home</Button></Link></div></main>}
