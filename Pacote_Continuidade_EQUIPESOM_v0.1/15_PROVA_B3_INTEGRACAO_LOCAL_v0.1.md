# Prova B3 — integração local de acesso e leitura (v0.1)

Atualizado em 07/10/2026. Escopo autorizado por Camila: somente Supabase local, contas e propostas fictícias; preservar `localStorage` e a emissão existente no navegador; manter B2 desabilitado para operação real.

## O que foi preparado

- login Supabase local por REST, com chave pública de desenvolvimento e sessão somente em memória;
- validação da identidade no Auth e reconsulta de `current_access_context` antes de cada leitura;
- seleção somente de tenants com vínculo ativo;
- leitura somente de `proposals` e da versão mais recente em `proposal_versions`, protegida pela RLS do banco;
- rota isolada `/acesso-local/propostas`; a rota `/propostas` e a chave versionada de `localStorage` permanecem inalteradas;
- proxy Vite aceito somente em loopback, no modo `local` e durante `vite serve`;
- nenhum SDK, segredo server-side, SMTP, emissão B2, migração de propostas reais ou ambiente externo.

## Arquivos da implementação

- `app-equipesom/src/services/b3LocalBackend.ts`
- `app-equipesom/src/components/auth/B3LocalSession.tsx`
- `app-equipesom/src/components/auth/B3LocalAccessBoundary.tsx`
- `app-equipesom/src/pages/B3LocalProposalsPage.tsx`
- `app-equipesom/src/config/runtimeEnvironment.ts`
- `app-equipesom/vite.config.ts`
- `app-equipesom/scripts/start-b3-local.mjs`
- `app-equipesom/scripts/verify-b3-readonly.mjs`

## Verificações

| Verificação | Resultado |
| --- | --- |
| TypeScript (`npm run typecheck`) | **PASS** |
| Contrato local/homologação/produção | **PASS** |
| Lint amplo | **PASS** no Mac após duas correções delimitadas de efeitos React da B3 |
| Build de produção | **PASS** |
| Banco local | **PASS: 4 arquivos e 90 asserções pgTAP** |
| B1 Auth local | **PASS** com isolamento, suspensão, revogação e limpeza |
| Prova REST B3 com massa fictícia, isolamento e limpeza | **PASS em 28/09/2026 no Docker Desktop/Supabase local do Mac** |
| Validação manual do login B3 por Camila | **PASS em 30/09/2026; acesso fictício removido com zero remanescentes** |
| Acesso do frontend em dispositivo móvel físico pela LAN | **PASS, confirmado por Camila em 07/10/2026** |
| Fluxo B3 autenticado end-to-end no celular | **Não executado nesta prova: o proxy B3 é deliberadamente restrito a loopback** |

`npm run verify:b3-readonly` comprovou: dois logins fictícios; cada usuário vendo somente seu tenant; tentativa cruzada retornando conjunto vazio; anônimo sem leitura; conta sem vínculo sem memberships; B2 sem `b2_test_enabled`; e remoção final de toda a massa fictícia. Nenhuma credencial, token ou dado real foi persistido.

Para a conferência visual de Camila, `npm run prepare:b3-manual` cria somente no ambiente local uma conta `example.invalid`, vínculo, tenant e proposta fictícios e registra os IDs e credenciais temporárias em `tmp/b3-manual-access.json`, com permissão `0600`. `npm run cleanup:b3-manual` remove todos os registros pelos IDs, comprova zero remanescentes e apaga o arquivo. Um ciclo completo de preparação e limpeza passou antes da abertura do acesso final.

Em 30/09/2026, Camila confirmou que concluiu com sucesso a validação manual do login B3 usando o acesso fictício temporário. Depois da conferência, executou `npm run cleanup:b3-manual`; a saída comprovou zero contas, vínculos, tenants, propostas e rascunhos fictícios restantes. Nenhuma credencial temporária foi preservada neste relatório.

Em 07/10/2026, Camila confirmou o acesso bem-sucedido ao frontend em dispositivo móvel físico pela LAN e decidiu encerrar a B3 como prova técnica local. Autenticação local, sessão, leitura autorizada e isolamento por tenant estão comprovados pelas evidências acima. O fluxo autenticado B3 não foi executado no celular porque a arquitetura desta prova restringe deliberadamente o proxy B3 a loopback. A validação end-to-end móvel deverá ocorrer em homologação futura com endpoint apropriado; a proteção de loopback não será removida apenas para satisfazer a prova local.

## Limites preservados

- B2 continua em modo de teste e sem emissão operacional;
- a B3 está encerrada somente como prova técnica local, não como autorização operacional;
- a regressão de PDF pós-integração não foi executada nesta etapa e foi transferida para gate futuro;
- o plano de migração opt-in permanece requisito futuro e não foi implementado na B3;
- permissões de emissão e registro da autorização de desconto por Edevaldo ainda dependem de decisão de Camila;
- SMTP autenticado continua uma trilha separada e pendente;
- não houve criação de usuário/tenant operacional, conexão do site ao backend por padrão, migração do `localStorage`, projeto externo, DNS, publicação ou commit.

## Critérios transferidos para gates futuros

- validação end-to-end do fluxo autenticado em dispositivo móvel, em homologação com endpoint apropriado;
- regressão do fluxo de geração e visualização de PDF após a integração;
- plano de migração opt-in, explícito, controlado e reversível, sem migração automática de dados existentes.

Esses itens não reabrem a prova local encerrada. Cada um dependerá de escopo, ambiente e critérios de aceite próprios. B2 operacional, dados reais, SMTP e infraestrutura externa permanecem desabilitados.
