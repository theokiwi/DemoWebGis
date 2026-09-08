export interface SectorProperties { geocode:string; riskScore:number|null; riskBand:number|null; confidence:string; population:number; distance:any; offer:any; vulnerability:any; missingReasons:string[] }
export interface SectorFeature { type:'Feature'; id:string; geometry:any; properties:SectorProperties }
export interface FacilityFeature { type:'Feature'; id:string; geometry:{type:'Point';coordinates:[number,number]}; properties:{cnesId:string;name:string;categories:string[];servesSus:boolean} }
const json = async <T,>(path:string, signal?:AbortSignal):Promise<T> => { const response=await fetch(`/api${path}`,signal ? { signal } : undefined); if(!response.ok) throw new Error('Não foi possível carregar os dados. Tente novamente.'); return response.json(); };
export const api = {
  metadata: (signal?:AbortSignal) => json<any>('/metadata',signal),
  sectors: (view:string,categories:string[],signal?:AbortSignal) => json<{type:string;features:SectorFeature[]}>(`/sectors?view=${encodeURIComponent(view)}&categories=${encodeURIComponent(categories.join(','))}`,signal),
  facilities: (view:string,categories:string[],signal?:AbortSignal) => json<{type:string;features:FacilityFeature[]}>(`/facilities?view=${encodeURIComponent(view)}&categories=${encodeURIComponent(categories.join(','))}`,signal),
  facility: (id:string,signal?:AbortSignal) => json<any>(`/facilities/${encodeURIComponent(id)}`,signal)
};
