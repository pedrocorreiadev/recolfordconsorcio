# Pedrão Consórcios

Projeto full stack e independente para apresentação, simulação e captação de interessados em consórcios de carros, imóveis e motos.

## Funcionalidades

- Página comercial responsiva
- Simulador de crédito, prazo, taxas, seguro e parcela reduzida
- Envio da simulação para o WhatsApp
- Cadastro de interessados por API
- Painel administrativo protegido por senha
- Criação, destaque e desativação de campanhas
- Gestão do atendimento por etapas
- Contrato de backend preparado para substituição por banco externo

## Tecnologias

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Componentes Shadcn/Radix UI
- APIs Route Handlers do Next.js

## Estrutura principal

```text
app/
  admin/                       Painel e login administrativo
  api/admin/                   Login e logout
  api/campaigns/route.ts       API de campanhas
  api/leads/route.ts           API de interessados
  page.tsx                     Página pública
components/
  public-home.tsx              Site e simulador
  admin-dashboard.tsx          Painel administrativo
lib/
  backend/repository.ts        Adaptador temporário de dados
  admin-session.ts             Sessão administrativa
  consorcio.ts                 Cálculos, tipos e configurações
database/
  schema.sql                   Modelo SQL para o banco definitivo
public/                        Imagens e ícones
```

## Rodar localmente

Requisitos:

- Node.js 22.13 ou superior

Instale as dependências:

```bash
npm install
```

Copie as variáveis de ambiente:

```bash
cp .env.example .env.local
```

Altere a senha e a chave de sessão em `.env.local`, depois execute:

```bash
npm run dev
```

Abra `http://localhost:3000`.

Painel administrativo:

```text
http://localhost:3000/admin
```

## Variáveis de ambiente

```env
ADMIN_PASSWORD=uma-senha-forte
ADMIN_SESSION_SECRET=uma-chave-aleatoria-longa
```

Nunca envie o arquivo `.env.local` para o GitHub.

## Configurações do consórcio

Em `lib/consorcio.ts` estão:

- Número do WhatsApp
- Campanhas padrão
- Taxas iniciais
- Fórmula da parcela estimada

## Backend atual

As APIs já estão estruturadas e validadas, mas o arquivo `lib/backend/repository.ts` utiliza memória temporária para facilitar o desenvolvimento do frontend.

Isso significa que campanhas e interessados podem desaparecer quando o servidor reiniciar. Não utilize esse armazenamento temporário em produção.

As funções que formam o contrato do backend são:

```text
listCampaigns
createCampaign
updateCampaign
removeCampaign
listLeads
createLead
updateLeadStatus
```

Ao escolher o banco definitivo, substitua somente a implementação dessas funções. As páginas e rotas da API podem permanecer com o mesmo formato.

## Migração futura para Vercel e Supabase

1. Criar o projeto e o banco.
2. Executar `database/schema.sql` no editor SQL.
3. Instalar o cliente do banco escolhido.
4. Adicionar as credenciais às variáveis de ambiente.
5. Substituir `lib/backend/repository.ts` por consultas persistentes.
6. Configurar regras de acesso no banco.
7. Publicar o repositório pela Vercel.

Se outro servidor ou banco for escolhido, mantenha os mesmos tipos e contratos do repositório para evitar alterações no frontend.

## Comandos

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Aviso comercial

Os valores do simulador são estimativas. As condições finais dependem do grupo, regulamento e contrato. A contemplação ocorre por sorteio ou lance e não possui data garantida....
