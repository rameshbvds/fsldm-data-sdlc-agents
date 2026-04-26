"use client";
import { animate, useInView, useMotionValue, useTransform } from "framer-motion";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

export function CountUp({
  to,
  from = 0,
  duration = 1.6,
  prefix = "",
  suffix = "",
  decimals = 0,
}: {
  to: number;
  from?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const motionValue = useMotionValue(from);
  const rounded = useTransform(motionValue, (latest) =>
    decimals > 0 ? latest.toFixed(decimals) : Math.round(latest).toLocaleString()
  );

  useEffect(() => {
    if (inView) {
      const controls = animate(motionValue, to, { duration, ease: "easeOut" });
      return controls.stop;
    }
  }, [inView, to, motionValue, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}
