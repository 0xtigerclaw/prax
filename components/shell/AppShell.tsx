import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { MarketTicker } from "./MarketTicker";
import { DesktopBanner } from "./DesktopBanner";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-0">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar />
        <MarketTicker />
        <DesktopBanner />
        <main className="flex-1 min-h-0 overflow-auto grid-bg">
          {children}
        </main>
      </div>
    </div>
  );
}
