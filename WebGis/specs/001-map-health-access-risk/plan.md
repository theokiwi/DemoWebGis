# Plano de Implementação: Mapa de Risco de Acesso à Saúde

**Branch**: `001-map-health-access-risk` | **Data**: 2026-09-08 | **Especificação**: [spec.md](spec.md)

**Entrada**: Especificação em `specs/001-map-health-access-risk/spec.md`

## Resumo

Construir uma aplicação web responsiva em React e TypeScript que apresenta, via
Leaflet, setores censitários de Belo Horizonte classificados por risco de acesso à
saúde e pontos do CNES filtráveis. Uma API REST em TypeScript/Fastify entregará
GeoJSON e detalhes a partir do PostgreSQL/PostGIS. Importadores versionados carregarão
IBGE, CNES, OpenStreetMap e GTFS; um processo analítico reproduzível pré-calculará
indicadores-base e usará consultas espaciais para recompor risco por visão de oferta
e categorias. OpenTripPlanner calculará matrizes de percurso a pé e transporte
público fora do caminho síncrono das requisições.

## Contexto Técnico

**Linguagem/versão**: TypeScript 7.x em modo estrito; Node.js 24 LTS

**Dependências principais**: React 19.2, Vite 8, Leaflet 1.9.4, React Leaflet 5.x,
Fastify 5.x, driver `pg`, JSON Schema/TypeBox, OpenTripPlanner 2.x

**Armazenamento**: PostgreSQL 18.6 com PostGIS 3.6.4; geometrias em SIRGAS 2000 para
preservação e projeção métrica local para cálculos; saída GeoJSON em WGS 84

**Testes**: Vitest para domínio, componentes e serviços; testes de integração da API
e PostGIS com Vitest; Playwright e `@axe-core/playwright` para jornadas, responsividade
e acessibilidade; casos dourados para cálculo do índice e rotas

**Plataforma-alvo**: Navegadores evergreen em desktop e dispositivos móveis; API e
processos de dados em Linux; layout funcional de 320 px até telas amplas

**Tipo de projeto**: Aplicação web com frontend, backend REST e pipeline de dados

**Metas de desempenho**: resposta percebida em até 2 s no p95 para filtros e detalhes;
GeoJSON inicial particionado por viewport/nível de detalhe; consultas espaciais
indexadas; processamento analítico pesado assíncrono e versionado

**Restrições**: Dados públicos e agregados; município 3106200; duas visões (SUS e
total); filtros recalculam o risco; cinco faixas relativas; equivalência entre mapa e
tabela; nenhuma dependência de roteamento ao vivo no caminho de leitura

**Escala/escopo**: Um município, milhares de setores e estabelecimentos, dezenas de
categorias, uma edição publicada por vez com histórico; acesso público predominantemente
de leitura

## Verificação da Constituição

*GATE: aprovado antes da Fase 0 e reavaliado após o desenho da Fase 1.*

- **Acessibilidade — APROVADO**: mapa é uma visualização complementar; tabela
  semântica expõe os mesmos setores, pontos, filtros e detalhes. Controles usam HTML
  nativo, foco visível, teclado, nomes acessíveis, padrões além de cor e alvos de toque.
  Leaflet preserva navegação por teclado; marcadores recebem nomes únicos. Playwright
  cobre teclado, 320 px, zoom de 200% e verificações automatizadas de acessibilidade.
- **Segurança — APROVADO**: API pública é somente leitura, parâmetros são validados por
  esquema e limitados, SQL é parametrizado, CORS é restrito e respostas têm cabeçalhos
  defensivos. Importações externas passam por validação de formato, tamanho, geometria,
  proveniência e staging antes da publicação atômica. Texto externo nunca é injetado
  como HTML nos popups.
- **Testes críticos — APROVADO**: domínio de normalização, pesos, quintis, empates,
  elegibilidade SUS/total, filtros, associação por geocódigo, ausências e matrizes de
  rota terá testes determinísticos. API/PostGIS terá testes de contrato e integração;
  as quatro jornadas críticas terão Playwright em desktop e móvel.
- **Documentação — APROVADO**: `research.md`, `data-model.md`, contrato OpenAPI,
  `quickstart.md`, dicionário de dados, metodologia, catálogo de fontes/licenças e
  runbook de publicação são entregáveis da funcionalidade.
- **Modularidade — APROVADO**: módulos de ingestão, roteamento, domínio analítico,
  persistência, API e apresentação dependem de contratos explícitos. O domínio não
  importa Fastify, React, Leaflet, PostGIS ou OpenTripPlanner.

**Reavaliação pós-desenho**: APROVADA. Modelo, contratos e validação mantêm os cinco
gates sem exceções.

## Arquitetura

```text
IBGE / CNES / OSM / GTFS
          │
          ▼
 pipelines de ingestão e validação ──► staging ──► edição publicada
          │                                  │
          └──► OpenTripPlanner ──► matrizes ─┘
                                             │
                                             ▼
                           PostgreSQL + PostGIS
                                             │
                                             ▼
                         API REST Fastify (GeoJSON/JSON)
                                             │
                          ┌──────────────────┴──────────────┐
                          ▼                                 ▼
                    Leaflet/mapa                 tabela acessível
                          └──────── React/TypeScript ───────┘
```

### Decisões de processamento

1. Cada arquivo-fonte gera uma `data_edition` imutável com checksum e relatório de
   qualidade. A troca da edição ativa ocorre em transação após validação completa.
2. Geometrias são validadas e indexadas com GiST. O GeoJSON público usa RFC 7946 e
   coordenadas WGS 84; o servidor nunca aceita SQL, nomes de coluna ou geometrias
   arbitrárias vindas da consulta.
3. Centro representativo do setor usa ponto garantidamente interno. Distância em linha
   reta usa PostGIS; caminhada e transporte usam matrizes produzidas pelo
   OpenTripPlanner com extrato OSM e GTFS versionados. O cenário usa terça-feira útil,
   partidas de 15 em 15 minutos entre 08:00 e 10:00 e a mediana dos tempos válidos.
   Cada modalidade minimiza seu próprio custo no conjunto elegível e conserva o CNES
   do destino; os destinos podem diferir e empates usam o menor CNES lexical.
4. Indicadores brutos e normalizados são persistidos por edição. A normalização usa
   posto percentílico empírico com posto médio nos empates e fórmula
   `(posto_médio - 1)/(n - 1)`. Indicadores de acesso usam o recorte de oferta ativo;
   os populacionais usam o conjunto municipal elegível da edição e permanecem
   estáveis entre filtros. Oferta e rendimento são invertidos.
   Para `n = 1`, usa-se 0,5 com aviso de comparação insuficiente. Combinações de visão
   e categoria frequentes são materializadas; combinações não materializadas são
   calculadas por consultas limitadas e podem ser armazenadas em cache com chave que
   inclui edição, visão e categorias ordenadas.
5. O frontend mantém filtros na URL e estado de seleção local. Dados remotos têm um
   único adaptador tipado; mapa e tabela consomem o mesmo modelo de apresentação.
6. A densidade principal conta estabelecimentos elegíveis alcançáveis em 30 minutos
   por transporte público por 10.000 habitantes; 15 e 45 minutos são preservados para
   sensibilidade. Estabelecimentos externos seguem a mesma regra de alcançabilidade.
7. A vulnerabilidade econômica usa exclusivamente `V06006` do dicionário IBGE de
   08/05/2026 (rendimento nominal mediano mensal das pessoas responsáveis com
   rendimentos), invertida após normalização. É proxy contextual, não taxa de pobreza
   nem renda domiciliar per capita, e essa limitação aparece na interface e documentação.

## Estrutura do Projeto

### Documentação desta funcionalidade

```text
specs/001-map-health-access-risk/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── openapi.yaml
└── tasks.md                 # gerado por $speckit-tasks
```

### Código-fonte

```text
apps/
├── api/
│   ├── src/
│   │   ├── routes/
│   │   ├── plugins/
│   │   └── server.ts
│   └── tests/
│       ├── contract/
│       └── integration/
└── web/
    ├── src/
    │   ├── app/
    │   ├── features/health-access/
    │   │   ├── api/
    │   │   ├── components/
    │   │   ├── map/
    │   │   ├── table/
    │   │   └── state/
    │   └── styles/
    └── tests/
        ├── unit/
        └── e2e/
packages/
├── contracts/              # esquemas e tipos compartilhados
├── domain/                 # índice, elegibilidade, normalização e faixas
├── data-pipeline/          # importadores e publicação de edições
├── routing/                # porta e adaptador OpenTripPlanner
├── db/                     # migrações, queries e repositórios PostGIS
└── test-fixtures/          # casos sintéticos e casos dourados
docs/
├── data-dictionary.md
├── methodology.md
├── sources-and-licenses.md
└── publication-runbook.md
infra/
└── compose.yaml
```

**Decisão estrutural**: monorepo npm workspaces, separando aplicações implantáveis de
pacotes puros. `packages/domain` concentra regras testáveis sem infraestrutura;
`packages/contracts` é a fonte única dos esquemas REST; adaptadores em `db`,
`data-pipeline` e `routing` implementam portas do domínio.

## Estratégia de Testes

- **Unitários/Vitest**: normalização percentílica, inversão de oferta e de `V06006`, pesos iguais,
  limites etários, ausências, quintis com empates, seleção SUS/total e categorias.
- **Componentes/Vitest**: filtros, legenda, estados de erro, painel de detalhes, tabela
  semântica, nomes acessíveis e preservação de estado.
- **Integração/Vitest**: migrações PostGIS, geocódigo, consultas por bbox, publicação
  atômica, isolamento por edição, GeoJSON válido e sanitização/serialização.
- **Contrato**: cada operação do `contracts/openapi.yaml`, incluindo limites, erros e
  propriedades nulas, é validada contra a implementação.
- **E2E/Playwright**: jornadas P1–P4 em viewport desktop e móvel; teclado, foco, zoom,
  tabela alternativa, filtros/recalculo, SUS/total, detalhes e falhas simuladas.
- **Dados**: fixtures pequenas com resultados calculados manualmente; checksum e
  relatório de qualidade bloqueiam publicação divergente.

## Segurança e Operação

- Limites máximos de `bbox`, categorias e tamanho de resposta; timeout de consulta e
  cancelamento de requisições obsoletas no cliente.
- Usuário de banco da API apenas com `SELECT` nas visões publicadas; usuário separado
  para migração/importação; segredos somente por ambiente.
- Logs estruturados sem endereços pessoais, parâmetros livres ou payload GeoJSON;
  métricas de latência, erros, tamanho de resposta, cache e edição ativa.
- Health checks separam processo vivo de prontidão do banco/edição publicada.
- Edição anterior permanece disponível para rollback transacional e auditoria.
- Dependências fixadas por lockfile e verificadas no pipeline; atribuições IBGE,
  CNES, PBH/GTFS e OpenStreetMap permanecem visíveis e documentadas.

### Modelo de Ameaças

| Limite de confiança | Ameaça principal | Controle exigido | Evidência |
|---|---|---|---|
| Arquivos IBGE/CNES/OSM/GTFS | arquivo excessivo, compactação abusiva, formato ou geometria maliciosa | allowlist de formatos/campos, limite comprimido e expandido, checksum, staging sem privilégios e validação geométrica | testes de segurança dos importadores e relatório da edição |
| Consultas REST | SQL injection, bbox/categorias excessivas e negação de serviço | schemas fechados, SQL parametrizado, limites, timeout, rate limit e usuário read-only | testes de abuso da API e métricas de rejeição |
| Texto externo no frontend | HTML/script em nomes, descrições ou fontes | serialização allowlist e criação de texto seguro sem `innerHTML` | teste de payload hostil e revisão de componentes |
| API ↔ PostgreSQL | escalada de privilégio e vazamento em logs | papel somente leitura, segredos por ambiente e redação de logs | teste de privilégios e inspeção automatizada de logs |
| Pipeline ↔ OpenTripPlanner | resposta adulterada, indisponível ou não reproduzível | rede restrita, timeout, checksum do grafo, validação da matriz e nenhum fallback silencioso | teste de contrato/integração e códigos de ausência |
| Publicação de edição | mistura de versões ou resultado parcial | chaves por edição, invariantes e troca transacional com rollback | teste de publicação atômica |

Riscos residuais — qualidade incompleta de OSM/GTFS/CNES e aproximação do tempo de
viagem — DEVEM aparecer na metodologia e no relatório de qualidade. Nenhuma ausência
pode ser transformada em zero ou ocultada por cache.

## Rastreamento de Complexidade

| Decisão | Por que é necessária | Alternativa mais simples rejeitada porque |
|---|---|---|
| Serviço OpenTripPlanner no pipeline | A especificação exige caminhada e transporte público combinados à distância linear | PostGIS isolado não interpreta horários GTFS, transferências e rede multimodal |
| Pré-cálculo e histórico de edições | Garante resposta p95, reprodutibilidade e rollback com fontes externas mutáveis | Roteamento e ingestão sob demanda tornariam resultados lentos e não reproduzíveis |
