# Dicionário de dados

| Campo | Unidade | Nulável | Descrição |
|---|---:|:---:|---|
| `geocode` | — | não | Geocódigo IBGE do setor em Belo Horizonte (`3106200…`) |
| `riskScore` | 0–1 | sim | Média das três dimensões quando todas existem |
| `riskBand` | 1–5 | sim | Faixa relativa com empates preservados |
| `responsiblePersonMedianIncomeBrl` | R$ | sim | Variável IBGE `V06006`; proxy contextual |
| `straightLineM`, `walkingM` | m | sim | Menor custo e respectivo CNES por modalidade |
| `transitMinutes` | min | sim | Mediana de partidas válidas entre 08h e 10h |
| `densityPer10000` | locais/10 mil hab. | sim | Oferta alcançável em 30 minutos |
