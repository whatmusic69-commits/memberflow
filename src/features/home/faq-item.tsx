"use client";

import { useEffect, useRef } from "react";

/** Preserve native disclosure semantics while keeping the answer visible during closing. */
export function FAQItem({ question, answer }: { question: string; answer: string }) {
  const details = useRef<HTMLDetailsElement>(null);
  const animation = useRef<Animation | null>(null);
  const expanded = useRef(false);

  useEffect(() => () => animation.current?.cancel(), []);

  function toggle(event: React.MouseEvent<HTMLElement>) {
    const node = details.current;
    const summary = node?.querySelector("summary");
    if (!node || !summary || !node.animate) return;
    event.preventDefault();

    const startHeight = node.getBoundingClientRect().height;
    animation.current?.cancel();
    const next = !expanded.current;
    expanded.current = next;
    node.dataset.expanded = String(next);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.open = next;
      delete node.dataset.animating;
      animation.current = null;
      return;
    }

    node.open = true;
    const border = parseFloat(getComputedStyle(node).borderBottomWidth) || 0;
    const endHeight = next
      ? node.getBoundingClientRect().height
      : summary.getBoundingClientRect().height + border;
    node.dataset.animating = "true";
    const current = node.animate(
      [{ height: `${startHeight}px` }, { height: `${endHeight}px` }],
      { duration: 260, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );
    animation.current = current;
    current.onfinish = () => {
      if (animation.current !== current) return;
      node.open = next;
      delete node.dataset.animating;
      animation.current = null;
    };
  }

  return (
    <details ref={details}>
      <summary onClick={toggle}>
        {question}
        <span aria-hidden="true">+</span>
      </summary>
      <p>{answer}</p>
    </details>
  );
}
