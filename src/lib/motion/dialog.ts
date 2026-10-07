"use client";
import { useEffect, useRef, type RefObject } from "react";

/** Keep the native modal (and its focus trap) alive until its exit finishes. */
export function animateDialogClose(
  node: HTMLDialogElement | null,
  done: () => void,
) {
  if (
    !node ||
    !node.open ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    done();
    return;
  }
  if (node.dataset.closing) return;
  node.dataset.closing = "true";
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    node.removeEventListener("animationend", ended);
    delete node.dataset.closing;
    done();
  };
  const ended = (event: AnimationEvent) => {
    if (event.target === node && event.animationName === "mf-modal-exit")
      finish();
  };
  const timer = setTimeout(finish, 240);
  node.addEventListener("animationend", ended);
}

export function useDialogDismiss(
  ref: RefObject<HTMLDialogElement | null>,
  done: () => void,
) {
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  return () =>
    animateDialogClose(ref.current, () => {
      if (mounted.current) done();
    });
}
