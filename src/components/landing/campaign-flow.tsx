import Image from 'next/image';
import { Music2, WalletCards, ArrowUpRight, Coffee } from 'lucide-react';
import type { GrowthContent } from '@/data/growth-content';

export const channels = ['Instagram', 'TikTok', 'Pinterest', 'Apple Wallet'];
export function ChannelIcon({ index }: { index: number }) {
  if (index === 0) return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none"/></svg>;
  if (index === 1) return <Music2 size={20} />;
  if (index === 2) return <span className="mf-pinterest" aria-hidden="true">P</span>;
  return <WalletCards size={20} />;
}
export function CampaignCard({ t, priority = false }: { t: GrowthContent; priority?: boolean }) {
  return <article className="mf-campaign">
    <div className="mf-campaign-label"><span className="mf-dot" />{t.offer}<ArrowUpRight size={14} /></div>
    <div className="mf-coffee-photo"><Image src="/latte.jpg" alt={t.coffee} fill sizes="(max-width: 600px) 260px, 300px" priority={priority} /></div>
    <div className="mf-campaign-info"><h3>{t.coffee}</h3><div className="mf-price"><span>€3.90</span><span className="mf-stamps">{t.stamps}</span></div><div className="mf-business"><Coffee size={18} /><strong>{t.business}</strong><span>{t.city}</span></div></div>
  </article>;
}
export function CampaignFlow({ t }: { t: GrowthContent }) {
  return <div className="mf-flow" aria-label={t.example}>
    <div className="mf-annotation mf-annotation-create">{t.annotation[0]}<span aria-hidden="true">↘</span></div>
    <div className="mf-flow-card"><CampaignCard t={t} priority /></div>
    <svg className="mf-connectors" viewBox="0 0 580 500" preserveAspectRatio="none" fill="none" aria-hidden="true"><path d="M280 260H322Q338 260 338 244V123Q338 108 354 108H392M338 206H392M338 260V386Q338 402 354 402H392M338 304H392" /><circle cx="280" cy="260" r="4" /><circle className="mf-signal" cx="338" cy="260" r="4" /></svg>
    <div className="mf-destinations">{channels.map((name, index) => <div className="mf-destination" key={name} style={{ animationDelay: `${.7 + index * .18}s` }}><span className="mf-channel-icon"><ChannelIcon index={index} /></span><div><strong>{name}</strong><small>{t.formats[index]}</small></div><span className="mf-status" /></div>)}</div>
    <div className="mf-annotation mf-annotation-publish">{t.annotation[1]}<span aria-hidden="true">↗</span></div>
    <span className="mf-example">{t.example}</span>
  </div>;
}
