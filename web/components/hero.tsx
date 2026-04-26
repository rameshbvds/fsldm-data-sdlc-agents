"use client";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CountUp } from "@/components/count-up";
import { GradientOrbs } from "@/components/gradient-orbs";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <GradientOrbs />
      <div className="absolute inset-0 grid-pattern opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

      <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-24 lg:pt-28 lg:pb-32">
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
            FSLDM Data Pipeline · Live
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-8 font-display text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl"
          >
            <span className="text-gradient-gold">Two weeks.</span>
            <br />
            <span className="text-foreground">Thirty seconds.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed"
          >
            AI-orchestrated data warehouse migration for Tier-1 banks. Field-level FSLDM lineage,
            dialect-correct SQL, and audit-grade test suites — generated in minutes, approved by
            humans.
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
                Run Pipeline
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/about">View Architecture</Link>
            </Button>
          </motion.div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full max-w-4xl">
            {[
              { value: 13, suffix: "", label: "Source tables" },
              { value: 3, suffix: "", label: "Target facts" },
              { value: 7, suffix: "", label: "Dialects" },
              { value: 80, suffix: "+", label: "Fields / run" },
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
  );
}
