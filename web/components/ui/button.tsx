"use client";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gold-gradient text-navy-950 shadow-[0_4px_14px_rgba(201,169,97,0.25)] hover:shadow-[0_8px_24px_rgba(201,169,97,0.45)] hover:-translate-y-0.5",
        ghost: "text-foreground/80 hover:bg-muted hover:text-foreground",
        outline:
          "border border-border bg-transparent hover:bg-muted text-foreground",
        destructive:
          "bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20",
        success:
          "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20",
      },
      size: {
        default: "h-10 px-5",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-7 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";
