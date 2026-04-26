"use client";
import { cn } from "@/lib/utils";

/** Stylised OCBC wordmark (red square + letters). Inspired by OCBC brand colors. */
export function OcbcMark({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 align-middle", className)}
      style={{ fontSize: size * 0.55 }}
    >
      <span
        className="inline-flex items-center justify-center rounded-[3px] bg-ocbc-500 text-white font-bold tracking-tight shadow-[0_2px_8px_rgba(237,28,36,0.35)]"
        style={{
          width: size,
          height: size,
          fontFamily: "Inter, sans-serif",
          letterSpacing: "-0.02em",
          fontSize: size * 0.42,
        }}
        aria-label="OCBC"
      >
        OCBC
      </span>
    </span>
  );
}

export function OcbcInline({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 font-semibold", className)}>
      <span
        className="inline-block h-2 w-2 rounded-sm bg-ocbc-500"
        style={{ boxShadow: "0 0 12px rgba(237,28,36,0.5)" }}
      />
      OCBC Bank
    </span>
  );
}
