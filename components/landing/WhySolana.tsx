import Image from "next/image";
import { Clock, CheckCircle2, ArrowRight } from "lucide-react";

export function WhySolana() {
  return (
    <section className="bg-bg-0 hairline-t">
      <div className="max-w-[1440px] mx-auto px-6 py-20">

        {/* Header */}
        <div className="flex items-end justify-between gap-8 mb-10">
          <div>
            <div className="mono text-[11px] uppercase tracking-[0.15em] text-bid mb-3">
              Why this exists
            </div>
            <h2 className="text-[44px] font-semibold tracking-[-0.03em] leading-[1.05]">
              Enterprises waste billions
              <br />
              in AI credits every year.
              <br />
              <span className="text-text-2 font-normal italic">Developers are desperate to buy them.</span>
            </h2>
          </div>
          <p className="hidden md:block text-[13.5px] text-text-1 max-w-[320px] leading-relaxed shrink-0">
            Every enterprise AI commit has a gap between what was bought
            and what gets used. That gap expires worthless unless
            there&rsquo;s a market. Prax is that market.
          </p>
        </div>

        {/* Scenario */}
        <div className="max-w-[960px] mx-auto mb-6">
          <div className="panel rounded-[12px] overflow-hidden">
            <div className="px-5 py-3 hairline-b bg-bg-2 flex items-center gap-2">
              <Clock size={11} className="text-ask" />
              <span className="mono text-[10px] uppercase tracking-[0.12em] text-text-2">
                Happening right now, daily
              </span>
            </div>
            <div className="p-5">
              <div className="flex flex-col md:flex-row items-stretch gap-4">

                {/* Enterprise side */}
                <div className="flex-1 rounded-[8px] border border-ask/25 bg-ask/5 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Image src="/logos/anthropic.svg" alt="" width={16} height={16} />
                    <span className="text-[12.5px] font-semibold">Enterprise team</span>
                  </div>
                  <div className="space-y-1.5 mb-3 text-[12px]">
                    <div className="flex justify-between">
                      <span className="text-text-2">Claude credits bought</span>
                      <span className="mono font-semibold">1,000 units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-2">Used</span>
                      <span className="mono text-bid font-semibold">700 units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-2">Expiring idle</span>
                      <span className="mono text-ask font-semibold">300 units</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-bg-3 rounded-full overflow-hidden mb-3">
                    <div className="h-full w-[70%] bg-bid rounded-full" />
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-ask">
                    <Clock size={9} />
                    <span className="font-medium">Expires in 2 days. Worth $0 after that.</span>
                  </div>
                </div>

                {/* Prax bridge */}
                <div className="flex items-center justify-center md:w-10">
                  <div className="panel rounded-[6px] px-2.5 py-1.5 flex items-center gap-1.5 text-[11px] shrink-0">
                    <span className="text-sol font-bold">◎</span> Prax
                    <ArrowRight size={10} />
                  </div>
                </div>

                {/* Developer side */}
                <div className="flex-1 rounded-[8px] border border-bid/25 bg-bid/5 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[14px]">👨‍💻</span>
                    <span className="text-[12.5px] font-semibold">Solo developer</span>
                  </div>
                  <div className="space-y-1.5 mb-3 text-[12px]">
                    <div className="flex justify-between">
                      <span className="text-text-2">List price</span>
                      <span className="mono text-text-2 line-through">$27.93</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-2">Pays on Prax</span>
                      <span className="mono text-bid font-semibold">$13.97</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-bid">
                    <CheckCircle2 size={9} />
                    <span className="font-medium">Ships their project. 50% cheaper.</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
