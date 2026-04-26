"use client";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TargetTable } from "@/lib/api";

export function OpenQuestionsGrid({ targets }: { targets: TargetTable[] }) {
  const groups = targets
    .map((t) => ({ table: t.target_table, qs: t.open_questions }))
    .filter((g) => g.qs.length > 0);

  if (groups.length === 0) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center">
        <div className="text-sm text-emerald-400 font-semibold">No open questions ✓</div>
        <div className="text-xs text-muted-foreground mt-1">
          Every target column has a confident mapping.
        </div>
      </div>
    );
  }

  const total = groups.reduce((a, g) => a + g.qs.length, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-ocbc-500" />
          <span className="font-display font-semibold">
            {total} open question{total === 1 ? "" : "s"} require human judgment
          </span>
        </div>
        <Badge variant="danger">Action required</Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {groups.flatMap((g, gi) =>
          g.qs.map((q, qi) => (
            <motion.div
              key={`${g.table}-${qi}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: (gi * 5 + qi) * 0.04 }}
              className="rounded-xl border border-ocbc-500/30 bg-ocbc-500/5 p-4 hover:border-ocbc-500/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-ocbc-500 font-bold">
                  {g.table}
                </span>
                <Badge variant="danger" className="text-[9px]">{`#${qi + 1}`}</Badge>
              </div>
              <div className="text-sm text-foreground leading-snug">{q}</div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
