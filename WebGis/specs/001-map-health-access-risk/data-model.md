# Modelo de Dados: Mapa de Risco de Acesso à Saúde

## Convenções

- Identificadores internos: UUID; identificadores oficiais permanecem como texto para
  preservar zeros à esquerda.
- Datas de competência usam `date`; instantes de ingestão/publicação usam UTC.
- Geometrias-fonte preservam seu SRID documentado. Consultas métricas usam uma projeção
  local apropriada e respostas GeoJSON são transformadas para EPSG:4326.
- Toda linha analítica referencia `data_edition_id` e `methodology_version_id`.
- Valores ausentes são `NULL` com código de motivo; zero é sempre um valor observado.

## Entidades

### DataEdition

Representa uma publicação coerente e imutável das fontes.

| Campo | Tipo | Regra |
|---|---|---|
| id | UUID | chave primária |
| label | texto | único e legível |
| status | enum | `staging`, `validating`, `ready`, `published`, `rejected`, `retired` |
| extracted_at | instante | obrigatório |
| published_at | instante nulo | somente quando publicada |
| methodology_version_id | UUID | obrigatório |
| source_manifest | JSON estruturado | fonte, URI, competência, checksum, licença e transformação |
| quality_report | JSON estruturado | contagens aceitas/rejeitadas e motivos |
| is_active | booleano | no máximo uma edição ativa |

**Transições**: `staging → validating → ready → published → retired`; qualquer estado
anterior à publicação pode ir para `rejected`. Publicação e troca da edição ativa são
atômicas. Uma edição publicada não é alterada.

### MethodologyVersion

| Campo | Tipo | Regra |
|---|---|---|
| id | UUID | chave primária |
| version | texto SemVer | único |
| effective_from | data | obrigatório |
| income_proxy_variable | texto | fixo em `V06006` nesta versão |
| dimension_weights | objeto decimal | distância, oferta e vulnerabilidade somam 1 |
| distance_weights | objeto decimal | linear, caminhada e transporte somam 1 |
| vulnerability_weights | objeto decimal | renda, crianças e idosos somam 1 |
| normalization_method | enum | `empirical_percentile_average_rank` |
| tie_policy | enum | `promote_boundary_ties`: empate na fronteira fica integralmente na faixa de maior risco |
| transit_reference_rule | objeto | terça útil sem feriado, 08:00–10:00, intervalo de 15 min, mediana |
| offer_threshold_minutes | inteiro | valor principal 30; sensibilidades 15 e 45 |

### SourceArtifact

Arquivo externo imutável associado a uma edição antes de qualquer transformação.

| Campo | Tipo | Regra |
|---|---|---|
| id | UUID | chave primária |
| data_edition_id | UUID | obrigatório |
| source_type | enum | `ibge_mesh`, `ibge_census`, `cnes`, `osm`, `gtfs` |
| source_uri | texto | URI oficial permitida |
| reference_date | data | obrigatório |
| downloaded_at | instante | UTC |
| compressed_bytes | inteiro ≥ 0 | limitado pela política de segurança |
| expanded_bytes | inteiro ≥ 0 | limitado antes da extração completa |
| sha256 | texto | único por fonte/edição |
| license | texto | obrigatório antes de `ready` |
| validation_status | enum | `pending`, `valid`, `invalid` |
| validation_report | objeto | erros, avisos, contagens e cobertura |

### CensusSector

| Campo | Tipo | Regra |
|---|---|---|
| geocode | texto | chave oficial única; município deve ser 3106200 |
| data_edition_id | UUID | parte da chave/versionamento |
| geometry | MultiPolygon | válida, não vazia |
| representative_point | Point | coberto pela geometria |
| area_m2 | decimal positivo | obrigatório quando publicado |
| resident_population | inteiro ≥ 0 | `NULL` somente com motivo |
| occupied_households | inteiro ≥ 0 | informação contextual, quando disponível |
| children_0_14 | inteiro ≥ 0 | não excede população |
| older_people_60_plus | inteiro ≥ 0 | não excede população |
| responsible_person_median_income_brl | decimal ≥ 0 nulo | `V06006`; proxy contextual, não taxa de pobreza |
| missing_reason | enum nulo | supressão, ausência, incompatibilidade ou inválido |

Índices: GiST em `geometry` e `representative_point`; B-tree em `geocode` e edição.
Setor sem moradores é preservado, mas não é elegível para classificação.

### HealthFacility

| Campo | Tipo | Regra |
|---|---|---|
| cnes_id | texto | identificador oficial por edição |
| data_edition_id | UUID | obrigatório |
| name | texto | tratado como texto não confiável na apresentação |
| geometry | Point | válida; pode estar na área de influência externa |
| address | texto nulo | dado público do cadastro |
| active | booleano | somente ativos entram nas visões |
| serves_sus | booleano | determina elegibilidade SUS |
| reference_date | data | obrigatório |
| municipality_code | texto | identifica pontos externos |
| exclusion_reason | enum nulo | coordenada, situação, duplicidade ou dado inválido |

Índice GiST em `geometry`; B-tree em edição, `active`, `serves_sus` e município.

### ResourceCategory

| Campo | Tipo | Regra |
|---|---|---|
| id | texto estável | chave pública usada nos filtros |
| label | texto | único por versão de taxonomia |
| description | texto | obrigatório |
| taxonomy_version | texto | obrigatório |
| active | booleano | categorias antigas permanecem auditáveis |

### FacilityCategory

Relação N:N entre `HealthFacility` e `ResourceCategory`, preservando código e descrição
originais do CNES e regra de mapeamento. Uma instalação pode pertencer a várias
categorias.

### RoutingDataset

| Campo | Tipo | Regra |
|---|---|---|
| id | UUID | chave primária |
| data_edition_id | UUID | obrigatório |
| osm_checksum | texto | obrigatório |
| gtfs_checksum | texto | obrigatório para transporte |
| gtfs_service_date | data | terça-feira útil sem feriado escolhida na edição |
| departure_window | intervalo horário | 08:00–10:00 |
| departure_interval_minutes | inteiro | 15 |
| aggregation | enum | `median_valid_travel_times` |
| status | enum | `building`, `ready`, `failed`, `retired` |
| coverage_report | JSON estruturado | setores cobertos e motivos de ausência |

### SectorFacilityDistance

Matriz versionada entre setor, estabelecimento e visão/categoria elegível.

| Campo | Tipo | Regra |
|---|---|---|
| data_edition_id | UUID | parte da chave |
| routing_dataset_id | UUID | obrigatório |
| sector_geocode | texto | FK lógica para setor da mesma edição |
| facility_cnes_id | texto | FK lógica para estabelecimento da mesma edição |
| straight_line_m | decimal ≥ 0 | PostGIS |
| walking_m | decimal ≥ 0 nulo | OTP; nulo com motivo |
| transit_minutes | decimal ≥ 0 nulo | OTP; nulo com motivo |
| missing_reason | enum nulo | sem rota, sem serviço, fora de cobertura ou erro de fonte |

### SectorRiskResult

Resultado reproduzível por edição, metodologia, visão e conjunto canônico de categorias.

| Campo | Tipo | Regra |
|---|---|---|
| id | UUID | chave primária |
| data_edition_id | UUID | obrigatório |
| sector_geocode | texto | obrigatório |
| offer_view | enum | `sus`, `total` |
| category_key | texto | IDs ordenados e hash estável; vazio significa todas |
| population | inteiro | denominador observado |
| facility_count | inteiro ≥ 0 | conjunto elegível |
| distance_raw | objeto | metros lineares, metros a pé e minutos de transporte |
| distance_destinations | objeto | CNES independente para linha reta, caminhada e transporte |
| distance_score | decimal 0..1 nulo | nulo quando insuficiente |
| offer_density | decimal ≥ 0 | recurso por população na unidade documentada |
| reachable_facilities_15m | inteiro ≥ 0 nulo | sensibilidade por transporte público |
| reachable_facilities_30m | inteiro ≥ 0 nulo | numerador principal |
| reachable_facilities_45m | inteiro ≥ 0 nulo | sensibilidade e área externa máxima |
| offer_risk_score | decimal 0..1 | sentido invertido |
| vulnerability_raw | objeto | `V06006` em reais, proporção de crianças e de idosos |
| vulnerability_score | decimal 0..1 nulo | nulo quando insuficiente |
| risk_score | decimal 0..1 nulo | média ponderada das dimensões |
| risk_band | inteiro 1..5 nulo | quintil relativo, preserva empates |
| confidence | enum | `complete`, `partial`, `unclassified` |
| missing_reasons | lista de enum | nunca substituída por zero |
| calculated_at | instante | obrigatório |

Unicidade: edição + metodologia + setor + visão + `category_key`.

## Relações

```text
MethodologyVersion 1 ── N DataEdition
DataEdition 1 ── N SourceArtifact
DataEdition 1 ── N CensusSector
DataEdition 1 ── N HealthFacility N ── N ResourceCategory
DataEdition 1 ── N RoutingDataset
CensusSector N ── N HealthFacility (SectorFacilityDistance)
CensusSector 1 ── N SectorRiskResult
```

## Invariantes críticas

1. Nenhum resultado mistura entidades de edições diferentes.
2. A visão `sus` aceita somente `active && serves_sus`; `total`, somente `active`.
3. O filtro aceita apenas IDs de categorias existentes e ordena/remove duplicatas antes
   de formar `category_key`.
4. Crianças são pessoas de 0–14 anos; idosas têm 60 anos ou mais.
5. Vulnerabilidade `complete` usa três indicadores; `partial` usa exatamente dois com
   pesos renormalizados; zero ou um produz `unclassified`.
6. Distância, vulnerabilidade e dimensões finais usam pesos iguais na versão 1.0.0.
7. Faixas são quintis; empate na fronteira fica integralmente na faixa de maior risco.
8. Oferta principal é o total alcançável em 30 minutos por 10.000 habitantes; ausência
   de matriz é nula, enquanto nenhuma instalação alcançável é zero.
9. Qualquer ausência permanece distinguível de zero na persistência e na API.
10. GeoJSON público contém apenas propriedades da allowlist do contrato.
