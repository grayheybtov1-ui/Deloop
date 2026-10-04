"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/Toast";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    showToast("Password Updated", "Your password has been successfully reset.", "success");
    router.push("/login");
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-Deloop-card border border-Deloop-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-slate-100">Set New Password</h1>
          <p className="text-xs text-slate-400">Choose a new password for your Deloop account</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/50 border border-red-900/60 text-red-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 font-mono">
              New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-Deloop-border text-slate-100 text-sm focus:outline-none focus:border-Deloop-accent font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 font-mono">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-Deloop-border text-slate-100 text-sm focus:outline-none focus:border-Deloop-accent font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-Deloop-accent hover:bg-Deloop-accentHover text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Update Password</span>
          </button>
        </form>
      </div>
    </div>
  );
}
