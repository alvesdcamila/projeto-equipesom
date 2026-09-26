# Prova B1 — Supabase Auth exclusivamente local v0.1

Data: 16/09/2026  
Estado: backend local de acesso testado; interface do site ainda não conectada

## Autorização e limite

Camila confirmou nesta conversa o uso de Supabase Auth **somente no ambiente local** para a primeira etapa funcional de acesso. A confirmação não escolhe fornecedor definitivo, não cria projeto externo nem autoriza usuários reais, migração do navegador, SMTP, DNS ou publicação. Camila continua sendo a única administradora de chaves e autorizações de pessoas.

## Entrega técnica

- A migração `app-equipesom/supabase/migrations/20260916170000_local_auth_context.sql` criou a função `current_access_context()`. Ela exige sessão ativa e retorna somente o perfil da pessoa e seus vínculos ativos, vigentes e pertencentes a tenants ativos. Anônimos não recebem permissão de executá-la.
- O comando opt-in `npm run verify:local-auth` lê as chaves **geradas pela CLI local** apenas em memória, exige URL de loopback, cria três identidades `example.invalid` com senhas aleatórias, autentica via Supabase Auth e consulta a API/banco com os tokens de sessão reais. Não registra chave, senha ou token em arquivo ou log.
- O teste cria dois tenants fictícios, dois vínculos e duas linhas fictícias apenas durante a execução. Verifica pessoa autenticada, tenant próprio, identidade sem vínculo, negação de consulta anônima, tentativa de tenant e proposta cruzados, suspensão do vínculo e revogação da sessão. Limpa seus IDs específicos ao final; não reseta nem varre o banco.
- A suíte pgTAP agora contém 56 asserções em três arquivos: 27 da fundação de acesso, 19 de propostas e 10 do contexto de autenticação. Todos os arquivos pgTAP terminam em `ROLLBACK`.

## Resultado observado

`supabase migration up --local` aplicou `20260916170000_local_auth_context.sql`. `supabase test db --local` retornou `Files=3, Tests=56`, `All tests successful`, `Result: PASS`. `npm run verify:local-auth` retornou `PASS: Auth local, contexto, isolamento, suspensão e revogação verificados.` Consulta direta depois do teste encontrou zero linhas em `auth.users`, `tenants`, `memberships`, `proposal_probe` e `session_revocations`; somente as estruturas locais e o histórico da migração permaneceram.

## O que B1 ainda não é

O formulário `/login` do site continua visual. Não foram criados usuário Camila, tenant EQUIPESOM operacional, senha real ou sessão persistente no navegador. O `AppShell` e as propostas atuais permanecem no protótipo local. Esta prova não demonstra recuperação de senha, convite funcional, administração da plataforma, MFA, backup/restauração nem autenticação hospedada. A autorização verdadeira foi verificada no Supabase local por API e RLS, não por filtro de interface.

## Próximo passo

Avançar para B2 em desenvolvimento local: emissão e numeração transacionais por tenant, criação imutável de versão, valores fotografados e auditoria, com testes concorrentes e dados fictícios. Antes de ligar as telas e migrar qualquer proposta real, revisar com Camila o contrato de permissões de emissão/desconto e o procedimento de preservação do navegador. B3 conectará a interface somente depois da prova B2; hospedagem, homologação com lote real e SMTP continuam portões separados.
