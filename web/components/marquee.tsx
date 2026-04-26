"use client";
import { motion } from "framer-motion";

export function Marquee({ items, speed = 30 }: { items: string[]; speed?: number }) {
  const doubled = [...items, ...items];
  return (
    <div className="relative overflow-hidden py-6 [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: speed, ease: "linear", repeat: Infinity }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            className="font-mono text-sm uppercase tracking-[0.2em] text-muted-foreground/60 hover:text-gold-400 transition-colors"
          >
            {item}
            <span className="ml-12 text-gold-400/40">·</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
