import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
export function Input({className,...props}:InputHTMLAttributes<HTMLInputElement>){return <input className={cn("h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50",className)} {...props}/>}
