# Prova B2 — emissão transacional exclusivamente local v0.1

Data: 16/09/2026  
Estado: mecanismo experimental de backend testado; operação real desabilitada

## Escopo e origem

Camila autorizou nesta conversa implementar e testar B2 no Supabase local, com dados fictícios e sem conectar o site, migrar proposta real, executar SMTP ou criar recursos externos/commit. Esta prova não aprova esquema físico definitivo nem converte a emissão do navegador em emissão do banco.

O registro de decisões vigente confirma: DEC-004, versões emitidas imutáveis; DEC-021, número `EQ-AAAA-NNNN` para EQUIPESOM; DEC-023, desconto percentual sobre subtotal anterior, com percentual e valor guardados; DEC-011, autorização de desconto por Edevaldo. DEC-040 reserva a administração de chaves e acessos a Camila. O Blueprint v0.1 é base de descoberta, não aprovação da matriz de permissões. A planilha v0.2.0 separa preços de referência, preço negociado e custos internos; não transforma os valores históricos em tabela oficial. A extração textual do PDF Blueprint apresentou caracteres acentuados corrompidos, mas as seções de fluxo e arquitetura puderam ser identificadas e foram confrontadas com o modelo conceitual v0.2 e as decisões vigentes.

## Entrega verificável

- A migração `20260916180000_b2_local_issuance_probe.sql` cria configuração de prefixo e fuso por tenant, com `b2_test_enabled = false` por padrão e sem concessão de escrita a usuários autenticados. O complemento `20260916183000_b2_snapshot_integrity.sql` preserva o fuso na versão e rejeita taxa cuja precisão exceda a fotografia numérica. O prefixo `EQ` é configurado somente nos dados fictícios do teste; não vira padrão global.
- O contador tem chave `(tenant_id, issue_year)`; seu UPSERT e o bloqueio da linha da proposta serializam a emissão. Índices únicos impedem duplicação de número/ano no tenant. Um erro na emissão reverte contador, versão, estado e auditoria na mesma transação.
- A função `issue_proposal_b2` exige sessão/vínculo ativo, portão B2 aberto explicitamente, proposta em rascunho e conteúdo financeiro estruturado. Recalcula base, deslocamento, subtotal, percentual, desconto e total no banco, substituindo valores derivados recebidos do cliente. Esta prova admite percentual de 0% a 100%, no máximo quatro casas na taxa, e arredondamento em centavos como **limites técnicos provisórios**, não política financeira global.
- A versão 1 guarda conteúdo fotografado, número, data/hora, fuso usado no cálculo do ano e da validade, moeda, valores e hash SHA-256. O gatilho existente impede alteração ou exclusão de versão. A auditoria registra ator, tenant, versão, número, valores e `discount_approval_pending` quando há desconto. Assinatura, envio e aceite não são simulados como emissão.
- A prova cobre apenas primeira emissão. Reabertura e segunda versão dependem da definição do fluxo de alteração após emissão; não foram presumidas.

## Resultados observados

- As migrações locais `20260916180000` e `20260916183000` foram aplicadas sem criar projeto externo.
- `supabase test db --local`: **4 arquivos, 90 asserções aprovadas** (27 acesso + 19 fundação de propostas + 10 contexto Auth + 34 B2). Todos os testes pgTAP usam `BEGIN`/`ROLLBACK` e massa fictícia. B2 verificou portão fechado, isolamento, número, versão, desconto e total recalculados, validade, fuso, precisão da taxa, hash, auditoria, duplicidade, imutabilidade e reversão após falha tardia.
- `npm run verify:b2-concurrency`: duas conexões disputaram o mesmo contador fictício de tenant/ano e receberam sequências 1 e 2. Esse exercício testa a alocação concorrente do contador, **não** dois fluxos completos de emissão via API. O contador e tenant temporários foram removidos pelos IDs da prova.
- Consultas finais de persistência, checagens da aplicação e do Git constam também no `REGISTRO_DE_ALTERACOES.md`.

## Portões para Camila — nenhuma decisão presumida

1. **Permissão de emissão.** Quem poderá criar/revisar/emitir para EQUIPESOM: Camila, Edevaldo ou ambos, e é necessária uma revisão por pessoa diferente antes de emitir? Camila administra acessos (DEC-040), mas isso não concede automaticamente a aprovação comercial; Edevaldo assina e envia. Recomenda-se configurar ações distintas por pessoa e auditar o revisor, sem senha compartilhada.
2. **Autorização de desconto por Edevaldo.** A DEC-011 diz literalmente: “Descontos exigem autorização de Edevaldo”. É necessário decidir se Edevaldo aprovará com a própria conta no sistema ou se Camila poderá registrar uma autorização externa com evidência verificável. Recomenda-se vincular a aprovação a uma revisão específica do rascunho, percentual, valor, total, identidade do aprovador e momento; uma mudança nesses elementos exigiria nova aprovação. O campo B2 `discount_approval_pending` **não é aprovação**.
3. **Limites comerciais.** Confirmar arredondamento monetário, percentual máximo, tratamento de desconto zero, validade/fuso por empresa, política de reabertura e criação da versão 2. Os limites da prova não devem virar regra global por omissão.

## Limites e próximo passo

O frontend `/login` e as propostas em `localStorage` não foram conectados. Não há usuário operacional, tenant EQUIPESOM real, validação integral do conteúdo comercial, PDF oficial do backend, aprovação de desconto funcional, assinatura, envio, aceite, backup/restauração de operação real ou homologação. SMTP autenticado continua pendência separada. O inventário incompleto não comprova disponibilidade.

Próximo passo sugerido: B3 local e ainda fictício, com integração controlada da autenticação e leitura das propostas autorizadas, sem habilitar a emissão real até Camila decidir os portões acima e aprovar um procedimento de preservação/migração dos dados do navegador.
