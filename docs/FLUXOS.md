# Fluxos

## Home Publica

1. O visitante abre `/`.
2. `PublicHome` carrega campanhas por `GET /api/campaigns`.
3. A home mostra atalhos de objetivo, campanhas ativas, especialistas e chamada para simulacao.
4. Os atalhos direcionam para `/simulacao` com objetivo e credito inicial na URL.

## Simulacao de Consorcio

1. O visitante abre `/simulacao`.
2. `SimulationPage` le `goal` e `credit` da URL quando existirem.
3. O visitante escolhe objetivo, credito, prazo e parcela reduzida.
4. A campanha ativa do segmento define taxa administrativa, seguro mensal e percentual reduzido.
5. A parcela estimada e recalculada no cliente.
6. O aviso comercial informa que o resultado e uma estimativa inicial.

## Cadastro de Lead

1. O visitante informa nome e o campo unico `WhatsApp ou e-mail`.
2. O especialista de preferencia e opcional.
3. `detectContact` identifica e valida o contato:
   - se contem `@`, valida como e-mail e salva `contactType: email`;
   - caso contrario, normaliza como telefone e salva `contactType: whatsapp`.
4. Erros de validacao nao limpam os campos ja preenchidos.
5. A pagina envia `POST /api/leads`.
6. A API valida nome, contato, objetivo, valores, prazo e especialista opcional.
7. `createLead` salva o lead com `status: novo` e `temperature: nao_classificado`.
8. Se houver especialista escolhido, o lead entra atribuido a ele.
9. Se nao houver especialista escolhido, o lead fica nao atribuido.

## Especialistas

1. Os especialistas ficam cadastrados em `SPECIALISTS`.
2. `/especialistas` mostra a lista completa de especialistas ativos.
3. `/especialistas/[slug]` mostra o perfil individual.
4. O card usa foto quando o caminho existe e fallback de iniciais quando a imagem falha.
5. Videos aparecem somente quando `videoPath` esta configurado.
6. Instagram aparece para todos os especialistas configurados.
7. WhatsApp e e-mail aparecem somente quando os campos existem no cadastro central.

## Sincronizacao de Midias

1. Configure `LOCAL_MEDIA_SOURCE` no ambiente local.
2. Execute `npm run sync:media`.
3. O script procura imagens e videos reconhecidos por especialista.
4. Arquivos reconhecidos sao copiados para `public/media/specialists/{id}`.
5. Imagens usam nome estavel `profile.ext`.
6. Videos usam nome estavel `intro.ext`.
7. Quando ha mais de uma opcao para o mesmo especialista e tipo, o script reporta ambiguidade e nao sobrescreve.

## Login Administrativo

1. O usuario acessa `/admin`.
2. `app/admin/page.tsx` chama `getAdminSession`.
3. Sem sessao valida, o usuario e redirecionado para `/admin/login`.
4. `AdminLoginForm` envia identificacao e senha para `POST /api/admin/login`.
5. `createAdminSession` compara os dados com variaveis de ambiente.
6. Se estiver correto, grava cookie HTTP-only assinado.
7. O painel recebe o administrador conectado e mostra seu nome no cabecalho.

## Gestao de Leads

1. O painel carrega campanhas e leads.
2. Administradores visualizam todos os leads.
3. Filtros locais separam por temperatura, situacao e responsavel.
4. Um administrador pode assumir lead nao atribuido.
5. O responsavel pode ser transferido para outro especialista ou removido.
6. Status, temperatura e observacoes sao atualizados por `PATCH /api/leads`.
7. A rota registra `updatedAt` e `updatedBy` usando a sessao atual.
8. O botao de contato abre WhatsApp para `contactType: whatsapp` e `mailto:` para `contactType: email`.

## Campanhas

1. `GET /api/campaigns` alimenta o site publico com campanhas ativas.
2. `GET /api/campaigns?all=1` alimenta o painel com campanhas ativas e inativas.
3. O painel cria campanhas por `POST /api/campaigns`.
4. O painel edita titulo, objetivo, descricao, credito, prazos, taxas, ativo e destaque por `PATCH /api/campaigns`.
5. O painel exclui campanhas por `DELETE /api/campaigns`.
6. As alteracoes persistem no SQLite local quando `DATA_PROVIDER=sqlite`.

## Persistencia Local

1. O primeiro acesso ao repositorio SQLite cria o banco local.
2. Migracoes sao aplicadas a partir de `database/migrations`.
3. Especialistas centrais sao inseridos ou atualizados.
4. Campanhas padrao sao criadas apenas quando a tabela esta vazia.
5. Leads e campanhas criados pelo usuario permanecem depois de reiniciar o servidor.
