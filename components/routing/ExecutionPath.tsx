"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Route,
  Lock,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { Panel, PanelHeader, PanelBody } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { RouteOption } from "@/lib/mock/routes";

const NODES = [
  { id: "user", label: "Your call", icon: User },
  { id: "router", label: "Prax", icon: Route },
  { id: "escrow", label: "Escrow swap", icon: Lock },
  { id: "provider", label: "Provider", icon: Sparkles },
  { id: "response", label: "You get the answer", icon: MessageSquare },
];

export function ExecutionPath({
  route,
  totalTokens,
}: {
  route: RouteOption | null;
  totalTokens: number;
}) {
  const [executing, setExecuting] = useState(false);
  const [activeNode, setActiveNode] = useState(-1);

  useEffect(() => {
    if (!executing) return;
    let cancelled = false;
    (async () => {
      for (let i = 0; i < NODES.length; i++) {
        await new Promise((r) => setTimeout(r, 450));
        if (cancelled) return;
        setActiveNode(i);
      }
      await new Promise((r) => setTimeout(r, 400));
      if (cancelled) return;
      setExecuting(false);
      setActiveNode(-1);
      toast.success("Call routed & settled", {
        description:
          "Response streamed · tx 5xKXfAP…F9Qm · you saved $0.0113",
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [executing]);

  const baseCost = route ? (totalTokens / 1000) * route.effective : 0;
  const networkFee = 0.0001;
  const protocolFee = baseCost * 0.001;
  const total = baseCost + networkFee + protocolFee;

  return (
    <Panel>
      <PanelHeader
        title="What happens when you hit execute"
        sub="end-to-end · ~600ms"
        right={
          route && (
            <Badge variant="bid">
              <Zap size={9} /> ready
            </Badge>
          )
        }
      />
      <PanelBody className="p-6 relative">
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />

        {/* Flow */}
        <div className="relative flex items-center justify-between gap-2">
          {/* SVG path */}
          <svg
            className="absolute inset-x-10 top-1/2 -translate-y-1/2 w-[calc(100%-80px)] h-12 pointer-events-none"
            viewBox="0 0 800 48"
            preserveAspectRatio="none"
          >
            <path
              d="M 0 24 L 800 24"
              stroke="rgba(91, 80, 61, 0.22)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            {executing && (
              <path
                d="M 0 24 L 800 24"
                stroke="#2f7d4f"
                strokeWidth="1.8"
                className="animate-dash"
              />
            )}
          </svg>

          {NODES.map((n, i) => {
            const isActive = executing && activeNode >= i;
            const Icon = n.icon;
            const isProvider = n.id === "provider" && route;
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative z-10 flex-1 flex flex-col items-center gap-2"
              >
                <div
                  className={cn(
                    "h-14 w-14 rounded-[10px] glass border flex items-center justify-center transition-all",
                    isActive
                      ? "border-bid shadow-[0_0_0_6px_rgba(47,125,79,0.14)]"
                      : "border-line",
                  )}
                >
                  {isProvider ? (
                    <Image
                      src={route!.provider.logo}
                      alt=""
                      width={22}
                      height={22}
                    />
                  ) : (
                    <Icon
                      size={18}
                      className={isActive ? "text-bid" : "text-text-1"}
                    />
                  )}
                </div>
                <div className="text-center">
                  <div
                    className={cn(
                      "text-[11.5px] font-medium",
                      isActive ? "text-bid" : "text-text-0",
                    )}
                  >
                    {n.label}
                  </div>
                  <div
                    className={cn(
                      "mono text-[10px] mt-0.5",
                      isActive ? "text-bid" : "text-text-2",
                    )}
                  >
                    {isActive ? (
                      <span className="flex items-center justify-center gap-1">
                        <CheckCircle2 size={9} /> ok
                      </span>
                    ) : executing && activeNode + 1 === i ? (
                      "pending…"
                    ) : (
                      "ready"
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Cost breakdown + execute */}
        <div className="mt-8 grid md:grid-cols-[1fr_auto] gap-4 items-center">
          <div className="panel-2 rounded-[8px] p-3 flex items-center gap-6 text-[12px]">
            <CostPart label="Base" value={`$${baseCost.toFixed(4)}`} />
            <span className="text-text-3">+</span>
            <CostPart label="Network fee" value={`$${networkFee.toFixed(4)}`} />
            <span className="text-text-3">+</span>
            <CostPart label="Protocol fee" value={`$${protocolFee.toFixed(4)}`} />
            <span className="text-text-3">=</span>
            <CostPart
              label="Total"
              value={`$${total.toFixed(4)}`}
              highlight
            />
          </div>
          <Button
            variant="primary"
            size="lg"
            disabled={!route || executing}
            onClick={() => {
              setExecuting(true);
              setActiveNode(-1);
            }}
          >
            {executing ? "Executing…" : "Execute"}
          </Button>
        </div>
      </PanelBody>
    </Panel>
  );
}

function CostPart({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <div className="mono text-[9.5px] uppercase tracking-wider text-text-2">
        {label}
      </div>
      <div
        className={cn(
          "mono text-[13px] mt-0.5 tabular-nums",
          highlight ? "text-bid font-medium" : "text-text-0",
        )}
      >
        {value}
      </div>
    </div>
  );
}
