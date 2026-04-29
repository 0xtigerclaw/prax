import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Github, Twitter, FileCheck } from "lucide-react";

export function CTAFooter() {
  return (
    <>
      <section className="relative overflow-hidden hero-glow">
        <div className="max-w-[1440px] mx-auto px-6 py-28 text-center">
          <h2 className="text-[clamp(40px,5vw,68px)] font-semibold tracking-[-0.035em] leading-[0.98]">
            Those credits expire in 2 days.
            <br />
            <span className="text-text-1">A developer needs them right now.</span>
          </h2>
          <p className="mt-5 text-[15px] text-text-1 max-w-[560px] mx-auto leading-relaxed">
            List your unused Anthropic, OpenAI, or Google balance in under
            a minute. Developers are bidding right now. You recover real
            money. They ship their project at half price.
          </p>
          <div className="mt-9 flex items-center justify-center gap-3">
            <Link href="/list">
              <Button variant="primary" size="xl">
                List your credits now <ArrowRight size={15} />
              </Button>
            </Link>
            <Link href="/market">
              <Button variant="outline" size="xl">
                Browse discounted credits
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="hairline-t bg-bg-1">
        <div className="max-w-[1440px] mx-auto px-6 py-10">
          <div className="grid md:grid-cols-[2fr_1fr_1fr_1fr] gap-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Image src="/logos/prax.svg" alt="" width={22} height={22} />
                <span className="text-[14px] font-semibold tracking-tight">
                  Prax
                </span>
              </div>
              <p className="text-[12px] text-text-2 max-w-[340px] leading-relaxed">
                The marketplace where enterprise AI credits find a second
                life. Sellers recover value before expiry. Developers and
                startups get the same models at 30–60% less. Settled on
                Solana in 400ms.
              </p>
              <div className="flex gap-2 mt-5">
                <IconLink icon={<Github size={14} />} />
                <IconLink icon={<Twitter size={14} />} />
                <IconLink icon={<FileCheck size={14} />} />
              </div>
            </div>
            <FooterCol
              title="Protocol"
              items={["Markets", "Routing", "Pools", "Listings"]}
            />
            <FooterCol
              title="Developers"
              items={["Docs", "API", "GitHub", "Audits"]}
            />
            <FooterCol
              title="Company"
              items={["About", "Careers", "Blog", "Legal"]}
            />
          </div>
          <div className="mt-10 pt-6 hairline-t flex items-center justify-between text-[11px] text-text-2">
            <span className="mono">© 2026 Prax Labs</span>
            <span className="mono">
              program: NcrmnM…RsuH · devnet
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}

function IconLink({ icon }: { icon: React.ReactNode }) {
  return (
    <a
      href="#"
      className="h-8 w-8 rounded-[6px] bg-bg-2 hover:bg-bg-3 border border-line flex items-center justify-center text-text-1 hover:text-text-0 transition-colors"
    >
      {icon}
    </a>
  );
}

function FooterCol({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div>
      <div className="mono text-[10px] uppercase tracking-[0.1em] text-text-2 mb-3">
        {title}
      </div>
      <ul className="space-y-1.5">
        {items.map((i) => (
          <li key={i}>
            <a
              href="#"
              className="text-[13px] text-text-1 hover:text-text-0 transition-colors"
            >
              {i}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
