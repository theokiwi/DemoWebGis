---
description: "Tarefas para o mapa de risco de acesso à saúde"
---

# Tarefas: Mapa de Risco de Acesso à Saúde

**Entrada**: documentos em `specs/001-map-health-access-risk/`

**Testes**: obrigatórios para cálculo, publicação, filtros, detalhes, acessibilidade e jornadas responsivas.

## Fase 1: Preparação

**Objetivo**: criar o monorepo, ferramentas e ambientes reproduzíveis.

- [ ] T001 Criar workspaces e scripts raiz para web, API, pacotes, lint, typecheck, testes e build em package.json
- [ ] T002 [P] Configurar TypeScript estrito compartilhado e referências dos workspaces em tsconfig.base.json
- [ ] T003 [P] Configurar lint e formatação para TypeScript, React, testes e YAML em eslint.config.js
- [ ] T004 Inicializar React 19.2, Vite 8 e React Leaflet 5 em apps/web/package.json
- [ ] T005 Inicializar Fastify 5, TypeBox e driver PostgreSQL em apps/api/package.json
- [ ] T006 [P] Inicializar pacotes domain, contracts, db, data-pipeline, routing e test-fixtures em packages/package.json
- [ ] T007 [P] Configurar projetos Vitest unitário e integração em vitest.workspace.ts
- [ ] T008 [P] Configurar projetos Playwright para Chromium, Firefox, WebKit e viewport móvel em playwright.config.ts
- [ ] T009 Configurar PostgreSQL/PostGIS e OpenTripPlanner locais com checks de saúde em infra/compose.yaml

**Checkpoint**: dependências instalam e workspaces executam lint, typecheck e testes vazios.

---

## Fase 2: Fundação Bloqueante

**Objetivo**: estabelecer contratos, banco, domínio mínimo, publicação de dados e API segura usados por todas as histórias.

- [ ] T010 [P] Escrever testes falhos de exemplos completos e propriedades adicionais do OpenAPI em apps/api/tests/contract/openapi-examples.test.ts
- [ ] T011 Gerar esquemas TypeBox e tipos TypeScript a partir do contrato OpenAPI em packages/contracts/src/http.ts
- [ ] T012 [P] Definir tipos e portas puras de edição, setor, estabelecimento, rota e risco em packages/domain/src/model.ts
- [ ] T013 [P] Criar fixtures sintéticas versionadas de setores, estabelecimentos, categorias, OSM e GTFS em packages/test-fixtures/data/manifest.json
- [ ] T014 [P] Escrever testes falhos de validação, proveniência, ausências e publicação atômica em packages/data-pipeline/tests/import-publication.test.ts
- [ ] T015 [P] Escrever testes falhos de arquivos excessivos, compactação abusiva, formatos e geometrias maliciosas em packages/data-pipeline/tests/source-security.test.ts
- [ ] T016 [P] Escrever testes falhos de checksum, licença, calendário, cobertura e integridade OSM/GTFS em packages/data-pipeline/tests/routing-sources.test.ts
- [ ] T017 Escrever migração inicial com extensões, enums, tabelas, constraints e chaves do modelo em packages/db/migrations/001_initial.sql
- [ ] T018 Criar índices GiST/B-tree, visão da edição ativa e privilégios read-only da API em packages/db/migrations/002_indexes_views_roles.sql
- [ ] T019 Implementar pool, transações e health checks do PostgreSQL em packages/db/src/client.ts
- [ ] T020 [P] Implementar validação de manifesto, checksum, limites e relatório de qualidade em packages/data-pipeline/src/validation.ts
- [ ] T021 Implementar staging e máquina de estados de publicação/rollback de edições em packages/data-pipeline/src/publication.ts
- [ ] T022 Implementar limites comprimidos/expandidos, allowlist e extração segura de fontes em packages/data-pipeline/src/security.ts
- [ ] T023 [P] Implementar importador de extrato OSM com checksum, cobertura e licença em packages/data-pipeline/src/sources/osm.ts
- [ ] T024 [P] Implementar importador GTFS com calendário, horários, paradas e integridade referencial em packages/data-pipeline/src/sources/gtfs.ts
- [ ] T025 Implementar persistência de artefatos, grafos e cobertura de roteamento por edição em packages/db/src/repositories/routing-datasets.ts
- [ ] T026 Implementar construção versionada do grafo OTP somente com fontes válidas em packages/routing/src/build-graph.ts
- [ ] T027 [P] Escrever testes falhos de contrato, timeout, ausência de rota e matriz OTP em packages/routing/tests/open-trip-planner.test.ts
- [ ] T028 Implementar adaptador OpenTripPlanner após T027, com timeout, retry limitado e códigos de ausência em packages/routing/src/open-trip-planner.ts
- [ ] T029 Implementar matrizes versionadas para a edição e para fixtures, usando terça útil, 08:00–10:00, intervalos de 15 minutos e mediana em packages/routing/src/build-matrix.ts
- [ ] T030 [P] Escrever testes falhos de bbox abusiva, categorias excessivas, SQL injection, privilégios e rate limit em apps/api/tests/security/api-abuse.test.ts
- [ ] T031 Configurar servidor Fastify, validação/serialização, CORS, limites e cabeçalhos defensivos em apps/api/src/server.ts
- [ ] T032 [P] Implementar respostas RFC 9457 sem detalhes internos e request ID em apps/api/src/plugins/errors.ts
- [ ] T033 [P] Implementar logs estruturados com redação de parâmetros e métricas básicas em apps/api/src/plugins/observability.ts
- [ ] T034 Criar endpoint de metadata e health checks conforme OpenAPI em apps/api/src/routes/metadata.ts

**Checkpoint**: fixture publicada atomicamente, edição ativa consultável e dados inválidos rejeitados sem alterar a edição anterior.

---

## Fase 3: História de Usuário 1 — Identificar regiões de maior risco (P1) 🎯 MVP

**Objetivo**: exibir setores classificados, decomposição do índice e tabela equivalente.

**Teste independente**: abrir a edição sintética, identificar os cinco setores de maior risco e consultar os componentes no mapa e na tabela.

### Testes da História 1

- [ ] T035 [P] [US1] Escrever testes falhos de posto percentílico, posto médio, inversão, caso n=1, pesos, densidade 30 minutos, quintis e empates promovidos em packages/domain/tests/risk-calculator.test.ts
- [ ] T036 [P] [US1] Escrever testes falhos de V06006 invertida, idades e confiança complete/partial/unclassified em packages/domain/tests/vulnerability.test.ts
- [ ] T037 [P] [US1] Escrever testes falhos das três distâncias com destinos independentes, desempate por CNES, cenário temporal, mediana e cobertura em packages/domain/tests/distance.test.ts
- [ ] T038 [P] [US1] Escrever testes falhos do contrato GET /sectors e GET /sectors/{geocode} em apps/api/tests/contract/sectors.test.ts
- [ ] T039 [P] [US1] Escrever teste Playwright falho da jornada mapa–tabela–decomposição em apps/web/tests/e2e/risk-overview.spec.ts

### Implementação da História 1

- [ ] T040 [P] [US1] Implementar indicadores de vulnerabilidade com proxy V06006 invertida e regras de ausência em packages/domain/src/vulnerability.ts
- [ ] T041 [P] [US1] Implementar composição das três medidas e seleção independente de destino por modalidade em packages/domain/src/distance.ts
- [ ] T042 [US1] Implementar densidade alcançável em 15/30/45 minutos, índice final e quintis com empates promovidos em packages/domain/src/risk-calculator.ts
- [ ] T043 [US1] Implementar importadores IBGE de malha, população, renda e faixas etárias em packages/data-pipeline/src/sources/ibge.ts
- [ ] T044 [US1] Implementar repositório de setores, bbox, GeoJSON WGS84 e resultados por edição em packages/db/src/repositories/sectors.ts
- [ ] T045 [US1] Implementar GET /sectors e GET /sectors/{geocode} com ETag e edição ativa em apps/api/src/routes/sectors.ts
- [ ] T046 [P] [US1] Criar cliente tipado de metadata e setores com cancelamento de requisições em apps/web/src/features/health-access/api/client.ts
- [ ] T047 [P] [US1] Criar mapa Leaflet com polígonos, legenda acessível e seleção em apps/web/src/features/health-access/map/RiskMap.tsx
- [ ] T048 [P] [US1] Criar tabela semântica ordenável equivalente ao mapa em apps/web/src/features/health-access/table/SectorTable.tsx
- [ ] T049 [US1] Integrar mapa, tabela, resumo textual, fontes e painel de decomposição em apps/web/src/features/health-access/HealthAccessPage.tsx

**Checkpoint**: US1 funciona isoladamente e passa os casos dourados do cálculo.

---

## Fase 4: História de Usuário 2 — Explorar estabelecimentos por categoria (P2)

**Objetivo**: alternar SUS/total e filtrar categorias recalculando pontos e risco.

**Teste independente**: selecionar categorias nas duas visões e confirmar que distância, oferta, pontuação e faixa mudam sem alterar vulnerabilidade.

### Testes da História 2

- [ ] T050 [P] [US2] Escrever testes falhos de elegibilidade SUS/total e chave canônica de categorias em packages/domain/tests/offer-filter.test.ts
- [ ] T051 [P] [US2] Escrever testes falhos do contrato GET /facilities com bbox, visão, categoria e cursor em apps/api/tests/contract/facilities.test.ts
- [ ] T052 [P] [US2] Escrever testes falhos de consultas PostGIS filtradas e isolamento por edição em apps/api/tests/integration/filtered-risk.test.ts
- [ ] T053 [P] [US2] Escrever teste Playwright falho de filtros, recálculo, vazio e restauração em apps/web/tests/e2e/filters.spec.ts

### Implementação da História 2

- [ ] T054 [P] [US2] Implementar importador CNES, situação ativa, vínculo SUS e categorias em packages/data-pipeline/src/sources/cnes.ts
- [ ] T055 [US2] Implementar elegibilidade, união de categorias e chave canônica do filtro em packages/domain/src/offer-filter.ts
- [ ] T056 [US2] Implementar repositório de pontos e resultados filtrados/materializados em packages/db/src/repositories/facilities.ts
- [ ] T057 [US2] Implementar GET /facilities e recálculo limitado por visão/categorias em apps/api/src/routes/facilities.ts
- [ ] T058 [P] [US2] Criar controles nativos de visão SUS/total e categorias com estado na URL em apps/web/src/features/health-access/components/Filters.tsx
- [ ] T059 [P] [US2] Criar camada de pontos com nomes acessíveis, agrupamento e seleção por teclado/toque em apps/web/src/features/health-access/map/FacilityLayer.tsx
- [ ] T060 [US2] Integrar filtros, contagem, estado vazio, carregamento e marcador de análise filtrada em apps/web/src/features/health-access/state/useHealthAccessQuery.ts

**Checkpoint**: US2 não confunde resultados gerais, filtrados, SUS ou totais.

---

## Fase 5: História de Usuário 3 — Consultar detalhes de um estabelecimento (P3)

**Objetivo**: abrir detalhes públicos consistentes de qualquer ponto pelo mapa ou lista.

**Teste independente**: selecionar o mesmo ponto no mapa e na lista e comparar conteúdo, fonte e campos ausentes.

### Testes da História 3

- [ ] T061 [P] [US3] Escrever testes falhos do contrato GET /facilities/{cnesId}, 404 e campos nulos em apps/api/tests/contract/facility-detail.test.ts
- [ ] T062 [P] [US3] Escrever testes falhos de texto CNES hostil e allowlist GeoJSON em apps/api/tests/integration/facility-security.test.ts
- [ ] T063 [P] [US3] Escrever teste Playwright falho de detalhes por mapa/lista e retorno com estado preservado em apps/web/tests/e2e/facility-details.spec.ts

### Implementação da História 3

- [ ] T064 [US3] Implementar consulta parametrizada de detalhe e proveniência CNES em packages/db/src/repositories/facility-detail.ts
- [ ] T065 [US3] Implementar GET /facilities/{cnesId} com serialização allowlist em apps/api/src/routes/facility-detail.ts
- [ ] T066 [P] [US3] Criar lista pesquisável equivalente aos pontos em apps/web/src/features/health-access/table/FacilityList.tsx
- [ ] T067 [US3] Criar painel responsivo com foco gerenciado, fonte e ausências explícitas em apps/web/src/features/health-access/components/FacilityDetails.tsx

**Checkpoint**: US3 apresenta dados idênticos e seguros por mapa ou lista.

---

## Fase 6: História de Usuário 4 — Usar em diferentes dispositivos (P4)

**Objetivo**: garantir equivalência funcional em desktop, móvel, toque, teclado e zoom.

**Teste independente**: completar carregamento, filtros e detalhes a 320 px, 200% de zoom e somente por teclado.

### Testes da História 4

- [ ] T068 [P] [US4] Escrever testes Vitest falhos de foco, anúncios e modos mapa/tabela em apps/web/tests/unit/accessibility.test.tsx
- [ ] T069 [P] [US4] Escrever teste Playwright falho para teclado, saída do mapa e foco restaurado em apps/web/tests/e2e/keyboard.spec.ts
- [ ] T070 [P] [US4] Escrever teste Playwright falho para 320 px, toque e painel móvel em apps/web/tests/e2e/mobile.spec.ts
- [ ] T071 [P] [US4] Escrever teste Playwright falho com axe, zoom 200% e contraste semântico em apps/web/tests/e2e/accessibility.spec.ts

### Implementação da História 4

- [ ] T072 [P] [US4] Implementar shell responsivo sem rolagem horizontal e tokens de foco em apps/web/src/styles/health-access.css
- [ ] T073 [P] [US4] Implementar região de status anunciável para carregamento, erro e recálculo em apps/web/src/features/health-access/components/StatusRegion.tsx
- [ ] T074 [P] [US4] Implementar skip links, foco restaurado e saída explícita do mapa em apps/web/src/features/health-access/components/AccessibilityNavigation.tsx
- [ ] T075 [US4] Adaptar controles Leaflet, alvos de toque, padrões e redução de movimento em apps/web/src/features/health-access/map/map-accessibility.ts
- [ ] T076 [US4] Integrar layouts desktop/móvel e preferências de mapa/tabela em apps/web/src/features/health-access/HealthAccessPage.tsx

**Checkpoint**: US4 passa em todos os navegadores e viewports configurados.

---

## Fase 7: Polimento e Preocupações Transversais

- [ ] T077 [P] Documentar limites de confiança, ameaças, controles, evidências e riscos residuais em docs/threat-model.md
- [ ] T078 [P] Documentar campos, unidades, nulabilidade e geocódigos em docs/data-dictionary.md
- [ ] T079 [P] Documentar fórmula percentílica, V06006 como proxy contextual, destinos por modalidade, pesos, quintis, empates e limitações em docs/methodology.md
- [ ] T080 [P] Documentar IBGE, CNES, OSM, GTFS, competências, checksums, licenças e atribuições em docs/sources-and-licenses.md
- [ ] T081 [P] Documentar ingestão, publicação, rollback e recuperação em docs/publication-runbook.md
- [ ] T082 Implementar limites de bbox, timeout SQL, paginação, cache por edição e métricas p95 em apps/api/src/plugins/performance.ts
- [ ] T083 [P] Adicionar testes de carga do recorte e filtros mais custosos em apps/api/tests/performance/sectors-load.test.ts
- [ ] T084 [P] Adicionar teste dedicado contra fixture OpenTripPlanner real em packages/routing/tests/open-trip-planner.integration.test.ts
- [ ] T085 Executar revisão manual de leitor de tela, teclado, toque e contraste em specs/001-map-health-access-risk/accessibility-review.md
- [ ] T086 Executar avaliação com pessoas nas tarefas do CS-002 e registrar amostra, protocolo, tempos e taxa de sucesso em specs/001-map-health-access-risk/usability-report.md
- [ ] T087 Executar o guia completo e registrar evidências em specs/001-map-health-access-risk/validation-report.md
- [ ] T088 Atualizar instalação, execução, testes e arquitetura em README.md

## Dependências e Ordem

```text
Preparação → Fundação → US1 (MVP) → US2
                      ├───────────→ US3
                      └───────────→ US4 (consolida US1–US3)
US1 + US2 + US3 + US4 → Polimento
```

- US2 depende do contrato de risco da US1, mas filtros e contratos usam fixtures isoladas.
- US3 pode avançar após a fundação usando fixture CNES; integra-se ao importador da US2.
- US4 testa e consolida os componentes das histórias incluídas na entrega.
- Em cada história: testes falham primeiro; domínio precede persistência, API e interface.

## Oportunidades Paralelas

- **US1**: T035–T039; depois T040/T041 e T047/T048.
- **US2**: T050–T053; depois T054/T058/T059.
- **US3**: T061–T063; depois T064/T066.
- **US4**: T068–T071; depois T072–T074.
- **Polimento**: T077–T081, T083 e T084.

## Estratégia de Implementação

### MVP

Concluir Fases 1–3 para entregar classificação territorial, decomposição e equivalência mapa/tabela com dados fixture.

### Incrementos

1. US1: risco e decomposição.
2. US2: SUS/total e categorias.
3. US3: detalhes dos estabelecimentos.
4. US4: matriz completa de acessibilidade e dispositivos.
5. Fase 7: desempenho, documentação, avaliação com pessoas e evidências.

## Notas

- Tarefas `[P]` nunca alteram o mesmo arquivo simultaneamente.
- E2E usa stub OTP determinístico; T084 valida o adaptador real separadamente.
- Cada tarefa termina com lint, typecheck e testes diretamente afetados passando.
