"use client";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
export function ThemeToggle(){const {theme,setTheme}=useTheme();return <Button variant="ghost" size="sm" aria-label="Toggle theme" title="Toggle theme" onClick={()=>setTheme(theme==="dark"?"light":"dark")} className="h-9 w-9 p-0">{theme==="dark"?<Sun size={17}/>:<Moon size={17}/>}</Button>}
