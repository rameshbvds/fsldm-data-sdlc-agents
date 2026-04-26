import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors",
  {
    variants: {
      variant: {
        default: "border border-gold/30 bg-gold/10 text-gold-400",
        success: "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
        warning: "border border-amber-500/30 bg-amber-500/10 text-amber-400",
        danger: "border border-red-500/30 bg-red-500/10 text-red-400",
        muted: "border border-border bg-muted text-muted-foreground",
        outline: "border border-border bg-transparent text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
