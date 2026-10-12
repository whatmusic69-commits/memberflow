"use client";

import { useEffect, useLayoutEffect } from "react";

/** Enhances server-rendered visuals. Content remains visible without JavaScript. */
export function MotionController() {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>(
        "#main > section:not(.hero), #main > .story > section",
      ),
    );
    const reveal = (section: HTMLElement) => {
      section.classList.add("is-scroll-revealed");
      observer.unobserve(section);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) reveal(entry.target as HTMLElement);
        }
      },
      { threshold: 0, rootMargin: "0px 0px -8% 0px" },
    );
    const setup = () => {
      observer.disconnect();
      for (const section of sections) {
        if (preference.matches) {
          section.classList.remove("is-scroll-reveal");
          reveal(section);
        } else {
          section.classList.add("is-scroll-reveal");
          if (
            section.classList.contains("is-scroll-revealed") ||
            section.getBoundingClientRect().top < window.innerHeight * 0.92
          ) {
            reveal(section);
          } else {
            observer.observe(section);
          }
        }
      }
    };
    const revealFocused = (event: FocusEvent) => {
      if (!(event.target instanceof Element)) return;
      const section = event.target.closest<HTMLElement>(".is-scroll-reveal");
      if (section) reveal(section);
    };
    setup();
    document.addEventListener("focusin", revealFocused);
    preference.addEventListener("change", setup);
    return () => {
      observer.disconnect();
      document.removeEventListener("focusin", revealFocused);
      preference.removeEventListener("change", setup);
      for (const section of sections) {
        section.classList.remove("is-scroll-reveal", "is-scroll-revealed");
      }
    };
  }, []);
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
