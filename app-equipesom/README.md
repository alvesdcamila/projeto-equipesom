# Protótipo EQUIPESOM

Experiência navegável, responsiva e mobile-first do sistema de propostas da EQUIPESOM. Esta versão usa dados simulados e armazenamento local provisório; não possui banco de dados, autenticação, integrações, assinatura eletrônica nem geração definitiva de PDF.

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

## Verificações

```bash
npm run typecheck
npm run lint
npm run build
npm run verify:prototype
```

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

O rascunho ativo, a etapa atual e as propostas locais são salvos somente neste navegador pela chave versionada `equipesom:tenant-equipesom-demo:prototype:v4`. Dados anteriores das chaves `v1`, `v2` e `v3` são normalizados para o formato atual sem apagar as chaves originais. É possível iniciar uma proposta limpa pela própria interface.

Cada proposta concluída recebe uma versão separada com uma fotografia dos dados preenchidos. A rota `/propostas/:proposalId` permite consultar a versão. Rascunhos locais com fotografia completa podem ser retomados em `/propostas/:proposalId/editar`; ao salvar, o mesmo identificador e a mesma versão são atualizados. Propostas enviadas ou aceitas, conteúdos demonstrativos e registros antigos incompletos continuam somente para consulta.

A fotografia da proposta separa emissor, contratante e nome de quem elaborou. Novas propostas copiam o perfil da empresa vinculado ao tenant; por isso, mudanças futuras no cadastro não alteram silenciosamente o cabeçalho já salvo. Na migração para `v4`, somente rascunhos locais completos e ainda não emitidos recebem a fotografia atual da EQUIPESOM. Versões enviadas, aceitas ou demonstrativas sem essa informação continuam indicando que o emissor histórico não está disponível.

## Laboratório de prévia visual

Rascunhos locais com fotografia completa oferecem a ação **Ver prévia visual** na página de detalhes. A rota `/propostas/:proposalId/previa` permite comparar duas direções de cor sobre os mesmos dados: **Técnico Litorâneo** e **Verão Profissional**. Nenhuma é apresentada como recomendada; Técnico Litorâneo aparece apenas como seleção inicial da interface.

Source Sans 3 é a única fonte da plataforma e das propostas nesta fase. A família variável é incorporada localmente pelo pacote oficial `@fontsource-variable/source-sans-3`, somente com o subconjunto latino necessário e sem CDN. A escolha de cor existe apenas em memória e não altera o rascunho, a proposta, a versão ou o `localStorage`.

A prévia usa paginação adaptativa inspirada em folhas A4 e inclui estilos básicos de impressão. Título, emissor, contratante, evento, equipamentos, serviços, investimento, condições, elaboração e data seguem uma única ordem documental. Se a altura medida couber na área útil, toda a proposta ocupa uma folha; novas folhas são criadas somente quando o conteúdo excede o espaço disponível. Páginas seguintes recebem um cabeçalho compacto de continuação, e o rodapé usa a marca da fotografia do emissor, o texto **Proposta comercial** e o total real de páginas.

A distribuição é calculada no navegador depois que Source Sans 3 fica disponível. Um módulo puro recebe as alturas reais dos blocos e as capacidades da primeira folha e das continuações, preservando a ordem e mantendo títulos com o primeiro item e blocos comerciais juntos sempre que couberem. Mudanças de largura, impressão e direção de cor disparam nova medição. O estado visual informa quando a paginação está estabilizada; esse resultado ainda é uma preparação para o futuro PDF, não uma emissão.

Ao abrir a rota, o laboratório captura uma única vez a data da visualização e mostra **Local e data da prévia** depois das condições, usando cidade e UF da fotografia do emissor. Essa data é transitória: não representa emissão oficial, não preenche `issuedAt` e não é salva. Uma futura data de emissão deverá vir exclusivamente do instante persistido da versão emitida.

O laboratório não emite proposta, não gera PDF e não inclui número, assinatura, aceite ou disponibilidade de equipamentos. Propostas demonstrativas, versões enviadas ou aceitas, registros incompletos e dados de outro tenant não podem abrir a prévia.

Camila confirmou que o futuro número oficial será exibido no formato `EQ-AAAA-NNNN`, por exemplo `EQ-2026-0001`. A sequência automática e sua atribuição transacional ainda não estão implementadas: rascunhos continuam sem número oficial e preservam seus identificadores locais.

## Controles do cabeçalho

Ajuda, Notificações e Perfil abrem painéis suspensos acessíveis; somente um permanece aberto por vez. Os painéis fecham pelo próprio controle, por `Escape` ou por clique fora, e restauram o foco quando o fechamento é feito pelo teclado. Ajuda oferece atalhos para criar e consultar propostas e abrir Configurações. Notificações mostra um estado vazio, sem indicador de conteúdo não lido. Perfil identifica Camila, o papel demonstrativo Administrador e a empresa EQUIPESOM, sem simular autenticação, logout ou dados pessoais adicionais.

O campo de elaboração guarda o nome digitado, sem vinculá-lo a assinatura, emissão, aceite ou autenticação. A associação futura com usuários permanece uma decisão posterior do produto.

## Interface interna e futuro documento

A tela de detalhes atual é uma interface interna de consulta e edição de rascunhos. Ela não representa o layout definitivo da proposta comercial. Fonte, paleta, capa, imagens e composição do PDF ainda serão validadas em um modelo visual separado.

A prévia experimental inaugura um mecanismo de renderização documental independente dos componentes da interface interna. Um futuro PDF poderá reaproveitar dados, blocos e tokens somente depois da validação visual; nenhuma das duas direções atuais constitui identidade aprovada. “Investimento” permanece uma recomendação para o título dos valores, sujeita à aprovação de Camila.

As regras comerciais exibidas no protótipo são sugestões configuráveis. Condições jurídicas, tributárias, disponibilidade de equipamentos e aceite eletrônico continuam fora desta etapa.
