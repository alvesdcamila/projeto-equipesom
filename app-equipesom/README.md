# Protótipo EQUIPESOM

Experiência navegável, responsiva e mobile-first do sistema de propostas da EQUIPESOM. O modo padrão continua usando dados simulados e armazenamento local provisório; a prova B3 acrescenta, somente por opt-in local, login Supabase e leitura autorizada de propostas fictícias. Não há emissão B2 operacional, SMTP, assinatura eletrônica nem geração definitiva de PDF.

## Requisitos

- Node.js 20.19 ou superior (ou Node.js 22.12+)
- npm

## Instalação

Na pasta `app-equipesom`, execute:

```bash
npm install
```

## Iniciar o protótipo

```bash
npm run dev
```

Abra no navegador a URL exibida pelo Vite. Para testar no celular conectado à mesma rede, use `npm run dev -- --host` e abra o endereço de rede informado.

### Prova B3 local (opt-in)

Com a stack Supabase local ativa, `npm run dev:b3` inicia uma porta de desenvolvimento separada e habilita o login com contas fictícias e a rota `/acesso-local/propostas`. A sessão fica apenas na memória desta aba; o protótipo em `/propostas`, o `localStorage` e a emissão atual do navegador não são alterados. A tela B3 é somente leitura e não cria, edita, emite ou envia propostas. Nenhuma conta ou proposta fictícia é criada pelo servidor de desenvolvimento; a massa descartável da validação é criada e removida apenas por `npm run verify:b3-readonly`.

Depois que a prova automatizada B3 passar, uma validação manual controlada pode ser preparada com `npm run prepare:b3-manual`. O comando aceita somente a stack local, cria uma conta `example.invalid`, um tenant e uma proposta fictícios, grava as credenciais temporárias em `tmp/b3-manual-access.json` com acesso restrito ao usuário local e informa a URL `http://127.0.0.1:5174/login`. Depois da conferência, `npm run cleanup:b3-manual` remove a conta e todos os registros pelos IDs registrados, comprova zero remanescentes e apaga o arquivo temporário. O acesso não habilita B2, não lê `localStorage` e não usa SMTP ou recursos externos.

## Verificações

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run verify:prototype
npm run verify:access-foundation:static
npm run verify:b3-readonly
npm run test:smtp-proof
```

## Prova SMTP isolada

A primeira fase da prova SMTP fica em `server/smtp` e não é importada pelo frontend React/Vite. Ela usa Nodemailer somente no processo Node e compõe uma mensagem fictícia com `streamTransport`, inteiramente em memória e sem abrir conexão de rede.

```bash
npm run test:smtp-proof
```

Os parâmetros não secretos confirmados para a prova são `mail.consolegroup.com.br`, porta `465`, SSL/TLS e o usuário/remetente `propostas@consolegroup.com.br`. O arquivo `server/smtp/.env.example` contém apenas um marcador de senha fictício e mantém todas as variáveis sem o prefixo `VITE_`.

Existe também o comando opt-in `npm run verify:smtp-connection`, preparado para executar somente `transporter.verify()`: ele valida DNS, conexão TLS e autenticação sem enviar mensagem. O comando não faz parte das verificações automáticas e permanece bloqueado até existir o arquivo local ignorado `server/smtp/.env`, uma credencial configurada diretamente pela responsável e a confirmação exata `SMTP_VERIFY_CONNECTION=CONFIRMAR_SEM_ENVIO`. A senha não deve ser informada ao Codex, registrada no repositório ou exibida em logs.

Esta fase não lê propostas, `localStorage`, PDF ou dados de clientes; não altera status, auditoria de negócio, Supabase, DNS ou interface. O envio real dependerá de autorização própria e de uma fundação server-side autenticada com versão emitida, destinatário e arquivo vinculados ao mesmo `tenant_id`.

## Organização

- `src/config`: dados da empresa e padrões configuráveis, separados das regras globais;
- `src/data`: propostas demonstrativas, serviços e catálogo preliminar extraído do inventário;
- `src/types`: conceitos de domínio, incluindo proposta e versão da proposta;
- `src/components`: estrutura e componentes reutilizáveis;
- `src/features/proposals`: fluxo guiado da nova proposta;
- `src/features/proposal-document`: dados de apresentação, blocos, temas e composição isolada da prévia documental;
- `src/services`: persistência provisória e consulta combinada de propostas, sem chamadas ao `localStorage` nos componentes;
- `src/pages`: páginas ligadas às rotas;
- `src/styles`: estilos próprios, tokens visuais e responsividade.

## Próxima etapa: fundação de acesso

Após a validação da prévia PDF no Safari/iPhone, a próxima etapa foi iniciada pela separação entre plataforma, empresa cliente, usuário, vínculo, papel e sessão. EQUIPESOM será o primeiro tenant e Camila uma identidade vinculada a ele. Os requisitos, gates e testes eliminatórios estão registrados em `../Pacote_Continuidade_EQUIPESOM_v0.1/09_FUNDACAO_DE_ACESSO_E_TENANCY_v0.1.md`.

A comparação preliminar de Supabase, Firebase e AWS composta está em `../Pacote_Continuidade_EQUIPESOM_v0.1/10_MATRIZ_DE_AVALIACAO_DA_FUNDACAO_v0.1.md`. Em 02/09/2026, Camila confirmou Supabase somente para uma prova descartável e `sa-east-1` como região pretendida para eventual réplica hospedada. A decisão não escolhe a arquitetura definitiva de produção.

A rota `/login` já apresenta a identidade pública Console Group e mantém EQUIPESOM como empresa cliente. O formulário é somente uma interface de validação: não cria sessão, não valida credenciais e não promove dados locais. O build identifica `VITE_APP_ENV` como `local`, `homologation` ou `production`. Em `local`, existe um atalho explícito para o protótipo demonstrativo; em homologação e produção, as rotas de negócio redirecionam ao login até que a sessão real seja implementada. Essa barreira de frontend não substitui autorização no servidor ou no banco.

O hostname pretendido foi definido como `app.consolegroup.com.br`; propriedade, DNS, certificado e publicação ainda não foram verificados. A rota visual `/criar-conta` representa o cadastro direto, mas não envia dados. A identidade criada por esse caminho somente poderá receber vínculo e utilizar a plataforma após contratação/pagamento válidos. O segundo caminho será um convite individual: a administração libera o e-mail e a pessoa recebe um link para criar a própria senha. Convites reais, cobrança e ativação ainda dependem das decisões da fundação.

A especificação vigente está em `../Pacote_Continuidade_EQUIPESOM_v0.1/09_FUNDACAO_DE_ACESSO_E_TENANCY_v0.4.md`; as versões 0.1, 0.2 e 0.3 foram preservadas.

### Prova técnica Supabase

A CLI oficial do Supabase foi adicionada como dependência de desenvolvimento, sem SDK no frontend. A pasta `supabase/` contém configuração local, migração versionada, seed vazio e 27 asserções pgTAP com exatamente dois tenants e dois usuários fictícios. O cadastro direto, a ativação comercial e o convite são entidades independentes; as políticas RLS exigem sessão, identidade, tenant e vínculo ativos.

```bash
npm run verify:access-foundation:static
npm run start:access-foundation
npm run test:access-foundation
npm run export:access-foundation
```

A checagem estática está disponível, mas não substitui PostgreSQL. Em 02/09/2026, o Docker Linux não iniciou porque a virtualização do Windows não estava ativa; por isso, migração, pgTAP e exportação continuam pendentes. Nenhum projeto externo foi criado. O relatório verificável está em `../Pacote_Continuidade_EQUIPESOM_v0.1/11_RELATORIO_DA_PROVA_TECNICA_SUPABASE_v0.1.md`.

O rascunho ativo, a etapa atual e as propostas locais são salvos somente neste navegador pela chave versionada `equipesom:tenant-equipesom-demo:prototype:v6`. Dados anteriores das chaves `v1` a `v5` são normalizados para o formato atual sem apagar as chaves originais. É possível iniciar uma proposta limpa pela própria interface.

No piloto atual, os textos livres configurados são normalizados em maiúsculas durante a edição e antes da persistência. E-mail, senha, URL, identificadores técnicos, códigos internos, números e datas permanecem fora dessa regra. O Evento exige uma UF selecionada entre as 27 unidades federativas; novos rascunhos começam em SC somente como conveniência do piloto, enquanto rascunhos antigos sem UF permanecem pendentes.

O desconto da EQUIPESOM é percentual sobre o subtotal formado por valor base e deslocamento. A fotografia atual guarda subtotal, percentual, valor monetário calculado e total, com arredondamento técnico em centavos. O intervalo aceito pelo protótipo é de 0% a 100%. Descontos fixos diferentes de zero encontrados nos formatos anteriores são preservados com seu total original e exigem uma nova definição percentual quando o rascunho é editado; não são reinterpretados silenciosamente.

Os campos monetários permitem conteúdo vazio durante a digitação, voltam a zero ao perder o foco se continuarem vazios e removem zeros à esquerda tanto na digitação quanto na colagem.

Cada proposta concluída recebe uma versão separada com uma fotografia dos dados preenchidos. A rota `/propostas/:proposalId` permite consultar a versão. Rascunhos locais com fotografia completa podem ser retomados em `/propostas/:proposalId/editar`; ao salvar, o mesmo identificador e a mesma versão são atualizados. Propostas enviadas ou aceitas, conteúdos demonstrativos e registros antigos incompletos continuam somente para consulta.

A fotografia da proposta separa emissor, contratante e nome de quem elaborou. Novas propostas copiam o perfil da empresa vinculado ao tenant; por isso, mudanças futuras no cadastro não alteram silenciosamente o cabeçalho já salvo. Na migração para `v4`, somente rascunhos locais completos e ainda não emitidos recebem a fotografia atual da EQUIPESOM. Versões enviadas, aceitas ou demonstrativas sem essa informação continuam indicando que o emissor histórico não está disponível.

## Documento comercial e emissão local

Rascunhos locais com fotografia completa oferecem a ação **Revisar e emitir** na página de detalhes. A rota `/propostas/:proposalId/previa` mantém o endereço técnico anterior por compatibilidade e permite comparar duas direções de cor sobre os mesmos dados: **Técnico Litorâneo** e **Verão Profissional**. Nenhuma é apresentada como recomendada; Técnico Litorâneo aparece apenas como seleção inicial da interface.

Source Sans 3 é a única fonte da plataforma e das propostas nesta fase. A família variável é incorporada localmente pelo pacote oficial `@fontsource-variable/source-sans-3`, somente com o subconjunto latino necessário e sem CDN. A escolha de cor permanece transitória enquanto o documento é revisado e é congelada na versão no momento da emissão.

O documento usa folhas com geometria física fixa de 210 × 297 mm e estilos próprios de impressão. Título, emissor, contratante, evento, equipamentos, serviços, investimento, condições, elaboração e data seguem uma única ordem documental. Se a altura medida couber na área útil, toda a proposta ocupa uma folha; novas folhas são criadas somente quando o conteúdo excede o espaço disponível. Páginas seguintes recebem um cabeçalho compacto de continuação, e o rodapé usa a marca da fotografia do emissor, o número oficial, a versão e o total real de páginas depois da emissão.

A distribuição é calculada no navegador depois que Source Sans 3 fica disponível. Um módulo puro recebe as alturas reais dos blocos e as capacidades da primeira folha e das continuações, preservando a ordem e mantendo títulos com o primeiro item e blocos comerciais juntos sempre que couberem. A medição usa sempre a folha A4 real e não observa a largura do viewport; por isso, breakpoints da interface e larguras de celular não alteram a quantidade de páginas, a tipografia ou a posição dos blocos. No celular, a interface continua responsiva e o documento A4 fica dentro de uma área com rolagem horizontal, sem ser transformado em uma folha de 360–430 px. Mudança de direção de cor ou nova tentativa explícita dispara nova medição.

O estado visual informa quando a paginação está estabilizada. O cálculo possui limite para o carregamento da fonte e termina em estado de erro controlado se a estrutura A4 não puder ser medida; nesse caso, a tela libera a ação **Tentar paginação novamente** em vez de manter “Calculando paginação...” indefinidamente. A ação **Emitir proposta** só é habilitada depois dessa estabilização.

Ao emitir, o protótipo local atribui a próxima sequência anual no formato `EQ-AAAA-NNNN`, grava o instante de emissão, congela a direção de cor, marca os valores fotografados como finais para aquela versão e registra um evento de auditoria com responsável, total e desconto. A proposta passa ao status **Emitida** e deixa de aceitar edição. A numeração é segura apenas para o uso atual em um navegador; coordenação entre dispositivos dependerá da fundação transacional no banco.

Depois da emissão, a página oferece **Imprimir ou salvar PDF**. A ação usa a impressão nativa do navegador, sem biblioteca adicional. No computador, use Chrome ou Edge, escolha **Salvar como PDF**, papel **A4**, escala **100%** e desative cabeçalhos e rodapés. Esse caminho mantém texto vetorial e alta nitidez em diferentes ampliações. O navegador controla o nome final, enquanto a aplicação sugere temporariamente `PROPOSTA-EQUIPESOM-EQ-AAAA-NNNN-CLIENTE-AAAA-MM-DD.pdf` e restaura o título original ao fechar a impressão.

As informações de conferência do inventário — como “modelo não informado”, “confirmar”, “presumido” e o estado interno do dado — permanecem preservadas no cadastro e na revisão interna, mas não são publicadas na prévia nem no documento emitido. A descrição comercial usa somente os trechos aproveitáveis de marca, modelo e especificação.

Na impressão, aparecem somente as folhas A4 da proposta, com cores, fonte local, conteúdo, identificação oficial, rodapés e total real de páginas. Cabeçalho e navegação da plataforma, controles de cor, botão, avisos internos, estado de paginação e área de medição ficam ocultos. Nenhuma folha exibe marca de prévia.

### Correção validada de impressão no Safari/iOS

Os PDFs medidos no iPhone/Safari confirmaram que o navegador reserva espaço para URL, data, hora e numeração e reduz a área vertical disponível. A folha lógica de `209,8 × 296,8 mm`, ajustada pela largura, ficava aproximadamente 48 px mais alta que o fragmentainer e gerava uma continuação residual depois de cada página. O comportamento ocorreu nos dois temas e também após a última página, descartando quebras e pseudo-elementos como causa principal.

O componente identifica transitoriamente iOS com AppleWebKit, incluindo iPad com user agent de desktop, e marca somente a apresentação com `data-print-platform="ios-webkit"`. Em `@media print`, viewport e documento externos passam a `218 mm`; o contêiner de páginas permanece centralizado com `209,8 mm`, e cada página conserva `209,8 × 296,8 mm`. A compensação força um shrink-to-fit uniforme sem reduzir a altura lógica ou mudar a capacidade calculada. Plataforma e geometria de impressão não são persistidas.

Em 01/09/2026, Camila validou novamente a prévia no localhost e no Safari/iPhone: as duas páginas lógicas passaram a resultar em duas páginas físicas, sem as folhas residuais intercaladas. Esse resultado encerra a investigação como marco técnico da prévia. O diagnóstico por query string permanece disponível somente como ferramenta de suporte e regressão; ele não integra o fluxo normal do produto.

Acrescente `?printDebug=1` à rota da prévia para abrir um painel copiável de diagnóstico. Exemplo: `/propostas/ID/previa?printDebug=1`. O painel informa navegador, viewport, ordem das folhas no DOM, correspondência com `:last-child`, contagem de páginas imprimíveis e da folha auxiliar de medição, dimensões, quebras e estilos calculados das folhas, wrappers, footer e pseudo-elementos. Ele tenta capturar os estados de tela, `beforeprint`, mídia de impressão e `afterprint`, não aparece no PDF e não grava nada no `localStorage`.

O teste C usa `/propostas/ID/previa?printDebug=1&printTest=C` e muda somente as quebras para `auto`. Ele foi útil para confirmar que a continuação também ocorria após uma página com `break-after: auto`, mas não é mais a correção principal.

O teste isolado B continua disponível em `/propostas/ID/previa?printDebug=1&printTest=B` e desativa apenas os pseudo-elementos do Verão. B e C permanecem mutuamente exclusivos como ferramentas históricas de diagnóstico; não devem ser combinados nem usados na validação principal da compensação iOS. A validação atual usa somente `/propostas/ID/previa?printDebug=1` e deve mostrar `printPlatform: "ios-webkit"` no iPhone.

Enquanto o rascunho é revisado, a tela mostra **Local e data do documento** com um instante transitório. Depois da emissão, o mesmo bloco passa a **Local e data de emissão** e usa exclusivamente o `issuedAt` persistido. A validade emitida mostra a quantidade de dias e a data final calculada.

Imprimir uma versão já emitida não altera fotografia, número, versão, status, data, tema ou auditoria. Propostas demonstrativas, registros incompletos e dados de outro tenant não podem abrir o documento comercial. Assinatura, envio, aceite, contrato e disponibilidade de equipamentos permanecem eventos ou controles distintos e não são fabricados pela geração do PDF.

Camila confirmou que o número oficial será exibido no formato `EQ-AAAA-NNNN`, por exemplo `EQ-2026-0001`. Rascunhos continuam sem número oficial e preservam seus identificadores locais; a numeração só é atribuída pela ação explícita de emissão.

## Controles do cabeçalho

Ajuda, Notificações e Perfil abrem painéis suspensos acessíveis; somente um permanece aberto por vez. Os painéis fecham pelo próprio controle, por `Escape` ou por clique fora, e restauram o foco quando o fechamento é feito pelo teclado. Ajuda oferece atalhos para criar e consultar propostas e abrir Configurações. Notificações mostra um estado vazio, sem indicador de conteúdo não lido. Perfil identifica Camila, o papel demonstrativo Administrador e a empresa EQUIPESOM, sem simular autenticação, logout ou dados pessoais adicionais.

O campo de elaboração guarda o nome digitado, sem vinculá-lo a assinatura, emissão, aceite ou autenticação. A associação futura com usuários permanece uma decisão posterior do produto.

## Interface interna e futuro documento

A tela de detalhes atual é uma interface interna de consulta e edição de rascunhos. Ela não representa o layout definitivo da proposta comercial. Fonte, paleta, capa, imagens e composição do PDF ainda serão validadas em um modelo visual separado.

A prévia experimental inaugura um mecanismo de renderização documental independente dos componentes da interface interna. Um futuro PDF poderá reaproveitar dados, blocos e tokens somente depois da validação visual; nenhuma das duas direções atuais constitui identidade aprovada. “Investimento” permanece uma recomendação para o título dos valores, sujeita à aprovação de Camila.

As regras comerciais exibidas no protótipo são sugestões configuráveis. Condições jurídicas, tributárias, disponibilidade de equipamentos e aceite eletrônico continuam fora desta etapa.
