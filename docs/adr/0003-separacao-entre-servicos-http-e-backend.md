# ADR 0003 - Separação entre serviços, HTTP e backend

- **Status:** Proposto
- **Data de registro:** 2026-10-15
- **Relação com decisões anteriores:** nenhum ADR anterior ou aceite histórico identificado; não substitui decisão documentada.

> Contexto histórico: este ADR preserva a análise original do commit `86e54da71a6706e0e38647f93a6feb5e5a81b8a0`, anterior à reorganização por funcionalidade. Os caminhos e nomes antigos nas evidências identificam aquele registro; os links apontam para os destinos atuais. A evolução posterior está registrada abaixo e no [ADR 0004](0004-organizacao-do-codigo-por-funcionalidade.md).

## Contexto e problema

O diagrama distingue serviços, cliente HTTP e backend externo. Ao mesmo tempo, chama `Services` de “único ponto de contato com o backend”, o que pode confundir a interface de operações consumida pela aplicação com o transporte de rede.

O frontend possui nomes de arquivos compatíveis com parte dessa intenção, mas nenhum deles implementa a integração. A decisão precisa definir responsabilidades e limites sem inventar operações de API, mecanismos de sessão ou funcionalidades de monitoramento.

## Evidências do registro original

| Evidência | Constatação |
| --- | --- |
| [src/app/service/authService.ts](../../src/features/auth/services/authService.ts) | Zero bytes; não exporta operação de autenticação. |
| [src/app/service/turbinaService.ts](../../src/features/turbinas/services/turbinaService.ts) | Zero bytes; não implementa consulta, comando ou qualquer outra operação de turbinas. |
| [src/app/service/telimetriaService.ts](../../src/features/telemetria/services/telemetriaService.ts) | Zero bytes; nenhuma leitura ou atualização de telemetria. A grafia do arquivo no registro original era `telimetriaService.ts`, preservada aqui como referência histórica. |
| [src/app/service/httpClient.ts](../../src/shared/http/httpClient.ts) | Zero bytes; não centraliza requisições, configuração, serialização ou tratamento de falhas. |
| [src/app/pages/Login.tsx](../../src/features/auth/pages/Login.tsx) | Sem chamada de serviço, estado de sessão ou manipulador `onSubmit`. O formulário contém `action="post"` e não declara `method`. |
| [vite.config.ts](../../vite.config.ts) e [package.json](../../package.json) | Não apresentam contrato de backend ou configuração de proxy de API. O código em `src/` não contém chamadas a APIs. |

Não existe arquivo de serviço de alertas nem implementação de backend neste repositório. Também não foram encontrados endpoints, formatos de requisição/resposta, política de autorização ou especificação de integração.

O comentário inicial de `Login` menciona futura consulta ao banco e ida para um dashboard; é uma anotação de trabalho pendente, não evidência de acesso ao banco nem contrato aceito. O texto “Todas as ações são registradas” não comprova auditoria implementada. A opção “Manter conectado” e o link de recuperação de senha também não possuem lógica correspondente.

O formulário HTML merece uma distinção: não haver chamadas de API na aplicação não impede submissão nativa pelo navegador. `action="post"` não define o método HTTP; sem `method` e sem tratamento de submissão, há risco de envio dos campos pela URL. Esse comportamento não foi exercitado no navegador nesta análise e não deve ser confundido com autenticação funcional.

## Decisão proposta

### Operações da aplicação e transporte

Os serviços serão a interface de operações consumida por páginas, componentes de domínio ou hooks de coordenação. Suas operações terão nomes e entradas compatíveis com as necessidades confirmadas da aplicação; conhecerão os endpoints e a adaptação de dados de cada operação quando esses contratos forem fornecidos. Não deverão importar componentes React para executar essas operações.

O `HttpClient` concentrará a execução HTTP e os aspectos compartilhados de transporte, como configuração de destino, serialização e identificação de falhas de comunicação. Não coordenará telas nem decidirá regras de turbinas, alertas ou telemetria. Serviços traduzirão resultados e erros específicos da operação quando isso for necessário para a aplicação; a representação exata depende do contrato confirmado.

Assim, “contato com o backend” terá dois sentidos explícitos: **Services oferece operações à aplicação; HttpClient realiza o transporte**. Páginas e componentes de domínio utilizarão os serviços, sem incorporar URLs e detalhes de HTTP. A separação é de responsabilidade; não exige separar os arquivos que, no registro original, compartilhavam `src/app/service/`.

Não selecionar uma biblioteca HTTP nem introduzir classes, injeção de dependências ou wrappers adicionais sem necessidade demonstrada. A implementação deve começar pelo mínimo exigido pelo primeiro fluxo de integração confirmado.

### Contratos representados no UML

Os nomes abaixo representam capacidades e fronteiras conceituais. Não são declarações TypeScript encontradas no código nem autorização para inventar assinaturas.

| Contrato | Significado proposto | Situação verificada |
| --- | --- | --- |
| `IAuthService` | Operações de autenticação que a aplicação realmente precisar consumir. | Arquivo vazio; fluxo, entradas, resultados e sessão não definidos. |
| `ITurbinaService` | Operações de aplicação relacionadas a turbinas, a especificar conforme requisitos. | Arquivo vazio; não se pode presumir operações de leitura ou controle. |
| `IAlertaService` | Operações de aplicação relacionadas a alertas, a especificar conforme requisitos. | Somente no diagrama; nenhum serviço implementado ou arquivo correspondente. |
| `ITelemetriaService` | Acesso às capacidades de telemetria que forem confirmadas. | Arquivo vazio com a grafia `telimetriaService.ts`; protocolo e frequência não definidos. |
| `IHttpClient` | Capacidade compartilhada de executar comunicação HTTP para os serviços. | Cliente vazio; sem assinaturas ou comportamento definidos. |
| `IBackendApi` | Contrato externo de integração: operações disponíveis, formatos, autenticação, autorização e erros a confirmar. | Nenhuma especificação ou implementação externa verificada. |

Exports de funções ou módulos e tipos de entradas/saídas podem expressar os contratos locais. Uma `interface` TypeScript só será necessária se houver um uso concreto que a justifique. `IBackendApi` exige acordo com o sistema externo: criar um tipo local não comprova conformidade da API. `IPages` e `IUiComponents` têm seus papéis descritos nos ADRs 0001 e 0002.

### Fronteira entre frontend e backend

Na proposta, o frontend cuida de apresentação, interação e coordenação das operações disponibilizadas pela API. O backend, externo a este repositório, deverá validar as requisições e aplicar suas regras e autorizações; controles de interface não substituem essa responsabilidade. Não há evidência de que essas garantias já existam no backend.

Não se propõe acesso direto do navegador ao banco de dados. O texto “API REST / SCADA” pertence ao diagrama; não confirma endpoints, modelo de dados, banco, protocolo de sessão ou permissões. O contrato de autenticação precisa ser conhecido antes de decidir envio de credenciais, persistência da sessão ou comportamento de expiração. Da mesma forma, a menção visual a tempo real não permite escolher polling, WebSocket ou outro mecanismo para telemetria.

## Alternativas consideradas na análise

| Alternativa | Motivo para não escolhê-la nesta proposta |
| --- | --- |
| Fazer requisições diretamente em páginas e componentes | Pode abreviar uma primeira chamada, mas distribui conhecimento de endpoints, transporte e tratamento de falhas pela interface e torna mudanças de integração mais abrangentes. |
| Usar uma camada única que misture operações de domínio e transporte | Reduz uma separação inicial, mas acopla configuração HTTP e operações distintas. A distinção já sugerida pelo UML pode ser mantida com poucos módulos, sem uma estrutura complexa. |
| Criar agora interfaces nominais, classes e adaptadores para todos os contratos UML | Não há operações concretas para especificar. O resultado seria uma abstração baseada em suposições, não em contratos verificados. |
| Definir antecipadamente sessão e atualização de telemetria | Exigiria escolher comportamentos sem requisitos nem documentação do backend. Essas escolhas ficam pendentes, não implicitamente resolvidas. |

O descarte dessas alternativas é uma avaliação desta análise, sem alegação de decisão histórica dos autores.

## Consequências, custos, limitações e riscos

- **Benefícios:** consumidores usam operações da aplicação sem conhecer transporte; configuração compartilhada de rede fica localizada; serviços e comunicação podem ser avaliados separadamente.
- **Custos:** há uma separação adicional entre UI, operação e transporte. Serviços muito pequenos podem parecer apenas encaminhamentos; não devem receber abstrações extras para justificar sua existência.
- **Limitações:** tipos locais não validam sozinhos dados recebidos de um sistema externo. Formatos e validações dessa fronteira precisarão seguir o contrato real. Nenhuma integração está funcional hoje.
- **Riscos:** uma falha no cliente compartilhado pode afetar todos os serviços; mensagens de erro podem perder contexto se o transporte assumir responsabilidades de domínio. O formulário atual precisa de revisão da submissão antes de receber credenciais reais, devido ao risco de exposição pela URL.
- **Informações não confirmadas:** não há base para prometer autorização, registro de ações, disponibilidade do backend, controle de turbinas, tratamento de alertas ou atualização em tempo real.

## Impactos e etapas de migração

A entrega original deste ADR não alterou contratos, imports ou comportamento da aplicação. Os arquivos vazios não ofereciam uma API implementada a migrar. A grafia do arquivo de telemetria foi preservada naquela entrega; a correção posterior está registrada no ADR 0004.

Para implementar uma integração após validação da proposta:

1. Obter requisitos da funcionalidade e o contrato real do backend, incluindo autenticação, respostas e falhas aplicáveis.
2. Especificar somente as operações de serviço necessárias a esse fluxo e o suporte de transporte correspondente, sem criar antecipadamente todos os serviços do diagrama.
3. Implementar o `HttpClient` compartilhado e conectar a operação de domínio ao transporte, mantendo detalhes HTTP fora da UI.
4. Conectar a operação à página, ao componente de domínio ou ao hook responsável conforme o ADR 0002. No caso do login, revisar o envio do formulário para evitar submissão indevida e exposição de credenciais na URL.
5. Validar sucesso, erros e dados recebidos de acordo com o contrato real. Documentar decisões adicionais sobre sessão ou telemetria quando houver evidências e requisitos para tomá-las.

## Critérios verificáveis

**Para a documentação deste registro:** confirmar que os quatro arquivos de serviço/cliente citados estão vazios, que alertas não possuem serviço e que nenhuma assinatura, endpoint ou sessão foi descrita como existente.

**Para uma futura implementação da proposta:**

- Chamadas da UI devem passar por serviços; serviços devem usar o cliente HTTP para transporte. Verificar imports e pontos de chamada, incluindo hooks quando existirem.
- Serviços e cliente HTTP não devem depender de componentes React; o cliente não deve conter navegação de telas nem regras de operação de turbinas, alertas ou telemetria.
- Testar uma operação implementada com transporte controlado, cobrindo sucesso, falha de comunicação e falhas/dados inválidos previstos no contrato, sem depender de um backend real para esses testes.
- Confirmar, em ambiente de integração disponibilizado pelo projeto, a compatibilidade com o contrato externo; testes locais com substitutos não comprovam essa compatibilidade.
- No fluxo de autenticação implementado, verificar que a submissão não inclui credenciais na URL e que os comportamentos de sessão e erro correspondem ao contrato aprovado.
- Validar autorização no backend conforme seus requisitos; esconder uma tela não deve ser usado como evidência dessa garantia.

## Evolução após o registro original

O [ADR 0004](0004-organizacao-do-codigo-por-funcionalidade.md) moveu os serviços para suas funcionalidades e o cliente HTTP para `shared/http`. O arquivo de telemetria foi renomeado para `telemetriaService.ts`; o nome anterior aparece neste ADR somente como evidência histórica. Todos continuam vazios, e a mudança não definiu contratos nem integrou autenticação ou backend. A separação entre operações da aplicação e transporte descrita neste registro continua válida.

## Referências e ADRs relacionados

- [Índice, proveniência do diagrama e limites da análise](README.md#fonte-e-limites-da-análise).
- [Dependências previstas e implementação atual](README.md#dependências-do-diagrama-e-implementação-atual).
- [Pendências de validação](README.md#pendências-de-validação).
- [ADR 0001 - Inicialização, composição e roteamento](0001-inicializacao-composicao-e-roteamento.md).
- [ADR 0002 - Responsabilidades da interface e acesso a serviços](0002-responsabilidades-da-interface-e-acesso-a-servicos.md).

- [ADR 0004 - Organização do código por funcionalidade](0004-organizacao-do-codigo-por-funcionalidade.md).
