# Arquitetura

## Visao Geral

O projeto Pedrao Consorcios e uma aplicacao full stack em Next.js para apresentar planos de consorcio, simular parcelas, enviar contatos para o WhatsApp e administrar campanhas e interessados.

A aplicacao combina:

- uma pagina publica comercial com simulador;
- APIs internas do Next.js;
- um painel administrativo protegido por senha;
- um adaptador temporario de dados em memoria;
- um schema SQL preparado para uma futura base persistente.

O design, textos, cores, numero de WhatsApp e formula do simulador ficam concentrados no codigo atual e nao precisam ser alterados para publicar o projeto no GitHub.

## Tecnologias

- Next.js 16 com App Router.
- React 19.
- TypeScript.
- Tailwind CSS 4.
- Componentes Shadcn/Radix UI.
- Lucide React para icones.
- Route Handlers do Next.js para as APIs.
- Cookies HTTP-only para sessao administrativa.

## Estrutura de Pastas

```text
app/
  page.tsx                     Entrada da pagina publica.
  layout.tsx                   Layout raiz e metadata.
  globals.css                  Estilos globais e tema visual.
  admin/
    page.tsx                   Pagina protegida do painel.
    login/page.tsx             Pagina de login administrativo.
  api/
    admin/login/route.ts       API de login.
    admin/logout/route.ts      API de logout.
    campaigns/route.ts         API de campanhas.
    leads/route.ts             API de interessados.

components/
  public-home.tsx              Interface publica, simulador e envio ao WhatsApp.
  admin-dashboard.tsx          Painel administrativo.
  admin-login-form.tsx         Formulario de login.
  ui/                          Componentes de UI base.

lib/
  consorcio.ts                 Tipos, campanhas padrao, formula e helpers.
  admin-session.ts             Criacao, verificacao e remocao da sessao admin.
  backend/repository.ts        Adaptador de dados em memoria.
  utils.ts                     Helper de classes CSS.

database/
  schema.sql                   Modelo SQL para banco futuro.

public/
  pedrao-consorcios-hero.png   Imagem principal.
  favicon.svg                  Icone do site.
  *.svg                        Assets publicos padrao.

vendor/
  shadcn-tailwind-4.13.0.css   CSS vendorizado usado pelo tema.
```

## Frontend e Backend

O frontend fica principalmente em `components/public-home.tsx`, `components/admin-dashboard.tsx` e nas paginas dentro de `app/`.

O backend fica nas rotas de API dentro de `app/api/`. Essas rotas recebem requisicoes HTTP, validam dados simples, verificam sessao quando necessario e chamam as funcoes do repositorio em `lib/backend/repository.ts`.

Essa separacao permite trocar o armazenamento no futuro sem mudar os componentes visuais nem os contratos das APIs.

## Paginas

- `/`: renderizada por `app/page.tsx`, usa `PublicHome`.
- `/admin/login`: renderizada por `app/admin/login/page.tsx`, usa `AdminLoginForm`.
- `/admin`: renderizada por `app/admin/page.tsx`, verifica sessao com `hasAdminSession` e redireciona para login quando necessario.

## APIs

- `GET /api/campaigns`: lista campanhas ativas para a pagina publica.
- `GET /api/campaigns?all=1`: lista todas as campanhas, exige sessao admin.
- `POST /api/campaigns`: cria campanha, exige sessao admin.
- `PATCH /api/campaigns`: atualiza `active` e `featured`, exige sessao admin.
- `DELETE /api/campaigns?id=...`: remove campanha, exige sessao admin.
- `GET /api/leads`: lista interessados, exige sessao admin.
- `POST /api/leads`: cadastra interessado vindo do simulador.
- `PATCH /api/leads`: atualiza etapa de atendimento, exige sessao admin.
- `POST /api/admin/login`: cria sessao admin.
- `POST /api/admin/logout`: remove sessao admin e redireciona para login.

## Configuracoes

As configuracoes principais estao em:

- `package.json`: scripts, dependencias e versao minima de Node.js.
- `.env.example`: modelo de variaveis de ambiente.
- `.env.local`: valores locais reais, ignorados pelo Git.
- `lib/consorcio.ts`: numero do WhatsApp, campanhas padrao, tipos e calculos.
- `lib/admin-session.ts`: nomes internos de cookie e uso das variaveis de ambiente.
- `app/globals.css`: tema visual e estilos globais.

Variaveis esperadas:

```env
ADMIN_PASSWORD=troque-por-uma-senha-forte
ADMIN_SESSION_SECRET=troque-por-uma-chave-aleatoria-longa
```

## Painel Administrativo

O painel usa uma senha definida por `ADMIN_PASSWORD`. Ao fazer login, `createAdminSession` cria um cookie HTTP-only assinado com `ADMIN_SESSION_SECRET`.

A pagina `/admin` sempre chama `hasAdminSession`. Se o cookie estiver ausente, invalido ou se as variaveis de ambiente nao estiverem configuradas, o usuario e redirecionado para `/admin/login`.

As APIs administrativas tambem chamam `hasAdminSession`, mantendo o painel e os dados protegidos pelo mesmo mecanismo.

## Adaptador de Dados

O arquivo `lib/backend/repository.ts` implementa um armazenamento temporario em memoria usando `globalThis.pedraoMemoryStore`.

Esse armazenamento facilita desenvolvimento local, mas os dados somem quando o servidor reinicia. Para usar banco persistente no futuro, substitua somente a implementacao das funcoes:

```text
listCampaigns
createCampaign
updateCampaign
removeCampaign
listLeads
createLead
updateLeadStatus
```

Mantenha os mesmos nomes, parametros e retornos para preservar os contratos usados pelas APIs e componentes.
