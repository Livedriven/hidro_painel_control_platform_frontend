# ADR 0001 - Inicialização, composição e roteamento

- **Status:** Proposto
- **Data de registro:** 2026-10-15
- **Relação com decisões anteriores:** nenhum ADR anterior ou aceite histórico identificado; não substitui decisão documentada.

> Contexto histórico: este ADR preserva a análise original do commit `86e54da71a6706e0e38647f93a6feb5e5a81b8a0`, anterior à reorganização por funcionalidade. Os caminhos e nomes antigos nas evidências identificam aquele registro; os links apontam para os destinos atuais. A evolução posterior está registrada abaixo e no [ADR 0004](0004-organizacao-do-codigo-por-funcionalidade.md).

## Contexto e problema

O UML atribui entrada e roteamento ao módulo `App`. O código distribui parte dessas responsabilidades: `main.tsx` inicializa o React e monta provedores, enquanto `App` compõe uma única página. O projeto precisa de uma descrição que preserve essa diferença e de uma orientação para acrescentar navegação sem misturar inicialização, composição e implementação das telas.

O objetivo desta proposta é tornar explícitas essas responsabilidades. Não há evidência de que a divisão tenha sido formalmente aceita ou adotada por algum motivo histórico específico.

## Evidências do registro original

| Evidência | Constatação |
| --- | --- |
| [index.html](../../index.html) | Define o elemento `root` e carrega `src/main.tsx`. |
| [src/main.tsx](../../src/main.tsx) | Usa `createRoot`, envolve `App` em `StrictMode` e `BrowserRouter` e importa o CSS global. |
| [src/app/App.tsx](../../src/app/App.tsx) | Importa `Login` e o renderiza diretamente; não declara rotas. |
| [src/app/pages/Login.tsx](../../src/features/auth/pages/Login.tsx) | Única página implementada. Não contém lógica de navegação ou autenticação. |
| [package.json](../../package.json) e [vite.config.ts](../../vite.config.ts) | Declaram React, React DOM, React Router e ferramentas de construção; a configuração usa os plugins de React, Tailwind e compilação React. Isso não comprova outras telas ou funcionalidades. |

Existe contexto de navegação, mas não uma tabela de rotas. A dependência `App → Pages` está implementada por um import concreto, independentemente de haver uma interface nominal `IPages`.

## Decisão proposta

Manter a inicialização em `main.tsx`: ponto de montagem no DOM, `StrictMode`, provedor de navegação e importação de estilos globais. Manter `App` como composição principal da aplicação e local de declaração das rotas quando houver telas e caminhos definidos.

As páginas representarão telas e coordenarão suas funcionalidades conforme o [ADR 0002](0002-responsabilidades-da-interface-e-acesso-a-servicos.md). A criação do root e dos provedores globais não será responsabilidade de cada página. `App` não assumirá operações de domínio ou detalhes de HTTP para registrar uma tela.

`IPages` será entendido como o contrato de disponibilização das páginas para composição: componentes exportados e, quando necessário, suas propriedades e integração com a navegação. O export de `Login` exemplifica uma superfície existente, mas não comprova um contrato UML formalmente especificado. Não se propõe criar uma `interface IPages`, uma classe base ou um registro dinâmico de páginas apenas para reproduzir o desenho.

Esta proposta não define URLs, novas páginas, redirecionamento após login ou proteção de rotas. Esses comportamentos dependem de requisitos e do contrato de autenticação ainda não confirmados.

## Alternativas consideradas na análise

| Alternativa | Motivo para não escolhê-la nesta proposta |
| --- | --- |
| Concentrar montagem, provedores, rotas e telas em `main.tsx` | É possível no tamanho atual, mas mistura configuração da raiz com decisões de navegação e reduz a responsabilidade clara já existente em `App`. |
| Manter `App` renderizando somente `Login` como organização definitiva | É suficiente para a tela atual, mas não orienta a composição das outras telas previstas no diagrama. Esse comportamento permanece válido enquanto não houver navegação a implementar. |
| Mover o provedor de navegação para `App` imediatamente | Não há necessidade demonstrada que justifique a movimentação. A localização atual já permite compor as futuras rotas em `App`. |

Esses motivos são avaliações atuais, não explicações históricas dos commits.

## Consequências, custos, limitações e riscos

- **Benefícios:** inicialização localizada e composição de páginas fácil de encontrar; a proposta aproveita o desenho atual sem introduzir dependências ou abstrações.
- **Custos:** novas telas exigirão manutenção da composição e das rotas em `App`. Se esse trabalho crescer, será necessário reavaliar a organização com evidências de complexidade real.
- **Limitações:** envolver a aplicação em `BrowserRouter` não cria rotas, sessão ou autorização. A proposta não resolve as lacunas funcionais do login.
- **Riscos:** confundir a intenção de navegação com uma implementação existente pode levar a testes ou documentação de telas inexistentes. Quando houver rotas, o comportamento de acesso direto e recarregamento dependerá também da configuração de hospedagem, ainda não verificada.

## Impactos e etapas de migração

A entrega original deste ADR alterou somente documentação, sem mudança de API pública, export, propriedade de componente, URL ou comportamento de execução.

Caso a proposta seja aceita e a navegação seja implementada:

1. Confirmar quais telas e caminhos precisam existir, incluindo comportamento de acesso que dependa de autenticação.
2. Declarar as rotas em `App`, preservando o root e o provedor em `main.tsx`.
3. Associar cada rota à página correspondente, sem incorporar transporte HTTP na composição principal.
4. Validar navegação e acesso direto no ambiente de hospedagem escolhido. Registrar decisões adicionais somente se houver uma escolha arquitetural relevante.

## Critérios verificáveis

**Para a documentação deste registro:** confirmar que `main.tsx` contém a inicialização, que `App` renderiza `Login` diretamente e que nenhum trecho deste ADR descreve rotas futuras como existentes.

**Para uma futura implementação da proposta:**

- A aplicação deve ter um ponto de montagem e um provedor global de navegação, sem duplicá-los nas páginas.
- `App` deve compor as rotas e páginas definidas pelos requisitos; páginas não devem executar `createRoot`.
- Para cada rota implementada, verificar renderização da tela correta, navegação, voltar/avançar e acesso direto/recarregamento.
- Os casos dependentes de sessão devem ser definidos e testados a partir do contrato real, sem inferir proteção pela existência de `BrowserRouter`.

## Evolução após o registro original

O [ADR 0004](0004-organizacao-do-codigo-por-funcionalidade.md) realocou Login para `features/auth/pages` e os estilos para `shared/styles`, ajustando os imports. A inicialização e os provedores continuam em `main.tsx`; `App` continua renderizando Login diretamente. Nenhuma rota foi acrescentada.

## Referências e ADRs relacionados

- [Índice, proveniência do diagrama e limites da análise](README.md#fonte-e-limites-da-análise).
- [Comparação entre dependências previstas e atuais](README.md#dependências-do-diagrama-e-implementação-atual).
- [ADR 0002 - Responsabilidades da interface e acesso a serviços](0002-responsabilidades-da-interface-e-acesso-a-servicos.md).
- [ADR 0003 - Separação entre serviços, HTTP e backend](0003-separacao-entre-servicos-http-e-backend.md).

- [ADR 0004 - Organização do código por funcionalidade](0004-organizacao-do-codigo-por-funcionalidade.md).
