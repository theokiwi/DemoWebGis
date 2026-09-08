export const facilities = [
  { cnesId: '2695571', name: 'Centro de Saúde Serra', categories: ['Centro de saúde'], servesSus: true, active: true, address: 'Rua do Ouro, Serra', position: [-43.923, -19.943] },
  { cnesId: '0027049', name: 'Hospital Metropolitano', categories: ['Hospital'], servesSus: true, active: true, address: 'Av. do Contorno, Centro', position: [-43.938, -19.924] },
  { cnesId: '9001003', name: 'Clínica Pampulha', categories: ['Clínica'], servesSus: false, active: true, address: 'Av. Portugal, Pampulha', position: [-43.976, -19.858] },
  { cnesId: '2219982', name: 'UPA Nordeste', categories: ['Urgência'], servesSus: true, active: true, address: 'Av. Cristiano Machado, Nordeste', position: [-43.928, -19.895] }
];

const sectorShapes = [
  [[-43.997,-19.950],[-43.968,-19.951],[-43.958,-19.932],[-43.969,-19.912],[-44.001,-19.916],[-44.010,-19.935],[-43.997,-19.950]],
  [[-43.968,-19.951],[-43.938,-19.956],[-43.925,-19.938],[-43.932,-19.916],[-43.958,-19.932],[-43.968,-19.951]],
  [[-43.969,-19.912],[-43.958,-19.932],[-43.932,-19.916],[-43.926,-19.894],[-43.949,-19.882],[-43.974,-19.891],[-43.969,-19.912]],
  [[-44.001,-19.916],[-43.969,-19.912],[-43.974,-19.891],[-43.967,-19.868],[-43.998,-19.858],[-44.019,-19.878],[-44.001,-19.916]],
  [[-43.974,-19.891],[-43.949,-19.882],[-43.926,-19.894],[-43.910,-19.878],[-43.918,-19.852],[-43.945,-19.844],[-43.967,-19.868],[-43.974,-19.891]]
];
const polygon = (index: number) => ({ type: 'Polygon', coordinates: [sectorShapes[index]] });
const baseSectors = {
  type: 'FeatureCollection',
  features: [
    ['310620005010001', .91, 5, 2850, 1180, .31, .08],
    ['310620005010002', .73, 4, 4200, 1540, .26, .12],
    ['310620005010003', .52, 3, 3650, 2110, .19, .18],
    ['310620005010004', .32, 2, 5100, 2870, .15, .23],
    ['310620005010005', .14, 1, 4750, 3960, .11, .27]
  ].map(([geocode,riskScore,riskBand,population,income,children,older], index) => ({
    type: 'Feature', id: geocode, geometry: polygon(index),
    properties: { geocode, riskScore, riskBand, confidence: 'complete', population,
      distance: { straightLineM: 420 + index*310, walkingM: 610 + index*390, transitMinutes: 12 + index*7,
        straightLineDestinationCnesId: facilities[index % facilities.length]!.cnesId,
        walkingDestinationCnesId: facilities[(index+1) % facilities.length]!.cnesId,
        transitDestinationCnesId: facilities[(index+2) % facilities.length]!.cnesId, score: riskScore },
      offer: { reachable15m: Math.max(0,3-index), reachable30m: 5-index, reachable45m: 7-index, densityPer10000: (5-index)*10000/(population as number), riskScore },
      vulnerability: { responsiblePersonMedianIncomeBrl: income, incomeProxyScore: 1-index/4, childrenShare: children, olderPeopleShare: older, score: riskScore },
      missingReasons: [] }
  }))
};

type View = 'sus' | 'total';
const centers: [number, number][] = [
  [-43.985,-19.932],[-43.946,-19.937],[-43.951,-19.904],[-43.992,-19.883],[-43.938,-19.868]
];

function percentile(values: number[], invert = false) {
  if (values.length === 1) return [0.5];
  return values.map(value => {
    const below = values.filter(candidate => candidate < value).length;
    const equal = values.filter(candidate => candidate === value).length;
    const averageRank = below + (equal + 1) / 2;
    const score = (averageRank - 1) / (values.length - 1);
    return invert ? 1 - score : score;
  });
}

function haversineMeters([lng1,lat1]:[number,number],[lng2,lat2]:[number,number]) {
  const radians = (degrees:number) => degrees * Math.PI / 180;
  const dLat=radians(lat2-lat1), dLng=radians(lng2-lng1);
  const a=Math.sin(dLat/2)**2+Math.cos(radians(lat1))*Math.cos(radians(lat2))*Math.sin(dLng/2)**2;
  return 6_371_000*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

function nearest<T>(items:{facility:typeof facilities[number];value:T}[], numeric:(value:T)=>number) {
  return [...items].sort((a,b)=>numeric(a.value)-numeric(b.value)||a.facility.cnesId.localeCompare(b.facility.cnesId))[0] ?? null;
}

export function eligibleFacilities(view: View, categories: string[]) {
  const wanted=new Set(categories);
  return facilities.filter(item=>item.active&&(view==='total'||item.servesSus)&&(!wanted.size||item.categories.some(category=>wanted.has(category))));
}

export function sectorsForFilter(view: View, categories: string[]) {
  const eligible=eligibleFacilities(view,categories);
  const raw=baseSectors.features.map((feature,index)=>{
    const candidates=eligible.map((facility,facilityIndex)=>{
      const straight=haversineMeters(centers[index]!,facility.position as [number,number]);
      const walking=straight*(1.12+((index+facilityIndex)%3)*.12);
      const transit=4+straight/(210+facilityIndex*35)+((index*3+facilityIndex*2)%7);
      return {facility,value:{straight,walking,transit}};
    });
    const straight=nearest(candidates,value=>value.straight);
    const walking=nearest(candidates,value=>value.walking);
    const transit=nearest(candidates,value=>value.transit);
    const times=candidates.map(candidate=>candidate.value.transit);
    return {feature,straight,walking,transit,reachable15:times.filter(value=>value<=15).length,reachable30:times.filter(value=>value<=30).length,reachable45:times.filter(value=>value<=45).length};
  });
  if (!eligible.length) return { type:'FeatureCollection', features:baseSectors.features.map(feature=>({ ...feature, properties:{...feature.properties,riskScore:null,riskBand:null,confidence:'unclassified',distance:{straightLineM:null,walkingM:null,transitMinutes:null,straightLineDestinationCnesId:null,walkingDestinationCnesId:null,transitDestinationCnesId:null,score:null},offer:{reachable15m:0,reachable30m:0,reachable45m:0,densityPer10000:0,riskScore:null},missingReasons:['no_eligible_facilities']} })) };
  const straightScores=percentile(raw.map(item=>item.straight!.value.straight));
  const walkingScores=percentile(raw.map(item=>item.walking!.value.walking));
  const transitScores=percentile(raw.map(item=>item.transit!.value.transit));
  const densities=raw.map(item=>item.reachable30*10_000/(item.feature.properties.population as number));
  const offerScores=percentile(densities,true);
  const scores=raw.map((item,index)=>(straightScores[index]!+walkingScores[index]!+transitScores[index]!)/9+offerScores[index]!/3+(item.feature.properties.vulnerability.score as number)/3);
  const ordered=[...scores].sort((a,b)=>a-b);
  const bands=scores.map(score=>Math.min(5,Math.floor(ordered.indexOf(score)*5/scores.length)+1));
  return {type:'FeatureCollection',features:raw.map((item,index)=>({ ...item.feature,properties:{...item.feature.properties,riskScore:scores[index],riskBand:bands[index],confidence:'complete',distance:{straightLineM:Math.round(item.straight!.value.straight),walkingM:Math.round(item.walking!.value.walking),transitMinutes:Math.round(item.transit!.value.transit),straightLineDestinationCnesId:item.straight!.facility.cnesId,walkingDestinationCnesId:item.walking!.facility.cnesId,transitDestinationCnesId:item.transit!.facility.cnesId,score:(straightScores[index]!+walkingScores[index]!+transitScores[index]!)/3},offer:{reachable15m:item.reachable15,reachable30m:item.reachable30,reachable45m:item.reachable45,densityPer10000:densities[index],riskScore:offerScores[index]},missingReasons:[]}}))};
}

export const sectors = sectorsForFilter('sus', []);
