"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Download, Loader2, Sparkles, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StageTimeline } from "@/components/stage-timeline";
import { StatCard } from "@/components/stat-card";
import {
  artifactUrl,
  createRun,
  submitHitl,
  type Artifact,
  type MappingSpec,
  type TestReport,
} from "@/lib/api";
import { formatBytes, formatNumber } from "@/lib/utils";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

const DIALECTS = ["teradata", "snowflake", "redshift", "bigquery", "databricks", "postgres", "duckdb"];

export default function PipelinePage() {
  const [dialect, setDialect] = useState("teradata");
  const [runId, setRunId] = useState<string | null>(null);
  const [spec, setSpec] = useState<MappingSpec | null>(null);
  const [busy, setBusy] = useState(false);
  const [decision, setDecision] = useState("approve");
  const [feedback, setFeedback] = useState("");
  const [artifacts, setArtifacts] = useState<Artifact[] | null>(null);
  const [testReport, setTestReport] = useState<TestReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stage = !runId ? 0 : !artifacts ? 1 : 3;
  const done = !runId ? -1 : !artifacts ? 0 : 3;

  async function runMapping() {
    setBusy(true);
    setError(null);
    setArtifacts(null);
    setTestReport(null);
    try {
      const res = await createRun(dialect);
      setRunId(res.run_id);
      setSpec(res.mapping);
    } catch (e: any) {
      setError(e?.message || "failed");
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    if (!runId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await submitHitl(runId, decision, feedback);
      if (res.status === "complete") {
        setArtifacts(res.artifacts);
        setTestReport(res.test_report);
      }
    } catch (e: any) {
      setError(e?.message || "failed");
    } finally {
      setBusy(false);
    }
  }

  // Aggregates
  const allFms = spec?.target_tables.flatMap((t) => t.field_mappings) ?? [];
  const nFields = allFms.length;
  const nHigh = allFms.filter((f) => f.confidence >= 0.85).length;
  const nMid = allFms.filter((f) => f.confidence >= 0.5 && f.confidence < 0.85).length;
  const nLow = allFms.filter((f) => f.confidence < 0.5).length;
  const avgConf = nFields ? allFms.reduce((a, f) => a + f.confidence, 0) / nFields : 0;
  const nOpen = spec?.target_tables.reduce((a, t) => a + t.open_questions.length, 0) ?? 0;

  const tableCoverage = spec?.target_tables.map((t) => ({
    table: t.target_table,
    fields: t.field_mappings.length,
    open: t.open_questions.length,
  })) ?? [];

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Badge variant="default" className="mb-4">New Run</Badge>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
          Generate FSLDM artifacts
        </h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          Pick a target dialect, run mapping, review field-level lineage, and approve to emit
          production SQL plus data-quality test suites.
        </p>
      </motion.div>

      <StageTimeline activeIdx={stage} doneIdx={done} />

      {/* Run controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-end gap-4">
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Target dialect
              </label>
              <div className="flex flex-wrap gap-2">
                {DIALECTS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDialect(d)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium capitalize transition-all ${
                      dialect === d
                        ? "border-gold/40 bg-gold/10 text-gold-400"
                        : "border-border bg-card hover:border-gold/20 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={runMapping} disabled={busy} size="lg">
              {busy && stage === 0 ? <><Loader2 className="h-4 w-4 animate-spin" /> Running…</> : <><Sparkles className="h-4 w-4" /> Run Mapping</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm text-red-400 flex items-center gap-2">
          <XCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {/* Mapping result */}
      {spec && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-2xl font-bold">Mapping Overview</h2>
                <p className="text-sm text-muted-foreground font-mono">
                  {spec.mapping_id} · run <span className="text-gold-400">{runId}</span>
                </p>
              </div>
              <Badge variant="default">{spec.dialect}</Badge>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Mappings" value={nFields} delta={`${spec.target_tables.length} target tables`} accent="gold" />
              <StatCard label="High Confidence" value={nHigh} delta={`${((nHigh / Math.max(nFields, 1)) * 100).toFixed(0)}%`} accent="emerald" />
              <StatCard label="Open Questions" value={nOpen} delta="flagged for review" accent="rose" />
              <StatCard label="Avg Confidence" value={avgConf.toFixed(2)} accent="blue" />
            </div>
          </div>

          {/* Confidence breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Per-Table Coverage</CardTitle>
                <CardDescription>Mapped fields vs. open questions per target table</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tableCoverage} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
                      <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="table" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="fields" name="Mapped fields" fill="#c9a961" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="open" name="Open questions" fill="#EF4444" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Confidence Tiers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "High (≥ 0.85)", count: nHigh, color: "bg-emerald-500", textColor: "text-emerald-400" },
                  { label: "Mid (0.5–0.85)", count: nMid, color: "bg-amber-500", textColor: "text-amber-400" },
                  { label: "Low (< 0.5)", count: nLow, color: "bg-red-500", textColor: "text-red-400" },
                ].map((t) => (
                  <div key={t.label}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-muted-foreground">{t.label}</span>
                      <span className={`font-mono font-semibold ${t.textColor}`}>{t.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(t.count / Math.max(nFields, 1)) * 100}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`h-full ${t.color}`}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Per-table detail */}
          <div className="space-y-4">
            <h3 className="font-display text-xl font-bold tracking-tight">Field-Level Lineage</h3>
            {spec.target_tables.map((t) => (
              <details key={t.target_table} className="group rounded-2xl border border-border bg-card overflow-hidden">
                <summary className="cursor-pointer list-none p-5 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div>
                    <div className="font-mono font-semibold tracking-tight">{t.target_table}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{t.grain_description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="success">{t.field_mappings.filter((f) => f.confidence >= 0.85).length} high</Badge>
                    <Badge variant="warning">{t.field_mappings.filter((f) => f.confidence >= 0.5 && f.confidence < 0.85).length} mid</Badge>
                    <Badge variant="danger">{t.field_mappings.filter((f) => f.confidence < 0.5).length} low</Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-open:rotate-90 transition-transform" />
                  </div>
                </summary>
                <div className="border-t border-border overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/30">
                      <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                        <th className="px-5 py-3 font-medium">Target column</th>
                        <th className="px-5 py-3 font-medium">Source expression</th>
                        <th className="px-5 py-3 font-medium">Confidence</th>
                        <th className="px-5 py-3 font-medium">Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {t.field_mappings.map((fm) => (
                        <tr key={fm.target_column} className="border-t border-border/50 hover:bg-muted/20">
                          <td className="px-5 py-3 font-mono text-xs">{fm.target_column}</td>
                          <td className="px-5 py-3 font-mono text-xs text-muted-foreground max-w-md truncate">{fm.source_expr}</td>
                          <td className="px-5 py-3 w-48">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                                <div
                                  className={`h-full ${fm.confidence >= 0.85 ? "bg-emerald-500" : fm.confidence >= 0.5 ? "bg-amber-500" : "bg-red-500"}`}
                                  style={{ width: `${fm.confidence * 100}%` }}
                                />
                              </div>
                              <span className="font-mono text-xs">{fm.confidence.toFixed(2)}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-xs text-muted-foreground">{fm.transform_note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            ))}
          </div>

          {/* HITL */}
          {!artifacts && (
            <Card>
              <CardHeader>
                <CardTitle>Human-in-the-Loop Review</CardTitle>
                <CardDescription>
                  Approve to emit production artifacts, or revise/reject with feedback for the audit trail.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  {["approve", "revise", "reject"].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDecision(d)}
                      className={`flex-1 rounded-lg border px-4 py-3 font-medium capitalize transition-all ${
                        decision === d
                          ? d === "approve"
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                            : d === "revise"
                            ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                            : "border-red-500/40 bg-red-500/10 text-red-400"
                          : "border-border bg-card hover:border-foreground/20 text-muted-foreground"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Reviewer feedback (required if revise/reject). Be specific — name table.column and the correct lineage."
                  rows={4}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm font-mono placeholder:text-muted-foreground/50 focus:border-gold/40 focus:outline-none focus:ring-2 focus:ring-gold/20 resize-none"
                />
                <Button onClick={submit} disabled={busy} size="lg" className="w-full md:w-auto">
                  {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : <>Submit Decision <ArrowRight className="h-4 w-4" /></>}
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}

      {/* Artifacts + tests */}
      {artifacts && testReport && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <div className="font-semibold">Pipeline complete</div>
              <div className="text-sm text-muted-foreground">
                {artifacts.length} artifacts emitted · {testReport.total} expectations · {testReport.bteq_statements} BTEQ checks
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="GX Expectations" value={testReport.total} accent="emerald" />
            <StatCard label="Soda Checks" value={testReport.soda_checks} accent="blue" />
            <StatCard label="BTEQ Statements" value={testReport.bteq_statements} accent="gold" />
            <StatCard label="Artifacts" value={artifacts.length} accent="rose" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Generated Artifacts</CardTitle>
              <CardDescription>Production-ready SQL, dbt models, and test suites</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {artifacts.map((a) => (
                <a
                  key={a.path}
                  href={artifactUrl(a.path)}
                  download
                  className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 hover:border-gold/30 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-gold/10 flex items-center justify-center text-gold-400 font-mono text-[10px] uppercase shrink-0">
                      {a.kind}
                    </div>
                    <div className="min-w-0">
                      <div className="font-mono text-sm truncate">{a.path}</div>
                      <div className="text-xs text-muted-foreground">
                        {a.target_table || "—"} · {formatBytes(a.bytes_written)}
                      </div>
                    </div>
                  </div>
                  <Download className="h-4 w-4 text-muted-foreground group-hover:text-gold-400 transition-colors shrink-0 ml-3" />
                </a>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
