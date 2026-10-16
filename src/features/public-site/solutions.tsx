"use client";
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  Coffee,
  Sparkles,
  Dumbbell,
  ShoppingBag,
  Wrench,
  Check,
  Ticket,
  CalendarDays,
  QrCode,
} from "lucide-react";
import type { Locale } from "@/content";
import { customerPageContent } from "@/content/customer-page";
import { marketingLoyalty } from "@/data/demo/home";
import { LoyaltyProgress } from "@/components/customer/loyalty-progress";
import { ProgrammeCard } from "@/components/customer/programme-card";
import type { PublicSiteContent } from "@/content/public-site";
const icons = [Coffee, Sparkles, Dumbbell, ShoppingBag, Wrench];
export function SolutionsExplorer({ c, locale }: { c: PublicSiteContent; locale: Locale }) {
  const [selected, setSelected] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabList = useRef<HTMLDivElement>(null);
  const indicator = useRef<HTMLSpanElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const previousSelection = useRef(selected);
  useEffect(() => {
    let frame=0;
    const selectHash=()=>{
      cancelAnimationFrame(frame);
      const match=/^#industry-(\d+)$/.exec(window.location.hash);
      if(!match)return;
      const index=Number(match[1]);
      if(index>=0 && index<c.industries.length)frame=requestAnimationFrame(()=>setSelected(index));
    };
    selectHash();
    window.addEventListener("hashchange",selectHash);
    return ()=>{cancelAnimationFrame(frame);window.removeEventListener("hashchange",selectHash);};
  },[c.industries.length]);
  const industry = c.industries[selected];
  const Icon = icons[selected];
  useLayoutEffect(() => {
    const list = tabList.current;
    const active = tabs.current[selected];
    const highlight = indicator.current;
    if (!list || !active || !highlight) return;
    const position = () => {
      const bounds = list.getBoundingClientRect();
      const button = active.getBoundingClientRect();
      highlight.style.width = `${button.width}px`;
      highlight.style.height = `${button.height}px`;
      highlight.style.transform = `translate(${button.left - bounds.left}px, ${button.top - bounds.top}px)`;
      highlight.style.opacity = "1";
      list.dataset.indicatorReady = "true";
    };
    position();
    const observer = new ResizeObserver(position);
    observer.observe(list);
    tabs.current.forEach((button) => {
      if (button) observer.observe(button);
    });
    return () => observer.disconnect();
  }, [selected, c]);
  useLayoutEffect(() => {
    const changed = previousSelection.current !== selected;
    previousSelection.current = selected;
    if (!changed || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const elements = panel.current?.querySelectorAll<HTMLElement>(
      ".industry-copy, .solution-preview .preview-page, .industry-journey li",
    );
    const animations = Array.from(elements ?? []).map((element, index) =>
      element.animate(
        [
          { opacity: 0, transform: `translateY(${index === 1 ? 12 : 6}px)` },
          { opacity: 1, transform: "translateY(0)" },
        ],
        {
          duration: index === 1 ? 420 : 320,
          delay: index < 2 ? index * 45 : 65 + (index - 2) * 35,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          fill: "backwards",
        },
      ),
    );
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const cancel = () => animations.forEach((animation) => animation.cancel());
    preference.addEventListener("change", cancel);
    return () => {
      cancel();
      preference.removeEventListener("change", cancel);
    };
  }, [selected]);
  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % icons.length;
    else if (event.key === "ArrowLeft")
      next = (index + icons.length - 1) % icons.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = icons.length - 1;
    else return;
    event.preventDefault();
    setSelected(next);
    tabs.current[next]?.focus();
  }
  return (
    <section className="solutions-explorer" aria-label={c.nav[0]}>
      <div ref={tabList} className="industry-tabs" role="tablist" aria-label={c.nav[0]}>
        <span ref={indicator} className="industry-tab-indicator" aria-hidden="true" />
        {c.industries.map((item, i) => {
          const TabIcon = icons[i];
          return (
            <button
              key={item.name}
              ref={(node) => {
                tabs.current[i] = node;
              }}
              role="tab"
              id={`industry-${i}`}
              aria-selected={selected === i}
              aria-controls="industry-panel"
              tabIndex={selected === i ? 0 : -1}
              onClick={() => setSelected(i)}
              onKeyDown={(e) => navigate(e, i)}
            >
              <TabIcon size={17} aria-hidden="true" />
              {item.name}
            </button>
          );
        })}
      </div>
      <div
        ref={panel}
        className="industry-panel"
        role="tabpanel"
        id="industry-panel"
        aria-labelledby={`industry-${selected}`}
        tabIndex={0}
      >
        <div className="industry-copy">
          <p className="eyebrow">{c.problem}</p>
          <h2>{industry.problem}</h2>
          <p>{industry.solution}</p>
          <h3>{c.tools}</h3>
          <ul className="tool-tags">
            {industry.tools.map((tool) => (
              <li key={tool}>{tool}</li>
            ))}
          </ul>
        </div>
        <figure
          className={`solution-preview solution-preview-${industry.kind}`}
        >
          <figcaption>{c.demo}</figcaption>
          <div className="preview-page">
            <ProgrammeCard business={industry.business} icon={<Icon size={17} aria-hidden="true" />} label={industry.detail} title={industry.cardTitle} footer={industry.reward}>
              {industry.kind === "stamps" ? (
                <LoyaltyProgress loyalty={marketingLoyalty} progressLabel={customerPageContent[locale].progress} />
              ) : industry.kind === "package" ? (
                <div className="preview-package">
                  <Dumbbell size={32} aria-hidden="true" />
                  <div>
                    <strong>{industry.tools[1]}</strong>
                    <div className="preview-segments">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <span key={i} className={i < 2 ? "filled" : ""} />
                      ))}
                    </div>
                  </div>
                </div>
              ) : industry.kind === "offer" ? (
                <div className="preview-offer">
                  <Ticket size={34} aria-hidden="true" />
                  <strong>{industry.tools[1]}</strong>
                </div>
              ) : (
                <div className="preview-history">
                  <CalendarDays size={24} aria-hidden="true" />
                  <span>{industry.steps[0]}</span>
                  <Check size={18} aria-hidden="true" />
                </div>
              )}
            </ProgrammeCard>
            <div className="preview-bottom">
              <QrCode size={38} aria-hidden="true" />
              <span>{industry.steps[1]}</span>
            </div>
          </div>
        </figure>
        <div className="industry-journey">
          <h3>{c.scenario}</h3>
          <ol>
            {industry.steps.map((step, i) => (
              <li key={step}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
