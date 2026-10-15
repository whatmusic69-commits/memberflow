"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function ArticleContents({ label, sections, helpHref, helpLabel }: {
  label: string; sections: { title: string }[]; helpHref: string; helpLabel: string;
}) {
  const [active, setActive] = useState(0);
  const anchorSelection = useRef<number | null>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      // Native anchor scrolling is smooth. Keep the clicked section selected
      // throughout it, including when a short article cannot reach the top.
      if (anchorSelection.current !== null) {
        setActive(anchorSelection.current);
        return;
      }
      let next = 0;
      sections.forEach((_, i) => {
        const section = document.getElementById(`section-${i}`);
        if (section && section.getBoundingClientRect().top <= 140) next = i;
      });
      setActive(next);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const readHash = () => {
      const index = sections.findIndex((_, i) => window.location.hash === `#section-${i}`);
      anchorSelection.current = index >= 0 ? index : null;
      schedule();
    };
    const followReading = () => {
      anchorSelection.current = null;
      schedule();
    };
    const followKeyboard = (event: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) followReading();
    };
    readHash();
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("hashchange", readHash);
    window.addEventListener("wheel", followReading, { passive: true });
    window.addEventListener("touchstart", followReading, { passive: true });
    window.addEventListener("keydown", followKeyboard);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("hashchange", readHash);
      window.removeEventListener("wheel", followReading);
      window.removeEventListener("touchstart", followReading);
      window.removeEventListener("keydown", followKeyboard);
    };
  }, [sections]);
  return <nav className="article-contents" aria-label={label}>
    <strong>{label}</strong>
    <ol>{sections.map((section, i) => <li key={section.title}>
      <a href={`#section-${i}`} aria-current={active === i ? "location" : undefined} onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        anchorSelection.current = i;
        setActive(i);
      }}>
        <span className="article-contents-number" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
        <span>{section.title}</span>
      </a>
    </li>)}</ol>
    <Link className="article-contents-home" href={helpHref}>{helpLabel} ↗</Link>
  </nav>;
}
