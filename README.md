# Recol Ford Consórcio

Este repositório ficou como registro de uma ideia que começou a ser desenhada para a Recol Ford Consórcio, em Rio Branco. A proposta era criar um site simples, direto e mais acolhedor para quem queria entender uma simulação antes de falar com a equipe comercial.

A jornada imaginada era esta: a pessoa escolhia se queria carro, imóvel ou moto, ajustava o valor do crédito, via uma parcela estimada e deixava um contato para um especialista continuar o atendimento. Também havia a intenção de ter um painel interno para acompanhar leads, campanhas e responsáveis.

O projeto não avançou. A proposta foi descontinuada antes de virar uma operação real, então este código deve ser lido como um protótipo front-end preservado, não como um sistema pronto para produção.

## Estado Atual

- A home pública continua navegável.
- A tela de simulação funciona apenas como demonstração visual.
- O formulário não envia dados para backend.
- A área administrativa foi mantida só como contexto do que seria construído.
- Os valores, campanhas e especialistas são dados fixos de exemplo.
- As rotas de API respondem como arquivadas; banco e scripts antigos ficaram apenas como referência do rascunho.

## O Que A Ideia Tentava Resolver

A intenção era deixar a primeira conversa sobre consórcio menos fria. Em vez de jogar o visitante direto em um formulário comum, o site mostraria uma estimativa inicial e apresentaria a equipe que poderia continuar o atendimento.

Também havia uma preocupação comercial: organizar os contatos em um painel simples, permitindo que cada especialista acompanhasse os leads, mudasse status e registrasse observações. Essa parte acabou não saindo do papel.

## Tecnologias

- Next.js
- React
- TypeScript
- Tailwind CSS
- Componentes Shadcn/Radix UI

## Rodando Localmente

Requisito usado no projeto original:

- Node.js 22.13 ou superior

Instale as dependências:

```bash
npm install
```

Rode o front:

```bash
npm run dev
```

Abra no navegador:

```text
http://localhost:3000
```

Não é necessário configurar banco, Supabase ou variáveis de ambiente para visualizar o front arquivado.

## Estrutura Principal

```text
app/
  page.tsx               Home pública
  simulacao/page.tsx     Simulação visual
  especialistas/         Lista e perfis da equipe prevista
  admin/                 Tela estática sobre o painel não finalizado

components/
  public-home.tsx        Conteúdo principal da home
  simulation-page.tsx    Calculadora visual, sem envio real
  specialists-page.tsx   Página de especialistas
  specialist-card.tsx    Cards de perfil
  site-header.tsx        Navegação pública
  site-footer.tsx        Rodapé do protótipo

lib/
  consorcio.ts           Dados fixos e cálculo ilustrativo
  contact.ts             Validação local do campo de contato
```

## Observação

As simulações são apenas ilustrativas. Elas não representam proposta comercial, não salvam informações e não devem ser usadas como base para contratação. Este repositório serve principalmente para mostrar qual era a direção visual e funcional da ideia antes dela ser interrompida.
