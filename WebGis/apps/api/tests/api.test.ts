import { afterAll, describe, expect, it } from 'vitest';
import { buildServer } from '../src/server.js';
const app = buildServer();
afterAll(() => app.close());
describe('API', () => {
  it('publica metadata e GeoJSON', async () => {
    expect((await app.inject({ url: '/metadata' })).statusCode).toBe(200);
    const response = await app.inject({ url: '/sectors' });
    expect(response.headers['etag']).toContain('fixture-2026-09-sus');
    expect(response.json().type).toBe('FeatureCollection');
  });
  it('filtra SUS e não vaza erro interno', async () => {
    const response = await app.inject({ url: '/facilities?view=sus' });
    expect(response.json().features.every((feature: any) => feature.properties.servesSus)).toBe(true);
    expect((await app.inject({ url: '/facilities/inexistente' })).statusCode).toBe(404);
  });
  it('filtra categorias e recalcula o risco sem alterar vulnerabilidade', async () => {
    const all=(await app.inject({url:'/sectors?view=sus'})).json();
    const hospital=(await app.inject({url:'/sectors?view=sus&categories=Hospital'})).json();
    const points=(await app.inject({url:'/facilities?view=sus&categories=Hospital'})).json();
    expect(points.features).toHaveLength(1);
    expect(points.features[0].properties.categories).toContain('Hospital');
    expect(hospital.features.some((feature:any,index:number)=>feature.properties.riskScore!==all.features[index].properties.riskScore)).toBe(true);
    expect(hospital.features.map((feature:any)=>feature.properties.vulnerability)).toEqual(all.features.map((feature:any)=>feature.properties.vulnerability));
  });
  it('distingue recorte vazio e rejeita view inválida', async () => {
    const empty=(await app.inject({url:'/sectors?categories=Inexistente'})).json();
    expect(empty.features.every((feature:any)=>feature.properties.confidence==='unclassified'&&feature.properties.missingReasons.includes('no_eligible_facilities'))).toBe(true);
    expect((await app.inject({url:'/facilities?view=qualquer'})).statusCode).toBe(400);
  });
});
