import React from "react";
import Link from "next/link";
import { 
  Terminal, 
  ArrowRight, 
  Code2, 
  Github, 
  Users, 
  FolderGit2, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Layers
} from "lucide-react";
import { localStore } from "@/lib/supabase/store";
import { DeveloperCard } from "@/components/DeveloperCard";
import { ProjectCard } from "@/components/ProjectCard";

export default function LandingPage() {
  const profiles = localStore.getProfiles().slice(0, 3);
  const projects = localStore.getProjects().slice(0, 3);
  const stats = localStore.getStats();

  return (
    <div className="space-y-20 py-4">
      
      {/* HERO SECTION */}
      <section className="relative text-center space-y-6 pt-8 pb-12 md:py-16 max-w-4xl mx-auto">
        
        {/* TOP BADGE */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-Deloop-border text-xs text-slate-300 font-mono shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          <span>Full-Stack Platform for Modern Engineers</span>
        </div>

        {/* HERO HEADING */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-100 tracking-tight leading-[1.15]">
          Where Developers Build Their <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">Identity.</span>
        </h1>

        {/* HERO SUBTITLE */}
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Showcase your work. Connect with developers. Build your professional presence with GitHub analytics, real-time feedback, and interactive portfolios.
        </p>

        {/* HERO BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href="/developers"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-Deloop-accent hover:bg-Deloop-accentHover text-white font-semibold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 group"
          >
            <Users className="w-4 h-4" />
            <span>Explore Developers</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <Link
            href="/register"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-Deloop-card hover:bg-slate-800 text-slate-200 border border-Deloop-border font-semibold text-sm transition-all flex items-center justify-center gap-2"
          >
            <Terminal className="w-4 h-4 text-slate-400" />
            <span>Create Profile</span>
          </Link>
        </div>

        {/* TECH STACK BADGES BANNER */}
        <div className="pt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-500">
          <span>Powered by</span>
          <span className="text-slate-300">Next.js 15</span>
          <span>•</span>
          <span className="text-slate-300">Supabase Auth & DB</span>
          <span>•</span>
          <span className="text-slate-300">GitHub REST API</span>
          <span>•</span>
          <span className="text-slate-300">TypeScript</span>
        </div>
      </section>

      {/* PLATFORM METRICS */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-Deloop-card border border-Deloop-border shadow-sm">
        <div className="p-4 text-center space-y-1">
          <div className="text-3xl font-extrabold text-slate-100 font-mono">{stats.total_users}+</div>
          <div className="text-xs text-slate-400 font-medium">Active Developers</div>
        </div>
        <div className="p-4 text-center space-y-1 border-l border-Deloop-border">
          <div className="text-3xl font-extrabold text-slate-100 font-mono">{stats.total_projects}+</div>
          <div className="text-xs text-slate-400 font-medium">Projects Showcase</div>
        </div>
        <div className="p-4 text-center space-y-1 border-l border-Deloop-border">
          <div className="text-3xl font-extrabold text-slate-100 font-mono">{stats.total_likes}+</div>
          <div className="text-xs text-slate-400 font-medium">Community Likes</div>
        </div>
        <div className="p-4 text-center space-y-1 border-l border-Deloop-border">
          <div className="text-3xl font-extrabold text-slate-100 font-mono">{stats.total_comments}+</div>
          <div className="text-xs text-slate-400 font-medium">Comments & Discussions</div>
        </div>
      </section>

      {/* HOW IT WORKS / KEY FEATURES */}
      <section className="space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">Designed for Serious Engineers</h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Not just a generic social feed. Deloop is structured for architectural clarity and real engineering depth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-Deloop-card border border-Deloop-border space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Github className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-100 text-lg">GitHub API Synchronization</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automatically pull public repositories, stargazers, commit activity, and top language distributions directly into your developer profile.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-Deloop-card border border-Deloop-border space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-100 text-lg">Full-Stack Project Management</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Create, update, and showcase your web apps with status tags (Completed, In Progress, Planning), cover images, and tech stack tags.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-Deloop-card border border-Deloop-border space-y-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-100 text-lg">Developer Network & Feedback</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Follow fellow engineers, like projects, leave technical feedback in comments, and receive instant database notifications.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURED DEVELOPERS */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-Deloop-border pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-Deloop-accent" />
              <span>Featured Developers</span>
            </h2>
            <p className="text-xs text-slate-400">Discover talent across frontend, backend, AI, and full-stack engineering.</p>
          </div>
          <Link href="/developers" className="text-xs font-semibold text-Deloop-accent hover:underline flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <DeveloperCard key={profile.id} profile={profile} />
          ))}
        </div>
      </section>

      {/* FEATURED PROJECTS */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-Deloop-border pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-Deloop-accent" />
              <span>Top Projects</span>
            </h2>
            <p className="text-xs text-slate-400">Explore high-impact projects built with modern technologies.</p>
          </div>
          <Link href="/projects" className="text-xs font-semibold text-Deloop-accent hover:underline flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="p-8 md:p-12 rounded-2xl bg-gradient-to-r from-blue-950/40 via-Deloop-card to-slate-900 border border-blue-900/40 text-center space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">Ready to build your developer presence?</h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
          Create your developer profile, link your GitHub account, and start sharing your full-stack projects today.
        </p>
        <div className="pt-2">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-Deloop-accent hover:bg-Deloop-accentHover text-white font-semibold text-sm shadow-md transition-all"
          >
            <span>Get Started Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  );
}
