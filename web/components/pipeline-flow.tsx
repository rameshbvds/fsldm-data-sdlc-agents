"use client";
import { motion } from "framer-motion";
import {
  Database,
  FileCode,
  FileJson,
  FileText,
  GitBranch,
  Sparkles,
  Table,
  TestTube2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SOURCES = [
  { Icon: Table, label: "ODS Source", note: "13 tables · PRTY · DPOS_AGMT · DPOS_BAL …" },
  { Icon: Database, label: "FSLDM Target", note: "3 facts · FCT_DPOS_BAL · FCT_DPOS_EVNT · FCT_INTRS_ACCRL" },
];

const AGENTS = [
  { Icon: GitBranch, label: "Mapping Agent", color: "gold" as const },
  { Icon: Sparkles, label: "HITL Review", color: "ocbc" as const },
  { Icon: Database, label: "Dev Agent", color: "blue" as const },
  { Icon: TestTube2, label: "Testing Agent", color: "emerald" as const },
];

const OUTPUTS = [
  { Icon: FileCode, label: "Teradata SQL", note: "*.gen.sql" },
  { Icon: FileCode, label: "dbt Models", note: "Snowflake-compatible" },
  { Icon: FileJson, label: "GX Suite", note: "deposit_expectations.gen.json" },
  { Icon: FileText, label: "Soda Checks", note: "deposit_checks.gen.yml" },
  { Icon: FileText, label: "BTEQ Validation", note: "deposit_validate_all.gen.sql" },
];

const colorMap = {
  gold: { bg: "bg-gold/10", border: "border-gold/30", text: "text-gold-400", glow: "shadow-[0_0_24px_-4px_rgba(201,169,97,0.6)]" },
  ocbc: { bg: "bg-ocbc-500/10", border: "border-ocbc-500/30", text: "text-ocbc-500", glow: "shadow-[0_0_24px_-4px_rgba(237,28,36,0.5)]" },
  blue: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400", glow: "shadow-[0_0_24px_-4px_rgba(59,130,246,0.5)]" },
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", glow: "shadow-[0_0_24px_-4px_rgba(16,185,129,0.5)]" },
};

export function PipelineFlow() {
  return (
    <div className="relative rounded-3xl border border-border bg-card/40 p-6 md:p-10 overflow-hidden">
      {/* Ambient grid */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-72 w-[500px] rounded-full bg-gold/10 blur-3xl pointer-events-none" />

      {/* SVG flow lines (desktop only) */}
      <svg
        className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="none"
        viewBox="0 0 1000 600"
      >
        <defs>
          <linearGradient id="flow1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#c9a961" stopOpacity="0" />
            <stop offset="50%" stopColor="#c9a961" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#c9a961" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="flow2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0" />
            <stop offset="50%" stopColor="#10B981" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Sources → Agents (curved) */}
        <motion.path
          d="M 200 150 Q 350 150 480 280"
          stroke="url(#flow1)"
          strokeWidth="1.5"
          fill="none"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
        <motion.path
          d="M 200 450 Q 350 450 480 320"
          stroke="url(#flow1)"
          strokeWidth="1.5"
          fill="none"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2, ease: "easeOut", delay: 0.2 }}
        />

        {/* Agents → Outputs (multi-fan) */}
        {[100, 200, 300, 400, 500].map((y, i) => (
          <motion.path
            key={i}
            d={`M 700 300 Q 800 300 880 ${y}`}
            stroke="url(#flow2)"
            strokeWidth="1.5"
            fill="none"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2, ease: "easeOut", delay: 0.6 + i * 0.1 }}
          />
        ))}

        {/* Animated flowing dots */}
        {[0, 1, 2].map((i) => (
          <motion.circle
            key={`dot-a-${i}`}
            r="3"
            fill="#c9a961"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              cx: [200, 350, 480],
              cy: [150, 150, 280],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeInOut",
            }}
          />
        ))}
        {[0, 1, 2].map((i) => (
          <motion.circle
            key={`dot-b-${i}`}
            r="3"
            fill="#c9a961"
            animate={{
              opacity: [0, 1, 1, 0],
              cx: [200, 350, 480],
              cy: [450, 450, 320],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: 0.4 + i * 0.8,
              ease: "easeInOut",
            }}
          />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <motion.circle
            key={`dot-c-${i}`}
            r="3"
            fill="#10B981"
            animate={{
              opacity: [0, 1, 1, 0],
              cx: [700, 800, 880],
              cy: [300, 300, 100 + i * 100],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              delay: 1.2 + i * 0.5,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>

      {/* Three-column grid */}
      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* SOURCES */}
        <div className="lg:col-span-3 space-y-3">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-4">
            Inputs
          </div>
          {SOURCES.map((s, i) => {
            const Icon = s.Icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="rounded-xl border border-border bg-card p-4 hover:border-gold/30 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-gold/10 group-hover:text-gold-400 transition-colors shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm">{s.label}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                      {s.note}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* AGENTS */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-4 text-center">
            Agent Pipeline
          </div>
          {AGENTS.map((a, i) => {
            const Icon = a.Icon;
            const c = colorMap[a.color];
            return (
              <motion.div
                key={a.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.12 }}
                whileHover={{ y: -2 }}
                className={cn("relative rounded-2xl border-2 p-4 backdrop-blur", c.border, c.bg, c.glow)}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center bg-background/50", c.text)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-mono tracking-wider text-muted-foreground">
                      STAGE 0{i + 1}
                    </div>
                    <div className={cn("font-display font-bold tracking-tight", c.text)}>
                      {a.label}
                    </div>
                  </div>
                  {/* Live pulse */}
                  <div className="hidden md:flex items-center gap-1.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75", c.text.replace("text-", "bg-"))} />
                      <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", c.text.replace("text-", "bg-"))} />
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <motion.div
                  className={cn("absolute bottom-0 left-0 h-0.5 rounded-full", c.text.replace("text-", "bg-"))}
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 + i * 0.2 }}
                />
              </motion.div>
            );
          })}
        </div>

        {/* OUTPUTS */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-4">
            Generated Artifacts
          </div>
          {OUTPUTS.map((o, i) => {
            const Icon = o.Icon;
            return (
              <motion.div
                key={o.label}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 1 + i * 0.08 }}
                className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 hover:border-emerald-500/40 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400 shrink-0">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm">{o.label}</div>
                    <div className="text-[10px] text-muted-foreground font-mono truncate">{o.note}</div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
