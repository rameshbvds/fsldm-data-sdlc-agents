"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Activity, BarChart3, History, Info, Mail, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Dashboard", icon: BarChart3 },
  { href: "/pipeline", label: "Run Pipeline", icon: Activity },
  { href: "/history", label: "History", icon: History },
  { href: "/about", label: "About", icon: Info },
  { href: "/contact", label: "Contact", icon: Mail },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 backdrop-blur-xl bg-background/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative h-8 w-8 rounded-lg bg-gold-gradient flex items-center justify-center shadow-[0_0_20px_rgba(201,169,97,0.4)]">
            <Sparkles className="h-4 w-4 text-navy-950" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-base font-bold tracking-tight">
              FSLDM<span className="text-gold mx-1">AI</span>SDLC
            </div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              AI Data Pipeline Console
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-0.5">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active ? "text-gold-400" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">{link.label}</span>
                {active && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-lg bg-gold/10 border border-gold/20 -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-medium text-emerald-400 tracking-wide">Live</span>
          </div>
          <div className="font-mono text-[10px] text-muted-foreground">v0.1.0</div>
        </div>
      </div>
    </header>
  );
}
