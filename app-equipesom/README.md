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
- `src/services`: persistência provisória e consulta combinada de propostas, sem chamadas ao `localStorage` nos componentes;
- `src/pages`: páginas ligadas às rotas;
- `src/styles`: estilos próprios, tokens visuais e responsividade.

O rascunho ativo, a etapa atual e as propostas locais são salvos somente neste navegador pela chave versionada `equipesom:tenant-equipesom-demo:prototype:v4`. Dados anteriores das chaves `v1`, `v2` e `v3` são normalizados para o formato atual sem apagar as chaves originais. É possível iniciar uma proposta limpa pela própria interface.

Cada proposta concluída recebe uma versão separada com uma fotografia dos dados preenchidos. A rota `/propostas/:proposalId` permite consultar a versão. Rascunhos locais com fotografia completa podem ser retomados em `/propostas/:proposalId/editar`; ao salvar, o mesmo identificador e a mesma versão são atualizados. Propostas enviadas ou aceitas, conteúdos demonstrativos e registros antigos incompletos continuam somente para consulta.

A fotografia da proposta separa emissor, contratante e nome de quem elaborou. Novas propostas copiam o perfil da empresa vinculado ao tenant; por isso, mudanças futuras no cadastro não alteram silenciosamente o cabeçalho já salvo. Na migração para `v4`, somente rascunhos locais completos e ainda não emitidos recebem a fotografia atual da EQUIPESOM. Versões enviadas, aceitas ou demonstrativas sem essa informação continuam indicando que o emissor histórico não está disponível.

O campo de elaboração guarda o nome digitado, sem vinculá-lo a assinatura, emissão, aceite ou autenticação. A associação futura com usuários permanece uma decisão posterior do produto.

## Interface interna e futuro documento

A tela de detalhes atual é uma interface interna de consulta e edição de rascunhos. Ela não representa o layout definitivo da proposta comercial. Fonte, paleta, capa, imagens e composição do PDF ainda serão validadas em um modelo visual separado.

A futura prévia e o PDF deverão compartilhar o mesmo mecanismo de renderização documental, independente dos componentes desta interface. Assim, alterações no CSS da aplicação interna não poderão modificar documentos históricos já emitidos. “Investimento” permanece uma recomendação para o título dos valores na prévia e no documento, sujeita à aprovação de Camila durante a criação do modelo visual.

As regras comerciais exibidas no protótipo são sugestões configuráveis. Condições jurídicas, tributárias, disponibilidade de equipamentos e aceite eletrônico continuam fora desta etapa.
