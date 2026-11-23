"use client";
import { useState } from "react";
import type { ReactNode } from "react";
export function Tabs({items}:{items:{label:string;content:ReactNode}[]}){const [active,setActive]=useState(0);return <div><div role="tablist" className="flex gap-1 border-b border-[var(--border)]">{items.map((item,i)=><button key={item.label} role="tab" aria-selected={active===i} onClick={()=>setActive(i)} className={`border-b-2 px-3 py-2.5 text-xs ${active===i?"border-[var(--accent)] text-[var(--text)]":"border-transparent text-[var(--muted)]"}`}>{item.label}</button>)}</div><div role="tabpanel" className="py-3">{items[active]?.content}</div></div>}
