"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Terminal, Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";
import { localStore } from "@/lib/supabase/store";
import { useToast } from "@/components/Toast";

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [email, setEmail] = useState("elvin@Deloop.az");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    setLoading(true);

    try {
      const user = localStore.login(email);
      showToast("Welcome Back!", `Logged in as @${user.username}`, "success");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 sm:py-16 px-4">
      <div className="bg-Deloop-card border border-Deloop-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        
        {/* LOGO & TITLE */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-Deloop-accent mx-auto">
            <Terminal className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Welcome to Deloop</h1>
          <p className="text-xs text-slate-400">Sign in with your Supabase Auth credentials</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-900/60 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* EMAIL */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 font-mono">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@domain.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-Deloop-border text-slate-100 text-sm focus:outline-none focus:border-Deloop-accent transition-colors"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300 font-mono">
                Password
              </label>
              <Link href="/forgot-password" className="text-[11px] text-Deloop-accent hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-Deloop-border text-slate-100 text-sm focus:outline-none focus:border-Deloop-accent transition-colors font-mono"
              />
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-Deloop-accent hover:bg-Deloop-accentHover text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-2"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* FOOTER LINK */}
        <div className="text-center pt-2 text-xs text-slate-400">
          Don't have a Deloop account yet?{" "}
          <Link href="/register" className="text-Deloop-accent font-semibold hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
