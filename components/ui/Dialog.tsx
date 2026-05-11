"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  width?: string;
};

export function Dialog({
  open,
  onOpenChange,
  children,
  title,
  description,
  className,
  width = "max-w-md",
}: DialogProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    const id = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(id);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div
            className="absolute inset-0 bg-bg-0/70 backdrop-blur-md"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 4 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "relative w-full glass rounded-[10px] shadow-2xl",
              width,
              className,
            )}
          >
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-3 right-3 h-7 w-7 rounded-md flex items-center justify-center text-text-1 hover:text-text-0 hover:bg-bg-3/70 transition-colors"
              aria-label="Close"
            >
              <X size={14} />
            </button>
            {(title || description) && (
              <div className="px-5 pt-5 pb-3">
                {title && (
                  <h2 className="text-[16px] font-semibold tracking-tight">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="text-[13px] text-text-1 mt-1">{description}</p>
                )}
              </div>
            )}
            <div className={cn(!title && !description && "pt-5", "px-5 pb-5")}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
