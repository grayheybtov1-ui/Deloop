import React, { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export function StatCard({ title, value, icon, description, trend }: StatCardProps) {
  return (
    <div className="bg-Deloop-card border border-Deloop-border rounded-xl p-5 flex flex-col justify-between space-y-3 shadow-sm hover:border-Deloop-borderHover transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-Deloop-accent">
          {icon}
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold text-slate-100 tracking-tight">{value}</span>
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 text-xs font-mono font-semibold px-2 py-0.5 rounded-full ${
                trend.isPositive
                  ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/50"
                  : "bg-red-950/60 text-red-400 border border-red-800/50"
              }`}
            >
              {trend.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trend.value}
            </span>
          )}
        </div>
        {description && <p className="text-xs text-slate-400 leading-relaxed">{description}</p>}
      </div>
    </div>
  );
}
