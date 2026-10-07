"use client";
import { useState } from "react";
import { Coffee, ArrowUpRight, Check, Ticket } from "lucide-react";
import type { HomeContent } from "@/content/types";
import { membership } from "@/data/demo/home";
export function RetentionVisual({ c }: { c: HomeContent }) {
  const [selected, setSelected] = useState(0);
  return (
    <div className="member-panel panel">
      <div className="panel-heading">
        <span>Your Coffee</span>
        <span className="avatar">A</span>
      </div>
      <div className="member-greeting">
        Anna<span>{c.retention[12]}</span>
      </div>
      <div className="member-tabs" role="tablist" aria-label={c.sections[4][0]}>
        {c.retention.slice(0, 3).map((label, i) => (
          <button
            key={label}
            id={`member-tab-${i}`}
            role="tab"
            aria-selected={i === selected}
            aria-controls="member-content"
            tabIndex={i === selected ? 0 : -1}
            onClick={() => setSelected(i)}
            onKeyDown={(e) => {
              if (["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) {
                e.preventDefault();
                const next =
                  e.key === "Home"
                    ? 0
                    : e.key === "End"
                      ? 2
                      : (selected + (e.key === "ArrowRight" ? 1 : 2)) % 3;
                setSelected(next);
                document.getElementById(`member-tab-${next}`)?.focus();
              }
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div
        id="member-content"
        role="tabpanel"
        aria-labelledby={`member-tab-${selected}`}
        className="member-content"
        tabIndex={0}
      >
        {selected === 0 ? (
          <>
            <Coffee className="member-icon" size={30} />
            <h3>{c.retention[3]}</h3>
            <div className="stamp-row">
              {Array.from({ length: 6 }, (_, i) => (
                <span key={i} className={i < 4 ? "filled" : ""}>
                  {i < 4 ? <Coffee size={18} /> : <span>·</span>}
                </span>
              ))}
            </div>
            <p>{c.retention[4]}</p>
            <div className="member-detail">
              <span>{c.connect[5]}</span>
              <strong>
                {c.connect[6]}
                <ArrowUpRight size={15} />
              </strong>
            </div>
          </>
        ) : selected === 1 ? (
          <>
            <Check className="member-icon" size={30} />
            <h3>{c.retention[5]}</h3>
            <div className="membership-name">
              {membership.name}
              <span className="success-badge">{c.retention[6]}</span>
            </div>
            <p>
              <strong>{membership.remainingVisits}</strong> {c.retention[7]}
            </p>
          </>
        ) : (
          <>
            <Ticket className="member-icon" size={30} />
            <h3>{c.retention[8]}</h3>
            <div className="offer-ticket">
              <span>{c.retention[9]}</span>
              <strong>Pumpkin Latte</strong>
              <p>{c.retention[11]}</p>
              <span>
                €3.90 <ArrowUpRight size={15} />
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
