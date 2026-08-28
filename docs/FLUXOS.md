# Fluxos

## Simulacao de Consorcio

1. O visitante abre `/`, que renderiza `PublicHome`.
2. `PublicHome` inicia com campanhas padrao de `DEFAULT_CAMPAIGNS`.
3. Ao carregar, a pagina chama `GET /api/campaigns`.
4. Se a API retornar campanhas ativas, elas substituem as campanhas padrao no estado local.
5. O visitante escolhe objetivo, credito, prazo e parcela reduzida.
6. A campanha ativa do segmento define taxa administrativa, seguro mensal e percentual reduzido usados no calculo.
7. A parcela estimada e recalculada sempre que objetivo, credito, prazo ou modalidade muda.

## Calculo da Parcela

1. `PublicHome` chama `calculateInstallment`.
2. A funcao recebe `credit`, `term`, `adminRate`, `insuranceRate`, `reducedPercent` e `reduced`.
3. O fundo com taxa administrativa e dividido pelo prazo.
4. O seguro mensal estimado e calculado sobre o credito.
5. A parcela cheia soma fundo/taxa e seguro.
6. Se `reduced` estiver ativo, a parcela cheia e multiplicada pelo percentual reduzido.
7. O resultado e exibido com `formatBRL`.

## Envio para o WhatsApp

1. O visitante clica em "Receber planejamento no WhatsApp".
2. `contactPedro` limpa nome e telefone digitados.
3. A funcao monta uma mensagem com nome, objetivo, credito, prazo e parcela estimada.
4. `whatsappUrl` cria a URL `wa.me` usando o numero configurado em `WHATSAPP_NUMBER`.
5. `window.open` abre o WhatsApp em uma nova aba ou janela.

## Cadastro de Interessado

1. Antes de abrir o WhatsApp, `contactPedro` verifica se nome e telefone foram preenchidos.
2. Se houver dados suficientes, envia `POST /api/leads`.
3. A API valida nome, telefone, objetivo, credito, prazo e consentimento.
4. Se valido, `createLead` adiciona o interessado no armazenamento em memoria.
5. O painel administrativo passa a listar esse lead em `GET /api/leads`.
6. Se a chamada falhar, o envio ao WhatsApp continua; o cadastro apenas nao e salvo.

## Login Administrativo

1. O usuario acessa `/admin`.
2. `app/admin/page.tsx` chama `hasAdminSession`.
3. Sem sessao valida, o usuario e redirecionado para `/admin/login`.
4. O formulario `AdminLoginForm` envia `POST /api/admin/login`.
5. A API chama `createAdminSession`.
6. `createAdminSession` compara a senha recebida com `ADMIN_PASSWORD` usando HMAC e `timingSafeEqual`.
7. Se estiver correta, grava o cookie administrativo assinado com `ADMIN_SESSION_SECRET`.
8. O navegador volta para `/admin`, agora com sessao valida.

## Criacao e Atualizacao de Campanhas

1. No painel, `AdminDashboard` chama `loadData`.
2. `loadData` busca `GET /api/campaigns?all=1`, que exige sessao admin.
3. Na aba "Nova campanha", o usuario preenche titulo, descricao, categoria, credito, prazo e taxas.
4. `saveCampaign` envia `POST /api/campaigns`.
5. A API valida os dados e chama `createCampaign`.
6. A campanha criada entra no armazenamento em memoria.
7. O painel recarrega os dados.
8. Para publicar/ocultar ou destacar, os switches chamam `changeCampaign`.
9. `changeCampaign` envia `PATCH /api/campaigns`, que chama `updateCampaign`.
10. A pagina publica usa as campanhas ativas na proxima busca.

## Alteracao da Etapa de Atendimento

1. O painel lista leads carregados por `GET /api/leads`.
2. Na coluna "Etapa", o usuario escolhe novo status.
3. `changeLeadStatus` envia `PATCH /api/leads`.
4. A API valida se o status pertence a lista permitida.
5. `updateLeadStatus` atualiza o lead em memoria.
6. O painel atualiza o estado local e exibe notificacao de sucesso.

## Fluxo Futuro com Banco Persistente

1. Criar um banco usando o modelo em `database/schema.sql`.
2. Configurar credenciais no ambiente de deploy.
3. Instalar o cliente do banco escolhido somente quando a integracao for feita.
4. Substituir a implementacao interna de `lib/backend/repository.ts`.
5. Manter os mesmos contratos das funcoes do repositorio.
6. Preservar as rotas de API como camada de validacao e autorizacao.
7. Testar novamente `npm run lint` e `npm run build`.

As funcoes que formam o contrato a preservar sao:

```text
listCampaigns
createCampaign
updateCampaign
removeCampaign
listLeads
createLead
updateLeadStatus
```
