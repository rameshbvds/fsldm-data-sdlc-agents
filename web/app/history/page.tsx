"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listRuns, type Run } from "@/lib/api";

export default function HistoryPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    listRuns().then(setRuns);
  }, []);

  const filtered = runs.filter(
    (r) =>
      !filter ||
      r.run_id.includes(filter) ||
      r.dialect.includes(filter) ||
      (r.user_email || "").includes(filter)
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Badge variant="default" className="mb-4">Audit Trail</Badge>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">Run History</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          Every pipeline execution is persisted with reviewer decision and feedback. Use the audit
          trail for compliance reviews and incident postmortems.
        </p>
      </motion.div>

      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter by run ID, dialect, or user…"
        className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:border-gold/40 focus:outline-none focus:ring-2 focus:ring-gold/20"
      />

      <Card>
        <CardHeader>
          <CardTitle>{filtered.length} runs</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No runs match the filter.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 font-medium">Created</th>
                  <th className="pb-3 font-medium">User</th>
                  <th className="pb-3 font-medium">Dialect</th>
                  <th className="pb-3 font-medium">Stage</th>
                  <th className="pb-3 font-medium">Decision</th>
                  <th className="pb-3 font-medium">Run ID</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.run_id} className="border-t border-border/50 hover:bg-muted/20">
                    <td className="py-3 font-mono text-xs">{(r.created_at || "").slice(0, 19).replace("T", " ")}</td>
                    <td className="py-3">{r.user_email || "—"}</td>
                    <td className="py-3"><Badge variant="muted">{r.dialect}</Badge></td>
                    <td className="py-3">{r.stage}</td>
                    <td className="py-3">
                      {r.hitl_decision === "approve" && <Badge variant="success">Approved</Badge>}
                      {r.hitl_decision === "revise" && <Badge variant="warning">Revise</Badge>}
                      {r.hitl_decision === "reject" && <Badge variant="danger">Reject</Badge>}
                      {!r.hitl_decision && <Badge variant="muted">Pending</Badge>}
                    </td>
                    <td className="py-3 font-mono text-xs text-muted-foreground">{r.run_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
