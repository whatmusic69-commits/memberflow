"use client";

import { useEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

/** Enhances server-rendered visuals. Content remains visible without JavaScript. */
export function MotionController() {
  const pathname = usePathname();
  useEffect(() => {
    if (!("IntersectionObserver" in window) || !("animate" in Element.prototype)) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animations = new Set<Animation>();
    const played = new WeakSet<Element>();
    const animate = (element: HTMLElement, delay = 0, duration = 560) => {
      if (preference.matches || played.has(element)) return;
      played.add(element);
      const animation = element.animate([
        { opacity: element.tagName === "H1" ? 1 : 0, transform: "translateY(18px)" },
        { opacity: 1, transform: "translateY(0)" },
      ], { duration, delay, easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards" });
      animations.add(animation);
      animation.onfinish = () => animations.delete(animation);
    };
    // Animate only when visible: no stylesheet hides content while waiting for JS.
    const sections = Array.from(document.querySelectorAll<HTMLElement>(
      "#main > section:not(.hero):not(.product-hero):not(.about-hero), #main > .story > section",
    ));
    const groups = Array.from(document.querySelectorAll<HTMLElement>("#main .public-plans, #main .product-business-list, #main .product-more-list"));
    const scenes = Array.from(document.querySelectorAll<HTMLElement>("#main [data-motion-scene]"));
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const element = entry.target as HTMLElement;
        const selector = element.hasAttribute("data-motion-scene")
          ? "[data-motion-item]"
          : groups.includes(element) ? ":scope > *"
          : ":scope > header, :scope > h2, :scope > p, :scope > div, :scope > figure, :scope > blockquote, :scope > a";
        const children = Array.from(element.querySelectorAll<HTMLElement>(selector));
        (children.length ? children : [element]).forEach((child, i) => animate(child, Math.min(i * 65, 260)));
        observer.unobserve(element);
      }
    }, { threshold: 0, rootMargin: "0px 0px -6% 0px" });
    [...sections, ...scenes, ...groups].forEach((element) => observer.observe(element));
    document.querySelectorAll<HTMLElement>(
      ".hero-copy > *, .product-hero-copy > *, .product-hero-composition, .about-hero > *, .public-heading > *, .pricing-heading > *",
    ).forEach((element, i) => animate(element, Math.min(i * 65, 260), 500));
    const stop = () => {
      if (preference.matches) {
        animations.forEach((animation) => animation.cancel());
        animations.clear();
      }
    };
    preference.addEventListener("change", stop);
    const revealFocus = (event: FocusEvent) => {
      if (!(event.target instanceof HTMLElement)) return;
      let element: HTMLElement | null = event.target;
      while (element && element.id !== "main") {
        element.getAnimations().forEach((animation) => {
          if (animations.has(animation)) {
            animation.cancel();
            animations.delete(animation);
          }
        });
        element = element.parentElement;
      }
    };
    document.addEventListener("focusin", revealFocus);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", stop);
      document.removeEventListener("focusin", revealFocus);
      animations.forEach((animation) => animation.cancel());
    };
  }, [pathname]);
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
      elements.forEach((element) => element.classList.remove("is-motion-ready", "is-in-view"));
    };
  }, [pathname]);
  return null;
}
