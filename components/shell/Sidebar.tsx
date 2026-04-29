"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Upload,
  Route,
  Waves,
  BookOpen,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/market", label: "Market", icon: BarChart3 },
  { href: "/list", label: "Sell credits", icon: Upload },
  { href: "/route", label: "Buy & route", icon: Route },
  { href: "/pools", label: "Make markets", icon: Waves, disabled: true },
  { href: "/portfolio", label: "Portfolio", icon: LayoutDashboard, disabled: true },
];

const SECONDARY = [
  { href: "/docs", label: "Docs", icon: BookOpen, disabled: true },
  { href: "/audits", label: "Audits", icon: ShieldCheck, disabled: true },
  { href: "/settings", label: "Settings", icon: Settings, disabled: true },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[220px] shrink-0 hairline-r bg-bg-1 flex flex-col relative z-20">
      {/* Brand */}
      <Link
        href="/"
        className="h-12 px-4 flex items-center gap-2.5 hairline-b hover:bg-bg-2 transition-colors"
      >
        <Image src="/logos/prax.svg" alt="" width={24} height={24} />
        <div className="flex flex-col leading-none">
          <span className="text-[14px] font-semibold tracking-tight">
            Prax
          </span>
          <span className="mono text-[9px] text-text-2 mt-0.5 tracking-wider uppercase">
            v0.1.0 · beta
          </span>
        </div>
      </Link>

      <nav className="flex-1 overflow-y-auto p-2 flex flex-col gap-0.5">
        <div className="px-2 py-1.5 text-[10px] uppercase tracking-[0.08em] text-text-2 font-medium">
          Trading
        </div>
        {NAV.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return item.disabled ? (
            <div
              key={item.href}
              className="group h-8 px-2 rounded-[6px] flex items-center gap-2.5 text-[12.5px] text-text-3 cursor-not-allowed"
              title="Coming soon"
            >
              <Icon size={14} className="shrink-0" />
              <span className="flex-1">{item.label}</span>
              <span className="text-[9px] mono uppercase text-text-3">soon</span>
            </div>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group h-8 px-2 rounded-[6px] flex items-center gap-2.5 text-[12.5px] transition-colors relative",
                active
                  ? "bg-bid/10 text-bid"
                  : "text-text-1 hover:bg-bg-2 hover:text-text-0",
              )}
            >
              {active && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-bid rounded-r" />
              )}
              <Icon size={14} className="shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <div className="px-2 pt-4 pb-1.5 text-[10px] uppercase tracking-[0.08em] text-text-2 font-medium">
          Resources
        </div>
        {SECONDARY.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.href}
              className="group h-8 px-2 rounded-[6px] flex items-center gap-2.5 text-[12.5px] text-text-3 cursor-not-allowed"
              title="Coming soon"
            >
              <Icon size={14} className="shrink-0" />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>

      {/* Footer stat block */}
      <div className="p-3 hairline-t">
        <div className="text-[10px] uppercase tracking-wider text-text-2 mb-1.5">
          Sold in last 24h
        </div>
        <div className="mono text-[18px] font-medium tracking-tight">
          $3.93M
        </div>
        <div className="mono text-[10.5px] delta-up mt-0.5">
          ↑ 12.4% · vs yesterday
        </div>
      </div>
    </aside>
  );
}
