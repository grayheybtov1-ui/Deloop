"use client";

import React, { useState } from "react";
import { Search, Filter, Users, Terminal } from "lucide-react";
import { localStore } from "@/lib/supabase/store";
import { DeveloperCard } from "@/components/DeveloperCard";
import { DeveloperCardSkeleton } from "@/components/Skeleton";

const SKILL_FILTERS = ["All", "React", "Next.js", "TypeScript", "Node.js", "Python", "AI", "Go", "Tailwind CSS"];

export default function DevelopersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("All");

  const allProfiles = localStore.getProfiles();

  const filteredProfiles = allProfiles.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.full_name.toLowerCase().includes(q) ||
      p.username.toLowerCase().includes(q) ||
      (p.bio && p.bio.toLowerCase().includes(q)) ||
      (p.skills && p.skills.some((s) => s.toLowerCase().includes(q)));

    const matchesSkill =
      selectedSkill === "All" ||
      (p.skills && p.skills.some((s) => s.toLowerCase() === selectedSkill.toLowerCase()));

    return matchesSearch && matchesSkill;
  });

  return (
    <div className="space-y-8 py-4">
      
      {/* PAGE HEADER */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2.5">
          <Users className="w-7 h-7 text-Deloop-accent" />
          <span>Discover Developers</span>
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Connect with software engineers, explore their technology stacks, and inspect live GitHub repositories.
        </p>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="bg-Deloop-card border border-Deloop-border rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search developers by name, username, bio, or skill (e.g. Next.js, Python)..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-900 border border-Deloop-border text-slate-100 text-sm focus:outline-none focus:border-Deloop-accent transition-colors"
          />
        </div>

        {/* SKILL PILLS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            Skills:
          </span>
          {SKILL_FILTERS.map((skill) => (
            <button
              key={skill}
              onClick={() => setSelectedSkill(skill)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors shrink-0 ${
                selectedSkill === skill
                  ? "bg-Deloop-accent text-white font-semibold shadow-sm"
                  : "bg-slate-900 text-slate-400 border border-Deloop-border hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      {/* DEVELOPERS GRID */}
      {filteredProfiles.length === 0 ? (
        <div className="bg-Deloop-card border border-Deloop-border rounded-2xl p-12 text-center space-y-3">
          <Terminal className="w-10 h-10 mx-auto text-slate-600" />
          <h3 className="font-bold text-slate-200 text-base">No developers found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query or removing skill filters to discover registered developers.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map((profile) => (
            <DeveloperCard key={profile.id} profile={profile} />
          ))}
        </div>
      )}
    </div>
  );
}
