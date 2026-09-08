# Especificação da Funcionalidade: Mapa de Risco de Acesso à Saúde

**Diretório da funcionalidade**: `001-map-health-access-risk`

**Criada em**: 2026-09-08

**Status**: Rascunho

**Entrada**: Criar uma visualização geográfica responsiva que permita identificar
quais regiões de Belo Horizonte têm maior risco de acesso a recursos de saúde,
considerando distância aos estabelecimentos, densidade de oferta e características
da população local, com filtros por categoria e consulta aos detalhes dos pontos.

## Clarifications

### Session 2026-09-08

- Q: Quais estabelecimentos devem contar como oferta de saúde no cálculo do risco? → A: Calcular visões separadas para oferta SUS e oferta total.
- Q: Ao filtrar uma categoria de estabelecimento, o mapa deve recalcular o risco para essa categoria ou manter o risco geral e apenas filtrar os pontos? → A: Recalcular distância, oferta e risco para as categorias selecionadas.
- Q: Como as pontuações contínuas devem ser convertidas em faixas como “baixo”, “médio” e “alto risco”? → A: Usar cinco grupos relativos, com aproximadamente 20% dos setores em cada faixa.
- Q: Qual medida de distância deve compor a primeira versão do índice de risco? → A: Combinar distância em linha reta, trajeto a pé e tempo por transporte público.
- Q: Quais características populacionais devem formar a dimensão de vulnerabilidade na primeira versão? → A: Combinar vulnerabilidade econômica, proporção de crianças e proporção de pessoas idosas; a vulnerabilidade econômica foi operacionalizada posteriormente pela proxy `V06006`, sem classificá-la como pobreza.

## Cenários de Usuário e Testes *(obrigatório)*

### História de Usuário 1 — Identificar regiões de maior risco (Prioridade: P1)

Como pessoa pesquisadora, gestora pública ou cidadã, quero visualizar a distribuição
espacial do risco de acesso a recursos de saúde em Belo Horizonte para reconhecer
rapidamente os setores censitários mais vulneráveis e apoiar análises e decisões.

**Por que esta prioridade**: Responder à pergunta territorial sobre desigualdade de
acesso é o valor central da funcionalidade.

**Teste independente**: Abrir a visualização com dados válidos e confirmar que todos
os setores elegíveis de Belo Horizonte são classificados, apresentados no mapa e em
uma alternativa não visual, com legenda e explicação do índice.

**Cenários de aceite**:

1. **Dado** que os dados foram carregados, **quando** a pessoa abre a funcionalidade,
   **então** vê Belo Horizonte enquadrada e os setores classificados por nível de
   risco, com legenda, período e fontes visíveis.
2. **Dado** um setor classificado, **quando** a pessoa o seleciona, **então** consulta
   sua classificação geral, os valores dos componentes de distância, oferta e
   vulnerabilidade populacional e a explicação de como contribuíram para o resultado.
3. **Dado** que a pessoa não utiliza o mapa, **quando** acessa a alternativa textual,
   **então** consegue ordenar e consultar as mesmas regiões e indicadores por uma
   lista ou tabela navegável por teclado e tecnologia assistiva.

---

### História de Usuário 2 — Explorar estabelecimentos por categoria (Prioridade: P2)

Como pessoa usuária, quero visualizar e filtrar estabelecimentos de saúde por
categoria para entender quais tipos de recurso estão próximos ou ausentes em cada
região.

**Por que esta prioridade**: A leitura do risco precisa ser relacionada à oferta de
serviços que existe no território.

**Teste independente**: Escolher uma ou mais categorias e verificar que os pontos,
contagens e resultados dependentes da seleção são atualizados de forma coerente,
sem perder os demais filtros ativos.

**Cenários de aceite**:

1. **Dado** o mapa com todos os estabelecimentos, **quando** a pessoa seleciona uma
   categoria, **então** somente os pontos correspondentes ficam visíveis e a
   interface informa a quantidade encontrada.
2. **Dado** um conjunto filtrado, **quando** a pessoa limpa os filtros, **então** a
   visão completa é restaurada.
3. **Dado** um filtro sem resultados, **quando** ele é aplicado, **então** a pessoa
   recebe uma mensagem clara e pode remover o filtro sem perder o contexto.

---

### História de Usuário 3 — Consultar detalhes de um estabelecimento (Prioridade: P3)

Como pessoa usuária, quero consultar os dados básicos de cada estabelecimento para
interpretar sua categoria, localização e contribuição para a oferta local.

**Por que esta prioridade**: Os detalhes dão rastreabilidade aos pontos usados no
cálculo e ajudam a evitar conclusões baseadas apenas na aparência do mapa.

**Teste independente**: Selecionar um estabelecimento no mapa e na alternativa
textual e confirmar a apresentação consistente de seus dados públicos e da fonte.

**Cenários de aceite**:

1. **Dado** um ponto visível, **quando** a pessoa o seleciona, **então** vê nome,
   categoria, endereço ou localização disponível, situação cadastral, data de
   referência e fonte.
2. **Dado** um registro com campo ausente, **quando** seus detalhes são exibidos,
   **então** o campo é indicado como não informado, sem inferir um valor.
3. **Dado** o painel de detalhes aberto em tela pequena, **quando** a pessoa o fecha,
   **então** retorna ao mapa preservando filtros, posição e seleção anterior.

---

### História de Usuário 4 — Usar a análise em diferentes dispositivos (Prioridade: P4)

Como pessoa usuária de desktop ou dispositivo móvel, quero navegar, filtrar e
consultar regiões e pontos sem perda de conteúdo ou funcionalidade.

**Por que esta prioridade**: O acesso responsivo é uma restrição explícita e amplia
o uso público da análise.

**Teste independente**: Executar as jornadas principais em larguras de tela de
desktop e móvel, com toque, teclado e ampliação, confirmando equivalência funcional.

**Cenários de aceite**:

1. **Dado** qualquer largura suportada, **quando** a interface é aberta, **então**
   mapa, filtros, legenda e detalhes permanecem legíveis e operáveis sem rolagem
   horizontal da página.
2. **Dado** um dispositivo móvel, **quando** a pessoa toca um setor ou ponto,
   **então** a seleção é inequívoca e não exige precisão incompatível com toque.
3. **Dado** o uso apenas por teclado, **quando** a pessoa percorre os controles,
   **então** há ordem lógica, foco visível e acesso a todas as ações e informações.

### Casos Limite

- Setores sem moradores não recebem risco populacional; devem ser identificados e
  excluídos da classificação comparativa, sem serem tratados como risco zero.
- Valores censitários ausentes ou sujeitos a supressão devem aparecer como não
  disponíveis e não podem ser convertidos silenciosamente em zero.
- Estabelecimentos fora do limite municipal podem ser considerados na distância se
  forem alcançáveis em até 45 minutos por transporte público no cenário temporal da
  edição; devem ser visualmente identificados como externos e só compõem a densidade
  quando alcançáveis dentro do limite principal de 30 minutos.
- Pontos com coordenadas ausentes, inválidas ou fora da área esperada devem ser
  excluídos do cálculo e contabilizados no relatório de qualidade dos dados.
- Muitos pontos próximos devem permanecer selecionáveis sem ocultar sua quantidade.
- Empates de pontuação devem receber a mesma classificação e ordenação secundária
  explícita.
- Falha ou indisponibilidade de uma fonte deve preservar a última edição válida, se
  houver, e informar claramente a data e a limitação; resultados parciais não podem
  ser apresentados como completos.
- Filtros incompatíveis ou sem resultados devem oferecer recuperação simples.
- Ampliação de texto, contraste elevado e redução de movimento não podem remover
  informações essenciais.

## Requisitos *(obrigatório)*

### Requisitos Funcionais

- **RF-001**: A funcionalidade DEVE limitar a análise territorial aos setores
  censitários do município de Belo Horizonte, identificado pelo código 3106200.
- **RF-002**: A funcionalidade DEVE apresentar cada setor elegível com pontuação
  contínua e faixa ordinal de risco de acesso à saúde.
- **RF-003**: A pontuação DEVE combinar três dimensões: distância ao recurso de saúde
  compatível mais próximo, densidade de oferta por população e vulnerabilidade
  derivada das características populacionais disponíveis.
- **RF-003C**: A dimensão de distância DEVE combinar, com pesos iguais, três medidas
  normalizadas: distância em linha reta, distância pelo menor trajeto caminhável e
  menor tempo estimado por transporte público até um recurso compatível.
- **RF-003F**: O recurso compatível mais próximo DEVE ser escolhido
  independentemente para cada modalidade, depois de aplicar edição, visão de oferta
  e categorias ativas; portanto, linha reta, caminhada e transporte público podem
  apontar para estabelecimentos distintos. Cada medida DEVE conservar o CNES de seu
  destino; empates usam o menor CNES em ordem lexical como desempate determinístico.
- **RF-003E**: O tempo de transporte público DEVE usar uma terça-feira útil sem
  feriado, partidas a cada 15 minutos entre 08:00 e 10:00 e a mediana dos tempos
  válidos, incluindo caminhada, espera e transferências. A data concreta DEVE ser
  registrada por edição; ausência de viagem válida resulta em dado ausente com motivo
  `no_transit_service`.
- **RF-003D**: A funcionalidade DEVE conservar e apresentar as três medidas originais,
  suas unidades, cobertura territorial e data de referência, além do valor composto,
  sem tratar percurso ou tempo indisponível como zero.
- **RF-003A**: A funcionalidade DEVE calcular e identificar separadamente uma visão
  baseada apenas em estabelecimentos ativos com atendimento ao SUS e uma visão de
  oferta total baseada em todos os estabelecimentos ativos, públicos e privados.
- **RF-003B**: A pessoa usuária DEVE poder alternar entre as visões SUS e oferta total,
  e a interface DEVE atualizar pontuação, faixa, componentes, legenda e detalhes sem
  permitir que resultados de uma visão sejam interpretados como pertencentes à outra.
- **RF-004**: Cada indicador DEVE ser normalizado em `[0,1]` pelo posto percentílico
  empírico: indicadores de acesso usam os setores elegíveis da mesma edição, visão
  e conjunto canônico de categorias; indicadores populacionais usam todos os setores
  populacionalmente elegíveis da mesma edição e não mudam com filtros de oferta. A
  fórmula é `(posto_médio - 1) / (n - 1)`, usando posto médio nos
  empates. Distância, crianças e idosos mantêm o sentido crescente; oferta e
  rendimento usam `1 - percentil`. Com `n = 1`, o valor normalizado é `0,5` e recebe
  aviso de comparação insuficiente. A primeira versão DEVE atribuir o mesmo peso às
  três dimensões.
- **RF-005**: Maior distância, menor oferta por habitante e maior vulnerabilidade
  populacional DEVEM aumentar a pontuação de risco.
- **RF-005A**: A funcionalidade DEVE ordenar os setores elegíveis do
  menor para o maior risco e distribuí-los em cinco faixas relativas, contendo
  aproximadamente 20% dos setores em cada faixa.
- **RF-005B**: Setores com a mesma pontuação DEVEM permanecer na mesma faixa, ainda
  que isso produza faixas com quantidades diferentes, e o critério secundário de
  ordenação DEVE ser explícito e não alterar a faixa atribuída.
- **RF-005G**: Quando uma pontuação empatada atravessar o limite teórico entre duas
  faixas, todos os setores empatados DEVEM permanecer na faixa de maior risco; as
  faixas seguintes começam na primeira pontuação diferente.
- **RF-005C**: A interface DEVE explicar que as faixas representam posição relativa
  entre os setores do recorte, da visão de oferta e das categorias ativas, não um
  limite absoluto de acesso adequado ou inadequado.
- **RF-005D**: A dimensão de vulnerabilidade DEVE combinar, com pesos iguais, três
  indicadores normalizados: proxy contextual de menor rendimento, proporção de
  crianças de 0 a 14 anos e proporção de pessoas idosas com 60 anos ou mais.
- **RF-005E**: A proxy de rendimento DEVE usar exatamente a variável `V06006` do
  dicionário IBGE de 08/05/2026, "Valor do rendimento nominal mediano mensal das
  pessoas responsáveis com rendimentos por domicílios particulares permanentes
  ocupados", em reais, com sentido invertido após normalização. Ela NÃO DEVE ser
  apresentada como taxa de baixa renda, renda domiciliar per capita, pobreza ou
  medida isolada para ordenar territórios; mudança de variável exige nova versão
  metodológica.
- **RF-005F**: Nenhum indicador populacional ausente DEVE ser imputado como zero. Um
  setor com os três indicadores recebe confiança `complete`; com exatamente dois,
  os pesos disponíveis são renormalizados para somarem 1 e a confiança é `partial`;
  com zero ou um indicador, o setor não recebe pontuação de vulnerabilidade nem
  classificação geral, usa confiança `unclassified` e apresenta o motivo.
- **RF-006**: A metodologia DEVE informar definição, unidade, período, tratamento de
  ausências, normalização, pesos e limites das faixas, permitindo reproduzir e
  interpretar a classificação.
- **RF-007**: A pessoa usuária DEVE poder visualizar simultaneamente os polígonos de
  risco e os pontos de estabelecimentos de saúde.
- **RF-008**: A pessoa usuária DEVE poder filtrar pontos por uma ou mais categorias
  públicas de estabelecimento ou serviço, com opção de restaurar todos os valores.
- **RF-009**: Ao selecionar uma ou mais categorias, a funcionalidade DEVE recalcular
  a distância, a densidade de oferta, a pontuação e a faixa de risco usando somente
  os estabelecimentos correspondentes, dentro da visão SUS ou oferta total ativa.
- **RF-009A**: A interface DEVE identificar permanentemente quando o risco exibido é
  filtrado, informar as categorias e a visão de oferta consideradas e permitir
  restaurar a classificação geral em uma única ação.
- **RF-009B**: A densidade de oferta DEVE contar estabelecimentos elegíveis alcançáveis
  em até 30 minutos por transporte público, divididos pela população residente e
  expressos por 10.000 habitantes. A metodologia DEVE registrar também contagens em
  15 e 45 minutos para análise de sensibilidade, sem alterar o indicador principal.
- **RF-009C**: Na visão SUS, o numerador inclui somente estabelecimentos ativos com
  atendimento ao SUS; na visão total, todos os ativos. Categorias filtram o numerador.
  Zero significa nenhum recurso alcançável; matriz ausente permanece dado ausente.
- **RF-010**: A pessoa usuária DEVE poder selecionar um setor e consultar pontuação,
  faixa, população, indicador de renda quando disponível, distância, densidade de
  oferta, quantidade de estabelecimentos considerada e qualidade dos dados.
- **RF-011**: A pessoa usuária DEVE poder selecionar um ponto e consultar nome,
  categoria, localização pública, situação cadastral, competência dos dados e fonte.
- **RF-012**: A interface DEVE apresentar legenda, definições das categorias, data de
  atualização e ligação para as fontes e a metodologia.
- **RF-013**: A interface DEVE oferecer uma lista ou tabela equivalente ao mapa, com
  busca, ordenação por risco e acesso aos detalhes de regiões e estabelecimentos.
- **RF-014**: Filtros, seleção e posição de análise DEVEM ser preservados ao abrir e
  fechar detalhes e ao alternar entre mapa e alternativa textual durante a sessão.
- **RF-015**: A funcionalidade DEVE informar carregamento, ausência de resultados,
  dados incompletos e falhas de forma compreensível, sem apresentar valores antigos
  ou parciais como atuais e completos.
- **RF-016**: A funcionalidade DEVE registrar, por edição dos dados, quantos setores e
  estabelecimentos foram aceitos, excluídos ou ficaram com atributos ausentes.
- **RF-016A**: A edição DEVE registrar as fontes, versões e datas de referência da
  rede caminhável, dos itinerários e dos horários de transporte público usados nas
  medidas de deslocamento, bem como setores sem cobertura válida.
- **RF-017**: A funcionalidade NÃO DEVE permitir inferência sobre pessoas ou exibir
  microdados individuais; todos os indicadores populacionais devem permanecer
  agregados por setor.
- **RF-018**: Todas as jornadas críticas — carregar a análise, classificar setores,
  filtrar categorias e consultar detalhes — DEVEM possuir testes automatizados de
  sucesso, ausência de dados e falha relevante.

### Requisitos de Qualidade *(obrigatório)*

- **RQ-001 — Criticidade**: Classificação territorial, associação de fontes, cálculo
  dos três componentes e filtros que alterem a interpretação são críticos, pois uma
  falha pode induzir decisões incorretas sobre desigualdade de acesso.
- **RQ-002 — Acessibilidade**: Todos os controles DEVEM possuir nome acessível, foco
  visível e operação por teclado; cor não pode ser o único meio de expressar risco;
  mapa, legenda e gráficos DEVEM ter equivalentes textuais; a interface DEVE manter
  leitura e operação com ampliação de 200% e alvos adequados para toque.
- **RQ-003 — Segurança e privacidade**: Somente dados públicos e agregados DEVEM ser
  utilizados. Conteúdo externo DEVE ser validado antes da publicação, textos de
  fontes não podem executar conteúdo ativo, e mensagens ou registros não devem
  expor detalhes internos nem informações pessoais.
- **RQ-004 — Testes automatizados**: Os testes DEVEM verificar cálculos com exemplos
  conhecidos, associação por geocódigo, tratamento de ausências, limites das faixas,
  composição das três medidas de distância, filtros, detalhes, equivalência entre
  mapa e tabela e jornadas responsivas e acessíveis.
- **RQ-004A — Testes de vulnerabilidade**: Os testes DEVEM cobrir limites etários,
  `V06006`, inversão da proxy de rendimento, postos percentílicos, pesos iguais,
  ausências parciais e exclusão de
  setores sem dados suficientes.
- **RQ-005 — Documentação**: A entrega DEVE incluir dicionário de dados, catálogo de
  fontes e competências, metodologia do índice, limitações, guia de uso e histórico
  das edições publicadas.
- **RQ-006 — Modularidade**: Ingestão e validação das fontes, cálculo de indicadores,
  classificação do risco e apresentação ao usuário DEVEM ter responsabilidades e
  contratos independentes, permitindo testar e substituir cada parte isoladamente.
- **RQ-007 — Responsividade**: Nenhum conteúdo ou ação essencial pode existir somente
  em desktop ou somente em dispositivo móvel; a reorganização visual DEVE preservar
  contexto, filtros e equivalência de informação.

### Fontes e Proveniência

- **Malha territorial**: IBGE, Malha de Setores Censitários definitiva do Censo
  Demográfico 2022, usando geometrias e geocódigos oficiais de Minas Gerais e o
  recorte de Belo Horizonte. Acesso: <https://www.ibge.gov.br/geociencias/organizacao-do-territorio/malhas-territoriais/26565-malhas-de-setores-censitarios-divisoes-intramunicipais.html>.
- **População e características locais**: IBGE, Agregados por Setores Censitários dos
  Resultados do Universo do Censo 2022, incluindo população e rendimento do
  responsável pelo domicílio quando disponível e metodologicamente compatível.
  Acesso: <https://sidra.ibge.gov.br> e
  <https://www.ibge.gov.br/estatisticas/sociais/populacao/22827-censo-demografico-2022.html>.
- **Oferta de saúde**: Cadastro Nacional de Estabelecimentos de Saúde (CNES),
  DATASUS/Ministério da Saúde, usando registros públicos de estabelecimentos, tipos,
  serviços, localização e situação cadastral necessários à análise. Acesso:
  <https://datasus.saude.gov.br/cnes-estabelecimentos/>.
- Cada edição publicada DEVE conservar identificação da fonte, data de extração,
  competência, versão ou nome do arquivo e regras de transformação aplicadas.

### Entidades Principais

- **Setor censitário**: Unidade territorial oficial, identificada por geocódigo, com
  geometria, população, características disponíveis e indicadores calculados.
- **Estabelecimento de saúde**: Estabelecimento com cadastro público contendo identificador, nome,
  categoria, serviços, situação, localização e competência.
- **Categoria de recurso**: Agrupamento documentado usado para filtrar e comparar
  estabelecimentos ou serviços de saúde.
- **Indicador de acesso**: Valor de uma dimensão do risco, incluindo unidade, direção,
  origem, tratamento de ausências e valor normalizado.
- **Classificação de risco**: Resultado por setor composto por pontuação, faixa,
  componentes, pesos, versão metodológica e edição dos dados.
- **Edição de dados**: Conjunto coerente de fontes, competências, transformações e
  métricas de qualidade usado em uma publicação.
- **Rede de deslocamento**: Representação versionada das conexões caminháveis, linhas,
  paradas e horários de transporte público usada para calcular percurso e tempo.

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **CS-001**: 100% dos setores elegíveis com dados suficientes são exibidos com
  pontuação, faixa e decomposição nos três componentes; todos os demais apresentam
  motivo explícito para não classificação.
- **CS-002**: Em avaliação com tarefas representativas, pelo menos 90% das pessoas
  identificam as cinco regiões de maior risco e consultam seus componentes em até
  três minutos, sem orientação externa.
- **CS-003**: Aplicar ou remover um filtro e abrir detalhes produz retorno visual ou
  textual perceptível em até dois segundos para pelo menos 95% das interações em
  condições usuais de acesso.
- **CS-003A**: Em 100% dos casos de referência, a seleção de categorias produz
  distância, densidade, pontuação e faixa calculadas exclusivamente com os
  estabelecimentos elegíveis, sem alterar os dados de vulnerabilidade populacional.
- **CS-003B**: Em 100% dos casos de referência de deslocamento, as distâncias em linha
  reta e a pé, o tempo por transporte público e o componente combinado correspondem
  aos resultados esperados; casos sem cobertura são identificados, nunca zerados.
- **CS-004**: Os resultados de 100% dos casos de referência do cálculo correspondem
  aos valores esperados nas visões SUS e oferta total, e todas as jornadas críticas
  passam nos testes automatizados.
- **CS-004A**: Os resultados de 100% dos casos de referência da vulnerabilidade
  correspondem aos valores esperados para a proxy `V06006`, crianças e pessoas idosas,
  incluindo limites etários e dados ausentes.
- **CS-005**: Todas as tarefas principais podem ser concluídas em desktop e móvel,
  por toque e somente por teclado, sem perda de conteúdo ou função.
- **CS-006**: Uma auditoria de acessibilidade não encontra barreiras críticas no
  carregamento, filtragem, seleção, interpretação e consulta de detalhes, e toda
  informação transmitida por cor possui alternativa textual.
- **CS-007**: 100% dos valores exibidos permitem identificar fonte, competência e
  versão metodológica, e 100% dos registros excluídos são contabilizados por motivo.
- **CS-008**: Nenhum dado individual ou identificador pessoal é exibido, exportado ou
  registrado pela funcionalidade.

## Premissas

- O termo "região" será operacionalizado por setor censitário, unidade disponível
  nas fontes e adequada à análise intraurbana; agrupamentos administrativos poderão
  contextualizar resultados, mas não substituirão a classificação setorial.
- A primeira versão é descritiva e comparativa: indica risco relativo de acesso, não
  causalidade, diagnóstico médico, necessidade individual nem suficiência real do
  serviço.
- A dimensão de distância combina proximidade em linha reta, percurso caminhável e
  tempo estimado por transporte público. Ela melhora a representação das barreiras
  territoriais, mas não garante disponibilidade real, capacidade, horário de
  atendimento, condições individuais de mobilidade nem duração observada da viagem;
  essas limitações serão exibidas junto à metodologia.
- A densidade inicial relaciona recursos de saúde válidos à população atendida; se
  informações confiáveis de capacidade estiverem disponíveis, elas podem enriquecer
  a oferta sem substituir a contagem de estabelecimentos alcançáveis em 30 minutos
  por transporte público por 10.000 habitantes, nem perder rastreabilidade.
- A vulnerabilidade inicial utiliza o rendimento mediano `V06006` somente como proxy
  contextual, proporção de crianças de 0 a 14 anos e proporção de pessoas idosas com
  60 anos ou mais. Ausência de rendimento não será interpretada como baixo rendimento
  e reduzirá o grau de confiança do resultado do setor.
- Os três componentes terão pesos iguais na primeira versão; qualquer alteração
  futura exigirá nova versão metodológica, justificativa e possibilidade de comparar
  resultados.
- Os dados do CNES/DATASUS são necessários para responder às dimensões de distância e
  oferta, embora não tenham sido citados originalmente; serão tratados como fonte
  pública complementar oficial. O vínculo com o SUS e a situação ativa do cadastro
  determinam a inclusão na visão SUS; estabelecimentos ativos, independentemente do
  vínculo, determinam a visão de oferta total.
- A funcionalidade é de consulta pública e não exige cadastro para as jornadas
  descritas nesta especificação.

## Fora do Escopo

- Recomendar tratamento, estabelecimento ou rota para uma pessoa específica.
- Avaliar qualidade clínica, disponibilidade em tempo real, filas, horários ou vagas.
- Coletar localização precisa, perfil de saúde ou outros dados pessoais da pessoa
  usuária.
- Prever causalidade entre os indicadores e desfechos de saúde.
- Permitir edição pública das fontes, dos pesos ou das classificações oficiais.
