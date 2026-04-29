"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-[6px] font-medium transition-all select-none whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bid/40",
  {
    variants: {
      variant: {
        primary:
          "bg-bid text-[#f5efe4] hover:bg-bid/90 active:scale-[0.98] shadow-[0_0_0_1px_rgba(47,125,79,0.35),0_8px_24px_-12px_rgba(47,125,79,0.55)]",
        ask: "bg-ask text-[#f5efe4] hover:bg-ask/90 active:scale-[0.98]",
        secondary:
          "bg-bg-2 text-text-0 hover:bg-bg-3 border border-line hover:border-line-2",
        ghost: "text-text-0 hover:bg-bg-2",
        outline:
          "border border-line text-text-0 hover:bg-bg-2 hover:border-line-2",
        danger: "bg-warn text-white hover:bg-warn/90",
      },
      size: {
        sm: "h-7 px-2.5 text-[12px]",
        md: "h-9 px-3.5 text-[13px]",
        lg: "h-11 px-5 text-[14px]",
        xl: "h-12 px-6 text-[15px]",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";
