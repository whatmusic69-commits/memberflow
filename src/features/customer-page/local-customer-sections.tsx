"use client";
import { Gift } from "lucide-react";
import type { Locale } from "@/content";
import { customerAccountContent } from "@/content/customer-account";
import { customerPageContent } from "@/content/customer-page";
import { dashboardContent } from "@/content/dashboard";
import { LoyaltyProgress } from "@/components/customer/loyalty-progress";
import { useMembershipJournal } from "@/features/prototype/membership-cards";
import { readLocalRecords } from "@/features/workspace/repository";

type Props={businessId:string;customerId:string;locale:Locale};
export function LocalCustomerLoyalty({businessId,customerId,locale}:Props){
  const journal=useMembershipJournal(businessId), c=customerPageContent[locale],a=customerAccountContent[locale];
  const programmes=readLocalRecords(businessId,"loyalty").filter(p=>!p.archived);
  const progress=journal.progress.filter(p=>p.businessId===businessId && p.customerId===customerId && programmes.some(programme=>programme.id===p.programmeId));
  const rewards=journal.rewards.filter(r=>r.businessId===businessId && r.customerId===customerId && r.status==="AVAILABLE");
  if(!progress.length && !rewards.length)return null;
  return <section id="cp-rewards" className="cp-section cp-account-loyalty">
    <h2 className="cp-label"><Gift size={15} aria-hidden="true"/>{c.loyalty}</h2>
    {progress.map(p=><article className="cp-loyalty-programme" key={p.id}>
      <h3>{programmes.find(programme=>programme.id===p.programmeId)?.name}</h3>
      {p.kind==="points" ? <><p className="cp-points">{a.points.replace("{current}",String(p.current)).replace("{target}",String(p.target))}</p><progress aria-label={c.loyalty} value={p.current} max={p.target}/></> : <LoyaltyProgress loyalty={{stamps:p.current,target:p.target,nextReward:p.reward}} progressLabel={c.progress}/>}
      {p.reward && <div className="cp-reward"><span>{c.nextReward}</span><strong>{p.reward}</strong></div>}
    </article>)}
    {rewards.length>0 && <div className="cp-available-rewards"><h3>{a.ready}</h3><ul>{rewards.map(reward=><li key={reward.id}><Gift size={16} aria-hidden="true"/>{reward.name}</li>)}</ul></div>}
  </section>;
}
export function LocalCustomerHistory({businessId,customerId,locale}:Props){
  const journal=useMembershipJournal(businessId),c=customerAccountContent[locale];
  const events=journal.events.filter(e=>e.businessId===businessId && e.customerId===customerId && Number.isFinite(Date.parse(e.occurredAt))).sort((a,b)=>b.occurredAt.localeCompare(a.occurredAt));
  if(!events.length)return null;
  const rows=(items:typeof events)=><ol className="cp-history-list">{items.map(event=><li key={event.id}><span>{dashboardContent[locale].eventCopy[event.type]}{event.detail && <small>{event.detail}</small>}</span><time dateTime={event.occurredAt}>{new Intl.DateTimeFormat(locale,{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}).format(new Date(event.occurredAt))}</time></li>)}</ol>;
  return <section className="cp-section cp-account-history"><h2 className="cp-label">{c.history}</h2>{rows(events.slice(0,5))}{events.length>5 && <details><summary>{c.allHistory}</summary>{rows(events.slice(5))}</details>}</section>;
}
