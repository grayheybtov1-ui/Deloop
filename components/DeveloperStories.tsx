"use client";

import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { localStore } from "@/lib/supabase/store";

export function DeveloperStories() {
  const profiles = localStore.getProfiles();
  const currentUser = localStore.getCurrentUser();

  return (
    <div className="bg-[#f5f7fa] dark:bg-[#0b0f17] border border-gray-200/80 dark:border-neutral-800/80 rounded-2xl p-4 overflow-x-auto no-scrollbar shadow-xs mb-6 transition-colors">
      <div className="flex items-start gap-4 min-w-max px-1">

        {/* MY STORY — Add Story */}
        <div className="flex flex-col items-center gap-1.5 cursor-pointer group" style={{ width: "64px" }}>
          <div className="relative">
            <img
              src={
                currentUser?.avatar_url ||
                `https://ui-avatars.com/api/?name=${currentUser?.full_name || "U"}&background=random&size=120`
              }
              alt="Hekayəniz"
              className="object-cover rounded-full border border-gray-200 dark:border-neutral-800"
              style={{
                width: "56px",
                height: "56px",
              }}
            />
            {/* Blue Plus Badge */}
            <div
              className="absolute bottom-0 right-0 flex items-center justify-center rounded-full text-white bg-blue-600 border-2 border-white dark:border-[#0b0f17]"
              style={{
                width: "20px",
                height: "20px",
              }}
            >
              <Plus className="w-3 h-3" strokeWidth={3} />
            </div>
          </div>
          <span
            className="text-center truncate text-[11px] text-gray-800 dark:text-neutral-200 block"
            style={{ width: "64px" }}
          >
            Hikayen
          </span>
        </div>

        {/* OTHER DEVELOPERS STORIES */}
        {profiles.slice(0, 10).map((profile) => (
          <Link
            key={profile.id}
            href={`/developers/${profile.username}`}
            className="flex flex-col items-center gap-1.5 group no-underline"
            style={{ width: "64px" }}
          >
            {/* Clean Story Ring */}
            <div
              className="rounded-full flex items-center justify-center transition-transform group-hover:scale-105"
              style={{
                width: "60px",
                height: "60px",
                border: "2px solid #0095f6",
                padding: "2px",
              }}
            >
              <div
                className="rounded-full bg-white dark:bg-[#0b0f17]"
                style={{
                  width: "52px",
                  height: "52px",
                }}
              >
                <img
                  src={
                    profile.avatar_url ||
                    `https://ui-avatars.com/api/?name=${profile.full_name}&background=random&size=120`
                  }
                  alt={profile.full_name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
            <span
              className="truncate text-center text-[11px] text-gray-800 dark:text-neutral-200 group-hover:text-blue-500 transition-colors block"
              style={{ width: "64px" }}
            >
              {profile.username}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
