import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { eligibleFacilities, facilities, sectorsForFilter } from './fixtures.js';

function parseFilter(query: { view?: string; categories?: string }) {
  const view=query.view??'sus';
  if (view!=='sus'&&view!=='total') throw Object.assign(new Error('view deve ser sus ou total'),{statusCode:400});
  const categories=query.categories?.split(',').map(value=>value.trim()).filter(Boolean)??[];
  if (categories.length>20) throw Object.assign(new Error('No máximo 20 categorias são permitidas'),{statusCode:400});
  return {view,categories} as const;
}

export function buildServer() {
  const app = Fastify({ logger: { redact: ['req.headers.authorization', 'req.query'] }, bodyLimit: 64_000, requestIdHeader: 'x-request-id' });
  app.register(cors, { origin: ['http://localhost:5173'] });
  app.register(helmet, { contentSecurityPolicy: false });
  app.register(rateLimit, { max: 120, timeWindow: '1 minute' });
  app.setErrorHandler((error: Error & { statusCode?: number }, request, reply) => reply.status(error.statusCode ?? 500).type('application/problem+json').send({
    type: 'about:blank', title: (error as any).statusCode ? 'Requisição inválida' : 'Erro interno', status: (error as any).statusCode ?? 500,
    detail: error.statusCode ? error.message : 'Não foi possível concluir a solicitação.', instance: request.id
  }));
  app.get('/health/live', async () => ({ status: 'ok' }));
  app.get('/health/ready', async () => ({ status: 'ready', edition: 'fixture-2026-09' }));
  app.get('/metadata', async () => ({ edition: { id: '11111111-1111-4111-8111-111111111111', label: 'Fixture sintética', extractedAt: '2026-09-08T12:00:00Z', publishedAt: '2026-09-08T12:00:00Z' }, methodology: { version: '1.0.0', incomeProxyVariable: 'V06006', normalizationMethod: 'empirical_percentile_average_rank', bands: 5, weights: { distance: 1/3, offer: 1/3, vulnerability: 1/3 } }, categories: ['Centro de saúde','Hospital','Clínica','Urgência'] }));
  app.get<{ Querystring: { view?: string; categories?: string } }>('/sectors', async (request, reply) => {
    const filter=parseFilter(request.query);
    return reply.header('etag', `"fixture-2026-09-${filter.view}-${filter.categories.sort().join('.')}"`).send(sectorsForFilter(filter.view,filter.categories));
  });
  app.get<{ Params: { geocode: string } }>('/sectors/:geocode', async (request, reply) => {
    const found = sectorsForFilter('sus',[]).features.find((feature) => feature.properties.geocode === request.params.geocode);
    return found ?? reply.status(404).send({ type: 'about:blank', title: 'Setor não encontrado', status: 404 });
  });
  app.get<{ Querystring: { view?: string; categories?: string } }>('/facilities', async (request) => {
    const filter=parseFilter(request.query);
    return { type: 'FeatureCollection', features: eligibleFacilities(filter.view,filter.categories).map((item) => ({ type: 'Feature', id: item.cnesId, geometry: { type: 'Point', coordinates: item.position }, properties: { cnesId: item.cnesId, name: item.name, categories: item.categories, servesSus: item.servesSus } })) };
  });
  app.get<{ Params: { cnesId: string } }>('/facilities/:cnesId', async (request, reply) => facilities.find((item) => item.cnesId === request.params.cnesId) ?? reply.status(404).send({ type: 'about:blank', title: 'Estabelecimento não encontrado', status: 404 }));
  return app;
}

if (process.env.NODE_ENV !== 'test') buildServer().listen({ port: Number(process.env.PORT ?? 3333), host: '0.0.0.0' });
