"use client";
import { motion } from "framer-motion";
import { Check, Database, GitBranch, Sparkles, TestTube2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STAGES = [
  { id: "mapping", label: "Mapping", desc: "Field-level lineage", Icon: GitBranch },
  { id: "hitl", label: "HITL", desc: "Human review", Icon: Sparkles },
  { id: "develop", label: "Develop", desc: "SQL + dbt", Icon: Database },
  { id: "test", label: "Test", desc: "GX · Soda · BTEQ", Icon: TestTube2 },
];

export function StageTimeline({
  activeIdx = 0,
  doneIdx = -1,
}: {
  activeIdx?: number;
  doneIdx?: number;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {STAGES.map((s, i) => {
        const done = i <= doneIdx;
        const active = i === activeIdx;
        const Icon = s.Icon;
        return (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className={cn(
              "relative rounded-2xl border p-4 transition-all duration-300",
              done && "border-emerald-500/30 bg-emerald-500/[0.03]",
              active && "border-gold/40 bg-gold/[0.03] shadow-[0_0_24px_-4px_rgba(201,169,97,0.3)]",
              !done && !active && "border-border bg-card/40"
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg",
                done && "bg-emerald-500/15 text-emerald-400",
                active && "bg-gold/15 text-gold-400",
                !done && !active && "bg-muted text-muted-foreground"
              )}>
                {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <span className="font-mono text-[10px] tracking-wider text-muted-foreground">
                STAGE 0{i + 1}
              </span>
            </div>
            <div className="font-semibold tracking-tight">{s.label}</div>
            <div className="mt-1 text-xs text-muted-foreground">{s.desc}</div>
            {active && (
              <div className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-gold-400">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold" />
                </span>
                In progress
              </div>
            )}
            {done && (
              <div className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                ✓ Complete
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
