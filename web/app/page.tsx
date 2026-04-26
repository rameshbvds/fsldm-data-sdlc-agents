"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  Database,
  FileQuestion,
  GitBranch,
  Layers,
  Lock,
  Scan,
  ShieldCheck,
  Sparkles,
  TestTube2,
  Users,
  Workflow,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/scroll-reveal";
import { CountUp } from "@/components/count-up";
import { GradientOrbs } from "@/components/gradient-orbs";
import { Marquee } from "@/components/marquee";
import { PipelineFlow } from "@/components/pipeline-flow";
import { StageDetail } from "@/components/stage-detail";
import { listRuns, type Run } from "@/lib/api";

const PIPELINE = [
  {
    Icon: Scan,
    num: "01",
    name: "Mapping Agent",
    sub: "Heuristic field-level lineage",
    desc: "Reads source ODS + target FSLDM schemas. Auto-resolves direct name matches with confidence scores. Flags ambiguous cases as open questions — never fabricates lineage.",
  },
  {
    Icon: Sparkles,
    num: "02",
    name: "HITL Review",
    sub: "Human approves every mapping",
    desc: "A required gate. Reviewer can approve, revise with feedback, or reject. The 18% of fields the heuristic flags get human attention; the 82% obvious ones are pre-filled.",
  },
  {
    Icon: Database,
    num: "03",
    name: "Development Agent",
    sub: "Templated SQL + dbt skeleton",
    desc: "Emits Teradata SQL plus dbt models with placeholder JOINs and TODOs where lineage is unresolved. Every emitted statement is sqlglot-validated before disk write.",
  },
  {
    Icon: TestTube2,
    num: "04",
    name: "Testing Agent",
    sub: "GX · Soda · BTEQ test stubs",
    desc: "Generates Great Expectations suites, Soda YAML checks, and BTEQ control-table SQL — templated from FSLDM column-name conventions (*_IND, *_AMT, *_DT, *_CD).",
  },
];

const FEATURES = [
  { Icon: ShieldCheck, title: "PII Guards", desc: "Source-flagged PII columns (PRTY_FULL_NM, DOB_DT…) are redacted in logs and blocked at write-time via PreTool hook." },
  { Icon: Lock, title: "sqlglot Validation", desc: "Every emitted SQL parses for the declared dialect or fails the build. No invalid SQL leaves the agent." },
  { Icon: Layers, title: "7 SQL Dialects", desc: "Single source schema → Teradata · Snowflake · Redshift · BigQuery · Databricks · Postgres · DuckDB templates." },
  { Icon: Workflow, title: "Audit Trail", desc: "Every run, decision, and reviewer comment persists in SQLite — searchable by run_id for compliance review." },
  { Icon: FileQuestion, title: "Honest Open Questions", desc: "Low-confidence mappings are flagged, not invented. Analysts get a focused review list, not a wall of guesses." },
  { Icon: Users, title: "HITL First", desc: "AI never ships unreviewed lineage. Every mapping goes through approve/revise/reject before SQL emit." },
];

const TECH = [
  "FSLDM", "Teradata", "Snowflake", "BigQuery", "Databricks", "Redshift", "Postgres",
  "dbt", "sqlglot", "LangGraph", "Claude", "Great Expectations", "Soda", "FastAPI",
  "Next.js 15", "Tailwind", "Framer Motion",
];

export default function DashboardPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  useEffect(() => {
    listRuns().then(setRuns).catch(() => setRuns([]));
  }, []);

  const total = runs.length;
  const approved = runs.filter((r) => r.hitl_decision === "approve").length;

  return (
    <>
      <GradientOrbs />

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

        <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-20 lg:pt-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-gold-400"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold" />
              </span>
              FSLDM Data SDLC Platform
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="mt-8 font-display text-5xl font-bold tracking-tight md:text-7xl lg:text-[5.5rem]"
            >
              <span className="text-gradient-gold">Skip the boilerplate.</span>
              <br />
              <span className="text-foreground">Focus on the hard 18%.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed"
            >
              An AI-assisted scaffolding tool for FSLDM data warehouse migration.
              Auto-resolves the obvious 80%+ of column mappings, flags the rest for human
              review, and emits dialect-correct SQL skeletons plus data-quality test stubs.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="mt-10 flex flex-col sm:flex-row items-center gap-3"
            >
              <Button asChild size="lg">
                <Link href="/pipeline" className="group">
                  <Sparkles className="h-4 w-4" />
                  Run a Pipeline
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/about">How it Works</Link>
              </Button>
            </motion.div>

            {/* Live metrics — verified, not aspirational */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full max-w-4xl">
              {[
                { value: total, suffix: "", label: "Runs in this tenant" },
                { value: approved, suffix: "", label: "Approved" },
                { value: 80, suffix: "", label: "Mapped fields per run" },
                { value: 7, suffix: "", label: "SQL dialects emitted" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.08 }}
                  whileHover={{ y: -4 }}
                  className="glass border-shimmer rounded-2xl p-5 text-center cursor-default"
                >
                  <div className="font-display font-mono text-3xl md:text-4xl font-bold text-gold-400">
                    <CountUp to={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="mt-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── WHAT THIS IS / ISN'T ──────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <ScrollReveal>
          <Badge variant="default" className="mb-4">Honest scope</Badge>
          <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight max-w-3xl">
            What this platform <br />
            <span className="text-gradient-gold">is — and isn&rsquo;t.</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl">
            Banks reward honest scope over hype. Here&rsquo;s the truth about what these agents
            do today.
          </p>
        </ScrollReveal>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5">
          <ScrollReveal delay={0.1}>
            <Card className="relative overflow-hidden border-emerald-500/20 h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent" />
              <CardContent className="relative pt-8">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-[10px] uppercase tracking-[0.15em] text-emerald-400 font-bold">
                    Today · What it does
                  </span>
                </div>
                <h3 className="font-display text-2xl font-bold">A scaffolding generator</h3>
                <ul className="mt-6 space-y-3 text-muted-foreground text-sm">
                  {[
                    "Auto-resolves direct column-name matches between source and target",
                    "Flags ambiguous mappings as open_question with confidence scores",
                    "Emits Teradata + dbt SQL skeletons (templated, sqlglot-validated)",
                    "Generates GX / Soda / BTEQ stubs from column-name conventions",
                    "Persists every run + reviewer decision to an audit trail",
                    "Saves analysts the boilerplate — about a week of work per fact table",
                  ].map((b) => (
                    <li key={b} className="flex gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      {b}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <Card className="relative overflow-hidden border-ocbc-500/20 h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-ocbc-500/5 via-transparent to-transparent" />
              <CardContent className="relative pt-8">
                <div className="flex items-center gap-2 mb-3">
                  <FileQuestion className="h-4 w-4 text-ocbc-500" />
                  <span className="text-[10px] uppercase tracking-[0.15em] text-ocbc-500 font-bold">
                    Today · What it doesn&rsquo;t
                  </span>
                </div>
                <h3 className="font-display text-2xl font-bold">A turnkey migration tool</h3>
                <ul className="mt-6 space-y-3 text-muted-foreground text-sm">
                  {[
                    "Generated SQL has placeholder JOINs — analyst must fill keys",
                    "Open questions are flagged, not solved — judgment stays human",
                    "Test stubs are templates, not domain-specific business rules",
                    "Doesn't run against a real warehouse — generation only",
                    "Doesn't replace data analysts — it gives them a head start",
                  ].map((b) => (
                    <li key={b} className="flex gap-2">
                      <span className="text-ocbc-500 mt-0.5 shrink-0">○</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>

        {/* Real metric strip */}
        <ScrollReveal delay={0.3}>
          <div className="mt-8 rounded-2xl border border-gold/30 bg-gradient-to-r from-gold/5 via-gold/10 to-gold/5 p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { v: 82, s: "%", l: "Auto-resolved", note: "direct name matches" },
              { v: 14, s: "", l: "Open Qs flagged", note: "per typical run" },
              { v: 0, s: "", l: "Hallucinated lineage", note: "heuristic-first design" },
              { v: 7, s: "", l: "SQL dialects", note: "single source schema" },
            ].map((s) => (
              <div key={s.l}>
                <div className="font-display text-4xl md:text-5xl font-bold text-gradient-gold">
                  <CountUp to={s.v} suffix={s.s} />
                </div>
                <div className="mt-2 text-xs uppercase tracking-wider text-foreground font-semibold">{s.l}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{s.note}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* ── PIPELINE ARCHITECTURE — animated flow ─────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <ScrollReveal>
          <Badge variant="default" className="mb-4">How it works</Badge>
          <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight max-w-3xl">
            Four agents. <br />
            <span className="text-gradient-gold">One audit trail.</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl">
            Watch the data flow: input schemas → agent pipeline → generated artifacts.
          </p>
        </ScrollReveal>

        <div className="mt-12">
          <PipelineFlow />
        </div>
      </section>

      {/* ── STAGE DEEP DIVES ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <ScrollReveal>
          <Badge variant="default" className="mb-4">Stage by stage</Badge>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight max-w-3xl">
            What each agent <span className="text-gradient-gold">actually does.</span>
          </h2>
        </ScrollReveal>

        <div className="mt-8 divide-y divide-border/40">
          <StageDetail
            num="01"
            Icon={Scan}
            name="Mapping Agent"
            tagline="Heuristic field-level lineage"
            accent="gold"
            inputs={[
              "schemas/deposit_source.json",
              "schemas/deposit_target.json",
              "13 source tables · 3 target facts",
            ]}
            process={[
              "Match column names by FSLDM suffix conventions",
              "Score confidence (0.95 direct → 0.4 unmapped)",
              "Flag *_IND derivations and ETL-audit columns",
              "Emit MappingSpec (Pydantic, audit-safe)",
            ]}
            outputs={[
              "MappingSpec JSON",
              "~80 field mappings per run",
              "~14 open questions auto-flagged",
            ]}
            sample={{
              label: "Example mapping",
              before: 'Target column: "DPOS_AGMT_ID" — DECIMAL(18,0) PK',
              after: '{ source_expr: "DPOS_AGMT.DPOS_AGMT_ID", confidence: 0.95, note: "direct" }',
            }}
          />
          <StageDetail
            num="02"
            Icon={Sparkles}
            name="HITL Review Gate"
            tagline="Human approves every mapping"
            accent="ocbc"
            reverse
            inputs={[
              "MappingSpec from Stage 01",
              "List of flagged open questions",
              "Reviewer identity (audit trail)",
            ]}
            process={[
              "Pause pipeline at LangGraph interrupt",
              "Render mapping table with confidence bars",
              "Capture approve / revise / reject + feedback",
              "Persist decision to runs.db",
            ]}
            outputs={[
              "hitl_decision: approve · revise · reject",
              "Reviewer feedback (free-text)",
              "Audit row with run_id + timestamp",
            ]}
            sample={{
              label: "Reviewer action",
              before: "FCT_DPOS_BAL.RGN_CD → confidence 0.20 (unmapped)",
              after: 'decision: "revise" — feedback: "Should join via BRCH.RGN_CD"',
            }}
          />
          <StageDetail
            num="03"
            Icon={Database}
            name="Development Agent"
            tagline="Templated SQL + dbt skeleton"
            accent="blue"
            inputs={[
              "Approved MappingSpec (from HITL)",
              "Target dialect (teradata / snowflake / …)",
              "FSLDM target schema metadata",
            ]}
            process={[
              "Render INSERT-SELECT per target table",
              "Stub LEFT JOINs with /* TODO join key */",
              "Emit dbt model with {{ source(...) }} refs",
              "Validate every statement via sqlglot",
            ]}
            outputs={[
              "sql_teradata/*.gen.sql",
              "sql_dbt_gen/*.sql",
              "schema.gen.yml",
            ]}
            sample={{
              label: "Generated Teradata SQL",
              before: "Target: FCT_DPOS_BAL (39 columns, 5 open Qs)",
              after: 'INSERT INTO EDW_FSLDM.FCT_DPOS_BAL SELECT DPOS_AGMT.DPOS_AGMT_ID, …',
            }}
          />
          <StageDetail
            num="04"
            Icon={TestTube2}
            name="Testing Agent"
            tagline="GX · Soda · BTEQ test stubs"
            accent="emerald"
            reverse
            inputs={[
              "Approved MappingSpec",
              "Generated SQL artifacts (from Stage 03)",
              "FSLDM column-name conventions",
            ]}
            process={[
              "Emit GX expectations from suffix rules",
              "*_IND → in_set {Y, N}",
              "*_AMT, *_DT, *_CD → not_null",
              "Generate Soda YAML + BTEQ control SQL",
            ]}
            outputs={[
              "gx/deposit_expectations.gen.json",
              "soda/deposit_checks.gen.yml",
              "sql_bteq/deposit_validate_all.gen.sql",
            ]}
            sample={{
              label: "Generated test stub",
              before: 'Column: "CASA_IND" — CHAR(1) NOT NULL',
              after: 'expect_column_values_to_be_in_set(column="CASA_IND", value_set=["Y","N"])',
            }}
          />
        </div>
      </section>

      {/* ── FEATURES GRID ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <ScrollReveal>
          <Badge variant="default" className="mb-4">Production-grade</Badge>
          <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight max-w-3xl">
            Built for <span className="text-gradient-gold">tier-1 banks.</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl">
            Every guardrail you&rsquo;d want in a regulated environment, wired in by default.
          </p>
        </ScrollReveal>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => {
            const Icon = f.Icon;
            return (
              <ScrollReveal key={f.title} delay={i * 0.06}>
                <Card className="group h-full hover:border-gold/30 transition-all">
                  <CardContent className="pt-6">
                    <div className="h-10 w-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold-400 mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-lg font-bold tracking-tight">{f.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* ── TECH MARQUEE ───────────────────────────────────────────────── */}
      <ScrollReveal>
        <section className="border-y border-border/40 bg-card/40 py-2">
          <Marquee items={TECH} speed={40} />
        </section>
      </ScrollReveal>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <ScrollReveal>
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/15 via-transparent to-emerald-500/5" />
            <div className="absolute inset-0 grid-pattern opacity-30" />
            <CardContent className="relative py-16 text-center">
              <Banknote className="h-10 w-10 text-gold-400 mx-auto mb-6" />
              <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
                See it in action.
              </h2>
              <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
                Run a pipeline now on the bundled FSLDM deposit schema. No setup needed.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button asChild size="lg">
                  <Link href="/pipeline">Run Pipeline →</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/about">View Architecture</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </section>
    </>
  );
}
