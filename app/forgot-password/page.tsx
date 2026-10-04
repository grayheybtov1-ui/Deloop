"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-Deloop-card border border-Deloop-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-slate-100">Reset Password</h1>
          <p className="text-xs text-slate-400">
            Enter your account email to receive a password reset link
          </p>
        </div>

        {submitted ? (
          <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-900/60 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="font-bold text-slate-100 text-sm">Reset link sent!</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              We have dispatched a reset link to <strong className="text-white">{email}</strong>. Check your inbox to set a new password.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-xs text-Deloop-accent font-semibold hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Log In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-Deloop-accent hover:bg-Deloop-accentHover text-white font-semibold text-sm shadow-md transition-all"
            >
              Send Reset Link
            </button>
          </form>
        )}

        <div className="text-center pt-2 text-xs text-slate-400">
          Remembered your password?{" "}
          <Link href="/login" className="text-Deloop-accent font-semibold hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
