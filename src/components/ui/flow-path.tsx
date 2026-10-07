import type { CSSProperties } from "react";

/** A line and its signal share the exact same SVG coordinates. Runs once on reveal. */
export function FlowPath({
  d,
  delay = 0,
  duration = 1600,
  className = "",
  signal = true,
}: {
  d: string;
  delay?: number;
  duration?: number;
  className?: string;
  signal?: boolean;
}) {
  const timing = {
    "--flow-delay": `${delay}ms`,
    "--flow-duration": `${duration}ms`,
  } as CSSProperties;
  return (
    <g className={`flow-path ${className}`} style={timing}>
      <path className="flow-line" d={d} pathLength={1} />
      {signal && (
        <circle
          className="flow-signal"
          r="3.5"
          style={{ offsetPath: `path('${d}')` }}
        />
      )}
    </g>
  );
}
