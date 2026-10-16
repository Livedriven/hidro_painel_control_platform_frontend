# ADR 0002 - Responsabilidades da interface e acesso a serviços

- **Status:** Proposto
- **Data de registro:** 2026-10-15
- **Relação com decisões anteriores:** nenhum ADR anterior ou aceite histórico identificado; não substitui decisão documentada.

> Contexto histórico: este ADR preserva a análise original do commit `86e54da71a6706e0e38647f93a6feb5e5a81b8a0`, anterior à reorganização por funcionalidade. Os caminhos e nomes antigos nas evidências identificam aquele registro; os links apontam para os destinos atuais. A evolução posterior está registrada abaixo e no [ADR 0004](0004-organizacao-do-codigo-por-funcionalidade.md).

## Contexto e problema

O diagrama permite que páginas e componentes utilizem serviços, mas descreve `Components` genericamente como peças reutilizáveis de UI. Reutilização visual e responsabilidade de domínio não são a mesma coisa: um componente que apenas apresenta dados tem necessidades diferentes de uma unidade de interface que coordena uma funcionalidade.

É necessário esclarecer quando cada lugar pode acessar serviços, sem impor que todo componente seja puramente visual ou que toda operação passe por um hook. O código atual ainda não oferece casos implementados para validar a distribuição mais adequada de cada funcionalidade.

## Evidências do registro original

| Evidência | Constatação |
| --- | --- |
| [src/app/pages/Login.tsx](../../src/features/auth/pages/Login.tsx) | Renderiza o formulário e conteúdo com elementos HTML; não importa componentes próprios, serviços ou hooks. O comentário inicial descreve trabalho pendente. |
| [src/app/components/Sidebar.tsx](../../src/app/components/Sidebar.tsx) | Arquivo de zero bytes; não implementa componente e não permite classificá-lo como visual genérico ou de domínio. |
| [src/app/App.tsx](../../src/app/App.tsx) | Consome `Login` diretamente, sem uma composição compartilhada de componentes. |
| [authService.ts](../../src/features/auth/services/authService.ts), [turbinaService.ts](../../src/features/turbinas/services/turbinaService.ts) e [telimetriaService.ts](../../src/features/telemetria/services/telemetriaService.ts) | Arquivos vazios, sem operações disponíveis para consumo pela interface. |

Não foram encontrados hooks próprios nem outros componentes no diretório `components`. A separação entre componentes genéricos e de domínio é uma proposta de responsabilidade, não uma classificação já materializada em subdiretórios.

## Decisão proposta

Distribuir a coordenação conforme o papel da unidade de interface:

| Unidade | Responsabilidade proposta | Acesso a serviços |
| --- | --- | --- |
| Página | Compor uma tela e coordenar operações e estados que abrangem a tela. | Permitido quando a operação pertence à coordenação da página. |
| Componente visual genérico | Apresentar dados e emitir eventos por propriedades e callbacks; pode manter estado local de interação. | Não deve depender de serviços de domínio. Recebe os dados e ações de quem o compõe. |
| Componente de domínio | Representar uma funcionalidade coesa com significado para a aplicação. | Permitido quando coordena a própria funcionalidade; não é obrigado a buscar dados se o pai já os fornece. |
| Hook próprio | Encapsular coordenação de estado e efeitos quando houver reutilização ou complexidade que justifique extração. | Permitido em hooks de aplicação ou domínio; não é intermediário obrigatório para qualquer chamada. |

Para cada operação, definir quem coordena seus dados e estados para evitar requisições duplicadas entre página e componente. Quem coordena a operação também deve apresentar ou encaminhar seus estados de carregamento, sucesso e erro. O transporte permanece encapsulado conforme o [ADR 0003](0003-separacao-entre-servicos-http-e-backend.md).

O contrato UML `IUiComponents` significa a superfície de consumo dos componentes: exports, propriedades e callbacks quando necessários. Uma função React e tipos de propriedades podem expressar essa superfície. Não há atualmente um catálogo reutilizável ou uma declaração com esse nome, e a proposta não exige criar `interface IUiComponents`.

Não criar novas pastas, camadas de hooks, componentes genéricos ou abstrações antecipadamente. A estrutura técnica existente pode acomodar essa distinção enquanto houver poucos elementos. A classificação deve acompanhar a responsabilidade efetiva, não apenas o nome do diretório.

## Alternativas consideradas na análise

| Alternativa | Motivo para não escolhê-la nesta proposta |
| --- | --- |
| Permitir serviços somente nas páginas | Facilita uma regra uniforme, mas pode concentrar estados demais nas páginas e exigir passagem de muitas propriedades para funcionalidades de domínio autônomas. |
| Permitir serviços em qualquer componente | É simples no início, mas vincula peças visuais genéricas ao domínio e pode espalhar coordenação, duplicar requisições e dificultar reutilização e testes. |
| Exigir um hook para toda operação | Pode padronizar a coordenação, mas introduz indireção mesmo para lógica pequena e de uso único. A extração deve resolver uma necessidade observada. |
| Criar agora uma estrutura completa por domínio | Poderia aproximar arquivos relacionados quando o produto crescer, mas não há funcionalidades implementadas suficientes para justificar essa reorganização nesta análise. |

Nenhuma dessas alternativas foi identificada como uma decisão historicamente rejeitada pelo projeto.

## Consequências, custos, limitações e riscos

- **Benefícios:** componentes genéricos podem ser reutilizados sem conhecer backend ou domínio; funcionalidades coesas podem manter a coordenação perto da sua interface.
- **Custos:** a regra exige avaliar responsabilidades caso a caso. Componentes que acessam serviços precisarão de testes capazes de controlar o resultado dessas operações.
- **Limitações:** sem componentes funcionais além de `Login`, não é possível demonstrar reaproveitamento, redução de complexidade ou o local ideal de cada futura operação.
- **Riscos:** coordenação compartilhada sem definição clara pode duplicar carregamentos ou apresentar dados inconsistentes. Classificar qualquer componente como “de domínio” apenas para permitir chamadas enfraquece a separação proposta.

## Impactos e etapas de migração

A entrega original deste ADR foi exclusivamente documental; não modificou o formulário nem acrescentou componentes ou propriedades públicas.

Na implementação de uma funcionalidade aprovada:

1. Identificar o responsável por coordenar a operação: página ou componente de domínio.
2. Conectar esse responsável ao serviço confirmado e tratar os estados necessários da operação.
3. Extrair apresentação para componentes genéricos quando houver responsabilidade visual clara ou reutilização concreta.
4. Extrair um hook se a coordenação se repetir ou ficar complexa o suficiente para justificar a separação.
5. Rever os consumidores ao extrair propriedades e callbacks, preservando estados, eventos, validações e acessibilidade existentes.

Na análise original, não havia necessidade de migrar `Sidebar` ou os serviços: os arquivos não continham implementação a preservar ou refatorar. A reorganização posterior está descrita na seção de evolução.

## Critérios verificáveis

**Para a documentação deste registro:** verificar que `Login` não consome serviços, que `Sidebar` está vazio e que páginas, componentes e hooks são descritos como opções de coordenação propostas.

**Para uma futura implementação da proposta:**

- Um componente classificado como visual genérico deve funcionar recebendo dados e callbacks, sem importar serviços de domínio ou o cliente HTTP.
- Uma operação deve ter um responsável identificável por dados, carregamento e erro; verificar que a página e seus filhos não a disparam redundantemente.
- Testar um componente visual com diferentes propriedades e eventos sem depender de API.
- Testar a unidade que coordena uma operação com resultados de sucesso e falha do serviço; incluir carregamento e interações relevantes à funcionalidade.
- A introdução de um hook deve ter uma necessidade demonstrável de reutilização ou organização da coordenação, sem exigir um hook por serviço.

## Evolução após o registro original

Após a análise original, o solicitante escolheu organização por funcionalidade e preservação dos arquivos vazios. O [ADR 0004](0004-organizacao-do-codigo-por-funcionalidade.md) revisa a alternativa de agrupamento por domínio discutida acima, sem apagar seu motivo de descarte original. As responsabilidades de páginas, componentes visuais, componentes de domínio e hooks continuam válidas. A nova organização não cria componentes compartilhados ou hooks antecipadamente; Sidebar permanece vazio em `app/components`.

## Referências e ADRs relacionados

- [Índice, proveniência do diagrama e limites da análise](README.md#fonte-e-limites-da-análise).
- [Arquitetura proposta](README.md#arquitetura-proposta).
- [ADR 0001 - Inicialização, composição e roteamento](0001-inicializacao-composicao-e-roteamento.md).
- [ADR 0003 - Separação entre serviços, HTTP e backend](0003-separacao-entre-servicos-http-e-backend.md).

- [ADR 0004 - Organização do código por funcionalidade](0004-organizacao-do-codigo-por-funcionalidade.md).
