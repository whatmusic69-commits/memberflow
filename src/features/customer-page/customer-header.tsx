"use client";
import { useRef } from "react";
import { ChevronDown, UserRound, Layers, LogOut } from "lucide-react";
import type { Locale } from "@/content";
import { customerAccountContent } from "@/content/customer-account";
import { customerPageContent } from "@/content/customer-page";
import { CustomerImage } from "./customer-image";
import { Wordmark } from "@/components/ui/brand";

export function CustomerHeader({business,logo,initials,name,locale,rewards,offers,onLogout}: {
  business:string;logo:string|null;initials:string;name:string;locale:Locale;rewards:boolean;offers:boolean;onLogout?:()=>void;
}) {
  const c=customerAccountContent[locale],menu=useRef<HTMLDetailsElement>(null);
  return <header className="cp-account-header">
    <a className="cp-account-brand" href="#cp-home">
      <CustomerImage src={logo} alt="" className="cp-account-logo" fallback={<span className="cp-account-logo cp-account-initials">{initials}</span>}/>
      <div className="cp-account-brand-copy">
        <span className="cp-account-platform"><Wordmark /></span>
        <h1>{business}</h1>
      </div>
    </a>
    <nav className="cp-account-nav" aria-label={c.home}>
      {rewards && <a href="#cp-rewards">{c.rewards}</a>}
      {offers && <a href="#cp-offers">{c.offers}</a>}
    </nav>
    <details className="cp-profile-menu" ref={menu} onKeyDown={event=>{
      if(event.key==="Escape" && menu.current){menu.current.open=false;menu.current.querySelector("summary")?.focus();}
    }}>
      <summary aria-label={c.profile}><UserRound size={18} aria-hidden="true"/><ChevronDown size={12} aria-hidden="true"/></summary>
      <div className="cp-profile-panel">
        <strong>{name}</strong>
        <div className="cp-future-cards"><Layers size={16} aria-hidden="true"/><span>{c.cards}<small>{c.soon}</small></span></div>
        {onLogout && <button type="button" onClick={()=>{if(menu.current)menu.current.open=false;onLogout();}}><LogOut size={15} aria-hidden="true"/>{customerPageContent[locale].logout}</button>}
      </div>
    </details>
  </header>;
}
