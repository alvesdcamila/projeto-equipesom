# Roadmap e status — Projeto EQUIPESOM

Atualizado em 30/09/2026

## B3 — acesso local e leitura autorizada (prova integrada e validação manual do login concluídas; gate aberto)

O modo opt-in de desenvolvimento conecta o login ao Auth Supabase local e lê propostas somente após validar identidade, vínculo ativo e tenant. A rota `/acesso-local/propostas` é somente leitura; a rota `/propostas`, o `localStorage` e a emissão atual do navegador permanecem preservados. O proxy aceita apenas loopback e o modo `local`; não há conexão por padrão, emissão B2 real, SMTP ou dados operacionais.

Em 28/09/2026, no Mac ARM, as dependências foram reinstaladas para a plataforma, Docker Desktop e o Supabase exclusivamente local foram iniciados, e as 90 asserções pgTAP passaram. `npm run verify:b3-readonly` comprovou login, vínculo, leitura somente leitura, isolamento entre tenants, negação cruzada/anônima, B2 desligado e limpeza integral das três contas, dois tenants e duas propostas fictícias. O relatório está em `15_PROVA_B3_INTEGRACAO_LOCAL_v0.1.md`.

Em 30/09/2026, Camila confirmou a validação manual bem-sucedida do login B3 com o acesso fictício temporário. Depois da conferência, executou `npm run cleanup:b3-manual`, que informou zero contas, vínculos, tenants, propostas e rascunhos fictícios restantes. Essa confirmação encerra somente a validação manual do login, não o gate B3 completo.

Próximo gate: analisar e registrar os três critérios B3 ainda abertos — validação em celular, regressão de PDF e decisão ou plano de migração opt-in. Até decisão explícita sobre esses critérios, B3 permanece aberto; B2 não pode ser habilitado para operação real. Permissões de emissão e registro da autorização de desconto por Edevaldo vêm depois do fechamento formal de B3. SMTP autenticado segue trilha separada.

## Concluído

- Blueprint do produto v0.1.
- Análise de cinco propostas históricas.
- Validação do cartão CNPJ.
- Cadastro mestre inicial da empresa.
- Mapeamento do processo atual.
- Catálogo preliminar de serviços.
- Regras comerciais iniciais.
- Tipos de evento e exceções.
- Catálogo preliminar de cláusulas.
- Princípios de arquitetura multiempresa.
- Dicionário inicial de dados do MVP.
- Fundamentos de marca.
- Primeiro levantamento físico de equipamentos.

## Em andamento — Gate 1

1. Concluir inventário físico com Edevaldo.
2. Reconciliar o total e os tipos de caixas.
3. Fotografar etiquetas de marcas/modelos duvidosos.
4. Informar condição, propriedade e disponibilidade de cada ativo.
5. Reconciliar equipamentos históricos ausentes da lista atual.
6. Receber fotos de eventos com autoria e autorização.
7. Confirmar se `equipesom.com.br` foi registrado.
8. Definir as caixas de e-mail pessoais e o destino de `contato@`.
9. Consultar contabilidade sobre nome fantasia, telefone e impostos.
10. Definir sinal, cancelamento, remarcação e clima.

## Entregável produzido — Modelo de Dados e Fluxos v0.2

O arquivo `08_MODELO_DE_DADOS_E_FLUXOS_v0.2.md` foi produzido em 22/08/2026 e aprovado por Camila em 25/08/2026 exclusivamente como modelo conceitual. O documento detalha:

- entidades e relacionamentos;
- campos obrigatórios e opcionais;
- status e transições;
- isolamento multiempresa;
- usuários, vínculos, papéis e permissões;
- proposta e versões;
- modelos e versões;
- catálogo e itens da proposta;
- regras de preço e exceções;
- cláusulas e versões;
- assinatura, aceite e evidências;
- contrato e ordem de serviço;
- anexos e auditoria;
- fluxo de criação pelo celular;
- fluxo específico para cliente público.

Critério de saída conceitual: Camila aprova as separações, os princípios e os requisitos confirmados que orientarão a comparação da fundação técnica.

O critério de saída conceitual foi cumprido pela aprovação de Camila em 25/08/2026. A aprovação não encerra o Gate 1, não resolve hipóteses ou estados pendentes e não aprova fornecedor, esquema físico definitivo, textos jurídicos, tratamento contábil ou tributário, disponibilidade de equipamentos ou migração/oficialização de dados do `localStorage`.

## Validação operacional local da proposta EQ-2026-0001 — aprovada por Camila em 16/09/2026

Camila confirmou explicitamente nesta conversa a aprovação da validação operacional local da proposta `EQ-2026-0001`. Essa confirmação encerra o marco de validação para a condução do projeto. O Codex verificou regras e fluxos por testes automatizados com dados sintéticos, mas não inspecionou o PDF real nem conferiu seus dados comerciais. A aprovação não comprova disponibilidade de equipamentos nem representa assinatura, envio ou aceite pelo Codex; assinatura e envio continuam sob responsabilidade de Edevaldo.

O roteiro operacional que orientou esse marco permanece registrado abaixo:

1. Camila preenche cliente, evento, escopo, valores e condições da proposta real pela rota **Nova proposta**.
2. Camila e Edevaldo conferem o conteúdo e escolhem uma das duas direções de cor disponíveis.
3. A ação explícita **Emitir proposta** atribui número, data e versão, congela o tema, registra auditoria e torna a versão imutável.
4. A versão emitida é salva em PDF pela impressão nativa e conferida antes do envio externo, que continua sob responsabilidade de Edevaldo.
5. Depois desta validação operacional, a prova local Supabase pode ser retomada para executar as 27 asserções pgTAP e gerar a exportação SQL somente se todas passarem.

## Prova multiempresa Supabase somente local — concluída em 16/09/2026

WSL2, Docker Linux e Supabase CLI `2.116.0` foram confirmados. A migração `20260902193000_access_foundation_probe.sql` foi aplicada no PostgreSQL local, e as 27 asserções pgTAP passaram (`Result: PASS`). O teste usou dois tenants e dois usuários fictícios em `BEGIN`/`ROLLBACK`; a consulta posterior encontrou zero registros desses tenants e usuários. Somente após esse resultado foi gerada a exportação de esquema `app-equipesom/supabase/exports/access-foundation.sql`, sem linhas de dados. A prova não escolhe a arquitetura definitiva, não valida PDF real, não conecta o frontend e não cria tenant operacional ou projeto externo. O relatório técnico v0.1 permanece como registro histórico do bloqueio anterior; esta atualização documenta sua superação.

## Retomada do backend local — primeira fatia concluída em 16/09/2026

Camila definiu que administrará pessoalmente chaves, autorizações e trocas de acesso; quer o backend como prioridade antes de investir em hospedagem AWS; e admite dados reais na futura homologação, ainda em fases de teste. As decisões estão em `02_REGISTRO_DE_DECISOES.md` (DEC-040–042). A especificação `12_ESPECIFICACAO_DE_AMBIENTES_v0.2.md` sucede a v0.1, que foi preservada; ela condiciona qualquer lote real de homologação a isolamento, acesso individual, backup/restauração e aprovação concreta de Camila. Não há transferência de dados agora.

No Supabase exclusivamente local, a migração `20260916160000_proposal_backend_foundation.sql` acrescentou proposta, rascunho e versão como entidades distintas, políticas por `tenant_id` e gatilho de imutabilidade de versão. A suíte completa passou com **46 asserções pgTAP** (27 da fundação anterior e 19 da nova fatia), todas com dados fictícios e `ROLLBACK`; a consulta posterior encontrou zero registros fictícios persistidos. Não há login funcional, emissão transacional, API de negócio conectada ao site, projeto externo ou migração do `localStorage`. Essa é uma entrega parcial de backend, não a conclusão do backend.

## B1 — Supabase Auth e contexto de acesso local testados em 16/09/2026

Camila confirmou Supabase Auth somente como implementação local inicial (DEC-043). A migração `20260916170000_local_auth_context.sql` fornece o contexto de pessoa e vínculos ativos a partir da sessão. O comando opt-in `npm run verify:local-auth` autenticou três identidades fictícias no serviço local e comprovou isolamento, negação sem vínculo, suspensão e revogação; os IDs de teste foram removidos. A suíte pgTAP completa passou com **56 asserções** e `ROLLBACK`; a consulta posterior encontrou zero usuários, tenants, vínculos, probes e revogações fictícios persistidos. Evidências e limites constam em `13_PROVA_B1_AUTH_LOCAL_v0.1.md`. A tela `/login` ainda é visual e o protótipo do navegador permanece inalterado.

## B2 — emissão transacional somente local testada em 16/09/2026

As migrações `20260916180000_b2_local_issuance_probe.sql` e `20260916183000_b2_snapshot_integrity.sql` acrescentaram prefixo/fuso configurados por tenant, contador anual transacional, número e fotografia financeira com fuso preservado na versão imutável e auditoria de emissão. A função de teste exige sessão e vínculo ativos e um portão por tenant **fechado por padrão**; esse portão não representa permissão operacional. A suíte completa passou com **90 asserções pgTAP** (34 novas de B2), usando dados fictícios e `ROLLBACK`. Duas alocações concorrentes no contador fictício receberam números 1 e 2, e sua massa temporária foi removida. Uma falha tardia na emissão reverteu contador e versão. Detalhes e limites estão em `14_PROVA_B2_EMISSAO_LOCAL_v0.1.md`.

## Próximo passo imediato — completar os critérios restantes do gate B3

A integração controlada do login e da leitura B3 foi comprovada com identidades fictícias, e Camila encerrou a validação manual do login em 30/09/2026 com limpeza verificável. Antes de declarar o gate B3 concluído, ainda é necessário decidir e registrar: teste do fluxo relevante em celular; regressão do PDF existente; e plano de migração opt-in, explícito, controlado e reversível. Até lá, preservar o `localStorage` e manter a emissão B2 operacional desabilitada. Depois do fechamento formal de B3, Camila poderá decidir quem cria, revisa e emite, e como a autorização de desconto por Edevaldo será registrada e invalidada após alterações. Homologação (H1), produção (P1), SMTP autenticado e infraestrutura externa continuam gates separados.

## Emissão comercial local implementada em 04/09/2026

- o documento comercial deixou de imprimir a identificação **PRÉVIA — NÃO EMITIDA**;
- o preenchimento continua concluindo um rascunho editável, seguido por revisão explícita;
- somente a ação **Emitir proposta** cria a numeração anual no formato aprovado `EQ-AAAA-NNNN`;
- número, `issuedAt`, versão, tema visual e fotografia dos dados ficam vinculados à versão emitida;
- a emissão registra responsável, instante, número, versão, total e percentual de desconto em auditoria local;
- versões emitidas não podem ser editadas nem emitidas novamente;
- o PDF exibe número, versão, data de emissão e data final da validade e usa nome de arquivo comercial;
- assinatura do fornecedor, envio, aceite do cliente, contrato e disponibilidade permanecem separados;
- a sequência é local ao navegador e ainda não oferece coordenação transacional entre dispositivos.

## Requisitos confirmados com fase de implementação pendente

- propostas aceitas originarão acompanhamento financeiro;
- valor proposto, valor aceito, valor final executado, ajustes e pagamentos permanecerão separados;
- haverá relatório financeiro anual de apoio, sem caráter de declaração tributária;
- a proposta suportará pelo menos três cláusulas, mas os textos dependem de fonte e revisão jurídica.

## Evolução validável do protótipo em 26/08/2026

- textos livres configurados para o piloto são persistidos e apresentados em maiúsculas, com exclusões explícitas para e-mail, senha, URL, identificadores, códigos, números e datas;
- o Evento passou a exigir UF selecionada entre as 27 unidades federativas e a apresentar Cidade/UF; SC é somente o padrão inicial de novos rascunhos do piloto;
- o desconto da EQUIPESOM passou a usar percentual sobre `valor base + deslocamento`, guardando subtotal, percentual, valor calculado e total;
- o arredondamento em centavos é uma regra técnica desta validação do protótipo, sem aprovar uma regra financeira global do SaaS;
- a persistência local evoluiu para `v5`, mantendo as chaves `v1` a `v4`; descontos fixos antigos e totais históricos não são reinterpretados, e rascunhos antigos exigem percentual e UF antes de nova conclusão;
- campos monetários podem ficar vazios durante a digitação e normalizam zeros à esquerda, inclusive em conteúdo colado.

Essas evoluções continuam sendo validação de experiência. Elas não escolhem fornecedor, não aprovam esquema físico e não oficializam dados do `localStorage`.

## Prova técnica de PDF em 27/08/2026

- a prévia pode abrir a impressão nativa do Chrome ou Edge depois que a paginação estiver estabilizada;
- o navegador pode salvar as folhas A4 como PDF com texto selecionável, conforme sua implementação;
- todas as folhas são identificadas como **PRÉVIA — NÃO EMITIDA**;
- interface, controles, avisos internos e área de medição ficam fora da impressão;
- a ação não cria emissão, número oficial, versão imutável, `issuedAt`, assinatura, aceite, arquivo oficial ou gravação persistente;
- PDF oficial continua dependente da fundação, do fluxo transacional de emissão e do armazenamento de objetos ainda não escolhidos.

### Correção de consistência móvel em 29/08/2026

- a medição e a impressão usam geometria física A4 fixa de 210 × 297 mm, sem depender da largura da tela;
- regras responsivas da interface não alteram grade, tipografia, espaçamento ou capacidade das folhas;
- no celular, a prévia A4 permanece inteira dentro de um contêiner com rolagem horizontal;
- carregamento de fonte, medição inválida e interrupção passam a terminar em erro controlado com nova tentativa, sem loading indefinido;
- a mesma proposta média foi verificada com duas páginas e geometria idêntica em 1920, 1366, 430, 390 e 360 px, nos dois temas;
- a correção continua restrita à prévia técnica e não altera emissão, dados persistidos ou escolha da futura fundação.

### Investigação específica do Safari/iOS em 01/09/2026

- o teste automatizado no Chromium continua produzindo duas folhas físicas para duas páginas lógicas nos dois temas, mas isso não valida o WebKit;
- Camila confirmou em teste real que o Verão Profissional ainda intercala duas páginas de conteúdo com duas folhas quase vazias no iPhone/Safari;
- a hipótese experimental de fragmentação do footer flexível não foi confirmada e a respectiva regra CSS foi revertida;
- a auditoria encontrou duas páginas imprimíveis e uma folha auxiliar de medição no DOM; a auxiliar está sob `display: none !important` em impressão, mas o modo de diagnóstico agora permite confirmar o estilo efetivo no iPhone;
- a ordem global é folha auxiliar, página real 1 e página real 2. A auxiliar e a página real 2 satisfazem `:last-child` porque pertencem a wrappers diferentes; no baseline, suas quebras calculadas são `auto`, enquanto somente a página real 1 recebe `page`/`always`;
- não existem wrappers, alturas, footers ou regras de quebra exclusivos do Verão; a diferença estrutural relevante ainda não isolada está nos pseudo-elementos superiores de 9 mm e nos detalhes visuais do tema;
- `?printDebug=1` expõe geometria, ordem DOM, `:last-child` e estilos copiáveis sem persistência;
- os PDFs baseline e C medidos por Camila confirmaram uma área física A4 de 1191 × 1684 px, área usada pelo Safari de 1030 × 1411 px e folha lógica ajustada em 1030 × 1459 px; os 48 px excedentes formavam as folhas residuais;
- quebras, `:last-child` e pseudo-elementos foram descartados como causa principal porque os dois temas e a última página com quebra `auto` apresentaram a mesma continuação;
- iOS/WebKit agora recebe somente em impressão um canvas externo de 218 mm, calculado a partir do mínimo aproximado de 216,6 mm; o contêiner e as folhas permanecem em 209,8 mm e a altura lógica em 296,8 mm;
- Chromium normal manteve duas páginas, canvas e folhas de 209,8 mm; com user agent iOS, somente canvas/documento passaram a 218 mm, as folhas e o medidor permaneceram inalterados e o PDF de controle continuou com duas páginas;
- o diagnóstico informa atributo de plataforma e retângulos de viewport, documento, contêiner e folhas;
- em 01/09/2026, Camila validou a correção no localhost e no iPhone/Safari: duas páginas lógicas passaram a gerar duas páginas físicas, sem as faixas residuais; o marco técnico da prévia PDF foi encerrado.

### Fundação de acesso e separação multiempresa — evolução em 02/09/2026

- criado `09_FUNDACAO_DE_ACESSO_E_TENANCY_v0.1.md` como preparação da próxima etapa;
- plataforma, tenant, usuário, vínculo, papel e sessão permanecem conceitos separados;
- EQUIPESOM será o primeiro tenant; Camila será uma identidade vinculada a ele, não o próprio tenant;
- a primeira fatia deverá proteger as rotas atuais e carregar o tenant a partir da sessão e do vínculo autorizado;
- a administração interna da plataforma não será misturada ao painel do cliente nem protegida apenas por menu oculto;
- Supabase foi confirmado somente para uma prova descartável; a CLI `2.116.0` foi adicionada como dependência de desenvolvimento, sem SDK de autenticação no frontend;
- criado `10_MATRIZ_DE_AVALIACAO_DA_FUNDACAO_v0.1.md` com comparação preliminar de Supabase, Firebase e AWS composta, baseada em fontes oficiais consultadas em 02/09/2026;
- Supabase deixou de ser apenas candidato da prova após confirmação explícita de Camila; a tecnologia definitiva, orçamento e produção não foram escolhidos;
- `sa-east-1` foi registrada como região pretendida de eventual ambiente hospedado, sem criação de projeto, contratação, DNS ou publicação;
- uma migração local modela identidade, tenant, papel, vínculo, convite, ativação comercial, sessão, auditoria e uma tabela mínima protegida por RLS;
- foram preparados 27 testes com dois tenants e dois usuários fictícios, mas a execução PostgreSQL e a exportação estão bloqueadas porque a virtualização necessária ao Docker Linux não está ativa;
- a especificação vigente é `09_FUNDACAO_DE_ACESSO_E_TENANCY_v0.4.md`, e o resultado parcial está em `11_RELATORIO_DA_PROVA_TECNICA_SUPABASE_v0.1.md`.

### Interface pública Console Group e separação de builds em 02/09/2026

- Console Group foi confirmada por Camila como identidade da plataforma; EQUIPESOM continua como primeiro tenant e não aparece como dona do login;
- as duas logos fornecidas foram incorporadas como ativos locais, sem dependência de endereço temporário ou serviço externo;
- criada a rota pública `/login`, com e-mail individual, senha, recuperação visual, indicação do ambiente e explicação de que a empresa é carregada pelo vínculo autorizado;
- o formulário não cria sessão fictícia: entrada e recuperação informam que a fundação real ainda depende da escolha do fornecedor;
- o build local mantém acesso explícito ao protótipo demonstrativo; homologação e produção redirecionam as rotas de negócio para `/login` e não oferecem o atalho local;
- a barreira atual é somente preventiva e compilada no frontend; isolamento real continua exigindo sessão, vínculo, autorização no servidor e políticas no banco;
- a especificação vigente passa a ser `09_FUNDACAO_DE_ACESSO_E_TENANCY_v0.2.md`; a v0.1 foi preservada integralmente.

### Hostname e caminhos de criação de acesso definidos em 02/09/2026

- Camila definiu `app.consolegroup.com.br` como hostname pretendido da entrada da plataforma; propriedade, DNS, certificado e publicação ainda não foram comprovados;
- o acesso poderá nascer por convite individual enviado a um e-mail previamente liberado pela administração ou por cadastro direto iniciado em **Criar conta**;
- no convite, a pessoa cria a própria senha pelo link recebido; o token deverá ser individual, expirável, revogável e de uso único;
- no cadastro direto, a identidade pode ser criada, mas o uso e o vínculo ativo dependem de contratação/pagamento válidos;
- clientes captados diretamente pela Console Group poderão receber convite sem que o produto presuma uma compra automática pelo site;
- criada a rota visual `/criar-conta`, sem envio de dados, criação real de identidade, pagamento ou sessão;
- provedor de cobrança, planos, preços, período de teste, inadimplência, cancelamento, reembolso e momento da ativação permanecem decisões pendentes;
- a v0.3 preserva esta decisão; a especificação vigente da prova passa a ser `09_FUNDACAO_DE_ACESSO_E_TENANCY_v0.4.md`, sem substituir as versões anteriores.

## Depois do Modelo de Dados

### UX e protótipo

- mapa de telas;
- formulário guiado;
- protótipo navegável para celular;
- dois modelos de proposta;
- teste com eventos reais.

### Identidade da EQUIPESOM

- briefing visual;
- três direções de marca;
- logotipo e variações;
- paleta e fontes;
- sistema de fotografia;
- assinatura de e-mail;
- modelo de proposta compacto e institucional.

### Construção do MVP

- autenticação e isolamento de empresa;
- cadastros;
- catálogo;
- propostas e versões;
- geração de PDF;
- histórico e auditoria;
- testes de uso no celular;
- piloto com EQUIPESOM.

### Expansões

- aceite eletrônico;
- contratos;
- assinatura integrada;
- ordem de serviço e checklists;
- agenda e disponibilidade;
- financeiro;
- múltiplos perfis visíveis;
- personalização para outras empresas;
- indicadores de conversão e rentabilidade.

## Regra de início da programação

Não iniciar a construção completa apenas porque já existe uma lista de telas. Programação deve começar quando o modelo de dados, o fluxo principal, o escopo do MVP e os critérios de aceite estiverem aprovados. Provas técnicas pequenas podem ser feitas antes, desde que não sejam confundidas com a arquitetura definitiva.
