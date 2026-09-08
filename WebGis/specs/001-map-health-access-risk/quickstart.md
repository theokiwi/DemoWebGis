# Guia de Validação: Mapa de Risco de Acesso à Saúde

## Pré-requisitos

- Node.js 24 LTS e npm compatível
- Docker com Compose para PostgreSQL/PostGIS e OpenTripPlanner
- Arquivos de fixture versionados em `packages/test-fixtures/`

O guia usa apenas dados sintéticos pequenos. Downloads integrais de fontes oficiais não
são necessários para validar a implementação local.

## Preparação

```bash
npm install
docker compose -f infra/compose.yaml up -d db otp
npm run db:migrate
npm run data:load-fixtures
```

Resultado esperado: banco pronto, uma edição sintética publicada, relatório sem erros
bloqueantes e health check da API indicando a edição ativa.

## Executar a aplicação

```bash
npm run dev
```

Abrir o endereço informado pelo processo web. A tela inicial deve enquadrar Belo
Horizonte sintética, mostrar cinco faixas, fontes e data da edição.

## Gates automatizados

```bash
npm run typecheck
npm run lint
npm run test:unit
npm run test:integration
npm run test:e2e
npm run build
```

Todos os comandos devem terminar com código zero. Vitest não substitui `typecheck`,
portanto ambos são gates separados.

## Cenários de validação

### 1. Risco e decomposição

1. Abrir a visão SUS sem categorias.
2. Selecionar o setor de maior risco na tabela.
3. Confirmar que mapa e tabela destacam o mesmo setor.
4. Conferir pontuação, quintil, três distâncias e seus destinos CNES, oferta, proxy
   de rendimento `V06006`, crianças, idosos,
   confiança, edição e metodologia.

Resultado: valores coincidem com a fixture dourada e nenhuma ausência aparece como zero.

### 2. Visão SUS versus total

Alternar para oferta total. Resultado: estabelecimentos privados ativos passam a contar,
pontuação/faixa são atualizadas e o rótulo da visão permanece visível no mapa, tabela e
detalhes.

### 3. Filtro com recálculo

Selecionar duas categorias, observar a contagem, remover uma e restaurar todas.
Resultado: pontos e quatro valores — distância, densidade, pontuação e faixa — mudam
conforme a fixture; vulnerabilidade permanece idêntica.

Confirmar que a densidade principal usa estabelecimentos alcançáveis em 30 minutos por
10.000 habitantes e que as contagens de sensibilidade de 15 e 45 minutos aparecem nos
detalhes. Zero e matriz indisponível devem produzir estados distintos.

### 4. Acessibilidade e responsividade

1. Completar os cenários anteriores somente com teclado.
2. Repetir em viewport de 320 px e ampliação de 200%.
3. Usar a tabela sem interagir com o mapa.
4. Confirmar foco visível, anúncio de carregamento/erro, nomes únicos dos marcadores,
   alternativa a cores e ausência de armadilha de teclado.

### 5. Segurança e falhas

Enviar bbox excessiva, categorias além do limite, tentativa de SQL injection e
caracteres de HTML em uma fonte. Importar fixture compactada acima dos limites e
geometria inválida. Resultado: entradas são rejeitadas pelo erro padronizado, texto é
exibido literalmente, logs não expõem payloads e a edição publicada não é alterada.

### 6. Publicação atômica

Executar uma importação válida e outra com geometrias inválidas. Resultado: a válida
torna-se ativa em uma única transação; a inválida é rejeitada com relatório e a edição
anterior continua servida.

### 7. Cenário temporal e ausências

Validar a terça-feira útil da fixture com partidas a cada 15 minutos entre 08:00 e
10:00. Resultado: o tempo publicado é a mediana das viagens válidas; setor sem viagem
recebe `no_transit_service`. Vulnerabilidade com dois indicadores é `partial` e tem
pesos renormalizados; com zero ou um é `unclassified`.

## Contratos relacionados

- Modelo persistente e invariantes: [data-model.md](data-model.md)
- API REST: [contracts/openapi.yaml](contracts/openapi.yaml)
- Metodologia e decisões: [research.md](research.md)
