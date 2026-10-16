# ADR 0004 - Organização do código por funcionalidade

- **Status:** Proposto
- **Data de registro:** 2026-10-15
- **Relação com decisões anteriores:** complementa os ADRs 0001 e 0003 e revisa a alternativa de agrupamento por domínio analisada no ADR 0002. Preserva as responsabilidades de interface e o histórico dos três registros.

## Contexto e problema

No registro inicial, o código estava agrupado por tipo de arquivo dentro de `src/app`: `pages`, `components`, `service` e `style`. A análise do ADR 0002 considerou que não havia funcionalidades implementadas suficientes para justificar uma organização completa por domínio.

Após essa análise, o solicitante escolheu explicitamente reorganizar e documentar o projeto **por funcionalidade**, mantendo os arquivos vazios como esqueleto. Essa escolha é o motivo desta reorganização; não se afirma que ela já produza ganhos de escala ou resolva integrações inexistentes. O status permanece **Proposto**, conforme o plano solicitado, e os ADRs anteriores não são promovidos automaticamente a aceitos.

O problema é aproximar os arquivos de uma mesma funcionalidade e dar destinos claros à composição e à infraestrutura compartilhada, preservando o comportamento atual do login.

## Evidências da implementação atual

Os caminhos da primeira coluna abaixo são históricos, presentes no commit `86e54da71a6706e0e38647f93a6feb5e5a81b8a0`. Os links apontam para os destinos após esta reorganização.

| Caminho no registro original | Destino atual | Situação |
| --- | --- | --- |
| `src/app/pages/Login.tsx` | [src/features/auth/pages/Login.tsx](../../src/features/auth/pages/Login.tsx) | Página realocada sem alterar seu conteúdo. |
| `src/app/service/authService.ts` | [src/features/auth/services/authService.ts](../../src/features/auth/services/authService.ts) | Continua vazio. |
| `src/app/service/turbinaService.ts` | [src/features/turbinas/services/turbinaService.ts](../../src/features/turbinas/services/turbinaService.ts) | Continua vazio. |
| `src/app/service/telimetriaService.ts` | [src/features/telemetria/services/telemetriaService.ts](../../src/features/telemetria/services/telemetriaService.ts) | Continua vazio; a grafia do nome foi corrigida. |
| `src/app/service/httpClient.ts` | [src/shared/http/httpClient.ts](../../src/shared/http/httpClient.ts) | Continua vazio. |
| `src/app/style/styles.css` | [src/shared/styles/global.css](../../src/shared/styles/global.css) | Conteúdo preservado, incluindo a importação do Tailwind. |

[Sidebar.tsx](../../src/app/components/Sidebar.tsx) permanece vazio no mesmo caminho. [App.tsx](../../src/app/App.tsx) passou a importar `Login` da funcionalidade de autenticação; [main.tsx](../../src/main.tsx) passou a importar o CSS compartilhado. O root, os provedores e os exports continuam iguais.

No [package.json](../../package.json), foram removidos `main: "index.js"` e o script `tailwind:watch`: apontavam para arquivos inexistentes, e o script referenciava uma CLI não declarada. Os quatro comandos de desenvolvimento/verificação e as dependências foram preservados. O [lockfile](../../package-lock.json) e a [configuração do Vite](../../vite.config.ts) não foram alterados.

## Decisão proposta

### Organização e responsabilidades

- **`app`:** composição da aplicação e futuras rotas. `Sidebar` fica reservado à estrutura de navegação; sua localização é uma intenção de uso, não uma implementação funcional.
- **`features/auth`, `features/turbinas` e `features/telemetria`:** código pertencente a cada funcionalidade. Páginas, serviços e futuros componentes específicos ficam dentro do respectivo módulo.
- **`shared/http`:** transporte HTTP compartilhado pelos serviços. O arquivo reservado não passa a oferecer operações apenas por ter mudado de diretório.
- **`shared/styles`:** CSS global e importação do Tailwind. `main.tsx` continua responsável por carregar esses estilos.
- **Raiz do projeto:** entrada HTML, manifesto, lockfile, configurações das ferramentas, README e documentação. Não mover arquivos de configuração apenas para reproduzir a organização do código da aplicação.

A árvore completa e os comandos estão no [README do projeto](../../README.md#organização-do-código).

### Dependências e interfaces

A direção de dependência será `app → features → shared`. `shared` não dependerá de funcionalidades ou da composição da aplicação. Features não importarão `app` nem outras features; a composição entre funcionalidades ficará em `app`. `main.tsx`, como ponto de entrada, conecta `App`, os provedores e os estilos compartilhados.

Dentro de uma funcionalidade, páginas, componentes de domínio ou hooks podem coordenar serviços conforme o ADR 0002. Serviços utilizarão o transporte compartilhado conforme o ADR 0003. Componentes visuais genéricos continuarão recebendo dados e callbacks; somente quando existirem terão um destino em `shared/components`.

Preservar os cinco arquivos vazios por solicitação explícita, sem acrescentar exports, respostas simuladas ou integrações fictícias. Não criar agora uma funcionalidade de alertas, pastas vazias adicionais, aliases, arquivos de reexportação, novos contratos ou interfaces TypeScript. Hooks e tipos deverão ficar próximos dos consumidores quando houver uma necessidade concreta.

Os exports atuais de `App` e `Login` permanecem iguais. As mudanças são de caminhos internos; os serviços e o cliente vazio não possuem consumidores a migrar.

## Alternativas consideradas na análise

| Alternativa | Motivo para não escolhê-la nesta reorganização |
| --- | --- |
| Camadas técnicas diretamente em `src` | Teria pouca profundidade e seria suficiente para o tamanho atual, mas o solicitante escolheu aproximar os arquivos por funcionalidade. |
| Manter todos os grupos dentro de `src/app` | Exigiria menos movimentações, mas manteria composição, código de domínio e transporte no mesmo agrupamento principal. |
| Remover os arquivos vazios | Evitaria um esqueleto sem comportamento; foi descartada porque o solicitante pediu explicitamente sua preservação. |
| Criar desde já componentes compartilhados, hooks e interfaces para todos os domínios | Não há consumidores ou contratos que sustentem essas abstrações. A reorganização reserva apenas os arquivos já existentes. |

Esses motivos registram a análise e as escolhas desta tarefa, sem atribuí-los aos autores dos commits originais.

## Consequências, custos, limitações e riscos

- **Benefícios:** página e serviço de autenticação ficam próximos; composição, funcionalidades e transporte possuem destinos distintos; nomes de diretórios e a grafia de telemetria ficam consistentes.
- **Custos:** há mais níveis de diretórios para poucos arquivos, e algumas funcionalidades contêm somente um arquivo vazio. Esse custo foi aceito na escolha de manter o esqueleto, sem implicar aceite formal de todos os ADRs.
- **Limitações:** organização física não implementa autenticação, turbinas, alertas, telemetria ou HTTP. O projeto continua renderizando somente Login, sem rotas declaradas.
- **Riscos:** imports cruzados futuros podem enfraquecer a separação; recursos específicos de um domínio podem ser colocados indevidamente em `shared`. Mudanças de caminho podem quebrar imports, a descoberta de estilos ou links documentais, por isso a migração inclui essas verificações.
- **Pendência existente:** o risco de envio de credenciais pela URL descrito no ADR 0003 permanece. A movimentação preserva o formulário; corrigir a submissão é uma alteração funcional separada.

## Impactos e etapas de migração

1. Mover Login e os três serviços para as respectivas funcionalidades; manter Sidebar em `app/components`.
2. Mover o cliente HTTP e o CSS para `shared`, corrigindo o nome `telimetriaService.ts` para `telemetriaService.ts`.
3. Ajustar os dois imports afetados e remover os diretórios antigos que ficaram vazios, sem manter duplicatas ou aliases de compatibilidade sem consumidores.
4. Limpar os dois campos obsoletos do manifesto, preservando dependências, lockfile e configuração das ferramentas.
5. Atualizar README, índices, diagramas e links; preservar caminhos antigos como evidência histórica e registrar a evolução nos ADRs anteriores.
6. Verificar build, lint e renderização antes/depois, além da integridade dos arquivos movidos e dos links.

Não há migração de dados, mudança de URL pública, novo contrato de backend ou alteração de sessão. Não foram restaurados os arquivos de `diagramas/` que já estavam removidos localmente.

## Critérios verificáveis

- `npm ci` deve instalar as versões do lockfile; `npm run build` e `npm run lint` devem passar antes e depois, distinguindo problemas preexistentes.
- A página Login e o CSS movidos devem preservar integralmente seu conteúdo; os cinco arquivos reservados devem continuar com zero bytes.
- Imports devem resolver os novos destinos, sem referências executáveis aos caminhos antigos ou dependências no sentido contrário ao definido.
- Em desktop e celular, o login deve renderizar com os mesmos elementos e estilos, sem erros de execução; a verificação não deve enviar credenciais.
- O manifesto deve preservar os quatro scripts válidos e todas as dependências; o lockfile deve permanecer idêntico.
- Os links dos quatro ADRs e índices devem resolver, e as referências aos caminhos anteriores devem estar identificadas como históricas.

## Verificações desta reorganização

Em 2026-10-15, `npm ci --no-audit --no-fund` concluiu a instalação pelo lockfile. Build e lint passaram antes e depois da reorganização. No Chromium, o login foi conferido em 1280 × 900 e 390 × 844: DOM, estilos observados e capturas de tela permaneceram idênticos, sem erros de execução ou envio de credenciais.

A comparação de conteúdo confirmou os seis arquivos movidos sem alterações, os cinco arquivos reservados com zero bytes, o lockfile e as configurações preservados. Foram verificados 83 links e âncoras nos sete documentos, além da referência histórica ao diagrama no Git. As verificações foram pontuais, sem adicionar testes ou dependências ao projeto.

Não foram exercitados autenticação, submissão do formulário ou integração com backend. Esses comportamentos não podem ser considerados validados pela reorganização.

## Referências e ADRs relacionados

- [README e árvore atual](../../README.md#organização-do-código).
- [Índice dos ADRs e contexto da análise](README.md#fonte-e-limites-da-análise).
- [ADR 0001 - Inicialização, composição e roteamento](0001-inicializacao-composicao-e-roteamento.md).
- [ADR 0002 - Responsabilidades da interface e acesso a serviços](0002-responsabilidades-da-interface-e-acesso-a-servicos.md).
- [ADR 0003 - Separação entre serviços, HTTP e backend](0003-separacao-entre-servicos-http-e-backend.md).
