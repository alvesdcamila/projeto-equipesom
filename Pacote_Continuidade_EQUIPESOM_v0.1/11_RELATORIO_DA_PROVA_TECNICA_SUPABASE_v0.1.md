# Relatório da prova técnica Supabase — v0.1

Data: 02/09/2026

Status: artefatos preparados e verificação estrutural aprovada; execução PostgreSQL e exportação SQL pendentes por bloqueio local de virtualização

## 1. Autorização e limite

Camila confirmou Supabase como fornecedor da prova e São Paulo (`sa-east-1`) como região pretendida para eventual ambiente hospedado. A autorização limita a prova a dois tenants e dois usuários fictícios, sem plano pago, publicação, DNS, dados reais, PDFs, CNPJ ou leitura do `localStorage`.

Esta prova não escolhe a arquitetura definitiva, não implementa cobrança e não conecta as telas atuais ao Supabase. Nenhum ambiente externo pode ser excluído sem nova autorização explícita.

## 2. Artefatos produzidos

- `app-equipesom/supabase/config.toml`: configuração local, restrita a loopback, com confirmação de e-mail e política mínima de senha apenas para a prova;
- `app-equipesom/supabase/migrations/20260902193000_access_foundation_probe.sql`: esquema, privilégios, RLS, funções e auditoria;
- `app-equipesom/supabase/tests/database/access_foundation.test.sql`: 27 asserções pgTAP autocontidas e transacionais;
- `app-equipesom/supabase/seed.sql`: vazio de dados por decisão; a massa fictícia vive somente na transação de teste;
- `app-equipesom/scripts/verify-access-foundation.mjs`: verificação estrutural que não se apresenta como execução de banco;
- scripts npm para checagem estática, teste Supabase e exportação SQL.

A CLI Supabase `2.116.0` foi adicionada somente como dependência de desenvolvimento. Não foi instalado SDK no frontend.

## 3. Modelo avaliado

| Conceito | Implementação da prova | Regra demonstrada |
|---|---|---|
| Identidade | `auth.users` + `app_users` | senha pertence ao Supabase Auth; identidade sozinha não libera tenant |
| Tenant | `tenants` | fronteira explícita e estado independente |
| Papel | `roles` | papel pertence ao contexto, não ao usuário |
| Vínculo | `memberships` | acesso exige vínculo ativo, vigente e no tenant correto |
| Convite | `invitations` | e-mail, tenant, papel, hash, validade, revogação, aceite único e auditoria |
| Cadastro direto | `signup_requests` | não escolhe tenant nem cria vínculo ativo |
| Ativação comercial | `commercial_activations` | decisão separada; cobrança não implementada |
| Sessão | `session_revocations` | sessão revogada falha fechada nas políticas do banco |
| Auditoria | `audit_events` | criação e mudança de estado do convite deixam evento |
| Dado de negócio | `proposal_probe` | RLS baseada em `tenant_id` e vínculo ativo |

## 4. Testes preparados

As 27 asserções verificam:

1. existência separada das seis entidades nucleares;
2. visibilidade de apenas um tenant e seus dados por usuário;
3. permissão de escrita no próprio tenant;
4. negação de inserção cruzada e de alteração do `tenant_id`;
5. bloqueio quando o vínculo está suspenso;
6. criação de solicitação comercial sem vínculo ativo;
7. bloqueio imediato de sessão revogada;
8. armazenamento apenas do hash do token;
9. negação por e-mail diferente, expiração, revogação e segundo uso;
10. criação transacional do vínculo pelo convite válido;
11. trilha de auditoria do aceite;
12. revogação isolada de um vínculo sem afetar o outro tenant.

Os testes usam somente:

- tenants `Tenant Fictício Alfa` e `Tenant Fictício Beta`;
- usuários `Usuário Fictício Um` e `Usuário Fictício Dois`;
- e-mails sob o domínio reservado `example.invalid`;
- identificadores UUID determinísticos exclusivos da prova.

Todas as alterações do teste ficam dentro de `BEGIN`/`ROLLBACK`.

## 5. Resultado verificável até o momento

| Verificação | Resultado | Evidência |
|---|---|---|
| consistência estrutural dos arquivos | aprovada | `npm run verify:access-foundation:static`: 27 asserções reconhecidas e dois UUIDs de tenant/usuário |
| tipos do frontend | aprovado | `npm run typecheck` |
| regressão do protótipo | aprovada | `npm run test` |
| build do frontend | aprovado | `npm run build` |
| aplicação da migração | não executada | Docker Linux falhou antes da criação do banco |
| 27 testes pgTAP | não executados | não havia PostgreSQL local operacional |
| exportação `supabase db dump` | não gerada | não existe banco testado do qual exportar |

## 6. Bloqueio exato

O Docker Desktop está instalado e seu serviço do Windows está ativo, mas a API do mecanismo `dockerDesktopLinuxEngine` respondeu com erro interno HTTP 500. Após autorização de Camila, o diagnóstico do Windows 10 Pro, compilação 19045, informou:

- `Extensão de Modo de Monitor VM: Sim`;
- `Virtualização Habilitada no Firmware: Não`;
- `Conversão de Endereços de Segundo Nível: Sim`;
- `Prevenção de Execução de Dados Disponível: Sim`.

Isso confirma que o processador oferece os recursos necessários, mas a virtualização está desativada no BIOS. A configuração do Docker também registra `WslEngineEnabled: false`. A consulta detalhada dos recursos opcionais do Windows exigiu elevação administrativa e não alterou o sistema.

O comando oficial do Supabase falhou antes de iniciar ou migrar o PostgreSQL. Portanto, seria incorreto afirmar que RLS, funções e testes passaram, ou criar manualmente um arquivo e chamá-lo de exportação do banco. Como a ativação no BIOS exige reinicialização, a execução foi interrompida conforme a autorização de Camila; nenhuma reinicialização foi iniciada.

## 7. Saída e preservação

Quando houver um PostgreSQL Supabase operacional, a sequência prevista é:

```text
iniciar stack local → aplicar migrações → executar pgTAP → gerar db dump → conferir exportação → registrar evidências
```

O arquivo esperado será `app-equipesom/supabase/exports/access-foundation.sql`, gerado pelo comando versionado `npm run export:access-foundation`. Ele ainda não existe porque a origem exigida — o banco testado — não existe.

Nenhum projeto externo, credencial persistente, plano, DNS ou publicação foi criado. A região `sa-east-1` foi apenas registrada. A exclusão de qualquer futuro ambiente externo continua fora de escopo sem autorização explícita de Camila.

## 8. Decisão necessária para concluir a prova

Há duas rotas possíveis, ambas dependentes de autorização:

1. habilitar no Windows a virtualização necessária ao Docker/WSL, reiniciar se solicitado e executar a prova local; ou
2. criar uma única prova hospedada gratuita em `sa-east-1`, depois de Camila entrar no Supabase e confirmar a geração de credenciais persistentes.

A primeira rota preserva melhor o caráter local e descartável. A segunda cria um ambiente externo que deverá ser mantido até Camila autorizar sua exclusão.

## 9. Continuidade da rota local em 03/09/2026

Camila habilitou manualmente a opção Intel de virtualização na área avançada do BIOS e reiniciou o computador. A nova consulta do Windows passou a informar `Hipervisor detectado`, confirmando que o firmware reconheceu a alteração.

Com autorização administrativa de Camila, foram habilitados somente os recursos `Microsoft-Windows-Subsystem-Linux` e `VirtualMachinePlatform`, usando DISM com reinicialização automática desabilitada. O processo retornou `3010`, que registra conclusão bem-sucedida com reinicialização pendente.

Conforme o limite definido por Camila, o Codex parou antes da reinicialização. Migração, pgTAP e exportação continuam sem execução até que Camila reinicie manualmente e retome a tarefa. Nenhum ambiente externo foi criado ou excluído.
