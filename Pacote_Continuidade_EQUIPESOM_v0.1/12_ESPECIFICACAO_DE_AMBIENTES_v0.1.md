# Especificação verificável de ambientes — Projeto EQUIPESOM v0.1

Data: 16/09/2026  
Estado: proposta para revisão e aprovação de Camila; documentação, não autorização de implantação

## 1. Alcance, fontes e limite da evidência

Este documento detalha o plano de separação solicitado por Camila para **local**, **homologação** e **produção**. Define condições de entrada, evidências exigidas e decisões pendentes; não cria recursos nem escolhe automaticamente a tecnologia definitiva. O escopo atual do contrato de código é `configuration-only-no-frontend-connection` em `app-equipesom/config/environment-contract.json`.

Fontes vigentes: `02_REGISTRO_DE_DECISOES.md` (DEC-001, 002, 008, 021, 031, 034–039), `03_ROADMAP_E_STATUS.md`, `07_ESTADO_DO_PROJETO.json`, `08_MODELO_DE_DADOS_E_FLUXOS_v0.2.md`, `09_FUNDACAO_DE_ACESSO_E_TENANCY_v0.4.md`, `REGISTRO_DE_ALTERACOES.md`, `app-equipesom/config/environment-contract.json`, `src/config/runtimeEnvironment.ts`, `src/components/auth/PrototypeAccessBoundary.tsx` e a migração/teste Supabase local. O relatório técnico Supabase v0.1 e a fundação v0.4 registram o bloqueio de virtualização **em 02/09/2026**; o registro e estado atualizados em 16/09/2026 registram sua superação. Ambas as evidências são preservadas, sem reescrever o documento histórico.

Fato verificado: migração `20260902193000_access_foundation_probe.sql` aplicada somente no banco local; 27 asserções pgTAP aprovadas; massa fictícia revertida por `ROLLBACK`; exportação somente do esquema em `app-equipesom/supabase/exports/access-foundation.sql`. Isso não demonstra login funcional, integração do frontend, backup/restauração, isolamento de arquivos, operação com usuários reais, homologação ou produção. A aprovação operacional da proposta `EQ-2026-0001` foi declarada por Camila; o Codex não inspecionou o PDF real.

## 2. Contrato mínimo por ambiente

| Aspecto | Local — existente | Homologação — futura | Produção — futura |
|---|---|---|---|
| Finalidade | Protótipo e provas técnicas controladas | Validar integração e operação antes de promoção | Operação aprovada pela responsável |
| `VITE_APP_ENV` | `local` | `homologation` | `production` |
| `VITE_DATA_MODE` atual | `prototype-local` | `isolated-empty` | `isolated-empty` |
| Dados permitidos agora | Demonstração e dados locais do navegador, preservados; massa SQL fictícia transacional | Nenhum recurso ou dado criado; futura massa sintética somente com autorização específica | Nenhum recurso ou dado criado; dados reais somente após autorização de produção |
| Origem e serviços | Loopback para a prova; não aponta para outro ambiente | HTTPS, endereço não local e recursos independentes a decidir | HTTPS, endereço não local e recursos independentes a decidir |
| Acesso atual | Atalho explícito ao protótipo, sem sessão real | Somente `/login` visual; rotas de negócio bloqueadas | Somente `/login` visual; rotas de negócio bloqueadas |
| Situação | Existente, sem oficialização dos dados | Não implantado | Não implantado |

`VITE_APP_ENV` e `VITE_DATA_MODE` são valores compilados no frontend, não mecanismos de autorização. O código rejeita `prototype-local` fora do local, segredos server-side com nomes públicos e endpoint `localhost` fora do local. Antes de qualquer implantação, o processo de build deverá falhar se ambiente, modo, origem, URL pública, chave publicável ou destino não corresponderem ao manifesto aprovado. A chave publicável não é segredo nem substitui sessão, grants, RLS ou autorização no servidor. Variáveis de conexão, senha de banco, token administrativo e `service_role` nunca recebem prefixo `VITE_` nem entram no bundle, repositório, logs ou documentação com valores reais.

Se forem usados projetos hospedados no futuro, cada ambiente terá identidade, banco, autenticação, armazenamento de objetos, configurações, chaves, política de backup e trilha operacional próprios. Essa é uma condição de isolamento proposta, não criação autorizada. A URL e o hash do artefato publicado devem permitir identificar inequivocamente o ambiente. `app.consolegroup.com.br` é somente o hostname pretendido para a entrada da plataforma; propriedade, DNS, certificado e publicação não foram validados. O endereço de homologação permanece por decidir. Nenhum destes endereços será configurado nesta etapa.

## 3. Responsabilidades e aprovações

| Responsabilidade | Situação / titular |
|---|---|
| Decisão de produto, aprovação dos critérios e autorização para criar ambiente ou usar dados reais | Camila |
| Revisão comercial, assinatura e envio de propostas da EQUIPESOM | Edevaldo; não transferida ao Codex nem ao processo de implantação |
| Implementação técnica e produção de evidências para revisão | Responsável técnico a designar por Camila antes de implantação |
| Custódia de credenciais, provisionamento, backup, incidentes e recuperação | Responsável operacional a designar; nunca senha compartilhada |
| Revisão de privacidade/retenção, cláusulas e tributos | Profissionais e decisões específicos a definir; revisão jurídica e contábil não são inferidas da prova técnica |
| Aprovação de cada promoção ou reversão com impacto em dados | Camila ou delegado formalmente identificado por ela; delegação ainda não definida |

Nenhuma conta individual, política de MFA, orçamento ou procedimento de plantão é considerada aprovada por esta tabela. Cada designação futura precisa de nome, data, escopo e registro de decisão.

## 4. Dados, identidade e permissões

1. **Local:** preservar `localStorage` e chaves históricas `v1`–`v6`; não limpar nem importar a proposta real automaticamente. Dados demonstrativos não são evidência operacional. A prova SQL usa somente valores fictícios em transação com `ROLLBACK`.
2. **Homologação:** iniciar vazia após autorização futura. Admitir somente usuários e dados sintéticos identificáveis como testes. Cópia de cliente, PDF, proposta real, inventário ou credencial de produção é proibida por padrão; qualquer exceção exigiria decisão própria, base legal, minimização e método de anonimização verificado.
3. **Produção:** iniciar vazia. Criar o primeiro tenant operacional, pessoas reais e dados reais somente após autorização específica, política de privacidade/retenção e revisão do procedimento de importação. EQUIPESOM será o primeiro cliente, mas a prova com dois tenants fictícios não os criou operacionalmente.
4. A identidade Console Group, a empresa cliente, a pessoa, seu vínculo, papel e sessão permanecem distintos. Um `tenant_id` enviado pelo cliente nunca autoriza acesso por si. Convite, cadastro direto e ativação comercial têm critérios e auditorias diferentes; cadastro não concede vínculo ativo automaticamente.
5. Número e versão da proposta são conceitos distintos. Uma emissão futura entre dispositivos requer sequência transacional por tenant e ano, fotografia imutável da versão, PDF vinculado à versão e auditoria. A sequência atual do navegador não atende esse critério. Assinatura, envio e aceite continuam eventos separados. O inventário não reconciliado não comprova disponibilidade.

## 5. Matriz de verificação e evidência de isolamento

| Teste obrigatório antes de liberar acesso real | Evidência de aceite | Estado atual |
|---|---|---|
| Build de cada ambiente rejeita modo demonstrativo ou endpoint local fora do local e não contém segredos | Resultado do verificador, inspeção do bundle e manifesto de configuração sem valores secretos | Contrato estático disponível; implantação não testada |
| Sem sessão e sem vínculo ativo não há leitura, gravação, arquivo nem rota de negócio | Testes de UI, API e banco com negação explícita | Pendente; login é visual |
| Usuários de tenants A/B não enumeram, leem, alteram ou baixam dados e arquivos um do outro, inclusive com `tenant_id` adulterado | Testes negativos em API, RLS e objetos, com matriz usuário × operação × tenant | 27 pgTAP passaram somente para entidades SQL da prova; API/arquivos pendentes |
| Convite expirado, revogado, reutilizado ou aberto por outro e-mail falha; cadastro sem ativação não abre dados | Testes transacionais e de fluxo completo, com eventos de auditoria | Parcial no pgTAP; fluxo real pendente |
| Sessão revogada ou vínculo suspenso/encerrado perde acesso; administrador da plataforma não nasce de vínculo comum | Testes de revogação, permissões e rota administrativa por chamadas diretas | Parcial no pgTAP; integração pendente |
| Emissão concorrente produz número único, versão imutável, valores fotografados e evento auditável | Teste de concorrência e inspeção de transação, PDF e histórico | Pendente no banco; emissão atual só no navegador |
| Logs e artefatos não expõem token, senha, dados pessoais desnecessários ou URL de arquivo permanente | Varredura de bundle/logs e revisão de permissões | Pendente para ambientes futuros |

Falha em qualquer teste eliminatório bloqueia promoção; um resultado pgTAP local não é substituto de testes ponta a ponta. Cada execução futura registra versão de código/migração, ambiente, data, ator, massa usada, resultado e evidência sem segredo.

## 6. Backup, restauração e continuidade

Antes de homologação, definir proprietário do procedimento, escopo de banco/Auth/objetos/configuração, criptografia, acesso, retenção e mecanismo de exportação. Antes de produção, Camila deverá aprovar objetivos mensuráveis de perda máxima de dados (**RPO**) e tempo de recuperação (**RTO**), frequência, retenção, custo e responsável pelo acionamento. Os valores não estão definidos nos arquivos e não serão inventados.

Critério de saída: restaurar um backup em destino **isolado e autorizado**, verificar integridade referencial, usuários, políticas, contagens, versões emitidas, hashes de arquivos e trilha de auditoria, e registrar duração e divergências. Backup do banco e backup de objetos são provas distintas; a exportação SQL de esquema gerada na prova local **não é backup de dados**. Não copiar produção para homologação por conveniência. Não apagar o banco de origem nem sobrescrever proposta emitida durante ensaio de restauração.

## 7. Promoção e reversão

**Local → homologação (futuro):** decisão de fornecedor e orçamento registrados; responsáveis nomeados; autorização de criação; recursos isolados e vazios; migrações versionadas; configuração revisada; testes de isolamento e backup inicial executados. Apenas dados sintéticos autorizados. O resultado é um relatório de aceite de homologação, não autorização de produção.

**Homologação → produção (futuro):** critérios de segurança e operação da seção 5 aprovados; restauração real ensaiada; RPO/RTO, retenção, privacidade e custos aceitos; plano de suporte e incidente; artefato e migrações identificados por versão/hash; autorização explícita de Camila para recursos e dados reais. DNS, domínio, certificado e publicação têm validação e autorização próprias. Sem algum desses itens, a promoção fica bloqueada.

**Reversão:** manter artefato anterior e manifesto de configuração; prever desativação controlada de novas gravações e verificação de impacto antes de reverter o aplicativo. Migração de banco já aplicada não será revertida automaticamente por `reset`, exclusão ou script destrutivo: preparar correção compatível ou restauração pontual aprovada, com backup anterior e reconciliação dos registros criados após o marco. Nunca apagar versão emitida, PDF, evento de auditoria ou dado comercial para aparentar retorno ao estado anterior. O responsável registra motivo, janela, ambiente, dados afetados, resultado e autorização. Os comandos exatos e tempo de reversão só serão definidos após escolha da infraestrutura.

## 8. SMTP autenticado — trilha separada

A prova offline não equivale a conexão autenticada. `npm run verify:smtp-connection` permanece opt-in, sem envio, dependente de credencial local configurada pela responsável e confirmação específica; não é executado por este plano. Envio real de proposta exigirá outra autorização e vínculo seguro de tenant, versão emitida, destinatário, PDF e auditoria. SMTP não desbloqueia homologação nem produção por si só, e a especificação dos ambientes não autoriza conexão ou envio.

## 9. Decisões pendentes para Camila e critério de aprovação desta especificação

| Decisão pendente | Por que bloqueia a próxima etapa | Evidência esperada |
|---|---|---|
| Fornecedor definitivo de banco, autenticação e objetos; região e orçamento | Supabase foi confirmado apenas para prova local | Decisão registrada, comparação/custos atualizados e limite operacional |
| Responsáveis individuais e acesso administrativo, MFA e resposta a incidente | Não há titular designado para credenciais e recuperação | Matriz de papéis aprovada, sem senha compartilhada |
| Endereço de homologação e comprovação do hostname pretendido da plataforma | Nome desejado não demonstra propriedade, DNS ou certificado | Validação e autorização específicas antes de qualquer publicação |
| RPO, RTO, retenção, privacidade e backup de banco e objetos | Não é seguro promover dados sem restauração demonstrada | Política aprovada e ensaio registrado em ambiente isolado |
| Critérios para primeiro tenant, usuários reais e importação de rascunhos | O protótipo local e a prova sintética não são dados oficiais | Lista de registros aprovada, relatório de simulação e autorização de migração |
| Fluxo de convite, cobrança/ativação, permissões e operação do painel interno | Login visual e esquema de prova não constituem SaaS funcional | Regras e testes de aceite aprovados antes de implementar |

Aprovar esta especificação significa concordar com os **critérios e pendências**, não declarar os itens pendentes resolvidos nem autorizar implantação. A próxima etapa documental é Camila confirmar ou ajustar cada decisão acima e designar responsáveis. A sequência posterior, sujeita a novas autorizações, é: escolha da fundação → homologação sintética e testes completos → ensaio de restauração → decisão específica de produção e dados reais.

## Registro da versão

| Versão | Data | Alteração |
|---|---|---|
| 0.1 | 16/09/2026 | Especificação verificável dos três ambientes baseada no plano solicitado por Camila e na prova Supabase exclusivamente local, sem implantação. |
