# Registro de alterações — Projeto EQUIPESOM

Este arquivo mantém o histórico verificável de alterações materiais do protótipo. As entradas registram o estado anterior, a origem da solicitação, a decisão aplicada e as verificações executadas, sem substituir os documentos históricos do projeto.

## 2026-08-19 — Continuidade com próximo passo sempre mapeado

- **Estado:** concluída.
- **Origem:** solicitação direta de Camila nesta conversa para que toda conclusão já apresente o próximo passo, sem exigir uma nova mensagem apenas para perguntar como continuar.
- **Comportamento anterior:** o `AGENTS.md` definia comunicação, evidências, governança e registro de alterações, mas não exigia que cada conclusão trouxesse o próximo passo recomendado e um prompt pronto quando aplicável.
- **Alteração implementada:** foi criada no `AGENTS.md` a seção “Continuidade e próximo passo”, exigindo objetivo, justificativa, pendências, resultado esperado, sequência curta das etapas posteriores e prompt pronto para tarefas de desenvolvimento no Codex.
- **Justificativa:** reduzir interrupções na condução do projeto e manter a evolução visível para Camila sem transformar recomendações futuras em autorização automática.
- **Arquivos alterados:** `AGENTS.md` e `REGISTRO_DE_ALTERACOES.md`.
- **Impacto em dados e compatibilidade:** nenhum dado do protótipo, regra comercial ou arquivo histórico foi alterado. A instrução passa a orientar as próximas conversas abertas a partir da raiz do projeto.
- **Verificações executadas:** leitura direta dos dois arquivos após a alteração; nenhuma verificação de código é necessária porque não houve mudança no aplicativo.

## 2026-08-19 — Primeiro ponto de restauração do protótipo

- **Estado:** concluída com commit local, sem publicação.
- **Origem:** solicitação direta de Camila nesta conversa para criar o primeiro commit local de restauração do Projeto EQUIPESOM.
- **Comportamento anterior:** o repositório Git existe na branch `master`, ainda sem commits; todos os arquivos do projeto permanecem fora do histórico versionado.
- **Alteração solicitada:** criar um commit local com a base do protótipo, instruções, registro e arquivos textuais de continuidade autorizados, mantendo documentos binários, dados sensíveis, dependências, artefatos, logs, caches e cópias fora do commit.
- **Justificativa:** estabelecer um ponto de recuperação verificável antes das próximas evoluções, sem decidir ainda a política de privacidade ou a visibilidade de um futuro repositório remoto.
- **Publicação:** este será um commit exclusivamente local. Nenhum conteúdo será publicado e nenhum `push` será executado.
- **Arquivos previstos:** `.gitignore`, `AGENTS.md`, `REGISTRO_DE_ALTERACOES.md`, arquivos necessários de `app-equipesom` respeitando o `.gitignore` e arquivos `.md`, `.txt`, `.json` e `.csv` diretamente em `Pacote_Continuidade_EQUIPESOM_v0.1`.
- **Arquivos explicitamente excluídos:** `node_modules`, `dist`, logs, caches, `.env`, PDFs, cartão CNPJ, `fontes`, planilhas, `.inspect.ndjson`, documentos Word, ZIP, `1_ETAPA` e cópias binárias soltas na raiz.
- **Impacto em dados e compatibilidade:** nenhum documento será apagado, movido ou modificado para compor o commit. O histórico local apenas registrará cópias dos arquivos autorizados no estado atual.
- **Identidade e branch:** a identificação local deverá permanecer `alvesdcamila` e `dscamila@outlook.com.br`, sem alteração da branch atual.
- **Arquivos incluídos:** `.gitignore`, `AGENTS.md`, `REGISTRO_DE_ALTERACOES.md`, código-fonte e arquivos necessários de `app-equipesom` não ignorados e os nove arquivos textuais autorizados diretamente em `Pacote_Continuidade_EQUIPESOM_v0.1`.
- **Verificações executadas:** `npm run typecheck`, `npm run lint`, `npm run build` e `npm run verify:prototype`, todas concluídas sem erros ou avisos antes da preparação do commit.
- **Auditoria prevista antes da confirmação:** listar todos os arquivos no stage, conferir extensões e diretórios proibidos, confirmar a identidade Git local e verificar que a branch permanece inalterada.

## 2026-08-18 — Preparação da terceira evolução após validação

- **Estado:** concluída.
- **Origem:** solicitação de Camila fornecida no arquivo anexado `pasted-text.txt`.
- **Antes da alteração:** o protótipo usa o formato local `v2`; recupera dados da chave `v1` sem apagá-la; identifica quem elaborou a proposta pelo campo `preparedByUserId`, limitado às opções Camila e Edevaldo Alves; conclui rascunhos locais com uma fotografia completa; e oferece somente consulta no detalhe, sem rota para editar um rascunho já concluído.
- **Alteração solicitada:** substituir o responsável fixo por nome completo livre e obrigatório; evoluir a persistência para `v3` com migração explícita de `v1` e `v2`; permitir editar somente rascunhos locais completos, mantendo o mesmo identificador e a mesma versão; preservar a imutabilidade de propostas enviadas ou aceitas, os demonstrativos e os registros legados incompletos.
- **Justificativa:** incorporar o resultado da validação de Camila sem perder dados já salvos e sem confundir a mutabilidade do rascunho com emissão, assinatura, aceite ou criação de nova versão.
- **Arquivos alterados:** `app-equipesom/src/types/domain.ts`, `src/data/mockData.ts`, `src/config/proposalAuthors.ts`, `src/features/proposals/validation.ts`, componentes do formulário e revisão, `src/services/prototypeStorage.ts`, páginas e rotas de propostas, estilos, `scripts/verify-prototype.mjs` e `app-equipesom/README.md`.
- **Impacto em dados:** haverá gravação em uma nova chave isolada pelo tenant e pela versão do formato. As chaves `v1` e `v2` permanecerão intactas. Nomes comprovados serão convertidos; identificadores desconhecidos resultarão em campo vazio no rascunho para preenchimento explícito.
- **Migração e compatibilidade:** a aplicação deverá ler `v3` primeiro e, na ausência dele, normalizar `v2` ou `v1` para `v3`, sem exclusão silenciosa. Fotografias antigas completas manterão o nome exibido já registrado.
- **Depois da alteração:** o nome de elaboração é um texto livre obrigatório, iniciado em branco e aparado antes da gravação; o formato atual é `v3`; rascunhos locais completos abrem em `/propostas/:proposalId/editar`; a edição recupera sua etapa após recarga e atualiza a mesma proposta e versão; conteúdos enviados, aceitos, demonstrativos, legados incompletos ou de outro tenant permanecem bloqueados para edição.
- **Verificações executadas:** `npm run typecheck`, `npm run lint`, `npm run build` e `npm run verify:prototype`, todas concluídas sem falhas. A verificação funcional cobriu nome livre, documentos, inventário, fotografia completa, migrações `v1`/`v2`, retomada de edição, atualização sem duplicação ou nova versão, conteúdo incompatível e isolamento por tenant.
- **Pendências preservadas:** o protótipo continua sem autenticação, emissão, assinatura, aceite, banco de dados ou integração externa. O nome digitado para elaboração ainda não representa uma identidade de usuário verificada.

## 2026-08-18 — Fotografia estruturada da empresa emitente

- **Estado:** concluída.
- **Origem:** solicitação de Camila nesta conversa para acrescentar os dados confirmados da empresa emitente ao cabeçalho e à fotografia da proposta.
- **Comportamento anterior:** `CompanyProfile` registra apenas `tenantId`, marca, razão social, cidade resumida e pilares; o formato local atual é `v3`; `ProposalSnapshot` separa cliente e elaborador, mas não possui emitente; propostas novas e migradas não fotografam os dados da empresa; revisão e detalhe não exibem um bloco “Emitente”.
- **Alteração proposta:** estruturar documento, endereço e contatos opcionais no perfil da empresa-piloto; criar uma fotografia `issuer` independente; evoluir o armazenamento para `v4`; acrescentar o emitente a novas propostas, a rascunhos locais completos migrados e às telas de revisão e detalhe por componente reutilizável.
- **Justificativa:** preservar os dados da empresa que originaram cada rascunho sem misturá-los com contratante, elaborador, assinante ou regras globais, mantendo a preparação multiempresa por `tenantId`.
- **Arquivos afetados:** `app-equipesom/src/config/company.ts`, `src/types/domain.ts`, `src/services/prototypeStorage.ts`, `src/components/proposals/IssuerHeader.tsx`, `src/components/proposals/ProposalSnapshotDetails.tsx`, `src/features/proposals/steps/ReviewStep.tsx`, `src/utils/issuerPresentation.ts`, `src/styles/components.css`, `scripts/verify-prototype.mjs` e `app-equipesom/README.md`.
- **Impacto em dados existentes:** a nova gravação será feita em chave `v4`. As chaves `v1`, `v2` e `v3` permanecerão intactas. Rascunhos locais completos ainda não emitidos poderão receber os dados atuais confirmados da EQUIPESOM durante a migração de protótipo.
- **Migração e compatibilidade:** não será fabricada fotografia histórica para propostas enviadas, aceitas, demonstrativas ou registros incompatíveis sem emitente; a interface indicará a ausência. A edição de rascunhos e o isolamento por tenant deverão ser preservados.
- **Alteração implementada:** o perfil da empresa-piloto agora estrutura documento, endereço e contatos opcionais; propostas novas guardam `issuer` separado de `client` e `preparedBy`; revisão e detalhe usam um cabeçalho reutilizável identificado como “Emitente”; telefone e e-mail vazios não são renderizados; a edição mantém a fotografia já vinculada ao rascunho.
- **Migração concluída:** o formato atual passou a `v4`. Na ausência da chave atual, a aplicação lê `v3`, `v2` ou `v1` nessa ordem e grava uma cópia normalizada em `v4`, sem apagar nem sobrescrever as chaves anteriores. Somente rascunhos locais completos recebem a fotografia atual durante essa migração; propostas enviadas, aceitas, demonstrativas ou com emitente incompatível permanecem sem emitente histórico e exibem informação indisponível.
- **Verificações executadas:** `npm run typecheck`, `npm run lint`, `npm run build` e `npm run verify:prototype`, todas concluídas sem erros ou avisos. Os testes cobriram separação emitente/contratante, fotografia estruturada, cabeçalho baseado na fotografia, contatos vazios ocultos, criação, edição preservando emitente, migração `v3 → v4`, preservação das chaves `v1`/`v2`/`v3`, ausência de fabricação histórica e isolamento por tenant.

## 2026-08-18 — Telefone do piloto e textos por contexto de apresentação

- **Estado:** concluída.
- **Origem:** solicitação de Camila fornecida no arquivo anexado `pasted-text.txt` desta conversa.
- **Comportamento anterior:** o telefone opcional aceitava caracteres de formatação, 10 ou 11 dígitos e também números iniciados por `+55`; o componente não aplicava máscara nem limite centralizados. A interface usava “Emitente”, “Dados provisórios” e avisos sobre experimentação e compromisso comercial. Não existia configuração central para separar textos internos do rascunho, da futura prévia e do documento emitido.
- **Alteração solicitada:** limitar o telefone do cliente a 11 dígitos com máscara brasileira para celular e fixo, rejeitar `+55`, preservar telefones históricos sem corte silencioso, substituir os textos visíveis por “Emissor”, ajustar a seção interna de valores e criar o mapeamento preparatório `internalDraft`, `documentPreview` e `emittedDocument`.
- **Justificativa:** tornar a entrada do piloto coerente com a validação brasileira e impedir que mensagens internas da aplicação sejam confundidas ou reaproveitadas como texto comercial do futuro documento.
- **Arquivos afetados:** `app-equipesom/src/utils/clientPhone.ts`, `src/config/proposalPresentation.ts`, `src/features/proposals/steps/ClientStep.tsx`, `src/features/proposals/validation.ts`, `src/components/proposals/IssuerHeader.tsx`, `src/components/proposals/ProposalSnapshotDetails.tsx`, `src/pages/ProposalDetailPage.tsx`, `scripts/verify-prototype.mjs`, `app-equipesom/README.md` e este registro.
- **Impacto em dados existentes:** nenhuma migração de armazenamento será criada. Fotografias e rascunhos já salvos manterão o telefone original; um rascunho antigo inválido deverá ser corrigido na interface antes de ser salvo novamente.
- **Compatibilidade e escopo:** a regra de telefone é específica do piloto brasileiro e não constitui limitação global do futuro SaaS. O nome técnico persistido `issuer` será mantido. “Investimento” é apenas recomendação de apresentação, sujeita à aprovação de Camila durante a criação do modelo visual.
- **Alteração implementada:** o campo aplica máscara centralizada, `inputMode="numeric"`, limite visual coerente e corte em 11 dígitos; telefones fixos e celulares mantêm seus formatos; `+55` é rejeitado. Os textos visíveis passaram a usar “Emissor”. O detalhe interno usa “Rascunho”, “Valores” e o aviso aprovado, enquanto prévia e documento emitido usam a recomendação “Investimento” sem avisos internos.
- **Compatibilidade concluída:** o formato de armazenamento permanece `v4` e a propriedade técnica `issuer` não foi renomeada. A normalização de dados armazenados não aplica máscara nem corte ao telefone, preservando fotografias e rascunhos históricos; valores antigos inválidos geram pendência antes de nova gravação pela interface.
- **Verificações executadas:** `npm run typecheck`, `npm run lint`, `npm run build` e `npm run verify:prototype`, todas concluídas sem erros ou avisos. Os testes cobriram máscara e limite por digitação/colagem, 10 e 11 dígitos válidos, comprimentos inválidos, rejeição de `+55`, preservação histórica, terminologia “Emissor”, ausência dos textos internos substituídos e separação entre `internalDraft`, `documentPreview` e `emittedDocument`.
