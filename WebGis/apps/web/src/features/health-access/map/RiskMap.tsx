import { useEffect } from 'react';
import { CircleMarker, GeoJSON, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import { geoJSON } from 'leaflet';
import type { FacilityFeature, SectorFeature } from '../api/client';
const colors=['','#d7eee1','#abd8bd','#f0cb78','#e98d55','#a83d36'];
function FitSectorBounds({ sectors }: { sectors: SectorFeature[] }) {
  const map = useMap();
  useEffect(() => {
    if (!sectors.length) return;
    const bounds = geoJSON({ type: 'FeatureCollection', features: sectors } as any).getBounds();
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [24, 24], maxZoom: 13 });
  }, [map, sectors]);
  return null;
}
export function RiskMap({sectors,facilities,selected,onSector,onFacility}:{sectors:SectorFeature[];facilities:FacilityFeature[];selected:string|null;onSector:(id:string)=>void;onFacility:(id:string)=>void}) {
  return <div className="map-wrap"><a className="map-exit" href="#sector-table">Sair do mapa e ir para a tabela</a><MapContainer center={[-19.92,-43.95]} zoom={12} scrollWheelZoom={false} aria-label="Mapa dos setores e estabelecimentos de saúde">
    <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
    <FitSectorBounds sectors={sectors}/>
    {sectors.map(feature=><GeoJSON key={feature.id} data={feature as any} eventHandlers={{click:()=>onSector(feature.id)}} style={{color:selected===feature.id?'#132f27':'#fff',weight:selected===feature.id?4:1,fillColor:feature.properties.riskBand?colors[feature.properties.riskBand]:'#b9c0bc',fillOpacity:.82}}><Popup><strong>Setor {feature.properties.geocode.slice(-4)}</strong><br/>{feature.properties.riskBand?`Risco ${feature.properties.riskBand} de 5`:'Sem classificação para este recorte'}</Popup></GeoJSON>)}
    {facilities.map(feature=><CircleMarker key={feature.id} center={[feature.geometry.coordinates[1],feature.geometry.coordinates[0]]} radius={8} pathOptions={{color:'#fff',weight:2,fillColor:'#163f5c',fillOpacity:1}} eventHandlers={{click:()=>onFacility(feature.id)}}><Popup><button className="popup-button" onClick={()=>onFacility(feature.id)}>{feature.properties.name}<br/><span>Ver detalhes</span></button></Popup></CircleMarker>)}
  </MapContainer></div>;
}
