import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function StepIndicator({
  steps,
  current,
}: {
  steps: { id: number; label: string }[];
  current: number;
}) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => {
        const done = step.id < current;
        const active = step.id === current;
        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex items-center gap-3 shrink-0">
              <div
                className={cn(
                  "h-7 w-7 rounded-full flex items-center justify-center mono text-[12px] font-medium shrink-0 transition-colors border",
                  done
                    ? "bg-bid text-bg-0 border-bid"
                    : active
                      ? "bg-bid/10 text-bid border-bid"
                      : "bg-bg-2 text-text-2 border-line",
                )}
              >
                {done ? <Check size={13} /> : step.id}
              </div>
              <div className="flex flex-col leading-none">
                <span
                  className={cn(
                    "text-[11px] uppercase tracking-[0.08em] mono",
                    active ? "text-bid" : done ? "text-text-1" : "text-text-2",
                  )}
                >
                  Step {step.id}
                </span>
                <span
                  className={cn(
                    "text-[13px] font-medium mt-1",
                    active || done ? "text-text-0" : "text-text-2",
                  )}
                >
                  {step.label}
                </span>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-px mx-4",
                  done ? "bg-bid" : "bg-line",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
