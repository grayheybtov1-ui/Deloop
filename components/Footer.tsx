import React from "react";
import Link from "next/link";
import { Terminal, Github, Heart, Code2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-Deloop-border bg-Deloop-bg text-slate-400 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Terminal className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-200 text-base">Deloop</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Professional platform for developers to showcase full-stack projects, connect, and analyze GitHub activity.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-200 text-xs tracking-wider uppercase mb-3 font-mono">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/developers" className="hover:text-slate-200 transition-colors">Discover Developers</Link></li>
              <li><Link href="/projects" className="hover:text-slate-200 transition-colors">Explore Projects</Link></li>
              <li><Link href="/dashboard" className="hover:text-slate-200 transition-colors">User Dashboard</Link></li>
              <li><Link href="/register" className="hover:text-slate-200 transition-colors">Create Profile</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-200 text-xs tracking-wider uppercase mb-3 font-mono">Technologies</h4>
            <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">Next.js 15</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">React 19</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">TypeScript</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">Supabase DB</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">Tailwind CSS</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-200 text-xs tracking-wider uppercase mb-3 font-mono">Exam Status</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-2">
              Full-Stack Final Exam Project. Real Supabase Auth, PostgreSQL RLS, GitHub REST API.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              System Status: Ready
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-Deloop-border flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Deloop Platform. Built for developers by developers.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Crafted with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" /> and <Code2 className="w-3.5 h-3.5 text-blue-400 inline" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
