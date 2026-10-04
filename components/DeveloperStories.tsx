"use client";

import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Profile } from "@/types";
import { localStore } from "@/lib/supabase/store";

export function DeveloperStories() {
  const profiles = localStore.getProfiles();
  const currentUser = localStore.getCurrentUser();

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 overflow-x-auto no-scrollbar shadow-lg">
      <div className="flex items-center gap-4 min-w-max">
        
        {/* CREATE STORY / MY PROFILE STORY ITEM */}
        <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
          <div className="relative">
            <img
              src={currentUser?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
              alt="Hekayəniz"
              className="w-14 h-14 rounded-full object-cover border-2 border-slate-900 group-hover:scale-105 transition-transform"
            />
            <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-blue-500 text-white border-2 border-slate-900 flex items-center justify-center">
              <Plus className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-[11px] font-medium text-slate-300 group-hover:text-blue-400 transition-colors">
            Hekayəniz
          </span>
        </div>

        {/* DEVELOPERS STORIES LIST */}
        {profiles.map((profile, idx) => (
          <Link
            key={profile.id}
            href={`/developers/${profile.username}`}
            className="flex flex-col items-center gap-1.5 group"
          >
            {/* Instagram Story Gradient Border */}
            <div className={`p-0.5 rounded-full transition-transform group-hover:scale-105 ${
              idx % 2 === 0
                ? "bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600"
                : "bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600"
            }`}>
              <img
                src={profile.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                alt={profile.full_name}
                className="w-13 h-13 rounded-full object-cover border-2 border-slate-950"
              />
            </div>
            <span className="text-[11px] font-medium text-slate-300 group-hover:text-blue-400 max-w-[68px] truncate text-center">
              {profile.username}
            </span>
          </Link>
        ))}

      </div>
    </div>
  );
}
