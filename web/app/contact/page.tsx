"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Linkedin, Mail, MapPin, Send, Sparkles, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/scroll-reveal";
import { GradientOrbs } from "@/components/gradient-orbs";

const TOPICS = [
  { id: "demo", label: "Schedule a demo" },
  { id: "uat", label: "Join UAT pilot" },
  { id: "consult", label: "Consulting / Engagement" },
  { id: "general", label: "General inquiry" },
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [org, setOrg] = useState("");
  const [topic, setTopic] = useState("demo");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<{ id: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, org, topic, message }),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.detail || "Failed to send");
      }
      setSent(await r.json());
      setName(""); setEmail(""); setOrg(""); setMessage("");
    } catch (err: any) {
      setError(err.message || "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <GradientOrbs />
      <div className="mx-auto max-w-7xl px-6 py-20">
        <ScrollReveal>
          <Badge variant="default" className="mb-4">Contact</Badge>
          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight">
            <span className="text-gradient-gold">Let&rsquo;s talk.</span>
          </h1>
          <p className="mt-6 text-muted-foreground text-lg max-w-2xl">
            Schedule a private demo, join the UAT pilot, or discuss a custom FSLDM migration
            for your bank. We respond within one business day.
          </p>
        </ScrollReveal>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact info card */}
          <ScrollReveal delay={0.1} className="lg:col-span-1">
            <Card className="h-full overflow-hidden">
              <div className="relative h-32 bg-gold-gradient">
                <div className="absolute inset-0 grid-pattern opacity-20" />
              </div>
              <CardContent className="-mt-16 relative">
                <div className="h-32 w-32 rounded-2xl bg-card border-4 border-card flex items-center justify-center mb-4 shadow-2xl">
                  <span className="font-display text-5xl font-bold text-gradient-gold">RV</span>
                </div>
                <h3 className="font-display text-2xl font-bold tracking-tight">Ramesh V</h3>
                <p className="text-gold-400 text-sm font-medium mt-1">
                  Senior Data Engineering Architect
                </p>

                <div className="mt-6 space-y-3 text-sm">
                  <a
                    href="https://www.linkedin.com/in/ramesh-v-361baa80/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-muted-foreground hover:text-gold-400 transition-colors group"
                  >
                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center group-hover:bg-gold/10 transition-colors">
                      <Linkedin className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">LinkedIn</div>
                      <div className="font-medium">linkedin.com/in/ramesh-v</div>
                    </div>
                  </a>
                  <a
                    href="mailto:contact@example.com"
                    className="flex items-center gap-3 text-muted-foreground hover:text-gold-400 transition-colors group"
                  >
                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center group-hover:bg-gold/10 transition-colors">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">Email</div>
                      <div className="font-medium">contact@example.com</div>
                    </div>
                  </a>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">Location</div>
                      <div className="font-medium">Global · Remote</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center gap-2 text-xs text-emerald-400">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    Currently accepting new engagements
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Form */}
          <ScrollReveal delay={0.2} className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-gold-400" />
                  Send a message
                </CardTitle>
                <CardDescription>
                  Tell us a little about your bank and what you&rsquo;re trying to migrate.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sent ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center"
                  >
                    <div className="h-14 w-14 mx-auto rounded-full bg-emerald-500/15 flex items-center justify-center mb-4">
                      <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                    </div>
                    <h3 className="font-display text-2xl font-bold">Message received</h3>
                    <p className="mt-2 text-muted-foreground">
                      We&rsquo;ll get back to you within one business day.
                    </p>
                    <p className="mt-4 font-mono text-xs text-muted-foreground">
                      Reference: <span className="text-gold-400">{sent.id}</span>
                    </p>
                    <Button
                      onClick={() => setSent(null)}
                      variant="outline"
                      size="sm"
                      className="mt-6"
                    >
                      Send another message
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={submit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                          Full Name
                        </label>
                        <input
                          required value={name} onChange={(e) => setName(e.target.value)}
                          placeholder="Jane Doe"
                          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-gold/40 focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                          Work Email
                        </label>
                        <input
                          required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                          placeholder="jane@bank.com"
                          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-gold/40 focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        Organisation
                      </label>
                      <input
                        value={org} onChange={(e) => setOrg(e.target.value)}
                        placeholder="ACME Bank"
                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-gold/40 focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        Topic
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {TOPICS.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setTopic(t.id)}
                            className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                              topic === t.id
                                ? "border-gold/40 bg-gold/10 text-gold-400"
                                : "border-border bg-card hover:border-foreground/20 text-muted-foreground"
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        Message
                      </label>
                      <textarea
                        required value={message} onChange={(e) => setMessage(e.target.value)}
                        rows={6}
                        placeholder="What's the migration challenge you're solving? Source system, target warehouse, timeline…"
                        className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:border-gold/40 focus:outline-none focus:ring-2 focus:ring-gold/20 resize-none transition-all"
                      />
                    </div>

                    {error && (
                      <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 flex items-center gap-2">
                        <XCircle className="h-4 w-4" /> {error}
                      </div>
                    )}

                    <Button type="submit" disabled={busy} size="lg">
                      {busy ? "Sending…" : <>Send Message <Send className="h-4 w-4" /></>}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      We never share your details. Messages persist on our private server only.
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </div>
    </>
  );
}
