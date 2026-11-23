import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
export function Select({className,...props}:SelectHTMLAttributes<HTMLSelectElement>){return <select className={cn("h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none focus:border-[var(--accent)]",className)} {...props}/>}
