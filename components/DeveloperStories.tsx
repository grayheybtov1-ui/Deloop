"use client";

import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { localStore } from "@/lib/supabase/store";

export function DeveloperStories() {
  const profiles = localStore.getProfiles();
  const currentUser = localStore.getCurrentUser();

  return (
    <div
      className="overflow-x-auto no-scrollbar"
      style={{
        borderBottom: "1px solid var(--border-color)",
        padding: "16px 4px",
        backgroundColor: "var(--bg-card)",
      }}
    >
      <div className="flex items-start gap-4" style={{ minWidth: "max-content", padding: "0 12px" }}>

        {/* MY STORY — Add Story */}
        <div className="flex flex-col items-center gap-1.5 cursor-pointer group" style={{ width: "64px" }}>
          <div className="relative">
            <img
              src={
                currentUser?.avatar_url ||
                `https://ui-avatars.com/api/?name=${currentUser?.full_name || "U"}&background=random&size=120`
              }
              alt="Hekayəniz"
              className="object-cover rounded-full"
              style={{
                width: "56px",
                height: "56px",
                border: "1px solid var(--border-color)",
              }}
            />
            {/* Blue Plus Badge */}
            <div
              className="absolute bottom-0 right-0 flex items-center justify-center rounded-full text-white"
              style={{
                width: "20px",
                height: "20px",
                backgroundColor: "#0095f6",
                border: "2px solid var(--bg-card)",
              }}
            >
              <Plus className="w-3 h-3" strokeWidth={3} />
            </div>
          </div>
          <span
            className="text-center truncate"
            style={{
              fontSize: "11px",
              color: "var(--text-main)",
              width: "64px",
              display: "block",
              textAlign: "center",
            }}
          >
            Hikayen
          </span>
        </div>

        {/* OTHER DEVELOPERS STORIES */}
        {profiles.slice(0, 10).map((profile) => (
          <Link
            key={profile.id}
            href={`/developers/${profile.username}`}
            className="flex flex-col items-center gap-1.5 group"
            style={{ width: "64px", textDecoration: "none" }}
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
                className="rounded-full"
                style={{
                  width: "52px",
                  height: "52px",
                  backgroundColor: "var(--bg-card)",
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
              className="truncate text-center"
              style={{
                fontSize: "11px",
                color: "var(--text-main)",
                width: "64px",
                display: "block",
                textAlign: "center",
              }}
            >
              {profile.username}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
