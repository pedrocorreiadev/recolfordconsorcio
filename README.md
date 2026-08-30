# Recol Ford Consorcio

Aplicacao full stack local para simulacao de consorcio, captacao de leads e gestao administrativa compartilhada pela equipe Recol Ford Consorcio.

## Funcionalidades

- Home publica em `/` com campanhas, especialistas e atalhos para simulacao.
- Simulador completo em `/simulacao`.
- Pagina de especialistas em `/especialistas` e paginas individuais por slug.
- Cadastro de lead com nome e um campo obrigatorio: `WhatsApp ou e-mail`.
- Deteccao automatica do tipo de contato: `whatsapp` quando for telefone, `email` quando houver `@`.
- Leads novos entram com `status: novo` e `temperature: nao_classificado`.
- Painel administrativo protegido em `/admin`.
- Filtros de leads por temperatura, situacao e responsavel.
- Atribuicao, transferencia, status, temperatura e observacoes de leads.
- Contato direto por WhatsApp ou `mailto:` conforme o tipo de contato salvo.
- Criacao, edicao e exclusao de campanhas, incluindo ativo e destaque.
- Persistencia local em SQLite para desenvolvimento.
- Adaptador Supabase/Postgres preparado para producao via variaveis de ambiente.

## Tecnologias

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Componentes Shadcn/Radix UI
- Route Handlers do Next.js
- SQLite local via `node:sqlite`

## Estrutura principal

```text
app/
  page.tsx                     Home publica
  simulacao/page.tsx           Simulador completo
  especialistas/               Lista e perfis individuais
  admin/                       Login e painel administrativo
  api/                         APIs internas
components/
  public-home.tsx              Home publica
  simulation-page.tsx          Simulador e formulario de lead
  specialists-page.tsx         Pagina de especialistas
  specialist-card.tsx          Card reutilizavel de especialista
  admin-dashboard.tsx          Painel administrativo
lib/
  contact.ts                   Deteccao e validacao de contato
  consorcio.ts                 Tipos, especialistas, campanhas e helpers
  backend/                     Contratos e adaptadores de dados
database/
  migrations/001_initial_sqlite.sql
  schema.sql                   Modelo Postgres/Supabase de referencia
scripts/
  sync-specialist-media.mjs    Sincroniza midias locais autorizadas
  api-smoke-tests.mjs          Testes de API e persistencia local
public/media/specialists/      Fotos e videos usados pelo site
```

## Rodar localmente

Requisitos:

- Node.js 22.13 ou superior. Node 24 tambem funciona.

Instale as dependencias:

```bash
npm install
```

Copie as variaveis de ambiente:

```bash
cp .env.example .env.local
```

Configure `.env.local` com os dados locais e rode:

```bash
npm run dev
```

Abra:

```text
http://localhost:3000
http://localhost:3000/admin
```

## Variaveis de ambiente

```env
DATA_PROVIDER=sqlite
SQLITE_DB_PATH=.local-data/recol-consorcio.sqlite
LOCAL_MEDIA_SOURCE=D:\img e videos

ADMIN_SESSION_SECRET=troque-por-uma-chave-aleatoria-longa
ADMIN_FLAVIO_IDENTIFIER=...
ADMIN_FLAVIO_PASSWORD=...
ADMIN_JESSICA_IDENTIFIER=...
ADMIN_JESSICA_PASSWORD=...
ADMIN_JERSEY_IDENTIFIER=...
ADMIN_JERSEY_PASSWORD=...

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Nunca envie `.env.local`, `.env`, bancos SQLite ou notas locais para o Git.

## Midias dos Especialistas

O site nao le arquivos diretamente de `D:\img e videos`. Para usar midias locais, configure `LOCAL_MEDIA_SOURCE` e execute:

```bash
npm run sync:media
```

O script copia imagens e videos reconhecidos para `public/media/specialists/{flavio,jessica,jersey}` com nomes estaveis. Arquivos ambiguos sao apenas reportados, sem sobrescrever.

## Backend

Em desenvolvimento, `DATA_PROVIDER=sqlite` usa um banco local em `.local-data/`. As migracoes ficam em `database/migrations/`.

Para producao, use `DATA_PROVIDER=supabase` e configure `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`. O app nao volta silenciosamente para memoria quando o provider de producao esta incompleto.

## Comandos

```bash
npm run sync:media
npm run dev
npm run lint
npm run typecheck
npm run build
npm run test:smoke
```

## Aviso Comercial

Os valores do simulador sao estimativas. As condicoes finais dependem do grupo, regulamento e contrato. A contemplacao ocorre por sorteio ou lance e nao possui data garantida.
