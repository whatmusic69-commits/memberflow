"use client";
import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { Wordmark } from "@/components/ui/brand";
type Phase = "idle" | "leaving" | "entering";
const TransitionContext = createContext<((href: string) => void) | null>(null);
export function useOnboardingTransition() {
  return useContext(TransitionContext);
}
/** A brief brand transition; navigation still uses real links and Next's router. */
export function OnboardingTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const destination = useRef<string | null>(null);
  const brandTransition = useRef(false);
  const [showBrand, setShowBrand] = useState(false);
  const page = useRef<HTMLDivElement>(null);
  const started = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  function clearTimers() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }
  function start(href: string) {
    if (destination.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      router.push(href);
      return;
    }
    clearTimers();
    destination.current = href;
    brandTransition.current = /\/(en|lv|ru)\/onboarding(?:[?#]|$)/.test(href);
    setShowBrand(brandTransition.current);
    started.current = performance.now();
    setPhase("leaving");
    timers.current.push(
      setTimeout(() => router.push(href, { scroll: true }), 180),
    );
    // Never leave a blocked UI behind if the navigation fails or is cancelled.
    timers.current.push(
      setTimeout(() => {
        destination.current = null;
        setPhase("idle");
        clearTimers();
      }, 7000),
    );
  }
  useLayoutEffect(() => {
    if (!destination.current) {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const target =
        page.current?.querySelector<HTMLElement>(".mf-content") ?? page.current;
      const animation = target?.animate(
        [
          { opacity: 0, transform: "translateY(8px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: 260, easing: "ease-out" },
      );
      return () => animation?.cancel();
    }
    const arrived =
      pathname ===
      new URL(destination.current, window.location.origin).pathname;
    const delay = arrived
      ? Math.max(0, 300 - (performance.now() - started.current))
      : 0;
    const timer = setTimeout(() => {
      clearTimers();
      destination.current = null;
      setPhase(arrived ? "entering" : "idle");
      if (arrived) {
        timers.current.push(
          setTimeout(() => {
            if (brandTransition.current)
              window.scrollTo({ top: 0, left: 0, behavior: "instant" });
            document
              .querySelector<HTMLElement>(".onboarding-form-area h1")
              ?.focus({ preventScroll: true });
          }, 16),
        );
        timers.current.push(setTimeout(() => setPhase("idle"), 320));
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [pathname]);
  useEffect(() => () => clearTimers(), []);
  return (
    <TransitionContext.Provider value={start}>
      <div
        ref={page}
        className={`mf-route-content mf-route-${phase}`}
        onClickCapture={(event) => {
          if (
            event.defaultPrevented ||
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
          )
            return;
          const link = (event.target as HTMLElement).closest<HTMLAnchorElement>(
            "a[href]",
          );
          if (!link || link.target || link.hasAttribute("download")) return;
          const url = new URL(link.href, window.location.origin);
          if (
            url.origin !== window.location.origin ||
            url.pathname === pathname
          )
            return;
          event.preventDefault();
          start(url.pathname + url.search + url.hash);
        }}
        inert={phase === "leaving"}
        aria-busy={phase === "leaving"}
      >
        {children}
      </div>
      {phase !== "idle" && showBrand && (
        <div
          className={`mf-onboarding-transition mf-transition-${phase}`}
          aria-hidden="true"
        >
          <div className="mf-transition-brand">
            <Wordmark />
            <span className="mf-transition-track">
              <span />
            </span>
          </div>
        </div>
      )}
    </TransitionContext.Provider>
  );
}
