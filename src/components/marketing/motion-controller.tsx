"use client";

import { useEffect, useLayoutEffect } from "react";

/** Enhances server-rendered visuals. Content remains visible without JavaScript. */
export function MotionController() {
  useLayoutEffect(() => {
    if (window.location.hash !== "#top") return;
    const reset = () =>
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    reset();
    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(reset);
    });
    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, []);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-flow]"),
    );
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in-view");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.18 },
    );
    const setup = () => {
      observer.disconnect();
      for (const element of elements) {
        if (preference.matches) {
          element.classList.remove("is-motion-ready");
          element.classList.add("is-in-view");
        } else if (!element.classList.contains("is-in-view")) {
          element.classList.add("is-motion-ready");
          observer.observe(element);
        }
      }
    };
    setup();
    preference.addEventListener("change", setup);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", setup);
    };
  }, []);
  return null;
}
