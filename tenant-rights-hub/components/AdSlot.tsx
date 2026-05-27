"use client";

import { useEffect, useRef } from "react";

interface Props {
  slot: string;
  format?: "auto" | "rectangle" | "leaderboard";
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

const HEIGHT: Record<string, string> = {
  auto: "h-24",
  rectangle: "h-64",
  leaderboard: "h-24",
};

export default function AdSlot({ slot, format = "auto", className = "" }: Props) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;
  const pushed = useRef(false);

  useEffect(() => {
    if (!adsenseId || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // adsbygoogle not loaded yet
    }
  }, [adsenseId]);

  if (!adsenseId) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-100 text-xs text-gray-400 ${HEIGHT[format]} ${className}`}
      >
        Ad slot [{slot}] — {format}
      </div>
    );
  }

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={`ca-pub-${adsenseId}`}
        data-ad-slot={slot}
        data-ad-format={format === "leaderboard" ? "horizontal" : format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
