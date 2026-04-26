"use client";
import Link from "next/link";
import {
  Award,
  Briefcase,
  Database,
  Globe2,
  Linkedin,
  Mail,
  MapPin,
  Quote,
  Scan,
  Sparkles,
  TestTube2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/scroll-reveal";
import { CountUp } from "@/components/count-up";
import { Marquee } from "@/components/marquee";
import { GradientOrbs } from "@/components/gradient-orbs";
import { PipelineFlow } from "@/components/pipeline-flow";
import { StageDetail } from "@/components/stage-detail";
import { OcbcInline } from "@/components/ocbc-mark";

const DIALECTS = [
  { name: "Teradata", status: "Production", note: "Current DWH" },
  { name: "Snowflake", status: "Ready", note: "AWS migration" },
  { name: "Redshift", status: "Ready", note: "AWS alternative" },
  { name: "BigQuery", status: "Ready", note: "GCP" },
  { name: "Databricks", status: "Ready", note: "Lakehouse" },
  { name: "Postgres", status: "Ready", note: "OSS baseline" },
  { name: "DuckDB", status: "Ready", note: "Local testing" },
];

const TECH_STACK = [
  "FSLDM", "Teradata", "Informatica", "Oracle", "PL/SQL", "BTEQ",
  "Snowflake", "BigQuery", "Databricks", "dbt", "sqlglot",
  "LangGraph", "Claude Opus", "FastAPI", "Next.js 15", "Tailwind",
];

export default function AboutPage() {
  return (
    <>
      <GradientOrbs />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-12">
          <ScrollReveal>
            <Badge variant="default" className="mb-6">Platform Overview</Badge>
            <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight max-w-4xl">
              <span className="text-gradient-gold">Built by a banker.</span>
              <br />
              <span className="text-foreground">Designed for</span>{" "}
              <span className="text-gradient-gold">tier-1 banks.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-3xl leading-relaxed">
              An AI-assisted scaffolding tool for FSLDM data warehouse migration. Auto-resolves
              ~80% of column mappings, flags the rest for human review, and emits dialect-correct
              SQL skeletons plus data-quality test stubs.
            </p>
          </ScrollReveal>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: 80, suffix: "+", label: "Field mappings / run" },
              { value: 7, suffix: "", label: "Warehouse dialects" },
              { value: 14, suffix: "", label: "Open Qs auto-flagged" },
              { value: 0, suffix: "", label: "Hallucinated lineage" },
            ].map((s, i) => (
              <ScrollReveal key={s.label} delay={i * 0.08}>
                <div className="glass border-shimmer rounded-2xl p-6 text-center">
                  <div className="font-display text-4xl md:text-5xl font-bold text-gradient-gold">
                    <CountUp to={s.value} suffix={s.suffix} />
                  </div>
                  <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {s.label}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PIPELINE FLOW DIAGRAM ──────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <ScrollReveal>
          <Badge variant="default" className="mb-4">Architecture</Badge>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            The data flow.
          </h2>
          <p className="mt-3 text-muted-foreground text-lg max-w-2xl">
            Inputs · agent pipeline · generated artifacts. Watch the path from FSLDM source
            schema all the way to deployable SQL and tests.
          </p>
        </ScrollReveal>

        <div className="mt-10">
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

      {/* ── BUILT BY: RAMESH V ────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <ScrollReveal>
          <Badge variant="default" className="mb-4">Built by</Badge>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">Ramesh V</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mt-2">
            Assistant Vice President at OCBC Bank, Singapore. Architect of the FSLDM SDLC platform.
          </p>
        </ScrollReveal>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ScrollReveal delay={0.1}>
            <Card className="lg:col-span-1 overflow-hidden">
              <div className="relative h-32 bg-gold-gradient">
                <div className="absolute inset-0 grid-pattern opacity-20" />
              </div>
              <CardContent className="-mt-16 relative">
                <div className="h-32 w-32 rounded-2xl bg-card border-4 border-card flex items-center justify-center mb-4 shadow-2xl">
                  <span className="font-display text-5xl font-bold text-gradient-gold">RV</span>
                </div>
                <h3 className="font-display text-2xl font-bold tracking-tight">Ramesh V</h3>
                <p className="text-gold-400 text-sm font-medium mt-1">
                  Assistant Vice President
                </p>
                <div className="mt-2">
                  <OcbcInline className="text-sm" />
                </div>
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-3.5 w-3.5 text-gold-400" />
                    <span>OCBC Bank · 5+ years</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-gold-400" />
                    <span>Singapore</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe2 className="h-3.5 w-3.5 text-gold-400" />
                    <span>FSLDM · Teradata · Informatica · Oracle</span>
                  </div>
                </div>
                <div className="mt-5 flex gap-2">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <a href="https://www.linkedin.com/in/ramesh-v-361baa80/" target="_blank" rel="noopener noreferrer">
                      <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <a href="mailto:rameshbvds@gmail.com">
                      <Mail className="h-3.5 w-3.5" /> Email
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={0.2} className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Quote className="h-5 w-5 text-gold-400" />
                  Architect&rsquo;s Statement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Senior Software Analyst with deep experience in banking data warehousing.
                  Specialist in <span className="text-foreground font-medium">FSLDM (Teradata)</span>,
                  Informatica PowerCenter, Oracle PL/SQL, and end-to-end ETL design — the
                  discipline this platform encodes.
                </p>
                <p>
                  Career progression: Tata Consultancy Services (2008–2011) → Oracle India
                  (2011–2014) → Dell International Services (2014–2021) → currently AVP at OCBC
                  Bank Singapore (2021–present).
                </p>
                <blockquote className="border-l-2 border-gold pl-4 italic text-foreground/90">
                  &ldquo;The bottleneck in DWH migration was never SQL. It was the cost of
                  getting lineage right, repeatedly, across thousands of columns. AI doesn&rsquo;t
                  replace that judgment — it amplifies it.&rdquo;
                </blockquote>
                <p className="text-xs text-muted-foreground/70 italic">
                  Certifications: Teradata 12 Basic · Informatica 9.x Developer Specialist.
                  See full profile on{" "}
                  <a href="https://www.linkedin.com/in/ramesh-v-361baa80/" className="text-gold-400 hover:underline" target="_blank" rel="noopener noreferrer">
                    LinkedIn
                  </a>
                  .
                </p>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </section>

      {/* ── TECH MARQUEE ───────────────────────────────────────────────── */}
      <ScrollReveal>
        <section className="border-y border-border/40 bg-card/40 py-2">
          <Marquee items={TECH_STACK} />
        </section>
      </ScrollReveal>

      {/* ── DIALECTS ───────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <ScrollReveal>
          <Badge variant="default" className="mb-4">Portability</Badge>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            Seven dialects, one source of truth
          </h2>
          <p className="mt-3 text-muted-foreground text-lg max-w-2xl">
            Author your mapping once. Emit Teradata for the current DWH and dbt-flavoured SQL
            for whichever cloud target you migrate to next.
          </p>
        </ScrollReveal>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {DIALECTS.map((d, i) => (
            <ScrollReveal key={d.name} delay={i * 0.04}>
              <div className="rounded-xl border border-border bg-card p-5 flex items-center justify-between hover:border-gold/30 hover:-translate-y-0.5 transition-all">
                <div>
                  <div className="font-display font-semibold text-lg">{d.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{d.note}</div>
                </div>
                {d.status === "Production" ? (
                  <Badge variant="success">{d.status}</Badge>
                ) : (
                  <Badge variant="muted">{d.status}</Badge>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <ScrollReveal>
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/15 via-transparent to-emerald-500/5" />
            <div className="absolute inset-0 grid-pattern opacity-30" />
            <CardContent className="relative py-16 text-center">
              <Award className="h-10 w-10 text-gold-400 mx-auto mb-6" />
              <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
                See it in action.
              </h2>
              <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
                Run a pipeline now on the bundled FSLDM deposit schema.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button asChild size="lg">
                  <Link href="/pipeline">Run Pipeline →</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/contact">Get in Touch</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </section>
    </>
  );
}
