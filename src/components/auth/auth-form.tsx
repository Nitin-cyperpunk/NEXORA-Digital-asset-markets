"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

type Values = { email: string; password?: string };

export function AuthForm({ mode }: { mode: "login" | "signup" | "forgot-password" }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  const schema = z.object({
    email: z.string().email("Enter a valid email address"),
    password: z.string().optional(),
  }).superRefine((values, ctx) => {
    if (mode !== "forgot-password" && (values.password?.length ?? 0) < 8)
      ctx.addIssue({ code: "custom", path: ["password"], message: "Use at least 8 characters" });
  });
  const { register, handleSubmit, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema) });
  const title = mode === "signup" ? "Create your account" : mode === "login" ? "Welcome back" : "Reset your password";

  async function submit(values: Values) {
    setMessage("");
    const supabase = createClient();
    if (!supabase) { setMessage("Authentication is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to your environment."); return; }
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email: values.email, password: values.password ?? "" });
        if (error) throw error;
        router.push("/dashboard");
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email: values.email, password: values.password ?? "", options: { emailRedirectTo: `${window.location.origin}/dashboard` } });
        if (error) throw error;
        setMessage(data.session ? "Account created. Redirecting…" : "Check your email for a verification link to finish creating your account.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(values.email, { redirectTo: `${window.location.origin}/login` });
        if (error) throw error;
        setMessage("If an account exists for that email, a password reset link is on its way.");
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : "Something went wrong. Please try again."); }
    finally { setBusy(false); }
  }

  return <div className="w-full max-w-[390px]"><h1 className="text-[26px] font-semibold tracking-tight">{title}</h1><p className="mt-2 text-sm text-[var(--muted)]">{mode === "signup" ? "Start exploring digital asset markets." : mode === "login" ? "Sign in to continue to your account." : "We’ll send a recovery link to your email."}</p>
    <form onSubmit={handleSubmit(submit)} className="mt-8 space-y-5" noValidate>
      <div><label htmlFor="email" className="mb-2 block text-xs font-medium">Email address</label><input id="email" type="email" autoComplete="email" {...register("email")} className="h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none focus:border-[var(--accent)]" placeholder="you@example.com"/>{errors.email && <p role="alert" className="mt-1 text-xs text-[var(--negative)]">{errors.email.message}</p>}</div>
      {mode !== "forgot-password" && <div><label htmlFor="password" className="mb-2 block text-xs font-medium">Password</label><div className="relative"><input id="password" type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} {...register("password")} className="h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 pr-11 text-sm outline-none focus:border-[var(--accent)]" placeholder="At least 8 characters"/><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div>{errors.password && <p role="alert" className="mt-1 text-xs text-[var(--negative)]">{errors.password.message}</p>}</div>}
      {mode === "login" && <div className="-mt-2 text-right"><Link href="/forgot-password" className="text-xs text-[var(--accent)]">Forgot password?</Link></div>}
      {message && <p role="status" className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-xs leading-5 text-[var(--muted)]">{message}</p>}
      {!configured && <p className="text-xs leading-5 text-[var(--negative)]">Supabase is not configured. Set the project URL and publishable key to enable account access.</p>}
      <Button type="submit" variant="primary" disabled={busy || !configured} className="w-full">{busy ? "Please wait…" : mode === "signup" ? "Create account" : mode === "login" ? "Sign in" : "Send reset link"}</Button>
      <p className="text-center text-xs text-[var(--muted)]">{mode === "signup" ? <>Already have an account? <Link href="/login" className="text-[var(--accent)]">Sign in</Link></> : mode === "login" ? <>New to NEXORA? <Link href="/signup" className="text-[var(--accent)]">Create an account</Link></> : <Link href="/login" className="text-[var(--accent)]">Back to sign in</Link>}</p>
    </form>
  </div>;
}
