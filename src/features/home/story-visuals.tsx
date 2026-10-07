import Image from "next/image";
import { FlowPath } from "@/components/ui/flow-path";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Check,
  Coffee,
  MapPin,
  ScanLine,
  UserRound,
  RotateCcw,
  CreditCard,
  Globe,
  Play,
  Sparkles,
} from "lucide-react";
import type { HomeContent } from "@/content/types";
import { campaign, customers } from "@/data/demo/home";
import { ChannelIcon } from "./campaign-flow";
import { DistributionConnections } from "./distribution-connections";
export function CreateVisual({ c }: { c: HomeContent }) {
  return (
    <div className="editor-panel panel">
      <div className="panel-heading">
        <span>
          <span className="status-dot" />
          {c.editor[0]}
        </span>
        <span>01</span>
      </div>
      <div
        className="editor-photo"
        data-stage
        style={{ animationDelay: "100ms" }}
      >
        <Image
          src={campaign.image}
          alt={c.imageAlt}
          fill
          sizes="(max-width: 768px) 85vw, 440px"
        />
        <span className="photo-tag">
          <Coffee size={13} />
          Your Coffee
        </span>
      </div>
      <div className="editor-fields">
        <span data-stage style={{ animationDelay: "230ms" }}>
          {c.editor[1]}
        </span>
        <strong data-stage style={{ animationDelay: "300ms" }}>
          {campaign.name}
        </strong>
        <div className="editor-field-row">
          <div data-stage style={{ animationDelay: "440ms" }}>
            <span>{c.editor[2]}</span>
            <strong>{campaign.price}</strong>
          </div>
          <div data-stage style={{ animationDelay: "580ms" }}>
            <span>{c.editor[3]}</span>
            <strong>+2 {c.stamps}</strong>
          </div>
        </div>
      </div>
      <div
        className="editor-status"
        data-stage
        style={{ animationDelay: "760ms" }}
      >
        <Check size={15} />
        {c.editor[4]}
        <ArrowUpRight size={16} />
      </div>
    </div>
  );
}
export function DistributionVisual({ c }: { c: HomeContent }) {
  const names = [
    "Instagram",
    "TikTok",
    "Pinterest",
    c.distribution[6],
    "Apple & Google Wallet",
  ];
  return (
    <div className="distribution-visual">
      <DistributionConnections />
      <div className="source-chip" data-stage>
        <Coffee size={21} />
        <div>
          <span>{c.distribution[0]}</span>
          <strong>Pumpkin Latte</strong>
        </div>
        <span className="source-dot" />
      </div>
      <div className="output-network">
        <div className="adapted-list">
          {names.map((name, i) => (
            <div
              className={`adapted-row output-${i}`}
              data-stage
              style={{ animationDelay: `${900 + i * 150}ms` }}
              key={name}
            >
              <div className="adapted-icon">
                {i === 3 ? (
                  <Globe size={19} />
                ) : (
                  <ChannelIcon index={i === 4 ? 3 : i} />
                )}
              </div>
              <strong>{name}</strong>
              <span>{c.distribution[i + 1]}</span>
              <ArrowUpRight size={14} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export function AcquireVisual({ c }: { c: HomeContent }) {
  return (
    <div className="acquire-visual">
      <div className="discovery-post panel" data-stage>
        <div className="post-header">
          <span className="coffee-avatar">
            <Coffee size={16} />
          </span>
          <span>
            Your Coffee<small>{campaign.city}</small>
          </span>
          <span>···</span>
        </div>
        <div className="discovery-image">
          <Image
            src={campaign.image}
            alt={c.imageAlt}
            fill
            sizes="(max-width:700px) 180px, 220px"
          />
          <span>
            <Play size={17} fill="currentColor" />
            {campaign.name}
          </span>
        </div>
        <div className="post-caption">
          <strong>{campaign.name}</strong>
          <span>€3.90 · +2 {c.stamps}</span>
        </div>
      </div>
      <div className="journey-list">
        <svg
          className="journey-flow"
          viewBox="0 0 40 280"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <FlowPath d="M20 20V260" delay={300} duration={2100} />
        </svg>
        {c.journey.map((s, i) => (
          <div
            data-stage
            style={{ animationDelay: `${300 + i * 450}ms` }}
            key={s}
          >
            <span
              className={i === 3 ? "journey-icon connected" : "journey-icon"}
              style={{ animationDelay: `${300 + i * 450}ms` }}
            >
              {i === 0 ? (
                <Sparkles size={18} />
              ) : i === 1 ? (
                <Coffee size={18} />
              ) : i === 2 ? (
                <MapPin size={18} />
              ) : (
                <Check size={18} />
              )}
            </span>
            <span>
              <small>0{i + 1}</small>
              <strong>{s}</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
export function DemoQr({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 84 84" className="demo-qr" role="img" aria-label={label}>
      <title>{label}</title>
      <rect width="84" height="84" fill="white" />
      {[
        [6, 6],
        [54, 6],
        [6, 54],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={x} y={y} width="24" height="24" fill="currentColor" />
          <rect x={x + 4} y={y + 4} width="16" height="16" fill="white" />
          <rect x={x + 8} y={y + 8} width="8" height="8" fill="currentColor" />
        </g>
      ))}
      {Array.from({ length: 100 }, (_, i) => {
        const x = 6 + (i % 10) * 7,
          y = 6 + Math.floor(i / 10) * 7;
        return ((x > 31 && y > 31) ||
          (x > 31 && x < 51) ||
          (y > 31 && y < 51)) &&
          i % 3 !== 0 ? (
          <rect key={i} x={x} y={y} width="5" height="5" fill="currentColor" />
        ) : null;
      })}
    </svg>
  );
}
export function ConnectVisual({ c }: { c: HomeContent }) {
  return (
    <div className="connect-visual">
      <div className="connect-steps">
        <svg
          className="connect-flow"
          viewBox="0 0 480 46"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <FlowPath d="M80 23H400" duration={1700} />
        </svg>
        <div data-stage>
          <ScanLine size={20} />
          <span>{c.connect[0]}</span>
        </div>
        <ArrowRight size={15} />
        <div data-stage style={{ animationDelay: "550ms" }}>
          <UserRound size={20} />
          <span>{c.connect[1]}</span>
        </div>
        <ArrowRight size={15} />
        <div data-stage style={{ animationDelay: "1100ms" }}>
          <CreditCard size={20} />
          <span>{c.connect[2]}</span>
        </div>
      </div>
      <div className="wallet-composition">
        <div className="qr-stand">
          <Coffee size={21} />
          <strong>Your Coffee</strong>
          <DemoQr label={c.connect[8]} />
          <span>{c.connect[0]}</span>
        </div>
        <span className="wallet-bridge">
          <ArrowRight size={18} />
        </span>
        <div
          className="wallet-card"
          data-stage
          style={{ animationDelay: "1100ms" }}
        >
          <div className="wallet-brand">
            <Coffee size={17} />
            Your Coffee<span>MEMBERFLOW</span>
          </div>
          <div className="wallet-person">
            <small>{c.connect[4]}</small>
            <strong>Anna</strong>
            <span>
              <Check size={12} />
              {c.connect[3]}
            </span>
          </div>
          <div className="wallet-loyalty">
            <small>{c.retention[0]}</small>
            <strong>
              4 / 6 <span>{c.stamps}</span>
            </strong>
            <div className="mini-stamps">
              {Array.from({ length: 6 }, (_, i) => (
                <span
                  className={i < 4 ? "done" : ""}
                  style={{ animationDelay: `${1300 + i * 130}ms` }}
                  key={i}
                >
                  {i < 4 ? <Coffee size={13} /> : null}
                </span>
              ))}
            </div>
          </div>
          <div className="wallet-reward">
            <div>
              <small>{c.connect[5]}</small>
              <strong>{c.connect[6]}</strong>
            </div>
            <div>
              <small>{c.connect[7]}</small>
              <strong>Coffee Club</strong>
            </div>
          </div>
          <DemoQr label={c.connect[8]} />
        </div>
      </div>
    </div>
  );
}
export function CommunicationVisual({ c }: { c: HomeContent }) {
  return (
    <div className="communication-visual">
      <div className="communication-source" data-stage>
        <Coffee size={19} />
        <span>
          {c.communication[0]}
          <strong>Pumpkin Latte</strong>
        </span>
        <span className="reuse-marker">01</span>
      </div>
      <div className="communication-connector" aria-hidden="true">
        <svg
          className="communication-flow"
          viewBox="0 0 500 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <FlowPath d="M250 0V40" duration={700} />
          <FlowPath d="M250 40H125V100" delay={650} duration={900} />
          <FlowPath d="M250 40H375V100" delay={800} duration={900} />
        </svg>
        <span className="communication-hub" />
      </div>
      <div className="audience-split">
        <div data-stage style={{ animationDelay: "1050ms" }}>
          <span>{c.communication[1]}</span>
          <strong>{c.communication[2]}</strong>
        </div>
        <div data-stage style={{ animationDelay: "1250ms" }}>
          <span>{c.communication[3]}</span>
          <strong>{c.communication[4]}</strong>
        </div>
      </div>
      <div className="notification-branch">
        <div
          className="notification panel"
          data-stage
          style={{ animationDelay: "1600ms" }}
        >
          <div className="notification-icon">
            <Bell size={21} />
          </div>
          <div>
            <div className="notification-business">
              Your Coffee<span>MemberFlow</span>
            </div>
            <strong>{c.communication[5]}</strong>
            <p>{c.communication[6]}</p>
          </div>
        </div>
        <span className="visual-caption">{c.communication[7]}</span>
      </div>
    </div>
  );
}
export function ActivityVisual({ c }: { c: HomeContent }) {
  return (
    <div className="activity-panel panel">
      <div className="panel-heading">
        <span>{c.activity[0]}</span>
        <UserRound size={17} />
      </div>
      <div className="activity-header">
        <span>{c.activity[1]}</span>
        <span>{c.activity[2]}</span>
        <span>{c.activity[4]}</span>
      </div>
      {customers.map((customer, i) => (
        <div
          className={`customer-row relationship-${i ? "quiet" : "healthy"}`}
          data-stage
          style={{ animationDelay: `${150 + i * 250}ms` }}
          key={customer.id}
        >
          <div className="customer-person">
            <span className={`avatar avatar-${i}`}>{customer.initials}</span>
            <div>
              <strong>{customer.name}</strong>
              <small>
                {c.activity[3]}: {c.activity[5 + i]}
              </small>
              <span className={i ? "attention-badge" : "returning-badge"}>
                {c.activity[i ? 7 : 8]}
              </span>
            </div>
          </div>
          <strong>{customer.visits}</strong>
          <div className="loyalty-count">
            {customer.loyalty.stamps}/{customer.loyalty.target}
            <div>
              <span
                style={{
                  width: `${(customer.loyalty.stamps / customer.loyalty.target) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
export function ReturnVisual({ c }: { c: HomeContent }) {
  return (
    <div className="return-visual">
      <svg
        className="return-flow"
        viewBox="0 0 350 430"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <FlowPath d="M175 20V410" delay={200} duration={2400} />
      </svg>
      <div className="return-person panel" data-stage>
        <span className="eyebrow">
          <span className="status-dot" />
          {c.return[0]}
        </span>
        <div>
          <span className="avatar avatar-1">RK</span>
          <span>
            <strong>Robert Kalniņš</strong>
            <small>{c.return[1]}</small>
          </span>
        </div>
      </div>
      <div
        className="return-link"
        data-stage
        style={{ animationDelay: "600ms" }}
      >
        <ArrowDown size={20} />
        <span>{c.return[2]}</span>
      </div>
      <div
        className="return-offer"
        data-stage
        style={{ animationDelay: "1100ms" }}
      >
        <Coffee size={22} />
        <p>{c.return[3]}</p>
        <span>
          Your Coffee
          <ArrowUpRight size={17} />
        </span>
      </div>
      <div
        className="return-outcome"
        data-stage
        style={{ animationDelay: "2100ms" }}
      >
        <RotateCcw size={15} />
        {c.return[4]}
      </div>
      <small className="visual-caption">{c.return[5]}</small>
    </div>
  );
}
