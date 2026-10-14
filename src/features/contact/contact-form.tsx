"use client";
import { useRef, useState } from "react";
import { ArrowUpRight, Copy, Check } from "lucide-react";
import type { Locale } from "@/content";
import { contactContent } from "@/content/contact";
export function ContactForm({locale, recipient}: {locale: Locale; recipient: string | null}) {
  const c = contactContent[locale];
  const [name, setName] = useState(""), [email, setEmail] = useState(""), [business, setBusiness] = useState(""), [topic, setTopic] = useState("0"), [message, setMessage] = useState("");
  const [status, setStatus] = useState(""), [draft, setDraft] = useState(""), [busy, setBusy] = useState(false);
  const lock = useRef(false);
  function reset() {setStatus(""); setDraft("");}
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current || !name.trim() || !message.trim()) return;
    const enquiry = [`${c.name}: ${name.trim()}`, `${c.email}: ${email.trim()}`, ...(business.trim() ? [`${c.business}: ${business.trim()}`] : []), `${c.topic}: ${c.topics[Number(topic)]}`, "", message.trim()].join("\n");
    if (recipient) {
      window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(`${c.subject} — ${c.topics[Number(topic)]}`)}&body=${encodeURIComponent(enquiry)}`;
      setStatus(c.emailNote);
      return;
    }
    lock.current = true; setBusy(true);
    try {await navigator.clipboard.writeText(enquiry); setStatus(c.copied); setDraft("");}
    catch {setDraft(enquiry); setStatus(c.fallback);}
    finally {lock.current = false; setBusy(false);}
  }
  return <form className="contact-form" onSubmit={submit} onChange={reset}>
    <h2>{c.formTitle}</h2>
    <div className="contact-form-pair"><label><span>{c.name}</span><input name="name" autoComplete="name" required maxLength={120} value={name} onChange={e=>{setName(e.target.value); e.target.setCustomValidity(e.target.value.trim() ? "" : c.required);}} /></label><label><span>{c.email}</span><input type="email" name="email" autoComplete="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} /></label></div>
    <label><span>{c.business}</span><input name="organization" autoComplete="organization" maxLength={160} value={business} onChange={e=>setBusiness(e.target.value)} /></label>
    <label><span>{c.topic}</span><select name="topic" value={topic} onChange={e=>setTopic(e.target.value)}>{c.topics.map((text,index)=><option value={index} key={text}>{text}</option>)}</select></label>
    <label><span>{c.message}</span><textarea name="message" required rows={6} maxLength={4000} placeholder={c.placeholder} value={message} onChange={e=>{setMessage(e.target.value); e.target.setCustomValidity(e.target.value.trim() ? "" : c.required);}} /></label>
    <p className="contact-form-note">{recipient ? c.emailNote : c.draftNote}</p>
    <button className="button button-primary" disabled={busy}>{recipient ? c.openEmail : c.copy}{recipient ? <ArrowUpRight size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}</button>
    {status && <p className="contact-form-status" role="status">{status === c.copied && <Check size={16} aria-hidden="true" />}{status}</p>}
    {draft && <label><span>{c.prepared}</span><textarea readOnly rows={8} value={draft} onFocus={e=>e.target.select()} /></label>}
  </form>;
}
