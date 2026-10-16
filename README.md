# hidro_painel_control_platform_frontend
Frontend refatorado de um sistema SCADA para monitoramento de usina hidrelétrica. Projeto de aprendizado do SENAI com foco em organização de código, legibilidade e visualização de dados operacionais.

## Organização do código

`app` compõe a aplicação, `features` reúne o código de cada funcionalidade e `shared` contém recursos compartilhados. A organização por funcionalidade está registrada no [ADR 0004](docs/adr/0004-organizacao-do-codigo-por-funcionalidade.md).

```text
src/
├── main.tsx
├── app/
│   ├── App.tsx
│   └── components/
│       └── Sidebar.tsx
├── features/
│   ├── auth/
│   │   ├── pages/
│   │   │   └── Login.tsx
│   │   └── services/
│   │       └── authService.ts
│   ├── turbinas/
│   │   └── services/
│   │       └── turbinaService.ts
│   └── telemetria/
│       └── services/
│           └── telemetriaService.ts
└── shared/
    ├── http/
    │   └── httpClient.ts
    └── styles/
        └── global.css
```

| Área | Responsabilidade |
| --- | --- |
| `src/main.tsx` | Montagem do React, `StrictMode`, `BrowserRouter` e importação dos estilos globais. |
| `src/app/` | Composição das funcionalidades e futuras rotas. `Sidebar` fica reservado à navegação da aplicação. |
| `src/features/auth/` | Página de login e serviço reservado à autenticação. |
| `src/features/turbinas/` e `src/features/telemetria/` | Esqueleto dos serviços de cada funcionalidade. |
| `src/shared/http/` | Cliente HTTP reservado ao transporte compartilhado pelos serviços. |
| `src/shared/styles/` | Estilos globais e importação do Tailwind. |

As dependências seguem `app → features → shared`. `shared` não importa `app` ou funcionalidades. Funcionalidades não importam umas às outras: a composição entre elas fica em `app`. `main.tsx` é a entrada que conecta a aplicação aos estilos globais.

Componentes específicos ficam na funcionalidade correspondente. Componentes visuais independentes poderão ficar em `shared/components` quando existirem; hooks e tipos ficam próximos de seus consumidores, sem diretórios antecipados. Páginas, componentes de domínio e hooks podem coordenar serviços conforme o [ADR 0002](docs/adr/0002-responsabilidades-da-interface-e-acesso-a-servicos.md). Serviços usam o cliente HTTP conforme o [ADR 0003](docs/adr/0003-separacao-entre-servicos-http-e-backend.md). Essas operações ainda não estão implementadas.

Somente `Login` tem implementação de página. `Sidebar`, os três serviços e `httpClient` continuam vazios por escolha explícita de preservar o esqueleto. Não há rotas declaradas, integração de autenticação ou backend conectado.

## Arquivos gerais

| Arquivos | Função |
| --- | --- |
| `index.html` | Entrada HTML com o elemento de montagem e carregamento de `src/main.tsx`. |
| `package.json` e `package-lock.json` | Comandos, dependências e versões fixadas para instalação reproduzível. |
| `vite.config.ts` | Configuração de desenvolvimento e build, com React, compilador React e Tailwind. |
| `tsconfig.json`, `tsconfig.app.json` e `tsconfig.node.json` | Configuração TypeScript do código de aplicação e das ferramentas. |
| `eslint.config.js` | Regras de análise estática. |
| `.gitignore` | Exclusões de dependências, artefatos de build e arquivos locais. |
| `docs/` | Documentação e histórico de decisões arquiteturais. |

## Desenvolvimento e verificação

Com Node.js e npm instalados:

```sh
npm ci
npm run dev
```

| Comando | Resultado |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento do Vite. |
| `npm run build` | Verifica o TypeScript e gera a aplicação em `dist/`. |
| `npm run lint` | Executa o ESLint. |
| `npm run preview` | Serve o build de `dist/` para conferência local; execute o build antes. |

O Tailwind é processado pelo plugin do Vite; não há um comando separado de geração de CSS. Não foi adicionado framework ou script de testes nesta reorganização.

## Documentação

Consulte a [entrada da documentação](docs/README.md) e o [índice dos ADRs](docs/adr/README.md) para distinguir implementação, propostas e contratos ainda não confirmados. Os ADRs anteriores preservam o contexto original; a migração dos caminhos está registrada no ADR 0004.

A integração de autenticação permanece pendente. O risco de submissão nativa de credenciais pela URL no formulário atual está registrado no ADR 0003; esta reorganização preservou o formulário.
