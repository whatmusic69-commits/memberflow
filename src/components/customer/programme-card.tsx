import type { ReactNode } from "react";
import { Coffee } from "lucide-react";
import "./programme-card.css";

/** Shared presentation only; values and programme rules come from the caller. */
export function ProgrammeCard({ business, label, title, icon, children, footer }: {
  business: string;
  label: string;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  footer?: string;
}) {
  return <div className="mf-programme-card">
    <div className="mf-programme-brand">{icon ?? <Coffee size={17} aria-hidden="true" />}<strong>{business}</strong><span>MemberFlow</span></div>
    <p className="mf-programme-label">{label}</p>
    <h3 className="mf-programme-title">{title}</h3>
    <div className="mf-programme-content">{children}</div>
    {footer && <p className="mf-programme-footer">{footer}</p>}
  </div>;
}
