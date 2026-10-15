/** Read-only browser geocoding adapter. No Symfony endpoint or business mutation. */
export interface AddressSuggestion {id:string;label:string;address:string;city:string;}
const cache=new Map<string, {at:number;items:AddressSuggestion[]}>();
export async function searchAddresses(query:string,kind:"city"|"address",city:string,country:string,locale:string,signal:AbortSignal):Promise<AddressSuggestion[]> {
 const search=new URLSearchParams({q:kind==="address"&&city?`${query}, ${city}`:query,limit:"6",lang:locale});
 if(/^[A-Z]{2}$/.test(country))search.set("countrycode",country);
 if(kind==="city"){search.append("layer","city");search.append("layer","locality");}
 const key=search.toString(),saved=cache.get(key);if(saved&&Date.now()-saved.at<300000)return saved.items;
 const response=await fetch(`https://photon.komoot.io/api/?${search}`,{signal,credentials:"omit",referrerPolicy:"no-referrer"});if(!response.ok)throw new Error("geocoding");
 const json=await response.json(),features:Array<{properties?:Record<string,unknown>}>=Array.isArray(json?.features)?json.features:[];
 const items:AddressSuggestion[]=[];
 for(const f of features){const p=f?.properties;if(!p)continue;const str=(key:string)=>typeof p[key]==="string"?String(p[key]):"";
 const town=str("city")||str("town")||str("village")||(kind==="city"?str("name"):"");
 const street=[str("street"),str("housenumber")].filter(Boolean).join(" ");
 const address=kind==="city"?town:street||str("name");if(!address)continue;
 const label=[...(str("name")&&str("name")!==address&&kind!=="city"?[str("name")]:[]),address,...(kind!=="city"&&town?[town]:[]),str("country")].filter(Boolean).join(", ");
 if(items.some(i=>i.label===label))continue;items.push({id:`${str("osm_type")}:${String(p.osm_id??label)}`,label,address,city:town});
 }
 if(cache.size>=100)cache.delete(cache.keys().next().value!);cache.set(key,{at:Date.now(),items});return items;
}
