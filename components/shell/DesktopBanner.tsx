"use client";

import { useEffect, useState } from "react";
import { Monitor, X } from "lucide-react";

export function DesktopBanner() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const check = () => setShow(window.innerWidth < 1280);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!show || dismissed) return null;

  return (
    <div className="hairline-b bg-ask/10 text-ask flex items-center gap-2 px-4 h-8 text-[12px] relative z-10">
      <Monitor size={13} />
      <span>
        Desktop experience recommended. This terminal is optimized for 1280px
        and above.
      </span>
      <button
        onClick={() => setDismissed(true)}
        className="ml-auto h-6 w-6 flex items-center justify-center hover:bg-ask/20 rounded"
        aria-label="Dismiss"
      >
        <X size={12} />
      </button>
    </div>
  );
}
