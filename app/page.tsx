import { TopNav } from "@/components/landing/TopNav";
import { Hero } from "@/components/landing/Hero";
import { MarketTicker } from "@/components/shell/MarketTicker";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { WhySolana } from "@/components/landing/WhySolana";
import { FeaturedAuctions } from "@/components/landing/FeaturedAuctions";
import { StatsBand } from "@/components/landing/StatsBand";
import { CTAFooter } from "@/components/landing/CTAFooter";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <main className="flex-1">
        <Hero />
        <MarketTicker edgeToEdge />
        <HowItWorks />
        <WhySolana />
        <FeaturedAuctions />
        <StatsBand />
        <CTAFooter />
      </main>
    </div>
  );
}
