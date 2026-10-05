"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { FlowPath } from "@/components/ui/flow-path";

type Geometry = {
  width: number;
  height: number;
  main: string;
  branches: string[];
  hub: { x: number; y: number };
};

/** Measures the actual nodes, so translated copy and responsive gaps cannot break connections. */
export function DistributionConnections() {
  const svg = useRef<SVGSVGElement>(null);
  const [geometry, setGeometry] = useState<Geometry | null>(null);
  useLayoutEffect(() => {
    const root = svg.current?.closest<HTMLElement>(".distribution-visual");
    const source = root?.querySelector<HTMLElement>(".source-chip");
    const outputs = Array.from(
      root?.querySelectorAll<HTMLElement>(".adapted-row") ?? [],
    );
    if (!root || !source || !outputs.length) return;
    const measure = () => {
      const bounds = root.getBoundingClientRect();
      const input = source.getBoundingClientRect();
      const nodes = outputs.map((output) => output.getBoundingClientRect());
      const x = input.left + input.width / 2 - bounds.left;
      const y = input.bottom - bounds.top;
      const mobile =
        getComputedStyle(outputs[0].parentElement!).display === "flex";
      if (mobile) {
        // Mobile is a single centred vertical journey. The opaque cards cover
        // the line through their bodies; every visible gap stays connected.
        const last = nodes[nodes.length - 1];
        setGeometry({
          width: bounds.width,
          height: bounds.height,
          main: `M${x} ${y}V${last.top - bounds.top + 1}`,
          branches: [],
          hub: { x, y: y + (nodes[0].top - input.bottom) / 2 },
        });
      } else {
        const busY = y + 25;
        const centers = nodes.map(
          (node) => node.left + node.width / 2 - bounds.left,
        );
        setGeometry({
          width: bounds.width,
          height: bounds.height,
          main: `M${x} ${y}V${busY}`,
          branches: [
            `M${centers[0]} ${busY}H${centers[centers.length - 1]}`,
            ...nodes.map(
              (node, i) =>
                `M${centers[i]} ${busY}V${node.top - bounds.top + 1}`,
            ),
          ],
          hub: { x, y: busY },
        });
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    [root, source, ...outputs].forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
  return (
    <svg
      ref={svg}
      className="distribution-connections"
      viewBox={
        geometry ? `0 0 ${geometry.width} ${geometry.height}` : undefined
      }
      aria-hidden="true"
    >
      {geometry && (
        <>
          <FlowPath d={geometry.main} duration={1700} />
          {geometry.branches.map((d, i) => (
            <FlowPath
              key={i}
              d={d}
              delay={550 + i * 120}
              duration={750}
              signal={false}
            />
          ))}
          <circle
            cx={geometry.hub.x}
            cy={geometry.hub.y}
            r={4}
            fill="var(--accent)"
          />
        </>
      )}
    </svg>
  );
}
