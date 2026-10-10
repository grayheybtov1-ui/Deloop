"use client";

import React, { useState } from "react";
import { Search, Filter, Users, Terminal } from "lucide-react";
import { localStore } from "@/lib/supabase/store";
import { DeveloperCard } from "@/components/DeveloperCard";
import { getSavedLanguage, Language } from "@/lib/i18n";

const SKILL_FILTERS = ["Tümü", "React", "Next.js", "TypeScript", "Node.js", "Python", "AI", "Go", "Tailwind CSS"];

export default function DevelopersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("Tümü");
  const lang: Language = getSavedLanguage();

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
      selectedSkill === "Tümü" ||
      (p.skills && p.skills.some((s) => s.toLowerCase() === selectedSkill.toLowerCase()));

    return matchesSearch && matchesSkill;
  });

  return (
    <div className="space-y-6 py-4 px-2 sm:px-4 max-w-5xl mx-auto pb-20">
      
      {/* PAGE HEADER */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <Users className="w-6 h-6 text-blue-500" />
          <span>{lang === "tr" ? "Geliştiricileri Keşfet" : "Tərtibatçıları Kəşf Et"}</span>
        </h1>
        <p className="text-xs text-neutral-400">
          {lang === "tr"
            ? "Yazılım mühendisleriyle tanışın, teknoloji yığınlarını inceleyin ve GitHub projelerini keşfedin."
            : "Proqramçılarla əlaqə qurun, texnologiya steklərini araşdırın və layihələri kəşf edin."}
        </p>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-4 space-y-3.5">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === "tr"
                ? "İsim, kullanıcı adı veya teknoloji ile ara (örn: React, Python)..."
                : "Ad, istifadəçi adı və ya texnologiya ilə axtar..."
            }
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs sm:text-sm focus:outline-none focus:border-neutral-600 transition-colors placeholder:text-neutral-500"
          />
        </div>

        {/* SKILL PILLS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-xs font-medium text-neutral-400 shrink-0 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            {lang === "tr" ? "Yetenekler:" : "Bacarıqlar:"}
          </span>
          {SKILL_FILTERS.map((skill) => (
            <button
              key={skill}
              onClick={() => setSelectedSkill(skill)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                selectedSkill === skill
                  ? "bg-neutral-800 text-white font-semibold"
                  : "bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white"
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      {/* DEVELOPERS GRID */}
      {filteredProfiles.length === 0 ? (
        <div className="bg-neutral-900/30 border border-neutral-800 rounded-2xl p-12 text-center space-y-2">
          <Terminal className="w-8 h-8 mx-auto text-neutral-600" />
          <h3 className="font-semibold text-white text-sm">
            {lang === "tr" ? "Geliştirici bulunamadı" : "Tərtibatçı tapılmadı"}
          </h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            {lang === "tr"
              ? "Arama kriterlerinizi değiştirerek tekrar deneyin."
              : "Axtarış sorğusunu dəyişərək yenidən yoxlayın."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProfiles.map((profile) => (
            <DeveloperCard key={profile.id} profile={profile} />
          ))}
        </div>
      )}
    </div>
  );
}
