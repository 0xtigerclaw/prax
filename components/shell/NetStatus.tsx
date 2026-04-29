"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function NetStatus() {
  const [slot, setSlot] = useState(312_478_294);
  const [tps, setTps] = useState(3847);

  useEffect(() => {
    const id = setInterval(() => {
      setSlot((s) => s + 1 + Math.floor(Math.random() * 2));
      setTps((t) =>
        Math.max(1500, Math.min(6500, t + Math.round((Math.random() - 0.5) * 200))),
      );
    }, 1200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="hidden md:flex items-center gap-3 h-8 px-2.5">
      <div className="flex items-center gap-1.5 text-[11px]">
        <span className={cn("h-1.5 w-1.5 rounded-full bg-bid animate-pulse")} />
        <span className="text-text-2 uppercase tracking-wider">Live</span>
      </div>
      <div className="text-[11px] mono text-text-2">
        slot <span className="text-text-0">{slot.toLocaleString()}</span>
      </div>
      <div className="text-[11px] mono text-text-2">
        tps <span className="text-text-0">{tps.toLocaleString()}</span>
      </div>
    </div>
  );
}
