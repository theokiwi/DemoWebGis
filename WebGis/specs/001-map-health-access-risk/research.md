# Pesquisa Técnica: Mapa de Risco de Acesso à Saúde

## 1. Aplicação React e TypeScript

**Decisão**: React 19.2 com TypeScript 7, Vite 8 e React Leaflet 5.x em uma SPA focada na exploração
interativa.

**Justificativa**: a aplicação é pública, predominantemente cliente e possui uma única
jornada analítica. Vite oferece build TypeScript direto, enquanto contratos gerados e
tipos discriminados reduzem inconsistência entre estados de carregamento, erro e dado.

**Alternativas consideradas**: framework React com renderização no servidor, rejeitado
por acrescentar operação sem benefício relevante para dados interativos autenticados
por edição; Create React App, rejeitado por estar descontinuado.

## 2. Leaflet e GeoJSON

**Decisão**: Leaflet 1.9.4 com GeoJSON RFC 7946 em WGS 84. Polígonos usam renderização
vetorial adequada ao volume e pontos mantêm nomes acessíveis. Conteúdo de popup é
construído com nós/texto seguro, nunca com HTML vindo da fonte.

**Justificativa**: Leaflet suporta FeatureCollection, estilo e filtro por propriedades,
navegação de mapa por teclado e marcadores focáveis. A própria documentação alerta que
strings de popup são tratadas como HTML, o que exige serialização segura.

**Alternativas consideradas**: tiles vetoriais, adiados porque o recorte municipal
deve caber em GeoJSON simplificado/particionado; canvas exclusivo, rejeitado como padrão
porque piora a semântica e a inspeção acessível sem provar necessidade de desempenho.

## 3. API REST

**Decisão**: Node.js 24 LTS, Fastify 5.x e esquemas JSON compartilhados, com contrato
OpenAPI 3.1. A API é somente leitura, versionada em `/v1` e entrega GeoJSON para camadas
e JSON para metadados/detalhes.

**Justificativa**: Node 24 está em LTS; Fastify oferece TypeScript, validação e
serialização por esquema. O mesmo ecossistema reduz duplicação de tipos sem acoplar o
domínio aos handlers.

**Alternativas consideradas**: Express, rejeitado por exigir mais composição manual
para contrato e validação; GraphQL, rejeitado porque bbox, filtros e detalhes têm
operações REST claras e respostas geoespaciais padronizadas.

## 4. PostgreSQL e PostGIS

**Decisão**: PostgreSQL 18.6 e PostGIS 3.6.4, com índices GiST, edições imutáveis e visões
de publicação. Geometria original e geometria simplificada são distintas; GeoJSON é
serializado no banco/adapter com propriedades permitidas explicitamente.

**Justificativa**: PostGIS centraliza validação, transformação, proximidade geodésica,
recorte por viewport e indexação. PostgreSQL 18 é a versão estável atual e PostGIS 3.6
é compatível.

**Alternativas consideradas**: arquivos GeoJSON estáticos, insuficientes para
recalcular por categorias e preservar edições; banco não espacial, rejeitado devido ao
custo e risco de reimplementar consultas e validações geográficas.

## 5. Roteamento multimodal

**Decisão**: OpenTripPlanner 2.x como adaptador de pipeline, alimentado por extrato
OpenStreetMap e GTFS estático da PBH/SUMOB. Para uma data/hora de referência documentada,
o pipeline calcula matriz setor–recurso de caminhada e transporte; a API lê resultados
persistidos e não chama roteamento ao vivo.

**Justificativa**: OTP combina rede OSM e horários GTFS. A PBH publica GTFS do sistema
convencional, MOVE e suplementar com atualização semanal. Pré-cálculo garante
reprodutibilidade, evita latência imprevisível e permite validar cobertura.

**Alternativas consideradas**: pgRouting, adequado à caminhada mas não suficiente para
horários, espera e transferências GTFS; serviço externo sob demanda, rejeitado por
disponibilidade, privacidade, custo e irreprodutibilidade.

## 6. Metodologia do índice

**Decisão**: calcular componentes puros em `packages/domain`. Cada subindicador usa
posto percentílico empírico no recorte ativo, com posto médio em empates e fórmula
`(posto_médio - 1)/(n - 1)`; oferta e rendimento são invertidos e `n = 1` retorna
0,5 com aviso. As três modalidades minimizam custos independentemente e conservam o
CNES de cada destino. Três distâncias têm peso igual dentro da dimensão,
três características populacionais têm peso igual dentro da vulnerabilidade, e as
dimensões distância, oferta invertida e vulnerabilidade têm peso igual no índice final.
As cinco faixas são quintis com política explícita de empates.

**Justificativa**: reproduz diretamente as decisões esclarecidas e mantém pesos e
versão metodológica auditáveis. Fixtures sintéticas permitem validar todo cálculo.
O componente econômico usa `V06006` (dicionário IBGE de 08/05/2026), rendimento
nominal mediano mensal das pessoas responsáveis com rendimentos, apenas como proxy
contextual invertida. Não representa pobreza nem renda domiciliar per capita e não
deve sustentar, isoladamente, ordenação territorial.

**Alternativas consideradas**: cálculo integral em SQL, rejeitado porque esconderia
regras de domínio e dificultaria testes unitários; pesos configuráveis pelo público,
fora de escopo e prejudicial à comparabilidade da primeira versão.

## 7. Testes e acessibilidade

**Decisão**: Vitest para domínio, UI e integração; Playwright para jornadas reais em
Chromium, Firefox e WebKit, viewports desktop/móvel, com axe e snapshots da árvore
acessível como apoio. Testes manuais com leitor de tela continuam como gate de revisão.

**Justificativa**: automação cobre regressão crítica, mas verificadores automáticos não
provam toda acessibilidade. Mapa e tabela usam um modelo único, evitando divergência.

**Alternativas consideradas**: apenas testes visuais, insuficientes para cálculo,
teclado e semântica; apenas um navegador, insuficiente para a matriz pública prevista.

## 8. Segurança, licenças e proveniência

**Decisão**: staging isolado, allowlist de arquivos/campos, limites de tamanho,
checksums, validação geométrica e publicação transacional. Atribuição e licença são
mantidas por edição, incluindo ODbL e crédito a contribuidores do OpenStreetMap.

**Justificativa**: todas as fontes são externas e podem conter dados inesperados. A
proveniência é parte do produto analítico e condição de reprodutibilidade.

**Alternativas consideradas**: importação direta nas tabelas públicas, rejeitada por
risco de corrupção e publicação parcial.

## Referências oficiais

- React: <https://react.dev/learn/typescript>
- Vite no guia React: <https://react.dev/learn/build-a-react-app-from-scratch>
- Leaflet GeoJSON: <https://leafletjs.com/examples/geojson/>
- Leaflet acessível: <https://leafletjs.com/examples/accessibility/>
- Fastify: <https://fastify.dev/docs/latest/Reference/>
- Node.js LTS: <https://nodejs.org/en/about/previous-releases>
- PostgreSQL 18: <https://www.postgresql.org/docs/18/>
- PostGIS 3.6: <https://postgis.net/2025/09/PostGIS-3.6.0/>
- OpenTripPlanner: <https://docs.opentripplanner.org/en/latest/Configuration/>
- GTFS PBH: <https://dados.pbh.gov.br/pt_BR/dataset/?organization=superintendencia-de-mobilidade>
- OpenStreetMap: <https://www.openstreetmap.org/copyright>
- Playwright acessibilidade: <https://playwright.dev/docs/accessibility-testing>
