"use client";
import { useId, useLayoutEffect, useRef } from "react";

export function AuthFlow() {
  const id = useId();
  const path = useRef<SVGPathElement>(null);
  const signal = useRef<SVGCircleElement>(null);
  const motion = useRef<SVGAnimateMotionElement>(null);
  useLayoutEffect(() => {
    const line = path.current;
    const dot = signal.current;
    if (!line || !dot) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches) return;
    let cancelled = false;
    // Real SVG length avoids normalised dash lengths interacting with scaling.
    const length = line.getTotalLength();
    line.style.strokeDasharray = `${length} ${length}`;
    const drawing = line.animate(
      [{ strokeDashoffset: String(length) }, { strokeDashoffset: "0" }],
      { duration: 850, delay: 150, easing: "linear", fill: "both" },
    );
    drawing.finished
      .then(() => {
        if (cancelled || preference.matches) return;
        line.style.strokeDasharray = "none";
        drawing.cancel();
        dot.style.opacity = "1";
        // Start only after drawing actually completes, on the very same path.
        motion.current?.beginElement();
      })
      .catch(() => {});
    const reduce = () => {
      if (!preference.matches) return;
      cancelled = true;
      drawing.cancel();
      line.style.strokeDasharray = "none";
      dot.style.opacity = "0";
    };
    preference.addEventListener("change", reduce);
    return () => {
      cancelled = true;
      drawing.cancel();
      line.style.strokeDasharray = "none";
      preference.removeEventListener("change", reduce);
    };
  }, []);
  return (
    <svg viewBox="0 0 420 380" className="auth-flow" aria-hidden="true">
      <path
        ref={path}
        id={id}
        className="auth-loop-line"
        d="M86 80H334Q350 80 350 96V284Q350 300 334 300H86Q70 300 70 284V96Q70 80 86 80Z"
        fill="none"
      />
      <circle ref={signal} className="auth-loop-signal" r="3.5">
        <animateMotion
          ref={motion}
          begin="indefinite"
          dur="2.4s"
          repeatCount="1"
          fill="freeze"
        >
          <mpath href={`#${id}`} />
        </animateMotion>
      </circle>
    </svg>
  );
}
