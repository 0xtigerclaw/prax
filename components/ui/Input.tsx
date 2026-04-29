import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "w-full h-9 px-3 rounded-[6px] bg-bg-2 border border-line text-text-0 placeholder:text-text-2",
      "text-[13px] outline-none transition-colors",
      "hover:border-line-2 focus:border-bid/60 focus:ring-2 focus:ring-bid/15",
      "mono",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
