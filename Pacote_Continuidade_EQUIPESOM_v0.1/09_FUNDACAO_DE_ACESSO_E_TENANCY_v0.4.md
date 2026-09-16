# Fundação de acesso e separação multiempresa — v0.4

Atualizado em: 02/09/2026

Status: Supabase confirmado somente para prova descartável; esquema local e testes preparados; execução PostgreSQL e exportação SQL bloqueadas pela virtualização local

## 1. Objetivo

Preparar a primeira fatia vertical de autenticação do futuro SaaS sem confundir pessoa, empresa cliente e administração da plataforma. A EQUIPESOM será o primeiro tenant; Camila será uma identidade de usuário vinculada a ele. Console Group é a identidade da plataforma e da entrada pública no hostname definido por Camila: `app.consolegroup.com.br`.

A interface visual de login pode ser validada antes da prova, mas não concede sessão nem acesso. Em 02/09/2026, Camila confirmou Supabase somente como fornecedor da prova técnica e São Paulo (`sa-east-1`) como região pretendida para eventual réplica hospedada. A decisão não escolhe a arquitetura definitiva de produção, não autoriza cobrança, publicação, DNS, dados reais ou migração do `localStorage`.

## 2. Estado atual do protótipo

- O frontend usa React, Vite e React Router.
- Não existe sessão, rota pública de login, recuperação de acesso, logout nem proteção do `AppShell`.
- `CompanyProfile`, `Proposal` e fotografias do emissor já carregam `tenantId`.
- `pilotCompany` fixa o tenant demonstrativo `tenant-equipesom-demo` em tempo de código.
- O repositório de propostas filtra pelo tenant fixo do piloto.
- O armazenamento é local e usa chave versionada por tenant, mas o navegador continua sendo a única fronteira de dados.
- O painel de perfil mostra Camila e EQUIPESOM como conteúdo demonstrativo, sem identidade autenticada.
- Existe uma rota pública `/login` com identidade Console Group e formulário exclusivamente visual.
- Builds locais são identificados como `local` e podem abrir o protótipo demonstrativo; builds de homologação e produção bloqueiam as rotas atuais e redirecionam para `/login` enquanto não houver sessão real.
- Essa barreira compilada no frontend previne exposição acidental do protótipo, mas não constitui autorização de segurança.
- Existe uma rota pública visual `/criar-conta`. Ela não envia dados nem cria identidade real; a prova permanece isolada da interface e do armazenamento do navegador.

Conclusão: o protótipo já expressa intenção multiempresa nos dados, mas ainda não possui isolamento de segurança. Filtrar por `tenantId` no frontend não substitui autorização no servidor e no banco.

## 3. Conceitos que não podem ser fundidos

```text
Plataforma SaaS
├── administração interna da plataforma
└── empresas clientes (tenants)
    └── EQUIPESOM
        └── vínculos autorizados de pessoas
            ├── Camila
            └── futuros usuários com identidade própria
```

| Conceito | Responsabilidade | Não deve representar |
|---|---|---|
| Plataforma | opera o SaaS e administra clientes, suporte e configuração global | a empresa EQUIPESOM |
| Tenant | empresa cliente e fronteira dos dados de negócio | uma pessoa ou credencial |
| Usuário | identidade autenticável de uma pessoa | papel fixo ou empresa implícita |
| Vínculo | autoriza um usuário a atuar em um tenant com um papel e estado | senha ou sessão |
| Papel/permissão | limita ações dentro de um contexto autorizado | isolamento baseado apenas na interface |
| Sessão | comprova temporariamente a identidade autenticada | autorização automática para qualquer tenant |

## 4. Modelo mínimo independente de fornecedor

### Tenant

- `tenant_id`
- nome e estado da conta
- dados e configurações da empresa
- datas de criação, atualização e arquivamento

### User

- `user_id` interno da aplicação
- identificador da identidade no provedor de autenticação
- nome exibido
- estado da conta
- dados mínimos necessários; senha nunca pertence ao banco da aplicação

### Membership

- `membership_id`
- `user_id`
- `tenant_id`
- `role_id`
- estado: convite, ativo, suspenso ou encerrado, a validar fisicamente
- vigência e auditoria

### Role e Permission

O MVP pode apresentar somente um papel administrativo do tenant, conforme a decisão existente, mas o esquema não deve gravar “Administrador” diretamente no usuário. O papel pertence ao vínculo. Papéis reais adicionais, limites de desconto e acesso financeiro permanecem pendentes de validação.

Uma eventual permissão interna `platform_admin` pertence ao contexto da plataforma e não deve ser obtida por vínculo comum com a EQUIPESOM. O painel interno deverá usar rota e autorização próprias; esconder itens do menu não será considerado controle de acesso.

## 5. Fluxo mínimo de acesso

```text
Abrir aplicação
  → verificar sessão
  → sem sessão: mostrar /login
  → com sessão: localizar usuário interno
  → carregar vínculos ativos
  → selecionar explicitamente o tenant permitido
  → montar CurrentTenant e permissões
  → liberar o AppShell
```

Para o piloto com um único vínculo ativo, a seleção do tenant poderá ser automática. A estrutura continuará aceitando mais de um vínculo sem exigir agora uma tela de troca de empresa.

### 5.1 Criação de identidade e ativação de acesso

Foram definidos dois caminhos distintos:

1. **Convite:** a administração da plataforma libera um e-mail e envia um link individual para a pessoa criar a própria senha e concluir a identidade. O convite deverá ser de uso único, possuir expiração e ficar vinculado ao e-mail e ao tenant autorizados.
2. **Cadastro direto:** a pessoa inicia a conta pela ação **Criar conta** da tela de login. A criação da identidade não ativa automaticamente o uso nem concede acesso a dados. O tenant e o vínculo ativo dependem de contratação e pagamento válidos, conforme regras comerciais ainda não definidas.

Clientes captados diretamente pela Console Group poderão seguir o fluxo de convite. Usuários que chegarem pelo cadastro direto somente poderão utilizar a plataforma após a condição comercial aprovada. Provedor de cobrança, planos, preços, período de teste, inadimplência, cancelamento, reembolso, nota fiscal e momento exato da ativação permanecem pendentes; nada disso deve ser hardcoded antes da decisão.

Estados obrigatórios da interface:

- carregando sessão;
- não autenticado;
- autenticado sem vínculo ativo;
- autenticado com tenant ativo;
- sessão expirada ou revogada;
- acesso negado;
- recuperação de acesso;
- saída concluída.

## 6. Fronteiras de rotas propostas

| Área | Exemplo de rota | Regra |
|---|---|---|
| Pública | `/login`, `/criar-conta`, `/recuperar-acesso` | não exige sessão |
| Convite | futuro `/aceitar-convite` com token | exige convite válido, de uso único e vinculado ao e-mail/tenant |
| Cliente | rotas atuais sob o `AppShell` ou futuro prefixo `/app` | exige sessão e vínculo ativo no tenant |
| Administração da plataforma | futuro `/admin` | exige autorização interna independente do tenant |
| Prévia compartilhável | não definida | não deve nascer pública por suposição; exige decisão própria de token, validade e revogação |

Não é necessário alterar todas as URLs do protótipo na primeira fatia. A primeira implementação pode proteger as rotas atuais e adiar o prefixo `/app`, evitando uma migração cosmética antes da segurança real.

Estado implementado nesta versão: `/login` e `/criar-conta` existem como interfaces visuais; `/recuperar-acesso` e `/aceitar-convite` continuam pendentes. No build local, o protótipo permanece acessível para validação. Em homologação e produção, as rotas atuais retornam ao login até que o contrato de sessão real substitua a barreira temporária.

## 7. Contrato de aplicação esperado

A interface deverá depender de um contrato estável, e não diretamente do SDK escolhido:

```text
AuthSession
├── status
├── user
├── memberships
├── currentTenant
├── permissions
├── signIn
├── signUp
├── acceptInvite
├── signOut
└── recoverAccess
```

Repositórios de negócio receberão o contexto autenticado e nunca importarão `pilotCompany` para decidir autorização. O tenant enviado pelo navegador será tratado como escopo solicitado; o servidor e o banco deverão validá-lo contra o vínculo ativo.

## 8. Segurança e isolamento obrigatórios

1. Toda leitura e gravação de negócio valida usuário, vínculo ativo e `tenant_id` no servidor.
2. Políticas adicionais no banco devem bloquear acesso cruzado quando a tecnologia escolhida permitir.
3. Chaves de arquivos e URLs não concedem acesso por si mesmas.
4. Tokens, senhas e segredos não ficam no repositório nem no `localStorage` da aplicação.
5. Sessões são revogáveis e possuem expiração controlada.
6. Recuperação de acesso não revela se um e-mail pertence à plataforma além do necessário.
7. Logs não registram senha, token ou conteúdo sensível desnecessário.
8. Trocas de vínculo, papel e tenant ativo são auditáveis.
9. Dados demonstrativos permanecem separados de produção.
10. Nenhuma política depende apenas de menu oculto, rota escondida ou filtro no frontend.
11. Convites usam token aleatório, expiração, uso único, revogação e auditoria; o token não deve ser gravado em texto puro nos logs.
12. Criar identidade por cadastro direto não cria vínculo ativo nem libera tenant sem condição comercial válida.

## 9. Testes eliminatórios da fundação

- Usuário sem sessão não abre uma rota do `AppShell`.
- Usuário autenticado sem vínculo não acessa dados da EQUIPESOM.
- Um tenant não lê, altera, enumera ou baixa arquivos de outro tenant.
- Alterar `tenant_id` na URL ou requisição não amplia o acesso.
- Papel sem permissão recebe negação no servidor, mesmo chamando a API diretamente.
- Sessão revogada perde acesso.
- Operações críticas registram ator, tenant, ação e instante.
- Concorrência de emissão e numeração futura pode ser resolvida por transação.
- Backup, restauração e exportação possuem procedimento demonstrável antes da produção.
- Convite expirado, revogado, já utilizado ou aberto com outro e-mail não concede acesso.
- Cadastro direto sem pagamento ou ativação válida não abre o `AppShell` nem cria vínculo ativo.

## 10. Portões de implementação

### Gate A — comparação de fornecedores

Comparar candidatos reais para banco, autenticação e armazenamento usando os critérios do Modelo de Dados e Fluxos v0.2: isolamento, transações, auditoria, backup, portabilidade, região, custo, operação e LGPD. Nenhum SDK será instalado neste gate.

O primeiro levantamento foi registrado em `10_MATRIZ_DE_AVALIACAO_DA_FUNDACAO_v0.1.md`. Camila confirmou Supabase somente para a prova controlada em 02/09/2026. A escolha da tecnologia definitiva de produção permanece aberta.

### Gate B — escolha registrada

**Concluído somente para a prova descartável em 02/09/2026.** Supabase foi confirmado sem plano pago, e `sa-east-1` foi registrada como região pretendida para eventual ambiente hospedado. Custo de produção, estratégia definitiva e fornecedor de cobrança continuam pendentes.

### Gate C — fundação técnica

Criar ambientes separados, migrações versionadas, tabelas mínimas, políticas de acesso, segredos fora do código e testes de isolamento. Dados do `localStorage` não são migrados neste gate. **Artefatos locais preparados em 02/09/2026; execução e exportação ainda não concluídas porque o mecanismo Linux do Docker não iniciou neste computador.**

### Gate D1 — interface e separação de builds

Criar a identidade pública Console Group, rotas visuais `/login` e `/criar-conta`, indicador inequívoco de ambiente e bloqueio preventivo das rotas demonstrativas em builds não locais, sem simular usuário ou sessão. **Concluído para validação visual em 02/09/2026.**

### Gate D2 — primeira fatia vertical funcional

Implementar login, recuperação, sessão, vínculo da Camila com o tenant EQUIPESOM, proteção das rotas atuais, carregamento do tenant e logout. O painel interno da plataforma continua fora da navegação do cliente até possuir autorização própria.

### Gate E — migração controlada

Exportar e classificar dados locais, simular importação, apresentar relatório e migrar somente registros aprovados como rascunhos. Demonstrativos não viram fatos operacionais.

## 11. Decisões que permanecem após a autorização da prova

- usuários reais do piloto e e-mails individuais;
- necessidade de acesso de Edevaldo na primeira versão;
- exigência inicial de MFA;
- orçamento mensal aceitável do piloto e cenário de crescimento;
- requisitos definitivos de tratamento de dados; `sa-east-1` foi confirmada somente para eventual réplica hospedada da prova;
- responsável operacional por usuários, recuperação e incidentes;
- necessidade imediata ou posterior do painel interno da plataforma;
- política mínima de privacidade, retenção e exclusão.
- confirmação técnica de propriedade, DNS e certificado do hostname `app.consolegroup.com.br`;
- provedor de cobrança, planos, preços, período de teste, inadimplência, cancelamento e reembolso;
- momento exato em que pagamento ou convite cria o tenant e ativa o primeiro vínculo;
- validade, expiração e possibilidade de reenvio ou revogação dos convites;

## 12. Prova técnica Supabase autorizada

A prova local usa a CLI oficial do Supabase e uma migração SQL versionada. Ela modela:

- identidade em `auth.users` e perfil em `app_users`, sem senha no banco da aplicação;
- `tenants`, `roles` e `memberships` como entidades independentes;
- `invitations` com e-mail normalizado, tenant, papel, validade, estado, hash do token e auditoria;
- `signup_requests` sem tenant e `commercial_activations` como decisão separada;
- `session_revocations` para negar no banco uma sessão identificada no JWT;
- `proposal_probe` como dado mínimo protegido por RLS e `tenant_id`.

O aceite do convite é uma função transacional. Ela exige identidade e sessão ativas, compara o e-mail do JWT, aceita somente estado pendente e prazo válido, cria um único vínculo e marca o convite como aceito na mesma transação. Convites não são legíveis nem graváveis pelas funções comuns `anon` e `authenticated`; a emissão administrativa real deverá ocorrer somente em backend confiável.

Foram preparados 27 testes pgTAP com exatamente dois tenants, dois usuários e endereços `example.invalid`. Eles cobrem isolamento, adulteração de `tenant_id`, vínculo suspenso, cadastro direto sem ativação, sessão revogada, convite por outro e-mail, expirado, revogado e reutilizado, auditoria e revogação de vínculo. A checagem estrutural desses artefatos passou; isso não substitui a execução no PostgreSQL.

### Bloqueio de execução em 02/09/2026

O Docker Desktop está instalado, mas o mecanismo Linux retornou erro interno antes de criar o banco. Após a autorização de diagnóstico, o Windows confirmou `Virtualização Habilitada no Firmware: Não`, embora o processador ofereça extensão de monitor de máquina virtual e conversão de endereços de segundo nível. A configuração local do Docker registra `WslEngineEnabled: false`. Como a primeira correção depende de entrar no BIOS e reiniciar o computador, nenhuma configuração foi alterada e nenhuma reinicialização foi iniciada.

Como consequência verificável:

- nenhuma migração foi aplicada em banco;
- os 27 testes ainda não foram executados pelo pgTAP;
- nenhuma exportação produzida por `supabase db dump` existe;
- nenhum projeto, credencial, usuário ou dado externo foi criado;
- nenhum ambiente externo foi excluído, e sua exclusão continua expressamente proibida sem autorização de Camila.

O relatório detalhado está em `11_RELATORIO_DA_PROVA_TECNICA_SUPABASE_v0.1.md`.

## 13. Critério de saída desta versão

Esta preparação estará concluída quando:

- a separação plataforma/tenant/usuário/vínculo estiver aceita;
- os usuários e método de acesso do piloto estiverem definidos;
- a matriz de candidatos estiver preenchida com fontes oficiais, custos e riscos atuais;
- o fornecedor da prova estiver explicitamente escolhido e registrado — concluído para Supabase;
- a migração e os testes forem executados em PostgreSQL Supabase real;
- uma exportação SQL for gerada pelo banco testado;
- existir plano de implantação, reversão e saída antes de qualquer adoção definitiva.

## Registro da versão

| Versão | Data | Alteração |
|---|---|---|
| 0.1 | 01/09/2026 | Início formal da fundação de acesso após o encerramento do marco técnico de impressão no Safari/iOS; definidos limites, modelo mínimo, fluxo, segurança, testes e gates sem escolha ou instalação de fornecedor. |
| 0.2 | 02/09/2026 | Console Group registrada como identidade da plataforma; criada a interface pública de login e a separação preventiva entre build local e builds não locais, sem autenticação fictícia, SDK ou migração de dados. |
| 0.3 | 02/09/2026 | Definido `app.consolegroup.com.br` como hostname pretendido e separados os fluxos de convite e cadastro direto condicionado à contratação; criada a interface visual `/criar-conta`, ainda sem envio, cobrança ou sessão real. |
| 0.4 | 02/09/2026 | Supabase e `sa-east-1` confirmados somente para prova descartável; migração, RLS, convite, ativação comercial, revogação e 27 testes preparados com dados fictícios. Execução e exportação permanecem bloqueadas pela virtualização local, sem projeto externo. |
