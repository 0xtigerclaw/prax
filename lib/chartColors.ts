/**
 * Chart color constants — keep in sync with CSS tokens in app/globals.css.
 * Recharts props (stroke, fill, etc.) need literal strings, so we centralize
 * here rather than reading CSS vars from JS.
 */
export const CHART = {
  bid: "#2f7d4f",
  bidSoft: "rgba(47, 125, 79, 0.5)",
  bidFaint: "rgba(47, 125, 79, 0.08)",
  bidGlow: "rgba(47, 125, 79, 0.14)",
  ask: "#b55d16",
  askSoft: "rgba(181, 93, 22, 0.5)",
  askFaint: "rgba(181, 93, 22, 0.08)",
  gridLine: "rgba(91, 80, 61, 0.14)",
  gridLineSoft: "rgba(91, 80, 61, 0.08)",
  axis: "#8b7d65",
  axisTick: "#8b7d65",
  axisTickSub: "#b2a586",
  axisLine: "#d8cbae",
  tooltipBg: "#efe7d6",
  tooltipBorder: "#d8cbae",
  tooltipLabel: "#8b7d65",
  cursorLine: "#c8b892",
} as const;
