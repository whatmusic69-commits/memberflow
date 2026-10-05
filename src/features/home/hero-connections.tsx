"use client";
import { useLayoutEffect, useRef, useState } from "react";
import { FlowPath } from "@/components/ui/flow-path";
type Geometry = {
  width: number;
  height: number;
  sourceX: number;
  sourceY: number;
  busX: number;
  destinations: { x: number; y: number }[];
};
/** All connectors share one coordinate system measured from layout, not animated transforms. */
export function HeroConnections() {
  const svg = useRef<SVGSVGElement>(null);
  const [geometry, setGeometry] = useState<Geometry | null>(null);
  useLayoutEffect(() => {
    const root = svg.current?.closest<HTMLElement>(".hero-diagram");
    const campaign = root?.querySelector<HTMLElement>(".hero-campaign");
    const channels = root?.querySelector<HTMLElement>(".hero-channels");
    const nodes = Array.from(
      channels?.querySelectorAll<HTMLElement>(".channel-node") || [],
    );
    if (!root || !campaign || !channels || !nodes.length) return;
    const measure = () => {
      if (!svg.current || getComputedStyle(svg.current).display === "none")
        return;
      setGeometry({
        width: root.clientWidth,
        height: root.clientHeight,
        sourceX: campaign.offsetLeft + campaign.offsetWidth - 1,
        sourceY: root.clientHeight / 2,
        busX: (root.clientWidth * 350) / 600,
        destinations: nodes.map((node) => ({
          x: channels.offsetLeft + node.offsetLeft + 1,
          y: channels.offsetTop + node.offsetTop + node.offsetHeight / 2,
        })),
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    [root, campaign, channels, ...nodes].forEach((node) =>
      observer.observe(node),
    );
    return () => observer.disconnect();
  }, []);
  return (
    <svg
      ref={svg}
      className="hero-connectors"
      viewBox={
        geometry ? `0 0 ${geometry.width} ${geometry.height}` : undefined
      }
      fill="none"
      aria-hidden="true"
    >
      {geometry && (
        <>
          <FlowPath
            d={`M${geometry.sourceX} ${geometry.sourceY}H${geometry.busX}`}
            delay={350}
            duration={650}
          />
          <FlowPath
            d={`M${geometry.busX} ${geometry.destinations[0].y}V${geometry.destinations[geometry.destinations.length - 1].y}`}
            delay={1000}
            duration={700}
            signal={false}
          />
          {geometry.destinations.map((node, i) => (
            <FlowPath
              key={i}
              d={`M${geometry.busX} ${node.y}H${node.x}`}
              delay={1200 + i * 160}
              duration={450}
              signal={false}
            />
          ))}
          <circle
            className="distribution-hub-ring"
            cx={geometry.busX}
            cy={geometry.sourceY}
            r={10}
          />
          <circle
            className="distribution-hub"
            cx={geometry.busX}
            cy={geometry.sourceY}
            r={4.5}
          />
        </>
      )}
    </svg>
  );
}
