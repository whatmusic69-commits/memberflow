import { businessFieldsContent } from "@/content/business-fields";
import type { Locale } from "@/content";
export interface DayHours {open:boolean;from:string;to:string;}
export const emptyWeek = ():DayHours[]=>Array.from({length:7},()=>({open:false,from:"09:00",to:"18:00"}));
const aliases=[['mon','monday','пн','понедельник','pr','pirmdiena'],['tue','tuesday','вт','вторник','ot','otrdiena'],['wed','wednesday','ср','среда','tr','trešdiena'],['thu','thursday','чт','четверг','ce','ceturtdiena'],['fri','friday','пт','пятница','pk','piektdiena'],['sat','saturday','сб','суббота','se','sestdiena'],['sun','sunday','вс','воскресенье','sv','svētdiena']];
const time=(v:string)=>/^([01]\d|2[0-3]):[0-5]\d$/.test(v);
export function parseOpeningHours(value:string):DayHours[]|null {
 const rows=emptyWeek();if(!value.trim())return rows;
 for(const line of value.split(/\n|;/).map(v=>v.trim()).filter(Boolean)) {
  const hours=line.match(/(\d{1,2}:\d{2})\s*(?:[-–—]|to|до|līdz)\s*(\d{1,2}:\d{2})/i);
  const closed=/closed|выходной|закрыто|slēgts/i.test(line);
  if(!hours&&!closed)return null;
  const prefix=(hours?line.slice(0,hours.index):line.replace(/closed|выходной|закрыто|slēgts/i,'')).trim().replace(/\s+с$/i,'').replace(/[:.]+$/,'');
  const range=prefix.split(/\s*[-–—]\s*/).map(v=>v.trim().toLowerCase().replace(/[.:]+$/,''));
  const start=aliases.findIndex(a=>a.includes(range[0])),end=range[1]?aliases.findIndex(a=>a.includes(range[1])):start;
  if(start<0||end<start)return null;
  const from=hours?.[1].padStart(5,'0')??'09:00',to=hours?.[2].padStart(5,'0')??'18:00';
  if(hours&&(!time(from)||!time(to)))return null;
  for(let i=start;i<=end;i++)rows[i]={open:!closed,from,to};
 }
 return rows;
}
export function formatOpeningHours(rows:DayHours[],locale:Locale) {
 const c=businessFieldsContent[locale];
 return rows.map((r,i)=>`${c.days[i]}: ${r.open?`${r.from}–${r.to}${r.to&&r.from&&r.to<r.from?' (+1)':''}`:c.closed}`).join('\n');
}
