"use client";

import { useState } from "react";
import { Bell, Check, CheckCheck, CircleAlert, ShieldCheck, Wallet, TrendingUp, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Notice = { id:number; title:string; detail:string; time:string; category:"Wallet"|"Markets"|"Security"; unread:boolean };
const initial:Notice[]=[
  {id:1,title:"Demo deposit completed",detail:"A simulated 250 USDC deposit was added to your preview activity.",time:"12 min ago",category:"Wallet",unread:true},
  {id:2,title:"BTC price alert",detail:"Bitcoin moved above your illustrative $68,000 alert.",time:"48 min ago",category:"Markets",unread:true},
  {id:3,title:"Demo buy order filled",detail:"Your sample ETH order is shown in the activity preview.",time:"Yesterday",category:"Wallet",unread:true},
  {id:4,title:"Account security reminder",detail:"Review your sign-in and security settings.",time:"2 days ago",category:"Security",unread:false},
];
const categoryIcon={Wallet,Markets:TrendingUp,Security:ShieldCheck};

export function NotificationCenter(){
 const [items,setItems]=useState(initial); const [open,setOpen]=useState(false); const unread=items.filter(x=>x.unread).length;
 const markRead=(id:number)=>setItems(current=>current.map(x=>x.id===id?{...x,unread:false}:x));
 return <div className="relative">
  <button type="button" aria-label={`Notifications${unread?`, ${unread} unread`:""}`} aria-expanded={open} onClick={()=>setOpen(!open)} className="relative grid h-9 w-9 place-items-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--raised)] hover:text-[var(--text)]"><Bell size={17}/>{unread>0&&<span className="absolute -right-0.5 -top-0.5 grid h-[17px] min-w-[17px] place-items-center rounded-full border-2 border-[var(--bg)] bg-[var(--accent)] px-1 text-[9px] font-bold text-[#06110e]">{unread}</span>}</button>
  {open&&<><button aria-label="Close notifications" className="fixed inset-0 z-40 cursor-default" onClick={()=>setOpen(false)}/><section aria-label="Notifications" className="absolute right-0 top-12 z-50 w-[min(92vw,370px)] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl"><header className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3.5"><div><h2 className="text-sm font-semibold">Notifications</h2><p className="mt-0.5 text-[10px] text-[var(--muted)]">Preview examples · simulated</p></div><div className="flex items-center gap-1">{unread>0&&<button onClick={()=>setItems(cur=>cur.map(x=>({...x,unread:false})))} className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] text-[var(--accent)] hover:bg-[var(--raised)]"><CheckCheck size={13}/>Mark all read</button>}<button onClick={()=>setOpen(false)} aria-label="Close" className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--raised)]"><X size={15}/></button></div></header>
   {items.length?<ul className="max-h-[min(65vh,430px)] overflow-y-auto">{items.map(item=>{const Icon=categoryIcon[item.category];return <li key={item.id} className={cn("border-b border-[var(--border)] last:border-0",item.unread&&"bg-[rgba(0,214,163,.025)]")}><div className="flex gap-3 px-4 py-3.5"><span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--raised)] text-[var(--muted)]"><Icon size={15}/></span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><p className="text-xs font-medium">{item.title}</p>{item.unread?<span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]"/>:<span className="mt-0.5 text-[var(--muted)]"><Check size={13}/></span>}</div><p className="mt-1 text-[11px] leading-relaxed text-[var(--muted)]">{item.detail}</p><div className="mt-2 flex items-center justify-between"><span className="text-[10px] text-[var(--muted)]">{item.category} · {item.time}</span>{item.unread&&<button onClick={()=>markRead(item.id)} className="text-[10px] text-[var(--accent)] hover:underline">Mark read</button>}</div></div></div></li>})}</ul>:<div className="grid justify-items-center px-5 py-10 text-center"><span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--raised)] text-[var(--muted)]"><CircleAlert size={18}/></span><p className="mt-3 text-xs font-medium">You’re all caught up</p><p className="mt-1 text-[11px] text-[var(--muted)]">New updates will appear here.</p></div>}
  </section></>}
 </div>;
}
