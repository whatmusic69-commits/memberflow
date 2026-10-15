"use client";
import { useId, useState } from "react";
import type { Locale } from "@/content";
import { businessFieldsContent } from "@/content/business-fields";
import { emptyWeek, parseOpeningHours, formatOpeningHours, type DayHours } from "./opening-hours-model";
export function OpeningHoursField({value,onChange,locale}: {value:string;onChange:(value:string)=>void;locale:Locale}) {
 const c=businessFieldsContent[locale],id=useId();
 const [model,setModel]=useState(()=>({source:value,rows:parseOpeningHours(value)??emptyWeek(),editing:parseOpeningHours(value)!==null}));
 if(model.source!==value)setModel({source:value,rows:parseOpeningHours(value)??emptyWeek(),editing:parseOpeningHours(value)!==null});
 function update(rows:DayHours[]){const source=formatOpeningHours(rows,locale);setModel({source,rows,editing:true});onChange(source);}
 return <fieldset className="mf-opening-hours"><legend>{c.hours}</legend>{!model.editing?<><p className="mf-field-help">{c.legacy}</p><p className="mf-hours-legacy">{value}</p><button type="button" className="button" onClick={()=>{setModel({...model,editing:true});}}>{c.editDays}</button></>:<>
 {model.rows.map((row,i)=><div className="mf-hours-day" key={i}><label className="mf-hours-toggle"><input type="checkbox" checked={row.open} onChange={e=>update(model.rows.map((r,j)=>i===j?{...r,open:e.target.checked}:r))}/><span>{c.days[i]}</span></label>{row.open?<div className="mf-hours-times"><label htmlFor={`${id}-${i}-from`}><span>{c.from}</span><input id={`${id}-${i}-from`} aria-label={`${c.days[i]} · ${c.from}`} type="time" required value={row.from} onChange={e=>update(model.rows.map((r,j)=>i===j?{...r,from:e.target.value}:r))}/></label><span className="mf-hours-separator" aria-hidden="true">—</span><label htmlFor={`${id}-${i}-to`}><span>{c.to}</span><input id={`${id}-${i}-to`} aria-label={`${c.days[i]} · ${c.to}`} type="time" required value={row.to} ref={node=>{node?.setCustomValidity(row.from&&row.to===row.from?c.sameTime:"");}} onChange={e=>update(model.rows.map((r,j)=>i===j?{...r,to:e.target.value}:r))}/></label>{row.from&&row.to&&row.to<row.from&&<small>{c.nextDay}</small>}</div>:<span className="mf-hours-closed">{c.closed}</span>}</div>)}
 <button type="button" className="mf-text-link" onClick={()=>{const source=model.rows.find(r=>r.open)??{open:true,from:"09:00",to:"18:00"};update(model.rows.map((r,i)=>i<5?{...source,open:true}:r));}}>{c.weekdays}</button></>}
 </fieldset>;
}
