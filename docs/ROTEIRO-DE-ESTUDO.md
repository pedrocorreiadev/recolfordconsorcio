# Roteiro de Estudo

Este roteiro segue dos arquivos mais simples para as partes com mais estado, API e autenticacao.

## 1. Configuracao Basica

1. `package.json`
   - Veja os scripts `dev`, `lint`, `build` e `start`.
   - Confira a versao minima de Node.js.
   - Observe as dependencias principais: Next.js, React, Tailwind, Radix/Shadcn e Lucide.

2. `tsconfig.json`
   - Entenda o alias `@/*`, usado nos imports como `@/lib/consorcio`.

3. `.env.example`
   - Veja quais variaveis precisam existir localmente.
   - Lembre que `.env.local` fica fora do Git.

## 2. Estilos e Assets

1. `app/globals.css`
   - Observe as variaveis de cor, fonte e tema.
   - Veja os imports de Tailwind e do CSS vendorizado.

2. `public/`
   - Confira imagem principal, favicon e icones publicos.

3. `vendor/`
   - Entenda que o CSS vendorizado e uma dependencia visual local.

## 3. Tipos, Constantes e Calculos

1. `lib/consorcio.ts`
   - Comece pelos tipos `Goal`, `Campaign` e `Lead`.
   - Depois leia `DEFAULT_CAMPAIGNS`.
   - Estude `calculateInstallment`.
   - Veja os helpers `formatBRL`, `goalLabel` e `whatsappUrl`.

Este arquivo e um bom ponto de partida porque concentra regras de negocio simples e reutilizadas.

## 4. Pagina Publica

1. `app/page.tsx`
   - Veja como a pagina inicial delega tudo para `PublicHome`.

2. `components/public-home.tsx`
   - Leia primeiro os estados (`goal`, `credit`, `term`, `reduced`, `name`, `phone`, `campaigns`).
   - Depois acompanhe o `useEffect` que carrega campanhas.
   - Estude `activeCampaign` e `installment`.
   - Leia `chooseGoal`.
   - Leia `contactPedro`.
   - Por ultimo, percorra o JSX para conectar estado e interface.

## 5. APIs Publicas e Administrativas Simples

1. `app/api/campaigns/route.ts`
   - Comece pelo `GET`, usado pela pagina publica.
   - Depois veja `POST`, `PATCH` e `DELETE`, que exigem sessao admin.

2. `app/api/leads/route.ts`
   - Leia `POST`, usado pelo simulador.
   - Depois veja `GET` e `PATCH`, usados pelo painel.

## 6. Repositorio Temporario

1. `lib/backend/repository.ts`
   - Entenda `getStore` e o uso de `globalThis`.
   - Depois leia as funcoes de campanhas.
   - Por fim, leia as funcoes de leads.

Este arquivo simula um backend persistente, mas os dados vivem apenas em memoria.

## 7. Login e Sessao Administrativa

1. `lib/admin-session.ts`
   - Leia `settings`.
   - Depois `signature`.
   - Depois `safePasswordMatch`.
   - Finalize com `hasAdminSession`, `createAdminSession` e `clearAdminSession`.

2. `app/api/admin/login/route.ts`
   - Veja como a senha chega pela API.

3. `app/api/admin/logout/route.ts`
   - Veja como a sessao e encerrada.

## 8. Paginas Administrativas

1. `app/admin/login/page.tsx`
   - Entenda a estrutura da pagina de login.

2. `components/admin-login-form.tsx`
   - Leia o envio do formulario e o redirecionamento.

3. `app/admin/page.tsx`
   - Veja a protecao da pagina com `hasAdminSession`.

4. `components/admin-dashboard.tsx`
   - Leia `loadData`.
   - Depois estude os calculos de `stats`.
   - Siga para `saveCampaign`.
   - Depois `changeCampaign`.
   - Depois `changeLeadStatus`.
   - Por ultimo, percorra o JSX das abas.

## 9. Banco Futuro

1. `database/schema.sql`
   - Veja as tabelas `campaigns` e `leads`.
   - Compare os campos SQL com os tipos `Campaign` e `Lead`.
   - Entenda quais dados hoje estao em memoria e quais seriam persistidos.

2. Volte para `lib/backend/repository.ts`
   - Imagine cada funcao trocada por uma query ao banco.
   - Mantenha os contratos iguais para nao mexer nas APIs e componentes.

## 10. Validacao Antes de Publicar

Rode:

```bash
npm run lint
npm run build
git diff --check
git status --short
```

Antes de enviar para o GitHub, confirme tambem:

```bash
git check-ignore .env.local node_modules .next
```
