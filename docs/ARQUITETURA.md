# Arquitetura

## Visao Geral

O projeto Recol Ford Consorcio e uma aplicacao full stack em Next.js para simulacao publica, captacao de leads e gestao administrativa compartilhada por tres especialistas.

A aplicacao combina:

- paginas publicas separadas para home, simulacao e especialistas;
- APIs internas do Next.js;
- painel administrativo protegido por sessao local;
- repositorio de dados com adaptadores SQLite e Supabase/Postgres;
- migracoes locais reproduziveis;
- sincronizacao de midias locais para `public/media`.

Nao ha publicacao automatica, push, deploy ou integracao externa obrigatoria no fluxo local.

## Estrutura de Pastas

```text
app/
  page.tsx                     Home publica.
  simulacao/page.tsx           Simulador completo.
  especialistas/page.tsx       Lista de especialistas.
  especialistas/[slug]/page.tsx
  admin/
    page.tsx                   Painel protegido.
    login/page.tsx             Login administrativo.
  api/
    admin/login/route.ts       API de login.
    admin/logout/route.ts      API de logout.
    campaigns/route.ts         API de campanhas.
    leads/route.ts             API de leads.

components/
  public-home.tsx              Home publica.
  simulation-page.tsx          Simulador e envio de lead.
  specialists-page.tsx         Pagina de especialistas.
  specialist-card.tsx          Card de especialista.
  admin-dashboard.tsx          Painel administrativo.
  admin-login-form.tsx         Formulario de login.
  site-header.tsx              Navegacao publica.
  site-footer.tsx              Rodape publico.

lib/
  contact.ts                   Validacao e deteccao de contato.
  consorcio.ts                 Tipos, especialistas, campanhas e helpers.
  admin-session.ts             Sessao administrativa local.
  backend/
    types.ts                   Contrato do repositorio.
    repository.ts              Seletor de provider.
    sqlite.ts                  Adaptador SQLite local.
    supabase.ts                Adaptador Supabase/Postgres via REST.

database/
  migrations/001_initial_sqlite.sql
  schema.sql                   Modelo Postgres/Supabase de referencia.

scripts/
  sync-specialist-media.mjs
  api-smoke-tests.mjs
```

## Contrato de Dados

As rotas de API chamam apenas o contrato em `lib/backend/types.ts`. Isso permite trocar o provider sem alterar componentes visuais ou validacoes de rota.

Funcoes do contrato:

```text
listCampaigns
createCampaign
updateCampaign
removeCampaign
listLeads
createLead
updateLead
```

## Providers

`lib/backend/repository.ts` escolhe o provider por `DATA_PROVIDER`.

- `sqlite`: padrao em desenvolvimento. Usa `SQLITE_DB_PATH` ou `.local-data/recol-consorcio.sqlite`.
- `supabase`: provider de producao preparado. Exige `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`.

Se `NODE_ENV=production` e `DATA_PROVIDER` nao for definido, o app usa `supabase`. Se as variaveis de producao estiverem ausentes, retorna erro claro em vez de cair para memoria.

## SQLite Local

O adaptador `lib/backend/sqlite.ts`:

- cria o diretorio do banco quando necessario;
- aplica migracoes de `database/migrations`;
- cria tabelas de especialistas, campanhas e leads;
- faz seed apenas dos especialistas centrais e campanhas padrao;
- nao cria clientes ou leads falsos;
- preserva leads e campanhas apos reinicio do servidor.

Arquivos SQLite ficam ignorados pelo Git.

## Configuracao Central

`lib/consorcio.ts` concentra:

- ids e slugs dos especialistas;
- nome, descricao, Instagram, foto, video, WhatsApp, e-mail e status ativo;
- campanhas padrao;
- tipos de lead, status e temperatura;
- calculo de parcela estimada;
- helpers de exibicao e links.

Dados nao confirmados permanecem vazios ou explicitamente pendentes.

## APIs

- `GET /api/campaigns`: lista campanhas ativas.
- `GET /api/campaigns?all=1`: lista todas as campanhas, exige sessao admin.
- `POST /api/campaigns`: cria campanha, exige sessao admin.
- `PATCH /api/campaigns`: edita campanha, exige sessao admin.
- `DELETE /api/campaigns?id=...`: remove campanha, exige sessao admin.
- `GET /api/leads`: lista leads, exige sessao admin.
- `POST /api/leads`: cadastra lead publico.
- `PATCH /api/leads`: atualiza status, temperatura, responsavel ou observacoes, exige sessao admin.
- `POST /api/admin/login`: cria sessao admin.
- `POST /api/admin/logout`: remove sessao admin.

## Sessao Administrativa

O login usa `ADMIN_SESSION_SECRET` e pares de identificacao/senha por especialista. A sessao e gravada em cookie HTTP-only assinado. As APIs administrativas validam esse cookie antes de listar ou alterar dados.

## Midias

O app usa caminhos relativos em `public/media`. Arquivos locais externos, como `D:\img e videos`, entram apenas pelo script `npm run sync:media`, que copia arquivos reconhecidos para nomes estaveis e reporta ambiguidades.
