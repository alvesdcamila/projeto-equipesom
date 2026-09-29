# Prova B3 — integração local de acesso e leitura (v0.1)

Atualizado em 28/09/2026. Escopo autorizado por Camila: somente Supabase local, contas e propostas fictícias; preservar `localStorage` e a emissão existente no navegador; manter B2 desabilitado para operação real.

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

`npm run verify:b3-readonly` comprovou: dois logins fictícios; cada usuário vendo somente seu tenant; tentativa cruzada retornando conjunto vazio; anônimo sem leitura; conta sem vínculo sem memberships; B2 sem `b2_test_enabled`; e remoção final de toda a massa fictícia. Nenhuma credencial, token ou dado real foi persistido.

Para a conferência visual de Camila, `npm run prepare:b3-manual` cria somente no ambiente local uma conta `example.invalid`, vínculo, tenant e proposta fictícios e registra os IDs e credenciais temporárias em `tmp/b3-manual-access.json`, com permissão `0600`. `npm run cleanup:b3-manual` remove todos os registros pelos IDs, comprova zero remanescentes e apaga o arquivo. Um ciclo completo de preparação e limpeza passou antes da abertura do acesso final.

## Limites preservados

- B2 continua em modo de teste e sem emissão operacional;
- permissões de emissão e registro da autorização de desconto por Edevaldo ainda dependem de decisão de Camila;
- SMTP autenticado continua uma trilha separada e pendente;
- não houve criação de usuário/tenant operacional, conexão do site ao backend por padrão, migração do `localStorage`, projeto externo, DNS, publicação ou commit.

## Próximo passo

Camila valida a tela em `http://127.0.0.1:5174/login` com a conta fictícia temporária e confirma o encerramento da conferência. Em seguida, executar `npm run cleanup:b3-manual` e registrar a verificação de zero remanescentes. Depois Camila decide as permissões de emissão e a forma de registrar o desconto; a preparação de homologação continua sem dados reais até haver isolamento, backup/restauração e aprovação de lote.
