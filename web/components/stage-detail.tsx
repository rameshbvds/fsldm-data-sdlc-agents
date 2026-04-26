"use client";
import { motion } from "framer-motion";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StageDetail({
  num,
  Icon,
  name,
  tagline,
  inputs,
  process,
  outputs,
  sample,
  accent = "gold",
  reverse = false,
}: {
  num: string;
  Icon: LucideIcon;
  name: string;
  tagline: string;
  inputs: string[];
  process: string[];
  outputs: string[];
  sample?: { label: string; before: string; after: string };
  accent?: "gold" | "ocbc" | "blue" | "emerald";
  reverse?: boolean;
}) {
  const accentMap = {
    gold: { text: "text-gold-400", bg: "bg-gold/10", border: "border-gold/30", glow: "shadow-[0_0_36px_-6px_rgba(201,169,97,0.45)]" },
    ocbc: { text: "text-ocbc-500", bg: "bg-ocbc-500/10", border: "border-ocbc-500/30", glow: "shadow-[0_0_36px_-6px_rgba(237,28,36,0.4)]" },
    blue: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", glow: "shadow-[0_0_36px_-6px_rgba(59,130,246,0.4)]" },
    emerald: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", glow: "shadow-[0_0_36px_-6px_rgba(16,185,129,0.4)]" },
  }[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={cn(
        "grid grid-cols-1 lg:grid-cols-2 gap-8 items-center py-10",
        reverse && "lg:[&>*:first-child]:order-last"
      )}
    >
      {/* Left: text */}
      <div>
        <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em]", accentMap.bg, accentMap.text)}>
          <span className="font-mono">STAGE {num}</span>
          <span className="opacity-50">·</span>
          <span>{tagline}</span>
        </div>
        <h3 className="mt-4 font-display text-3xl md:text-4xl font-bold tracking-tight">{name}</h3>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-2">Inputs</div>
            <ul className="space-y-1.5">
              {inputs.map((x) => (
                <li key={x} className="text-xs text-muted-foreground leading-snug flex gap-1.5">
                  <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/40 shrink-0 mt-1" />
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className={cn("text-[9px] uppercase tracking-[0.2em] font-bold mb-2", accentMap.text)}>Process</div>
            <ul className="space-y-1.5">
              {process.map((x) => (
                <li key={x} className="text-xs text-foreground leading-snug flex gap-1.5">
                  <ArrowRight className={cn("h-2.5 w-2.5 shrink-0 mt-1", accentMap.text)} />
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-emerald-400 font-bold mb-2">Outputs</div>
            <ul className="space-y-1.5">
              {outputs.map((x) => (
                <li key={x} className="text-xs text-muted-foreground leading-snug flex gap-1.5">
                  <ArrowRight className="h-2.5 w-2.5 text-emerald-400 shrink-0 mt-1" />
                  {x}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Right: visual */}
      <div className="relative">
        <div className={cn("relative rounded-3xl border-2 p-6 md:p-8 overflow-hidden", accentMap.border, accentMap.bg, accentMap.glow)}>
          <div className="absolute inset-0 grid-pattern opacity-20" />
          <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full opacity-30 blur-3xl" style={{ background: accent === "gold" ? "#c9a961" : accent === "ocbc" ? "#ED1C24" : accent === "blue" ? "#3B82F6" : "#10B981" }} />

          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center backdrop-blur bg-background/50", accentMap.text)}>
                <Icon className="h-7 w-7" />
              </div>
              <div className="font-mono text-xs text-muted-foreground tracking-[0.2em]">
                STAGE {num} / 04
              </div>
            </div>

            {sample && (
              <div className="mt-2 space-y-3">
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
                  {sample.label}
                </div>
                <div className="rounded-xl bg-background/60 border border-border p-4 backdrop-blur">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Before</div>
                  <code className="block font-mono text-xs text-muted-foreground break-all">
                    {sample.before}
                  </code>
                </div>
                <div className="flex items-center justify-center">
                  <ArrowRight className={cn("h-4 w-4", accentMap.text)} />
                </div>
                <div className={cn("rounded-xl border p-4 backdrop-blur", accentMap.border, accentMap.bg)}>
                  <div className={cn("text-[10px] uppercase tracking-wider mb-1.5 font-bold", accentMap.text)}>After</div>
                  <code className="block font-mono text-xs text-foreground break-all">
                    {sample.after}
                  </code>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
