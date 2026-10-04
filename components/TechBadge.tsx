import React from "react";
import { cn } from "@/lib/utils";

interface TechBadgeProps {
  name: string;
  className?: string;
  size?: "sm" | "md";
}

export function TechBadge({ name, className, size = "sm" }: TechBadgeProps) {
  const normalized = name.toLowerCase();

  let colorClasses = "bg-slate-800 text-slate-300 border-slate-700";

  if (normalized.includes("react") || normalized.includes("next")) {
    colorClasses = "bg-blue-950/60 text-blue-300 border-blue-800/50";
  } else if (normalized.includes("typescript") || normalized.includes("ts")) {
    colorClasses = "bg-sky-950/60 text-sky-300 border-sky-800/50";
  } else if (normalized.includes("python") || normalized.includes("django")) {
    colorClasses = "bg-amber-950/60 text-amber-300 border-amber-800/50";
  } else if (normalized.includes("node") || normalized.includes("express")) {
    colorClasses = "bg-emerald-950/60 text-emerald-300 border-emerald-800/50";
  } else if (normalized.includes("tailwind") || normalized.includes("css")) {
    colorClasses = "bg-cyan-950/60 text-cyan-300 border-cyan-800/50";
  } else if (normalized.includes("go") || normalized.includes("golang")) {
    colorClasses = "bg-teal-950/60 text-teal-300 border-teal-800/50";
  } else if (normalized.includes("postgres") || normalized.includes("supabase")) {
    colorClasses = "bg-indigo-950/60 text-indigo-300 border-indigo-800/50";
  } else if (normalized.includes("ai") || normalized.includes("pytorch")) {
    colorClasses = "bg-purple-950/60 text-purple-300 border-purple-800/50";
  }

  const sizeClasses = size === "sm" ? "px-2.5 py-0.5 text-xs font-mono" : "px-3 py-1 text-sm font-mono";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border font-medium transition-colors",
        colorClasses,
        sizeClasses,
        className
      )}
    >
      {name}
    </span>
  );
}
