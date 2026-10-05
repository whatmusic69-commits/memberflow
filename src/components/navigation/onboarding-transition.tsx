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
    if (!destination.current) return;
    const arrived = pathname === destination.current;
    const abandoned = !arrived && !/^\/(en|lv|ru)$/.test(pathname);
    if (!arrived && !abandoned) return;
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
        className={`mf-route-content mf-route-${phase}`}
        inert={phase === "leaving"}
        aria-busy={phase === "leaving"}
      >
        {children}
      </div>
      {phase !== "idle" && (
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
