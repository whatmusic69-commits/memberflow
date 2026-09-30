import { ArrowDown, ArrowRight, Check, Coffee, QrCode, UserRound, Store, Scissors, Dumbbell, ShoppingBag, Wrench, Repeat2 } from 'lucide-react';
import Image from 'next/image';
import type { ReactNode } from 'react';
import type { GrowthContent } from '@/data/growth-content';
import { ChannelIcon, channels } from './campaign-flow';

export function StepSection({ t, index, children, id }: { t: GrowthContent; index: number; children: ReactNode; id?: string }) {
  const step = t.steps[index];
  return <section id={id} className={`mf-step mf-step-${index + 1}`}><div className="mf-container mf-step-grid"><div className="mf-step-copy"><p className="mf-label"><span>0{index + 1}</span> / {t.loop[index]}</p><h2>{step.title}</h2><p className="mf-description">{step.text}</p><p className="mf-step-note"><span />{step.note}</p></div><div className="mf-step-visual">{children}</div></div></section>;
}
export function CreateSection({ t }: { t: GrowthContent }) {
  return <StepSection t={t} index={0} id="product"><div className="mf-editor"><div className="mf-editor-top"><span className="mf-dot" />{t.editor[0]}<span>↗</span></div><div className="mf-editor-body"><p className="mf-label">{t.editor[1]}</p><div className="mf-type-list">{t.types.map((type, i) => <span className={i === 1 ? 'selected' : ''} key={type}>{type}</span>)}</div><div className="mf-editor-fields"><div className="mf-editor-image"><Image src="/latte.jpg" alt={t.coffee} fill sizes="220px" /></div><dl><dt>{t.editor[2]}</dt><dd>{t.coffee}</dd><dt>{t.editor[3]}</dt><dd>€3.90</dd><dt>{t.editor[4]}</dt><dd className="mf-reward">{t.stamps}</dd></dl></div><div className="mf-editor-bottom"><Check size={16} />{t.editor[5]}<ArrowRight size={17} /></div></div></div></StepSection>;
}
export function DistributionSection({ t }: { t: GrowthContent }) {
  return <StepSection t={t} index={1} id="integrations"><div className="mf-distribution"><div className="mf-source"><Coffee size={20}/><div><small>{t.distribution[0]}</small><strong>{t.coffee}</strong></div><ArrowDown size={18}/></div><div className="mf-output-grid">{channels.map((name, i) => <div className="mf-output" key={name}><ChannelIcon index={i}/><span className="mf-label">{i < 3 ? t.soon : t.live}</span><strong>{name}</strong><small>{t.formats[i]}</small></div>)}</div><div className="mf-google"><span>G</span><strong>Google Business</strong><small>{t.soon}</small></div></div></StepSection>;
}
export function AcquireSection({ t }: { t: GrowthContent }) {
  const icons = [<ChannelIcon key="social" index={0}/>, <Store key="store" size={23}/>, <QrCode key="qr" size={23}/>, <UserRound key="user" size={23}/>];
  return <StepSection t={t} index={2} id="journey"><div className="mf-acquire"><div className="mf-acquire-heading">Instagram / TikTok / Pinterest</div>{t.acquire.map((label, i) => <div className="mf-acquire-row" key={label}><span className="mf-acquire-index">0{i + 1}</span><span className="mf-acquire-icon">{icons[i]}</span><strong>{label}</strong>{i < 3 ? <ArrowDown size={16}/> : <Check size={16}/>}</div>)}<div className="mf-acquire-caption">DISCOVER → VISIT → JOIN</div></div></StepSection>;
}
export function RetainSection({ t }: { t: GrowthContent }) {
  return <StepSection t={t} index={3} id="automations"><div className="mf-wallet"><div className="mf-wallet-top"><Coffee size={24}/><strong>{t.business}</strong><WalletIcon/></div><p className="mf-label">{t.wallet[0]}</p><h3>{t.wallet[1]}</h3><div className="mf-stamp-row">{Array.from({length:6}, (_, i) => <span className={i < 4 ? 'filled' : ''} key={i}>{i < 4 ? <Coffee size={20}/> : <span/>}</span>)}</div><div className="mf-wallet-bottom"><span>{t.wallet[2]}</span><span>{t.wallet[3]}</span></div></div><div className="mf-retain-features">{t.retain.map(item => <span key={item}><Check size={14}/>{item}</span>)}</div></StepSection>;
}
function WalletIcon() { return <span className="mf-label">WALLET</span>; }
export function GrowthLoop({ t }: { t: GrowthContent }) {
  return <section className="mf-loop"><div className="mf-container"><div className="mf-loop-heading"><h2>{t.loopTitle}</h2><p>{t.loopText}</p></div><div className="mf-loop-track">{t.loop.map((item, i) => <div key={item}><small>0{i+1}</small><strong>{item}</strong>{i === 3 ? <Repeat2/> : <ArrowRight/>}</div>)}</div><div className="mf-loop-return" aria-hidden="true"><span>↖</span></div></div></section>;
}
const solutionIcons = [Coffee, Scissors, Dumbbell, ShoppingBag, Wrench];
export function Solutions({ t }: { t: GrowthContent }) {
  return <section id="solutions" className="mf-container mf-solutions"><div><p className="mf-label">MEMBERFLOW / {t.nav[1]}</p><h2>{t.solutionsTitle}</h2><p className="mf-description">{t.solutionsText}</p></div><div className="mf-solution-list">{t.solutions.map((item, i) => {const Icon = solutionIcons[i]; return <a href="/onboarding/business" key={item}><Icon size={22}/><span>{item}</span><ArrowRight size={20}/></a>;})}</div></section>;
}
export function FinalCTA({ t }: { t: GrowthContent }) {
  return <section className="mf-final"><div className="mf-container"><p className="mf-label">CREATE ONCE. GROW EVERYWHERE.</p><h2>{t.final}</h2><div><p>{t.finalText}</p><a className="mf-button" href="/onboarding/business">{t.start}<ArrowRight size={18}/></a></div></div></section>;
}
