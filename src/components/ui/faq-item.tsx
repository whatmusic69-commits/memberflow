"use client";

import { useEffect, useRef } from "react";

/** Preserve native disclosure semantics while keeping the answer visible during closing. */
export function FAQItem({ question, answer }: { question: string; answer: string }) {
  const details = useRef<HTMLDetailsElement>(null);
  const animation = useRef<Animation | null>(null);
  const answerNode = useRef<HTMLParagraphElement>(null);
  const answerAnimation = useRef<Animation | null>(null);
  const expanded = useRef(false);

  useEffect(() => () => {animation.current?.cancel(); answerAnimation.current?.cancel();}, []);

  function toggle(event: React.MouseEvent<HTMLElement>) {
    const node = details.current;
    const summary = node?.querySelector("summary");
    if (!node || !summary || !node.animate) return;
    event.preventDefault();

    const startHeight = node.getBoundingClientRect().height;
    const answer = answerNode.current;
    const answerStyle = answer ? getComputedStyle(answer) : null;
    const previousOpacity = answerStyle?.opacity ?? "1";
    const previousTransform = answerStyle?.transform ?? "none";
    const wasAnimating = answerAnimation.current !== null;
    animation.current?.cancel();
    answerAnimation.current?.cancel();
    answerAnimation.current = null;
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
    const style = getComputedStyle(node);
    const closedSpacing = [style.borderTopWidth, style.borderBottomWidth, style.paddingTop, style.paddingBottom].reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
    const endHeight = next
      ? node.getBoundingClientRect().height
      : summary.getBoundingClientRect().height + closedSpacing;
    node.dataset.animating = "true";
    if (answer) {
      const fade = answer.animate([
        {opacity: wasAnimating ? previousOpacity : next ? "0" : "1", transform: wasAnimating ? previousTransform : next ? "translateY(6px)" : "none"},
        {opacity: next ? "1" : "0", transform: next ? "none" : "translateY(-3px)"},
      ], {duration: next ? 280 : 160, easing: "ease-out", fill: "forwards"});
      answerAnimation.current = fade;
    }
    const current = node.animate(
      [{ height: `${startHeight}px` }, { height: `${endHeight}px` }],
      { duration: 300, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );
    animation.current = current;
    current.onfinish = () => {
      if (animation.current !== current) return;
      node.open = next;
      delete node.dataset.animating;
      animation.current = null;
      answerAnimation.current?.cancel();
      answerAnimation.current = null;
    };
  }

  return (
    <details ref={details} className="mf-faq-item">
      <summary onClick={toggle}>
        {question}
        <span aria-hidden="true">+</span>
      </summary>
      <p ref={answerNode}>{answer}</p>
    </details>
  );
}
