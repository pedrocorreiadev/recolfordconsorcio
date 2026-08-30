# Funcoes Importantes

## `components/public-home.tsx`

### `PublicHome`

- Renderiza a home publica em `/`.
- Carrega campanhas ativas por `GET /api/campaigns`.
- Mostra atalhos de objetivo, campanhas, especialistas e chamada para `/simulacao`.
- Nao contem o simulador completo.

## `components/simulation-page.tsx`

### `SimulationPage`

- Renderiza o simulador completo em `/simulacao`.
- Le parametros iniciais da URL.
- Controla objetivo, credito, prazo, parcela reduzida, especialista e dados do lead.
- Envia leads para `POST /api/leads`.
- Mantem os dados preenchidos quando ha erro.

### `submitLead`

- Valida nome e contato.
- Usa `detectContact` para decidir `contactValue` e `contactType`.
- Envia somente os campos aceitos pela API.
- Mostra confirmacao quando o backend salva o lead.

## `lib/contact.ts`

### `detectContact`

- Exige valor preenchido.
- Quando o valor contem `@`, valida formato basico de e-mail e normaliza em minusculas.
- Quando nao contem `@`, normaliza telefone e exige pelo menos 10 digitos.
- Retorna erro sem apagar dados do formulario.

## `components/specialist-card.tsx`

### `SpecialistCard`

- Exibe dados vindos de `SPECIALISTS`.
- Usa foto quando disponivel.
- Usa iniciais como fallback quando a imagem nao carrega.
- Mostra video somente quando `videoPath` existe.
- Mostra Instagram, WhatsApp e e-mail conforme os campos configurados.
- Linka para `/especialistas/[slug]`.

## `components/specialists-page.tsx`

### `SpecialistsPage`

- Renderiza a pagina `/especialistas`.
- Lista especialistas ativos.
- Mantem o mesmo cadastro central usado pela home, simulador e admin.

## `components/admin-dashboard.tsx`

### `AdminDashboard`

- Renderiza o painel administrativo compartilhado.
- Recebe `currentAdmin`.
- Carrega campanhas e leads.
- Permite filtros por temperatura, situacao e responsavel.
- Permite assumir, transferir, atualizar status, alterar temperatura e salvar observacoes.
- Permite criar, editar e excluir campanhas.

### `loadData`

- Busca `GET /api/campaigns?all=1` e `GET /api/leads`.
- Atualiza campanhas, leads e rascunhos de observacoes.
- Exibe erro quando a carga falha.

### `saveCampaign`

- Valida titulo.
- Envia `POST /api/campaigns`.
- Limpa o formulario e recarrega os dados apos sucesso.

### `updateCampaign`

- Envia alteracoes parciais para `PATCH /api/campaigns`.
- Atualiza estado local com a campanha retornada pela API.

### `patchLead`

- Envia alteracoes parciais para `PATCH /api/leads`.
- Recebe o lead atualizado da API.
- Atualiza estado local e rascunho de observacoes.

### `contactHref`

- Gera `mailto:` quando o lead foi salvo como e-mail.
- Gera link de WhatsApp quando o lead foi salvo como telefone.

## `components/admin-login-form.tsx`

### `AdminLoginForm`

- Renderiza campos de identificacao e senha.
- Envia `POST /api/admin/login`.
- Redireciona para `/admin` quando a autenticacao local e bem-sucedida.

## `lib/consorcio.ts`

### Tipos e listas

- `Goal`: objetivo do consorcio.
- `SpecialistId`: ids dos tres especialistas.
- `ContactType`: `whatsapp` ou `email`.
- `LeadStatus`: situacao administrativa.
- `LeadTemperature`: `nao_classificado`, `quente`, `morno` ou `frio`.
- `SPECIALISTS`: cadastro central dos especialistas.
- `BRAND_ASSETS`: caminhos autorizados de marca.

### `calculateInstallment`

- Calcula parcela estimada usando credito, prazo, taxa administrativa, seguro, percentual reduzido e modalidade reduzida.

### Helpers de exibicao

- `formatBRL`
- `goalLabel`
- `statusLabel`
- `temperatureLabel`
- `activeSpecialists`
- `getSpecialist`
- `getSpecialistBySlug`
- `specialistName`
- `initials`
- `normalizePhone`
- `whatsappUrl`

## `lib/admin-session.ts`

### `adminCredentials`

- Le identificacao e senha dos tres administradores por variaveis de ambiente.

### `createAdminSession`

- Valida identificacao e senha.
- Cria cookie HTTP-only assinado com o id do especialista.
- Retorna a sessao do administrador conectado.

### `getAdminSession`

- Le e valida o cookie administrativo.
- Retorna `{ id, name }` quando a sessao e valida.

### `hasAdminSession`

- Retorna booleano para rotas que precisam apenas bloquear acesso anonimo.

### `clearAdminSession`

- Remove o cookie administrativo.

## `lib/backend/repository.ts`

### `repository`

- Escolhe o provider por `DATA_PROVIDER`.
- Usa SQLite em desenvolvimento quando nao ha provider explicito.
- Usa Supabase em producao quando nao ha provider explicito.
- Nao usa armazenamento em memoria como fallback.

## `lib/backend/sqlite.ts`

### `createSqliteRepository`

- Abre ou cria o banco SQLite local.
- Aplica migracoes.
- Sincroniza especialistas centrais.
- Implementa campanhas e leads persistentes.

## `lib/backend/supabase.ts`

### `createSupabaseRepository`

- Cria adaptador REST para Supabase/Postgres.
- Exige variaveis de ambiente de producao.
- Implementa o mesmo contrato do repositorio.

## Rotas de API

### `app/api/leads/route.ts`

- `GET`: lista leads para administradores.
- `POST`: valida contato unico e cria lead publico.
- `PATCH`: atualiza status, temperatura, responsavel ou observacoes.

### `app/api/campaigns/route.ts`

- `GET`: lista campanhas.
- `POST`: cria campanha.
- `PATCH`: edita campanha.
- `DELETE`: remove campanha.

### `app/api/admin/login/route.ts`

- Cria sessao administrativa com identificacao e senha.

### `app/api/admin/logout/route.ts`

- Encerra sessao administrativa.
