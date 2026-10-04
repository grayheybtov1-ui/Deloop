"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Terminal, Lock, Mail, User, AtSign, ArrowRight, AlertCircle, Code2 } from "lucide-react";
import { localStore } from "@/lib/supabase/store";
import { useToast } from "@/components/Toast";
import { DeveloperTitle } from "@/types";

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [developerTitle, setDeveloperTitle] = useState<DeveloperTitle>("Full-Stack Developer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName || !username || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters long.");
      return;
    }

    const existing = localStore.getProfileByUsername(username.trim());
    if (existing) {
      setError("This username is already taken. Please choose another.");
      return;
    }

    setLoading(true);

    try {
      const newUser = localStore.register({
        full_name: fullName.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim(),
        developer_title: developerTitle,
      });

      showToast("Account Created!", `Welcome to Deloop, ${newUser.full_name}!`, "success");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 sm:py-14 px-4">
      <div className="bg-Deloop-card border border-Deloop-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        
        {/* LOGO & TITLE */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-Deloop-accent mx-auto">
            <Terminal className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Create Developer Account</h1>
          <p className="text-xs text-slate-400">Join the Deloop developer network</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-900/60 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* FULL NAME */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 font-mono">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Geray Heybetov"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-Deloop-border text-slate-100 text-sm focus:outline-none focus:border-Deloop-accent transition-colors"
              />
            </div>
          </div>

          {/* USERNAME */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 font-mono">
              Unique Username *
            </label>
            <div className="relative">
              <AtSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="geray_dev"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-Deloop-border text-slate-100 text-sm focus:outline-none focus:border-Deloop-accent transition-colors font-mono"
              />
            </div>
          </div>

          {/* DEVELOPER SPECIALIZATION */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 font-mono">
              Developer Specialization *
            </label>
            <div className="relative">
              <Code2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <select
                value={developerTitle}
                onChange={(e) => setDeveloperTitle(e.target.value as DeveloperTitle)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-Deloop-border text-slate-100 text-sm focus:outline-none focus:border-Deloop-accent transition-colors appearance-none font-mono"
              >
                <option value="Full-Stack Developer">Full-Stack Developer</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="AI / Data Engineer">AI / Data Engineer</option>
                <option value="Mobile Developer">Mobile Developer</option>
                <option value="DevOps Engineer">DevOps Engineer</option>
              </select>
            </div>
          </div>

          {/* EMAIL */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 font-mono">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="geray@Deloop.az"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-Deloop-border text-slate-100 text-sm focus:outline-none focus:border-Deloop-accent transition-colors"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 font-mono">
              Password *
            </label>
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
            <span>Create Profile</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* FOOTER LINK */}
        <div className="text-center pt-2 text-xs text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="text-Deloop-accent font-semibold hover:underline">
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
}
