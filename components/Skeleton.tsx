import React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-slate-800/60 border border-slate-700/30", className)}
      {...props}
    />
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="bg-Deloop-card border border-Deloop-border rounded-xl p-5 flex flex-col gap-4">
      <Skeleton className="h-44 w-full rounded-lg" />
      <div className="flex items-center gap-3">
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="h-4 w-28" />
      </div>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-12 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-Deloop-border">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-16 rounded-lg" />
      </div>
    </div>
  );
}

export function DeveloperCardSkeleton() {
  return (
    <div className="bg-Deloop-card border border-Deloop-border rounded-xl p-6 flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Skeleton className="w-14 h-14 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="flex justify-between items-center pt-4 border-t border-Deloop-border">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
    </div>
  );
}
