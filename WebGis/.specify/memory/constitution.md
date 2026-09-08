<!--
Sync Impact Report
- Version change: template -> 1.0.0
- Added principles:
  - I. Acessibilidade por Padrão
  - II. Segurança em Profundidade
  - III. Testes Automatizados para Funcionalidades Críticas
  - IV. Documentação como Parte da Entrega
  - V. Código Modular e Coeso
- Added sections: Padrões de Qualidade; Fluxo de Desenvolvimento e Gates
- Templates updated: plan-template.md, spec-template.md, tasks-template.md
- Follow-up TODOs: nenhum
-->

# Constituição do WebGis

## Princípios Fundamentais

### I. Acessibilidade por Padrão

Toda interface e fluxo de usuário DEVE ser projetado para uso com teclado,
tecnologias assistivas e diferentes condições visuais, motoras e cognitivas. A
implementação DEVE usar HTML semântico, rótulos e nomes acessíveis, foco visível,
ordem de navegação previsível, contraste adequado e alternativas textuais para
conteúdo não textual. Mapas e visualizações geográficas DEVEM oferecer uma forma
alternativa de compreender e operar seus dados essenciais. Critérios de
acessibilidade aplicáveis DEVEM constar na especificação e ser verificados antes
da entrega.

### II. Segurança em Profundidade

Dados e entradas externas DEVEM ser tratados como não confiáveis e validados nos
limites do sistema. Autenticação e autorização DEVEM aplicar privilégio mínimo;
segredos e dados sensíveis NÃO DEVEM ser expostos em código, logs ou respostas.
Dependências, armazenamento, comunicação e tratamento de erros DEVEM ser
avaliados quanto a riscos. Toda funcionalidade que manipule identidade,
permissões, dados sensíveis, arquivos, consultas ou integrações externas DEVE ter
ameaças, controles e testes de segurança documentados.

### III. Testes Automatizados para Funcionalidades Críticas

Toda funcionalidade crítica DEVE possuir testes automatizados que cubram o fluxo
esperado, falhas relevantes, limites de autorização e regressões conhecidas. Uma
funcionalidade é crítica quando sua falha pode comprometer segurança, integridade
ou disponibilidade de dados, acessibilidade de um fluxo essencial, ou a principal
proposta de valor do sistema. Os testes DEVEM ser escritos antes ou junto da
implementação, ser determinísticos e executar no pipeline de integração. Código
crítico sem teste correspondente NÃO PODE ser considerado concluído.

### IV. Documentação como Parte da Entrega

Mudanças de comportamento, arquitetura, configuração, operação ou contrato DEVEM
atualizar a documentação correspondente na mesma entrega. APIs e módulos públicos
DEVEM explicitar propósito, entradas, saídas, erros e exemplos relevantes.
Decisões arquiteturais não óbvias e concessões de segurança ou acessibilidade
DEVEM registrar contexto e justificativa. A documentação DEVE permanecer próxima
do código ou ser ligada diretamente a ele, e sua validação faz parte dos critérios
de aceite.

### V. Código Modular e Coeso

O sistema DEVE ser organizado em módulos com responsabilidade única, interfaces
explícitas e baixo acoplamento. Regras de domínio NÃO DEVEM depender diretamente
de detalhes de interface, persistência ou fornecedores externos. Dependências
DEVEM fluir por contratos claros e ser substituíveis em testes. Duplicação,
dependências circulares, estado global oculto e abstrações sem necessidade DEVEM
ser evitados. Exceções à estrutura modular exigem justificativa no plano.

## Padrões de Qualidade

- Cada especificação DEVE identificar fluxos críticos, requisitos de
  acessibilidade, riscos de segurança e documentação afetada.
- Critérios de aceite DEVEM ser observáveis e testáveis, incluindo estados de erro
  e alternativas acessíveis quando aplicáveis.
- O conjunto mínimo de testes DEVE ser proporcional ao risco: testes unitários
  para regras isoladas e testes de integração ou ponta a ponta para limites,
  contratos e jornadas críticas.
- Alterações DEVEM passar por análise estática, testes automatizados pertinentes e
  revisão humana antes de serem integradas.
- Dívida deliberada DEVE ser registrada com impacto, responsável e condição de
  resolução; ela não pode remover controles essenciais de segurança ou testes de
  funcionalidades críticas.

## Fluxo de Desenvolvimento e Gates

1. A especificação classifica o que é crítico e define resultados mensuráveis.
2. O plano descreve módulos, limites de confiança, abordagem de acessibilidade,
   estratégia de testes e documentação que será alterada.
3. As tarefas ligam cada funcionalidade crítica aos respectivos testes
   automatizados e incluem as atualizações documentais necessárias.
4. A revisão confirma a conformidade constitucional e registra qualquer exceção.
5. A entrega só é aprovada quando os testes passam, os critérios de acessibilidade
   e segurança foram verificados e a documentação está atualizada.

Violações de um princípio são bloqueantes. Uma exceção temporária exige risco
documentado, justificativa, mitigação, responsável e prazo explícito.

## Governança

Esta constituição prevalece sobre práticas e convenções conflitantes do projeto.
Emendas exigem proposta documentada, análise de impacto nos artefatos existentes,
aprovação dos mantenedores e plano de migração quando houver incompatibilidade.

O versionamento segue SemVer: MAJOR para remoção ou redefinição incompatível de
princípios; MINOR para novo princípio ou ampliação normativa relevante; PATCH para
esclarecimentos sem mudança de obrigação. Toda revisão de plano e código DEVE
verificar conformidade com a versão vigente. A data de última alteração e a versão
DEVEM ser atualizadas em cada emenda.

**Versão**: 1.0.0 | **Ratificada em**: 2026-09-08 | **Última alteração**: 2026-09-08
