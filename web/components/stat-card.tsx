"use client";
import { motion } from "framer-motion";
import { LucideIcon, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  accent = "gold",
  delay = 0,
}: {
  label: string;
  value: string | number;
  delta?: string;
  icon?: LucideIcon;
  accent?: "gold" | "emerald" | "blue" | "rose";
  delay?: number;
}) {
  const accentColor = {
    gold: "text-gold-400 from-gold/15 to-transparent",
    emerald: "text-emerald-400 from-emerald-500/15 to-transparent",
    blue: "text-blue-400 from-blue-500/15 to-transparent",
    rose: "text-rose-400 from-rose-500/15 to-transparent",
  }[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-colors hover:border-gold/30"
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-30 group-hover:opacity-50 transition-opacity", accentColor.split(" ").slice(1).join(" "))} />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            {label}
          </div>
          {Icon && <Icon className={cn("h-4 w-4", accentColor.split(" ")[0])} />}
        </div>
        <div className="mt-2 font-display text-3xl font-bold tracking-tight">{value}</div>
        {delta && (
          <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3 text-emerald-400" />
            {delta}
          </div>
        )}
      </div>
    </motion.div>
  );
}
