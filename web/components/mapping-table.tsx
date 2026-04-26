"use client";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, Copy, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { HighlightedSQL } from "@/lib/sql-highlight";
import { cn } from "@/lib/utils";
import type { TargetTable, FieldMapping } from "@/lib/api";

type FilterTier = "all" | "high" | "mid" | "low" | "open";

function confidenceTier(c: number, openQ: string | null): FilterTier {
  if (openQ) return "open";
  if (c >= 0.85) return "high";
  if (c >= 0.5) return "mid";
  return "low";
}

const tierColor: Record<Exclude<FilterTier, "all">, { border: string; bg: string; text: string; dot: string }> = {
  high: { border: "border-l-emerald-500", bg: "bg-emerald-500/[0.04]", text: "text-emerald-400", dot: "bg-emerald-500" },
  mid: { border: "border-l-amber-500", bg: "bg-amber-500/[0.04]", text: "text-amber-400", dot: "bg-amber-500" },
  low: { border: "border-l-red-500", bg: "bg-red-500/[0.04]", text: "text-red-400", dot: "bg-red-500" },
  open: { border: "border-l-ocbc-500", bg: "bg-ocbc-500/[0.05]", text: "text-ocbc-500", dot: "bg-ocbc-500" },
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      }}
      className="opacity-0 group-hover:opacity-100 inline-flex items-center justify-center h-6 w-6 rounded hover:bg-muted transition-all shrink-0"
      title="Copy"
    >
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
    </button>
  );
}

function MappingRow({ fm }: { fm: FieldMapping }) {
  const tier = confidenceTier(fm.confidence, fm.open_question);
  const c = tierColor[tier as Exclude<FilterTier, "all">];
  return (
    <tr className={cn("group border-t border-border/40 border-l-4 transition-colors hover:bg-muted/30", c.border, c.bg)}>
      <td className="px-4 py-3 align-top w-48">
        <div className="font-mono text-xs font-semibold text-foreground">{fm.target_column}</div>
        {fm.transform_note && (
          <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{fm.transform_note}</div>
        )}
      </td>
      <td className="px-4 py-3 align-top">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0 rounded bg-background/40 px-2 py-1.5 border border-border/40">
            <HighlightedSQL sql={fm.source_expr} />
          </div>
          <CopyButton text={fm.source_expr} />
        </div>
        {fm.open_question && (
          <div className="mt-2 text-[11px] text-ocbc-500 flex items-center gap-1.5">
            <span className={cn("inline-block h-1.5 w-1.5 rounded-full", c.dot)} />
            {fm.open_question}
          </div>
        )}
      </td>
      <td className="px-4 py-3 align-top w-44">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div className={cn("h-full", c.dot)} style={{ width: `${fm.confidence * 100}%` }} />
          </div>
          <span className={cn("font-mono text-xs font-semibold tabular-nums", c.text)}>
            {fm.confidence.toFixed(2)}
          </span>
        </div>
        <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          {tier === "open" ? "Open Question" : tier}
        </div>
      </td>
    </tr>
  );
}

function MappingCard({ fm }: { fm: FieldMapping }) {
  const tier = confidenceTier(fm.confidence, fm.open_question);
  const c = tierColor[tier as Exclude<FilterTier, "all">];
  return (
    <div className={cn("group rounded-xl border border-l-4 p-4 transition-colors", c.border, c.bg)}>
      <div className="flex items-center justify-between mb-2">
        <div className="font-mono text-sm font-semibold">{fm.target_column}</div>
        <span className={cn("font-mono text-xs", c.text)}>{fm.confidence.toFixed(2)}</span>
      </div>
      <div className="rounded bg-background/40 p-2 border border-border/40 mb-2">
        <HighlightedSQL sql={fm.source_expr} />
      </div>
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{fm.transform_note || "—"}</span>
        <CopyButton text={fm.source_expr} />
      </div>
      {fm.open_question && (
        <div className="mt-2 text-[11px] text-ocbc-500">⚠ {fm.open_question}</div>
      )}
    </div>
  );
}

export function MappingTable({ targets }: { targets: TargetTable[] }) {
  const [filter, setFilter] = useState<FilterTier>("all");
  const [search, setSearch] = useState("");
  const [openTable, setOpenTable] = useState<string | null>(targets[0]?.target_table ?? null);

  const counts = useMemo(() => {
    const all = targets.flatMap((t) => t.field_mappings);
    return {
      all: all.length,
      high: all.filter((f) => !f.open_question && f.confidence >= 0.85).length,
      mid: all.filter((f) => !f.open_question && f.confidence >= 0.5 && f.confidence < 0.85).length,
      low: all.filter((f) => !f.open_question && f.confidence < 0.5).length,
      open: all.filter((f) => f.open_question).length,
    };
  }, [targets]);

  function rowsFor(table: TargetTable) {
    return table.field_mappings.filter((fm) => {
      const tier = confidenceTier(fm.confidence, fm.open_question);
      if (filter !== "all" && tier !== filter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          fm.target_column.toLowerCase().includes(q) ||
          fm.source_expr.toLowerCase().includes(q) ||
          fm.transform_note.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }

  const filterChips: { key: FilterTier; label: string; count: number; cls: string }[] = [
    { key: "all", label: "All", count: counts.all, cls: "border-foreground/30 bg-foreground/5 text-foreground" },
    { key: "high", label: "High", count: counts.high, cls: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" },
    { key: "mid", label: "Mid", count: counts.mid, cls: "border-amber-500/40 bg-amber-500/10 text-amber-400" },
    { key: "low", label: "Low", count: counts.low, cls: "border-red-500/40 bg-red-500/10 text-red-400" },
    { key: "open", label: "Open Q", count: counts.open, cls: "border-ocbc-500/40 bg-ocbc-500/10 text-ocbc-500" },
  ];

  return (
    <div className="space-y-4">
      {/* Search + filter chips */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search column, expression, or note…"
            className="w-full rounded-lg border border-border bg-card pl-9 pr-9 py-2 text-sm focus:border-gold/40 focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full hover:bg-muted flex items-center justify-center"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {filterChips.map((chip) => (
            <button
              key={chip.key}
              onClick={() => setFilter(chip.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all",
                filter === chip.key ? chip.cls : "border-border bg-card text-muted-foreground hover:text-foreground"
              )}
            >
              {chip.label}
              <span className="font-mono opacity-70">{chip.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tables */}
      {targets.map((t) => {
        const rows = rowsFor(t);
        const isOpen = openTable === t.target_table;
        return (
          <div key={t.target_table} className="rounded-2xl border border-border bg-card overflow-hidden">
            <button
              onClick={() => setOpenTable(isOpen ? null : t.target_table)}
              className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors text-left"
            >
              <div>
                <div className="font-mono font-semibold tracking-tight">{t.target_table}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{t.grain_description}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="muted">{rows.length} / {t.field_mappings.length}</Badge>
                <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
              </div>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && rows.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden border-t border-border"
                >
                  {/* Desktop table */}
                  <div className="hidden md:block overflow-x-auto max-h-[600px]">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-card/95 backdrop-blur z-10 border-b border-border">
                        <tr className="text-left text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                          <th className="px-4 py-2.5 font-medium">Target Column</th>
                          <th className="px-4 py-2.5 font-medium">Source Expression</th>
                          <th className="px-4 py-2.5 font-medium">Confidence</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((fm) => (
                          <MappingRow key={fm.target_column} fm={fm} />
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="md:hidden p-3 space-y-2 max-h-[600px] overflow-y-auto">
                    {rows.map((fm) => (
                      <MappingCard key={fm.target_column} fm={fm} />
                    ))}
                  </div>
                </motion.div>
              )}
              {isOpen && rows.length === 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0 }}
                  className="border-t border-border p-8 text-center text-sm text-muted-foreground"
                >
                  No mappings match the current filter.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
