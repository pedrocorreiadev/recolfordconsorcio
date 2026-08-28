# Funcoes Importantes

Este catalogo descreve as funcoes principais do projeto. Os componentes grandes foram mantidos como estao para preservar a estrutura atual.

## `components/public-home.tsx`

### `PublicHome`

- Objetivo: renderizar o site publico, carregar campanhas, controlar o simulador e iniciar o contato pelo WhatsApp.
- Parametros: nao recebe parametros.
- Retorno: JSX da pagina publica.
- Usa: `fetch("/api/campaigns")`, componentes de UI, `calculateInstallment`, `DEFAULT_CAMPAIGNS`, `formatBRL`, `goalLabel` e `whatsappUrl`.
- Efeitos colaterais: busca campanhas na API, salva estado no navegador, envia lead por API e abre uma nova janela para WhatsApp.
- Chamado por: `app/page.tsx`.

### `chooseGoal`

- Objetivo: trocar o tipo de consorcio selecionado e ajustar credito/prazo com base na campanha correspondente.
- Parametros: `nextGoal`, com o objetivo escolhido; `scroll`, que define se a pagina deve rolar ate o simulador.
- Retorno: nenhum.
- Usa: `campaigns`, `DEFAULT_CAMPAIGNS`, `setGoal`, `setCredit`, `setTerm` e `document.querySelector`.
- Efeitos colaterais: altera estado da interface e pode rolar a pagina.
- Chamado por: botoes de objetivos, cards de planos e select do simulador.

### `contactPedro`

- Objetivo: montar a mensagem da simulacao, registrar o interessado se houver nome e telefone, e abrir o WhatsApp.
- Parametros: nenhum.
- Retorno: `Promise<void>`.
- Usa: estado do simulador, `fetch("/api/leads")`, `formatBRL`, `goalLabel`, `whatsappUrl` e `window.open`.
- Efeitos colaterais: pode criar um lead no backend e abre uma aba/janela externa.
- Chamado por: botao "Receber planejamento no WhatsApp".

## `components/admin-dashboard.tsx`

### `AdminDashboard`

- Objetivo: renderizar o painel administrativo com metricas, interessados, campanhas e formulario de nova campanha.
- Parametros: `userName`, nome exibido no cabecalho do painel.
- Retorno: JSX do painel administrativo.
- Usa: APIs `/api/campaigns?all=1`, `/api/leads`, componentes de UI, `toast`, `formatBRL`, `goalLabel` e `whatsappUrl`.
- Efeitos colaterais: busca dados administrativos, publica campanhas, atualiza campanhas, muda status de leads e exibe notificacoes.
- Chamado por: `app/admin/page.tsx`.

### `loadData`

- Objetivo: carregar campanhas e interessados para o painel.
- Parametros: nenhum.
- Retorno: `Promise<void>`.
- Usa: `fetch("/api/campaigns?all=1")`, `fetch("/api/leads")`, `setCampaigns`, `setLeads`, `setLoading` e `toast`.
- Efeitos colaterais: atualiza estado do painel e pode exibir erro.
- Chamado por: `useEffect`, botao "Atualizar" e depois da criacao de campanha.

### `saveCampaign`

- Objetivo: validar e publicar uma nova campanha.
- Parametros: nenhum.
- Retorno: `Promise<void>`.
- Usa: estado `campaign`, `fetch("/api/campaigns")`, `toast`, `setCampaign` e `loadData`.
- Efeitos colaterais: cria campanha no backend, limpa formulario e recarrega dados.
- Chamado por: botao "Publicar campanha".

### `changeCampaign`

- Objetivo: alterar se uma campanha esta ativa e/ou destacada.
- Parametros: `item`, campanha atual; `field`, campo alterado; `value`, novo valor booleano.
- Retorno: `Promise<void>`.
- Usa: `fetch("/api/campaigns")`, `setCampaigns` e `toast`.
- Efeitos colaterais: atualiza campanha no backend e no estado local.
- Chamado por: switches "Exibir no site" e "Destacar".

### `changeLeadStatus`

- Objetivo: atualizar a etapa de atendimento de um interessado.
- Parametros: `id`, identificador do lead; `status`, nova etapa.
- Retorno: `Promise<void>`.
- Usa: `fetch("/api/leads")`, `setLeads` e `toast`.
- Efeitos colaterais: atualiza lead no backend e no estado local.
- Chamado por: select da coluna "Etapa".

### `Field`

- Objetivo: renderizar um campo numerico reutilizado no formulario de campanha.
- Parametros: `label`, `value`, `step` e `onChange`.
- Retorno: JSX de um label com input numerico.
- Usa: componente `Input`.
- Efeitos colaterais: chama `onChange` quando o usuario altera o valor.
- Chamado por: formulario "Nova campanha".

## `components/admin-login-form.tsx`

### `AdminLoginForm`

- Objetivo: renderizar o formulario de login administrativo.
- Parametros: nenhum.
- Retorno: JSX do formulario.
- Usa: `useRouter`, `fetch("/api/admin/login")`, `Button` e `Input`.
- Efeitos colaterais: envia senha para API, altera estado de carregamento/erro, redireciona para `/admin` em caso de sucesso.
- Chamado por: `app/admin/login/page.tsx`.

### `submit`

- Objetivo: interceptar o envio do formulario e tentar autenticar o administrador.
- Parametros: evento `React.FormEvent<HTMLFormElement>`.
- Retorno: `Promise<void>`.
- Usa: estado `password`, `fetch`, `router.replace` e `router.refresh`.
- Efeitos colaterais: cria sessao via API, exibe erro local ou redireciona.
- Chamado por: `onSubmit` do formulario.

## `lib/consorcio.ts`

### `WHATSAPP_NUMBER`

- Objetivo: armazenar o numero usado pelos links do WhatsApp.
- Parametros: nenhum.
- Retorno: constante string.
- Usa: nenhum servico externo diretamente.
- Efeitos colaterais: nenhum.
- Chamado por: `whatsappUrl`.

### `DEFAULT_CAMPAIGNS`

- Objetivo: fornecer campanhas iniciais quando nao ha dados persistidos.
- Parametros: nenhum.
- Retorno: array de campanhas.
- Usa: tipos `Campaign` e `Goal`.
- Efeitos colaterais: nenhum.
- Chamado por: `PublicHome` e `getStore`.

### `calculateInstallment`

- Objetivo: calcular a parcela estimada do consorcio.
- Parametros: `credit`, `term`, `adminRate`, `insuranceRate`, `reducedPercent` e `reduced`.
- Retorno: numero com a parcela estimada.
- Usa: apenas operacoes matematicas locais.
- Efeitos colaterais: nenhum.
- Chamado por: `PublicHome`.

### `formatBRL`

- Objetivo: formatar numeros em moeda brasileira.
- Parametros: `value`, numero a formatar.
- Retorno: string em formato BRL.
- Usa: `Intl.NumberFormat`.
- Efeitos colaterais: nenhum.
- Chamado por: site publico e painel administrativo.

### `goalLabel`

- Objetivo: converter o identificador tecnico do objetivo em texto para interface.
- Parametros: `goal`, que pode ser `carro`, `imovel` ou `moto`.
- Retorno: label correspondente.
- Usa: mapa local de labels.
- Efeitos colaterais: nenhum.
- Chamado por: site publico, painel e mensagens de WhatsApp.

### `whatsappUrl`

- Objetivo: montar a URL de abertura do WhatsApp com texto pre-preenchido.
- Parametros: `message`, texto da mensagem.
- Retorno: URL do WhatsApp.
- Usa: `WHATSAPP_NUMBER` e `encodeURIComponent`.
- Efeitos colaterais: nenhum.
- Chamado por: `PublicHome` e `AdminDashboard`.

## `lib/admin-session.ts`

### `settings`

- Objetivo: ler senha e segredo de sessao das variaveis de ambiente.
- Parametros: nenhum.
- Retorno: objeto com `password` e `secret`.
- Usa: `process.env.ADMIN_PASSWORD` e `process.env.ADMIN_SESSION_SECRET`.
- Efeitos colaterais: nenhum.
- Chamado por: `hasAdminSession` e `createAdminSession`.

### `signature`

- Objetivo: gerar assinatura HMAC para o valor fixo da sessao.
- Parametros: `secret`, chave usada para assinar.
- Retorno: string hexadecimal.
- Usa: `createHmac` do Node.js.
- Efeitos colaterais: nenhum.
- Chamado por: `hasAdminSession` e `createAdminSession`.

### `safePasswordMatch`

- Objetivo: comparar a senha recebida com a senha configurada evitando comparacao direta simples.
- Parametros: `received`, `expected` e `secret`.
- Retorno: booleano.
- Usa: `createHmac` e `timingSafeEqual`.
- Efeitos colaterais: nenhum.
- Chamado por: `createAdminSession`.

### `hasAdminSession`

- Objetivo: verificar se a requisicao atual possui cookie administrativo valido.
- Parametros: nenhum.
- Retorno: `Promise<boolean>`.
- Usa: `cookies()` do Next.js, `settings`, `signature` e `timingSafeEqual`.
- Efeitos colaterais: leitura de cookies da requisicao.
- Chamado por: pagina `/admin` e APIs protegidas.

### `createAdminSession`

- Objetivo: validar a senha recebida e criar o cookie administrativo.
- Parametros: `receivedPassword`, senha enviada pelo usuario.
- Retorno: `Promise<boolean>` indicando sucesso ou falha.
- Usa: `settings`, `safePasswordMatch`, `signature` e `cookies().set`.
- Efeitos colaterais: grava cookie HTTP-only.
- Chamado por: `POST /api/admin/login`.

### `clearAdminSession`

- Objetivo: remover o cookie administrativo.
- Parametros: nenhum.
- Retorno: `Promise<void>`.
- Usa: `cookies().delete`.
- Efeitos colaterais: remove cookie da resposta.
- Chamado por: `POST /api/admin/logout`.

## `lib/backend/repository.ts`

### `getStore`

- Objetivo: criar ou recuperar o armazenamento temporario em memoria.
- Parametros: nenhum.
- Retorno: `MemoryStore`.
- Usa: `globalThis.pedraoMemoryStore` e `DEFAULT_CAMPAIGNS`.
- Efeitos colaterais: inicializa estado global em memoria quando ele ainda nao existe.
- Chamado por: todas as funcoes do repositorio.

### `listCampaigns`

- Objetivo: listar campanhas, com opcao de incluir inativas.
- Parametros: `includeInactive`, booleano opcional.
- Retorno: array de campanhas copiadas.
- Usa: `getStore` e `toSorted`.
- Efeitos colaterais: nenhum direto.
- Chamado por: `GET /api/campaigns`.

### `createCampaign`

- Objetivo: criar uma campanha no armazenamento temporario.
- Parametros: `input`, dados da campanha sem `id` e `createdAt`.
- Retorno: id numerico criado.
- Usa: `getStore` e `new Date().toISOString()`.
- Efeitos colaterais: altera a lista de campanhas em memoria.
- Chamado por: `POST /api/campaigns`.

### `updateCampaign`

- Objetivo: atualizar os campos `active` e `featured` de uma campanha.
- Parametros: `id`, `active` e `featured`.
- Retorno: `Promise<void>`.
- Usa: `getStore`.
- Efeitos colaterais: altera campanha em memoria se o id existir.
- Chamado por: `PATCH /api/campaigns`.

### `removeCampaign`

- Objetivo: remover uma campanha pelo id.
- Parametros: `id`.
- Retorno: `Promise<void>`.
- Usa: `getStore`.
- Efeitos colaterais: altera a lista de campanhas em memoria.
- Chamado por: `DELETE /api/campaigns`.

### `listLeads`

- Objetivo: listar interessados cadastrados.
- Parametros: nenhum.
- Retorno: array de leads copiados.
- Usa: `getStore`.
- Efeitos colaterais: nenhum direto.
- Chamado por: `GET /api/leads`.

### `createLead`

- Objetivo: criar um interessado vindo do simulador.
- Parametros: `input`, dados do lead sem `id`, `status` e `createdAt`, incluindo consentimento.
- Retorno: id numerico criado.
- Usa: `getStore` e `new Date().toISOString()`.
- Efeitos colaterais: adiciona lead em memoria.
- Chamado por: `POST /api/leads`.

### `updateLeadStatus`

- Objetivo: alterar a etapa de atendimento de um lead.
- Parametros: `id` e `status`.
- Retorno: `Promise<void>`.
- Usa: `getStore`.
- Efeitos colaterais: altera lead em memoria se o id existir.
- Chamado por: `PATCH /api/leads`.

## `app/api/campaigns/route.ts`

### `GET`

- Objetivo: retornar campanhas para o site ou para o painel.
- Parametros: `request`, usado para ler `all=1`.
- Retorno: `Response.json` com campanhas ou erro.
- Usa: `listCampaigns` e `hasAdminSession`.
- Efeitos colaterais: nenhum direto.
- Chamado por: `PublicHome` e `AdminDashboard`.

### `POST`

- Objetivo: criar campanha administrativa.
- Parametros: `request` com JSON da campanha.
- Retorno: `Response.json` com id criado ou erro.
- Usa: `hasAdminSession`, validacao local e `createCampaign`.
- Efeitos colaterais: cria campanha em memoria.
- Chamado por: `saveCampaign`.

### `PATCH`

- Objetivo: atualizar visibilidade/destaque de campanha.
- Parametros: `request` com `id`, `active` e `featured`.
- Retorno: `Response.json` com `ok`.
- Usa: `hasAdminSession` e `updateCampaign`.
- Efeitos colaterais: altera campanha em memoria.
- Chamado por: `changeCampaign`.

### `DELETE`

- Objetivo: remover campanha por query string.
- Parametros: `request`, usado para ler `id`.
- Retorno: `Response.json` com `ok`.
- Usa: `hasAdminSession` e `removeCampaign`.
- Efeitos colaterais: remove campanha em memoria.
- Chamado por: reservado para uso administrativo futuro.

## `app/api/leads/route.ts`

### `GET`

- Objetivo: listar interessados para o painel.
- Parametros: nenhum.
- Retorno: `Response.json` com leads ou erro.
- Usa: `hasAdminSession` e `listLeads`.
- Efeitos colaterais: nenhum direto.
- Chamado por: `loadData`.

### `POST`

- Objetivo: cadastrar interessado vindo da pagina publica.
- Parametros: `request` com JSON do contato e simulacao.
- Retorno: `Response.json` com id criado ou erro.
- Usa: validacao local e `createLead`.
- Efeitos colaterais: cria lead em memoria.
- Chamado por: `contactPedro`.

### `PATCH`

- Objetivo: atualizar etapa de atendimento.
- Parametros: `request` com `id` e `status`.
- Retorno: `Response.json` com `ok`.
- Usa: `hasAdminSession`, validacao local e `updateLeadStatus`.
- Efeitos colaterais: altera lead em memoria.
- Chamado por: `changeLeadStatus`.

## APIs de Login e Logout

### `POST` em `app/api/admin/login/route.ts`

- Objetivo: autenticar o administrador.
- Parametros: `request` com JSON contendo `password`.
- Retorno: `Response.json` com `ok` ou erro 401.
- Usa: `createAdminSession`.
- Efeitos colaterais: cria cookie de sessao quando a senha confere.
- Chamado por: `AdminLoginForm`.

### `POST` em `app/api/admin/logout/route.ts`

- Objetivo: encerrar a sessao administrativa.
- Parametros: `request`, usado para montar a URL de redirecionamento.
- Retorno: `Response.redirect` para `/admin/login`.
- Usa: `clearAdminSession`.
- Efeitos colaterais: remove cookie de sessao.
- Chamado por: formulario de logout no painel.
