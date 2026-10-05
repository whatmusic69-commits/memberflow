"use client";

import { RotateCcw } from "lucide-react";

export function ReplayFlow({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="flow-replay"
      aria-label={label}
      title={label}
      onClick={(event) => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
          return;
        const section =
          event.currentTarget.closest<HTMLElement>(".growth-section");
        if (!section) return;
        // Restart existing CSS timelines, including their stagger and pseudo-elements.
        // No remount, scroll change, or layout measurement is necessary.
        for (const animation of section.getAnimations({ subtree: true })) {
          animation.currentTime = 0;
          animation.play();
        }
      }}
    >
      <RotateCcw size={20} aria-hidden="true" />
    </button>
  );
}
