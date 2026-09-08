<div align="center">

# Acesso BH

### Observatório territorial de acesso à saúde em Belo Horizonte

Explore, compare e compreenda as barreiras de acesso a recursos de saúde por setor censitário — com uma leitura territorial acessível, transparente e reproduzível.

[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=061A23)](https://react.dev/)
[![Fastify](https://img.shields.io/badge/Fastify-API-000000?style=flat-square&logo=fastify&logoColor=white)](https://fastify.dev/)
[![Leaflet](https://img.shields.io/badge/Leaflet-WebGIS-199900?style=flat-square&logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![PostGIS](https://img.shields.io/badge/PostGIS-ready-336791?style=flat-square&logo=postgresql&logoColor=white)](https://postgis.net/)

</div>

> [!IMPORTANT]
> A versão atual usa uma **fixture inteiramente sintética**. Os resultados demonstram o funcionamento do produto e não devem orientar decisões sobre territórios ou serviços reais.

## Sobre o projeto

O **Acesso BH** é um WebGIS responsivo para pesquisadores, gestores públicos e cidadãos investigarem onde o acesso à saúde encontra mais barreiras em Belo Horizonte.

O índice de risco relativo combina três dimensões com pesos iguais:

- **distância**, considerando deslocamentos a pé e por transporte público;
- **oferta alcançável**, conforme estabelecimentos disponíveis no recorte;
- **vulnerabilidade populacional**, com indicadores contextuais do Censo.

A experiência oferece mapa e tabela equivalentes, filtros por atendimento SUS e categoria, decomposição do índice e detalhes dos estabelecimentos. O resultado é um sinal comparativo dentro do recorte selecionado — não um diagnóstico de suficiência da rede de saúde.

## Funcionalidades

- Mapa coroplético com cinco faixas relativas de risco;
- comparação entre oferta SUS e oferta total;
- filtro por categoria de estabelecimento;
- recálculo do índice conforme o recorte selecionado;
- detalhamento de distância, oferta e vulnerabilidade por setor;
- consulta de estabelecimentos de saúde;
- tabela acessível como alternativa completa ao mapa;
- navegação por teclado, estados anunciados e layout responsivo;
- API REST protegida com CORS, Helmet e rate limiting.

## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Interface | React, Vite, Leaflet e React Leaflet |
| API | Node.js, Fastify e TypeScript |
| Domínio | TypeScript, Vitest |
| Dados | PostgreSQL, PostGIS e migrações SQL |
| Mobilidade | OpenTripPlanner |
| Qualidade | ESLint, Playwright, Vitest e TypeScript |

## Arquitetura

```text
WebGis/
├── apps/
│   ├── api/          # API REST e fixture sintética
│   └── web/          # aplicação React e mapa Leaflet
├── packages/
│   ├── db/           # esquema, views e migrações PostGIS
│   └── domain/       # cálculo, normalização e regras do índice
├── docs/             # metodologia, fontes e operação
├── infra/            # PostgreSQL/PostGIS e OpenTripPlanner
└── specs/            # especificação funcional e contrato OpenAPI
```

O repositório usa **npm workspaces**. A interface consome a API, enquanto as regras de cálculo permanecem isoladas no pacote de domínio para facilitar testes e auditoria.

## Como executar

### Pré-requisitos

- [Node.js 24 LTS](https://nodejs.org/)
- npm

### Desenvolvimento local

```bash
git clone https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
cd SEU-REPOSITORIO
npm install
npm run dev
```

Acesse:

- aplicação web: [http://localhost:5173](http://localhost:5173)
- API: [http://localhost:3333](http://localhost:3333)
- health check: [http://localhost:3333/health/ready](http://localhost:3333/health/ready)

Nenhum banco ou download de dados oficiais é necessário para iniciar o ambiente de desenvolvimento: a API carrega automaticamente a fixture sintética versionada.

### Infraestrutura geoespacial opcional

Para preparar PostGIS e OpenTripPlanner com Docker:

```bash
docker compose -f infra/compose.yaml up -d
```

> [!NOTE]
> O serviço do OpenTripPlanner requer seus próprios artefatos no diretório `infra/otp`. A aplicação em modo fixture funciona sem esses contêineres.

## Comandos úteis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | inicia API e interface em modo de desenvolvimento |
| `npm run build` | gera os builds de domínio, API e web |
| `npm run typecheck` | valida os tipos de todo o monorepo |
| `npm run lint` | executa a análise estática |
| `npm test` | executa a suíte Vitest |
| `npm run test:unit` | testa as regras de domínio |
| `npm run test:integration` | testa a API |
| `npm run test:e2e` | executa os testes de interface com Playwright |

## Metodologia e dados

Cada subindicador é normalizado por posto percentílico empírico. As dimensões de distância, oferta e vulnerabilidade recebem pesos iguais, e a classificação final é apresentada em quintis relativos ao recorte ativo.

A dimensão econômica usa a variável `V06006` — rendimento nominal mediano mensal das pessoas responsáveis com rendimento — exclusivamente como **proxy contextual**. Ela não representa pobreza nem renda domiciliar per capita.

Fontes previstas para edições produtivas:

- IBGE — Censo Demográfico 2022 e malha de setores censitários;
- CNES/DATASUS — estabelecimentos e características de atendimento;
- OpenStreetMap — rede caminhável;
- PBH/BHTrans — dados GTFS do transporte coletivo.

Consulte a [metodologia](docs/methodology.md), o [dicionário de dados](docs/data-dictionary.md), as [fontes e licenças](docs/sources-and-licenses.md) e o [processo de publicação](docs/publication-runbook.md).

## API

Os principais recursos disponíveis são:

```text
GET /health/live
GET /health/ready
GET /metadata
GET /sectors
GET /sectors/:geocode
GET /facilities
GET /facilities/:cnesId
```

O contrato completo está documentado em [OpenAPI](specs/001-map-health-access-risk/contracts/openapi.yaml).

## Qualidade

Antes de publicar uma alteração, execute:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

O projeto cobre regras de domínio, integração da API e jornadas críticas no navegador, incluindo filtros, seleção sincronizada entre mapa e tabela e comportamento responsivo.

## Documentação

- [Visão do produto](PRODUCT.md)
- [Metodologia](docs/methodology.md)
- [Dicionário de dados](docs/data-dictionary.md)
- [Fontes e licenças](docs/sources-and-licenses.md)
- [Modelo de ameaças](docs/threat-model.md)
- [Runbook de publicação](docs/publication-runbook.md)
- [Especificação funcional](specs/001-map-health-access-risk/spec.md)

## Contribuição

Contribuições são bem-vindas. Abra uma issue com o contexto da proposta e, ao enviar um pull request, descreva o impacto metodológico e inclua testes para qualquer regra nova ou alterada.

---

<div align="center">
  Desenvolvido para tornar desigualdades territoriais mais legíveis — com método, contexto e responsabilidade.
</div>
