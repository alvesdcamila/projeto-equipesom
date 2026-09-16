# Matriz de avaliação da fundação técnica — v0.1

Data: 02/09/2026

Status: levantamento preliminar com fontes oficiais; nenhuma escolha ou instalação autorizada

## 1. Objetivo

Comparar fundações capazes de sustentar autenticação, isolamento multiempresa, dados relacionais, arquivos e futura emissão transacional. Esta matriz inicia o Gate A definido em `09_FUNDACAO_DE_ACESSO_E_TENANCY_v0.1.md`.

As notas são uma avaliação técnica inicial para o contexto conhecido do projeto. Não representam contratação, conformidade jurídica, orçamento aprovado nem garantia do fornecedor. Preços, limites e documentação foram consultados em 02/09/2026 e devem ser reconferidos antes da decisão.

## 2. Contexto usado na avaliação

- aplicação React/Vite atualmente sem backend;
- EQUIPESOM como primeiro tenant de um futuro SaaS B2B;
- modelo fortemente relacional: usuários, vínculos, clientes, eventos, propostas, versões, itens, cláusulas, financeiro, arquivos e auditoria;
- necessidade de transações futuras para emissão, versão e numeração `EQ-AAAA-NNNN`;
- isolamento por `tenant_id` obrigatório no servidor e, quando possível, no banco;
- armazenamento futuro de PDFs, fotos, anexos e evidências;
- piloto pequeno, mas sem aceitar arquitetura que dependa de senha compartilhada ou filtro somente no frontend;
- preferência operacional por poucos serviços e possibilidade de região em São Paulo, ainda sem decisão jurídica de residência.

## 3. Candidatos comparados

### A. Supabase integrado

PostgreSQL gerenciado, Auth, Storage e APIs integradas. O Postgres oferece Row Level Security (RLS), e o Auth fornece JWT que pode participar das políticas. O Storage também usa políticas ligadas ao Postgres.

### B. Firebase integrado

Firebase Authentication, Cloud Firestore e Cloud Storage. Firestore é NoSQL orientado a documentos; autorização de dados e arquivos depende de Security Rules. Suporta transações entre documentos, mas o modelo conceitual relacional precisaria ser redesenhado e desnormalizado.

### C. AWS composta

Amazon Cognito, Aurora/RDS PostgreSQL, S3 e serviços de aplicação. A AWS documenta PostgreSQL multi-tenant com RLS e possui região `sa-east-1` em São Paulo. É a opção com maior controle de composição, mas também com mais serviços, configuração, observabilidade e responsabilidade operacional.

## 4. Matriz preliminar

Escala: 1 = fraco para este projeto; 3 = atende com ressalvas; 5 = aderência forte. As notas refletem adequação ao EQUIPESOM, não qualidade absoluta do produto.

| Critério | Peso proposto | Supabase | Firebase | AWS composta |
|---|---:|---:|---:|---:|
| Aderência ao modelo relacional aprovado | 5 | 5 | 2 | 5 |
| Transações para emissão e numeração | 5 | 5 | 3 | 5 |
| Isolamento multiempresa verificável | 5 | 5 | 4 | 5 |
| Integração entre identidade e autorização de dados | 5 | 5 | 4 | 4 |
| Arquivos privados por tenant | 4 | 4 | 4 | 5 |
| Região disponível em São Paulo | 3 | 5 | 5 | 5 |
| Simplicidade para o primeiro piloto | 5 | 5 | 5 | 2 |
| Portabilidade e saída | 4 | 5 | 3 | 4 |
| Backup e recuperação | 4 | 4 | 4 | 5 |
| Previsibilidade operacional e de cobrança | 4 | 4 | 3 | 2 |
| Aderência total ponderada inicial | — | **208/220** | **161/220** | **184/220** |

O cálculo ponderado é somente triagem. Pesos e notas devem ser ajustados depois das respostas de orçamento, operação, recuperação, privacidade e método de login.

## 5. Leitura técnica

### Supabase — candidato líder para a prova controlada

Pontos favoráveis:

- preserva o modelo relacional já aprovado sem conversão para documentos;
- oferece RLS dentro do Postgres, adequada ao isolamento por `tenant_id`;
- integra Auth, banco e Storage sem exigir três fornecedores independentes;
- permite exportação SQL e ferramentas PostgreSQL conhecidas;
- possui região específica `sa-east-1` em São Paulo;
- plano Pro publicado a partir de US$ 25/mês inclui backups diários com retenção informada de sete dias; o plano gratuito não deve ser tratado como produção porque pode pausar e não inclui backup automático.

Riscos e validações obrigatórias:

- toda tabela exposta deve combinar privilégios mínimos e RLS; criar uma policy sem revisar grants não é suficiente;
- o `service_role` ignora RLS e deverá permanecer somente em ambiente confiável;
- autorização não deve depender de `raw_user_meta_data`, que o próprio usuário pode alterar;
- backup do banco não restaura automaticamente objetos apagados do Storage; a política de backup de arquivos precisa ser separada;
- custos de e-mail, domínio, recuperação ponto a ponto e crescimento devem entrar na simulação;
- região é controle de localização, não prova automática de conformidade com a LGPD.

### Firebase — rápido para interface, mas desalinhado ao núcleo relacional

Pontos favoráveis:

- Auth, Firestore e Storage possuem integração e regras de segurança;
- oferece região `southamerica-east1` em São Paulo;
- possui cotas iniciais publicadas e cobrança por uso;
- transações e escritas em lote são atômicas nos documentos envolvidos.

Riscos e validações obrigatórias:

- Firestore é orientado a documentos e não possui tabelas/linhas relacionais; vínculos, integridade e relatórios exigiriam outra modelagem;
- custo depende de leituras, escritas, exclusões, índices, armazenamento e tráfego, exigindo simulação por cenário;
- apagar um documento não apaga automaticamente suas subcoleções;
- regras de banco e Storage são linguagens/políticas distintas que precisam permanecer coerentes;
- a portabilidade do modelo desnormalizado tende a exigir mais transformação que PostgreSQL.

### AWS composta — maior controle, maior carga operacional

Pontos favoráveis:

- Cognito, PostgreSQL gerenciado e S3 podem ser combinados com forte separação de responsabilidades;
- a AWS possui região `sa-east-1` em São Paulo;
- a orientação oficial para SaaS multi-tenant com PostgreSQL recomenda RLS em todas as tabelas de tenant no modelo compartilhado;
- permite desenhar rede, funções, API, observabilidade, chaves e recuperação com grande controle.

Riscos e validações obrigatórias:

- autenticação não resolve isolamento de tenant sozinha; o contexto precisa atravessar API e sessão do banco corretamente;
- custo total combina Cognito, banco, capacidade, armazenamento, funções, API, logs, tráfego e backups;
- exige mais conhecimento e operação de IAM, rede, banco, S3 e observabilidade;
- para o piloto atual, o número de serviços aumenta a superfície de configuração e de erro.

## 6. Recomendação preliminar

O Supabase é o candidato líder para uma prova técnica curta porque corresponde diretamente ao modelo relacional, oferece Auth e Storage integrados, suporta RLS e reduz a carga operacional inicial. Essa recomendação não é uma escolha definitiva.

Firebase deve permanecer como alternativa caso velocidade de desenvolvimento e ecossistema Google recebam peso maior que aderência relacional. AWS deve permanecer como alternativa de maior controle caso operação, requisitos corporativos ou escala justifiquem a complexidade adicional.

Nenhum SDK deverá ser instalado antes de Camila aprovar:

1. pesos da matriz;
2. método de login;
3. usuários do piloto;
4. orçamento mensal aceitável;
5. região e requisitos de dados;
6. candidato para a prova controlada.

## 7. Prova técnica proposta após a decisão

Se Supabase for aprovado como candidato da prova, executar em ambiente descartável e sem dados reais:

1. criar `tenant`, `app_user`, `membership` e uma tabela mínima `proposal_probe`;
2. criar dois tenants fictícios e dois usuários independentes;
3. habilitar privilégios mínimos e RLS;
4. comprovar que cada usuário lê e grava somente seu tenant;
5. adulterar `tenant_id` na chamada e comprovar a negação;
6. criar bucket privado com arquivo por tenant e repetir o teste cruzado;
7. revogar um vínculo e comprovar perda de acesso após atualização da sessão;
8. exportar esquema e dados de teste por ferramenta PostgreSQL;
9. registrar custo, região, limites, backup e procedimento de exclusão;
10. apagar integralmente o ambiente descartável depois do relatório aprovado.

A prova não receberá propostas reais, CNPJ, dados de clientes, PDFs históricos ou conteúdo do `localStorage`.

## 8. Fontes oficiais consultadas

### Supabase

- [Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Segurança do banco](https://supabase.com/docs/guides/database/secure-data)
- [Controle de acesso do Storage](https://supabase.com/docs/guides/storage/security/access-control)
- [Regiões disponíveis](https://supabase.com/docs/guides/platform/regions)
- [Backups do banco](https://supabase.com/docs/guides/platform/backups)
- [Preços](https://supabase.com/pricing)

### Firebase

- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Modelo de dados do Firestore](https://firebase.google.com/docs/firestore/data-model)
- [Segurança do Firestore](https://firebase.google.com/docs/firestore/security/overview)
- [Transações e escritas em lote](https://firebase.google.com/docs/firestore/manage-data/transactions)
- [Segurança do Cloud Storage](https://firebase.google.com/docs/storage/security)
- [Regiões do Firestore](https://firebase.google.com/docs/firestore/locations)
- [Preços](https://firebase.google.com/pricing)

### AWS

- [PostgreSQL gerenciado para SaaS multi-tenant](https://docs.aws.amazon.com/prescriptive-guidance/latest/saas-multitenant-managed-postgresql/introduction.html)
- [Autorização e isolamento em SaaS multi-tenant](https://docs.aws.amazon.com/prescriptive-guidance/latest/saas-multitenant-api-access-authorization/introduction.html)
- [Regiões AWS](https://docs.aws.amazon.com/global-infrastructure/latest/regions/aws-regions.html)
- [Amazon Cognito](https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html)
- [Preço do Cognito](https://aws.amazon.com/cognito/pricing/)
- [Preço do Aurora](https://aws.amazon.com/rds/aurora/pricing/)

## Registro da versão

| Versão | Data | Alteração |
|---|---|---|
| 0.1 | 02/09/2026 | Comparação inicial de Supabase, Firebase e AWS composta com fontes oficiais atuais; Supabase registrado apenas como candidato líder para prova controlada, sem contratação, conta, SDK ou decisão definitiva. |
