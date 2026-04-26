"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Award,
  Briefcase,
  Database,
  ExternalLink,
  GitBranch,
  Linkedin,
  Mail,
  Quote,
  ShieldCheck,
  Sparkles,
  Target,
  Workflow,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/scroll-reveal";
import { CountUp } from "@/components/count-up";
import { Marquee } from "@/components/marquee";
import { GradientOrbs } from "@/components/gradient-orbs";

const TIMELINE = [
  { year: "Dec 2008 – Dec 2011", title: "System Engineer", company: "Tata Consultancy Services" },
  { year: "Dec 2011 – Nov 2014", title: "Operational Analyst", company: "Oracle India Pvt Ltd · Bangalore" },
  { year: "Nov 2014 – Jan 2021", title: "Sr Software Specialist", company: "Dell International Services · Singapore" },
  { year: "Jan 2021 – Present", title: "Assistant Vice President", company: "OCBC Bank · Singapore" },
];

const SKILLS = [
  { Icon: Database, label: "Teradata · FSLDM" },
  { Icon: Workflow, label: "Informatica PowerCenter" },
  { Icon: Database, label: "Oracle · PL/SQL" },
  { Icon: GitBranch, label: "ETL Mapping & Lineage" },
  { Icon: Zap, label: "BTEQ · FASTLOAD · MULTILOAD" },
  { Icon: Sparkles, label: "Hadoop · Hive · Spark" },
  { Icon: ShieldCheck, label: "Banking Compliance" },
  { Icon: Target, label: "Shell · Batch · Python" },
];

const TECH_LIST = [
  "Teradata", "FSLDM", "Informatica", "Oracle", "PL/SQL", "BTEQ",
  "FASTLOAD", "MULTILOAD", "Control-M", "Hadoop", "Hive", "Spark",
  "WebServices", "Shell", "Python",
];

const CERTS = ["Teradata 12 Basic", "Informatica 9.x Developer Specialist Certified"];

export default function BuiltByRameshPage() {
  return (
    <>
      <GradientOrbs />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6 pt-16 pb-12">
          <ScrollReveal>
            <Link href="/about" className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-gold-400 transition-colors mb-6">
              ← Back to About
            </Link>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-center">
            <ScrollReveal className="lg:col-span-1">
              <div className="relative aspect-square max-w-sm rounded-3xl bg-gold-gradient p-1 shadow-[0_30px_80px_-20px_rgba(201,169,97,0.4)]">
                <div className="h-full w-full rounded-3xl bg-card flex items-center justify-center">
                  <span className="font-display text-9xl font-bold text-gradient-gold">RV</span>
                </div>
                <div className="absolute -bottom-3 -right-3 px-4 py-2 rounded-full bg-card border border-gold/30 shadow-lg">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-gold-400">Architect</span>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1} className="lg:col-span-2">
              <Badge variant="default" className="mb-4">Architect</Badge>
              <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight">
                Ramesh V
              </h1>
              <p className="mt-3 text-2xl text-gradient-gold font-medium">
                Assistant Vice President · OCBC Bank
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Singapore</p>
              <p className="mt-6 text-muted-foreground text-lg leading-relaxed max-w-2xl">
                Senior Software Analyst with deep experience in banking data warehousing.
                Specialist in <span className="text-foreground font-medium">FSLDM (Teradata)</span>,
                Informatica PowerCenter, Oracle PL/SQL, and end-to-end ETL design — the discipline
                behind the platform you&rsquo;re using.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <a href="https://www.linkedin.com/in/ramesh-v-361baa80/" target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-4 w-4" /> View LinkedIn <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href="mailto:rameshbvds@gmail.com">
                    <Mail className="h-4 w-4" /> rameshbvds@gmail.com
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/contact">Get in Touch</Link>
                </Button>
              </div>
            </ScrollReveal>
          </div>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { v: 17, s: "+", l: "Years in IT / Data" },
              { v: 5, s: "+", l: "Years at OCBC" },
              { v: 4, s: "", l: "Companies" },
              { v: 2, s: "", l: "Certifications" },
            ].map((s, i) => (
              <ScrollReveal key={s.l} delay={i * 0.06}>
                <div className="glass border-shimmer rounded-2xl p-6 text-center">
                  <div className="font-display text-5xl font-bold text-gradient-gold">
                    <CountUp to={s.v} suffix={s.s} />
                  </div>
                  <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {s.l}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <ScrollReveal>
          <Card className="relative overflow-hidden border-gold/20">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-blue-500/5" />
            <CardContent className="relative py-14 px-8 md:px-14 text-center max-w-4xl mx-auto">
              <Quote className="h-10 w-10 text-gold-400/30 mb-6 mx-auto" />
              <blockquote className="font-display text-2xl md:text-3xl tracking-tight leading-tight text-foreground/90 italic">
                &ldquo;The bottleneck in DWH migration was never SQL. It was the cost of getting
                lineage right, repeatedly, across thousands of columns. AI doesn&rsquo;t replace
                that judgment — <span className="text-gradient-gold not-italic font-bold">it amplifies it.</span>&rdquo;
              </blockquote>
              <div className="mt-6 text-sm text-muted-foreground">
                — Ramesh V, on the philosophy behind FSLDM SDLC
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </section>

      {/* Skills */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <ScrollReveal>
          <Badge variant="default" className="mb-4">Domain Expertise</Badge>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
            Core Skills
          </h2>
        </ScrollReveal>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {SKILLS.map((s, i) => {
            const Icon = s.Icon;
            return (
              <ScrollReveal key={s.label} delay={i * 0.04}>
                <div className="rounded-xl border border-border bg-card p-5 hover:border-gold/30 transition-all group h-full">
                  <div className="h-9 w-9 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold-400 group-hover:scale-110 transition-transform mb-3">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-sm">{s.label}</span>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* Career timeline */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <ScrollReveal>
          <Badge variant="default" className="mb-4">Trajectory</Badge>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
            Career
          </h2>
        </ScrollReveal>

        <div className="mt-12 relative">
          <div className="absolute left-3 top-0 bottom-0 w-px bg-gradient-to-b from-gold/40 via-gold/20 to-transparent" />
          <div className="space-y-6">
            {TIMELINE.map((t, i) => (
              <ScrollReveal key={t.year} delay={i * 0.08}>
                <div className="flex gap-6 pl-12 relative">
                  <div className="absolute left-0 top-3 h-3.5 w-3.5 rounded-full bg-gold-gradient ring-4 ring-background" />
                  <Card className="hover:border-gold/30 transition-colors flex-1">
                    <CardContent className="pt-5">
                      <Badge variant="default" className="mb-2">{t.year}</Badge>
                      <h3 className="font-display text-xl font-bold tracking-tight">{t.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5 text-gold-400" />
                        {t.company}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <ScrollReveal>
          <Badge variant="default" className="mb-4">Credentials</Badge>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
            Certifications &amp; Education
          </h2>
        </ScrollReveal>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          {CERTS.map((c, i) => (
            <ScrollReveal key={c} delay={i * 0.06}>
              <Card>
                <CardContent className="pt-6">
                  <Award className="h-6 w-6 text-gold-400 mb-3" />
                  <div className="font-semibold">{c}</div>
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
          <ScrollReveal delay={0.18}>
            <Card>
              <CardContent className="pt-6">
                <Sparkles className="h-6 w-6 text-gold-400 mb-3" />
                <div className="font-semibold">VIGNAN VIDYALAM</div>
                <div className="text-xs text-muted-foreground mt-1">Engineering</div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </section>

      {/* Tech marquee */}
      <ScrollReveal>
        <section className="border-y border-border/40 bg-card/40 py-2">
          <Marquee items={TECH_LIST} speed={45} />
        </section>
      </ScrollReveal>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <ScrollReveal>
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/15 via-transparent to-emerald-500/5" />
            <div className="absolute inset-0 grid-pattern opacity-30" />
            <CardContent className="relative py-16 text-center">
              <Award className="h-10 w-10 text-gold-400 mx-auto mb-6" />
              <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
                Want to learn more?
              </h2>
              <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
                Reach out via LinkedIn or email to discuss the platform.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button asChild size="lg">
                  <Link href="/contact">Get in Touch →</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/pipeline">Try the Platform</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </section>
    </>
  );
}
