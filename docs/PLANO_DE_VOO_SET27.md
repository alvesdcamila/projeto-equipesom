# Plano de Voo set27

## 1. Objetivo

O Plano de Voo set27 é o plano prático de formação em desenvolvimento de software com horizonte até setembro de 2027.

O objetivo não é apenas concluir cursos ou produzir aplicações com auxílio de inteligência artificial.

O objetivo é desenvolver capacidade suficiente para:

- construir aplicações de software;
- compreender o funcionamento das principais camadas de um sistema;
- diagnosticar problemas;
- investigar código existente;
- implementar alterações com segurança;
- trabalhar com controle de versão;
- testar e validar implementações;
- explicar decisões técnicas;
- participar de processos seletivos para posições iniciais em desenvolvimento de software.

O estado atual é de formação. Não se presume domínio prévio dos conceitos utilizados nos projetos.

O aprendizado deve ocorrer por aplicação prática e progressiva.

---

## 2. Método

O método principal do Plano de Voo set27 é:

**Aprender → Construir → Quebrar → Investigar → Corrigir → Finalizar → Explicar**

Cada projeto deve proporcionar experiência prática e não somente resultar em um produto funcional.

Uma etapa não é considerada plenamente aproveitada para formação quando o sistema funciona, mas a desenvolvedora não consegue explicar minimamente:

- qual problema foi resolvido;
- em qual camada ocorreu a alteração;
- quais arquivos ou componentes participaram;
- como a solução funciona;
- como a solução foi testada;
- quais erros ocorreram;
- como esses erros foram investigados;
- quais seriam os principais riscos daquela implementação.

---

## 3. Papel da inteligência artificial

ChatGPT e Codex são ferramentas de apoio ao desenvolvimento e à aprendizagem.

Devem atuar como engenharia pareada, auxílio de investigação e mentoria técnica.

Não devem transformar o projeto em uma sequência de alterações automáticas sem compreensão da desenvolvedora.

Em tarefas relevantes, o processo deve favorecer:

1. entendimento do problema;
2. formulação de hipóteses;
3. investigação;
4. implementação;
5. validação;
6. explicação do resultado.

Quando uma ferramenta realizar uma parte significativa da implementação, deve ser possível posteriormente revisar a mudança e compreender seu funcionamento.

---

## 4. Projetos como laboratório

Cada projeto do Plano de Voo deve ser tratado como um laboratório real de engenharia de software.

Os projetos podem ser pequenos, desde que permitam percorrer o ciclo completo de desenvolvimento.

O foco não é quantidade de funcionalidades.

O foco é desenvolver progressivamente capacidade em áreas como:

- terminal e sistema operacional;
- Git;
- GitHub;
- HTML e CSS;
- JavaScript;
- TypeScript;
- React;
- frontend;
- backend;
- APIs;
- autenticação;
- autorização;
- banco de dados;
- SQL;
- migrations;
- testes;
- debugging;
- segurança;
- ambientes de desenvolvimento;
- deploy;
- arquitetura;
- documentação técnica.

Nem todos esses temas precisam ser estudados separadamente antes de construir.

Eles devem aparecer progressivamente conforme forem necessários nos projetos.

---

# 5. Projeto EQUIPESOM

O EQUIPESOM é atualmente um dos principais laboratórios práticos do Plano de Voo set27.

Além de possuir finalidade real, o projeto deve ser utilizado para desenvolver competências de engenharia de software.

Por isso, uma funcionalidade implementada no EQUIPESOM deve ser tratada também como oportunidade de aprendizagem.

---

## 6. Arquitetura e conceitos já encontrados

Durante o desenvolvimento do EQUIPESOM já houve contato prático com conceitos como:

- aplicação frontend;
- React;
- TypeScript;
- Vite;
- Node.js;
- npm;
- armazenamento local no navegador;
- autenticação;
- autorização;
- backend;
- Supabase;
- PostgreSQL;
- migrations;
- SQL;
- isolamento por tenant;
- sessões;
- APIs;
- testes automatizados;
- scripts Node;
- variáveis de ambiente;
- Git;
- GitHub;
- commits;
- branches;
- ambiente local;
- terminal Windows;
- terminal macOS;
- reprodutibilidade de ambiente.

Contato com um conceito não significa domínio.

Os conceitos devem ser revisitados sempre que necessário até que possam ser utilizados e explicados com autonomia crescente.

---

# 7. Estratégia de evolução do backend

O desenvolvimento recente foi organizado em provas progressivas.

A sequência conceitual é:

```text
B1
Autenticação local
        ↓
B2
Fundação de backend e operações transacionais locais
        ↓
B3
Integração controlada entre frontend, autenticação
e backend local
        ↓
Validação manual B3
        ↓
Fechamento formal do gate B3
        ↓
Próximos gates de produto
```

Essas provas utilizam ambiente local e dados fictícios.

Elas não representam autorização automática para operação real.

---

# 8. Estado atual — 07/10/2026

## B1

A prova local de autenticação foi implementada anteriormente.

Ela estabeleceu fundamentos relacionados a:

- identidade;
- autenticação;
- sessão;
- associação de usuário;
- tenant;
- autorização;
- isolamento de acesso.

---

## B2

A prova B2 introduziu fundamentos de backend relacionados a operações de proposta e persistência local.

B2 continua sendo uma prova técnica.

Sua existência não significa autorização para emissão comercial real.

---

## B3

B3 conecta de forma controlada partes da interface ao backend local.

Entre os objetivos técnicos estão:

- login através do Supabase Auth local;
- validação de identidade;
- associação do usuário ao tenant;
- leitura autorizada de propostas;
- isolamento entre tenants;
- rejeição de acesso não autorizado;
- preservação do funcionamento anterior durante a prova;
- utilização exclusivamente local e com dados fictícios.

---

# 9. Validação manual B3

Em 30/09/2026 foi concluída com sucesso a validação manual do login B3 no ambiente local do novo MacBook.

Foi utilizado o processo:

```bash
npm run prepare:b3-manual
```

O script criou temporariamente:

- uma identidade fictícia;
- um papel fictício;
- um tenant fictício;
- uma proposta fictícia;
- um rascunho fictício;
- credenciais descartáveis de acesso.

O login manual foi realizado com sucesso.

Nenhuma credencial temporária deve ser registrada neste documento ou reutilizada.

Depois da validação foi executado:

```bash
npm run cleanup:b3-manual
```

O resultado comprovado foi:

```text
PASS: acesso manual B3 removido; zero contas, vínculos, tenants,
propostas e rascunhos fictícios restantes.
```

Portanto:

**VALIDAÇÃO MANUAL DO LOGIN B3: CONCLUÍDA**

Em 07/10/2026, Camila encerrou formalmente a B3 como prova técnica local, considerando em conjunto esta validação e as evidências automatizadas de autenticação, sessão, leitura autorizada e isolamento por tenant.

---

# 10. Gate B3 — encerrado como prova técnica local

O frontend foi acessado com sucesso em dispositivo móvel físico pela LAN. O fluxo B3 autenticado não foi executado no celular porque o proxy da prova é deliberadamente restrito a loopback. A proteção não deve ser removida apenas para satisfazer a prova local.

Critérios transferidos para gates futuros:

### Validação end-to-end móvel em homologação

Executar o fluxo autenticado em dispositivo móvel físico quando houver homologação com endpoint apropriado, preservando a restrição de loopback da prova local.

### Regressão de PDF pós-integração

Confirmar em gate próprio que as alterações introduzidas durante B1/B2/B3 não causaram regressões no fluxo de geração ou visualização de PDF já existente. Não há nova evidência dessa regressão nesta etapa.

### Plano de migração opt-in

Definir em etapa futura como uma eventual migração será realizada de forma explícita, controlada e reversível, sem converter automaticamente dados ou fluxos existentes. Esse plano não foi implementado na B3.

O fechamento decorre do escopo de prova local e das evidências acumuladas; não equivale à aprovação desses três critérios nem à autorização para operação real.

---

# 11. Restrições atuais

Até nova decisão explícita:

- não utilizar dados reais nas provas locais;
- não habilitar emissão B2 para operação real;
- não migrar automaticamente propostas existentes;
- não criar usuários operacionais reais como consequência dos testes;
- não habilitar SMTP real;
- não publicar infraestrutura externa;
- não tratar ambiente local como homologação ou produção;
- não considerar prova técnica equivalente a autorização operacional.

---

# 12. Depois do B3

O encerramento de B3 não autoriza automaticamente a próxima implementação.

Os gates seguintes devem ser definidos separadamente.

Entre as decisões futuras já identificadas estão:

### Permissões de emissão

Definir quem poderá:

- criar;
- editar;
- revisar;
- emitir propostas.

### Autorização de desconto

Definir mecanismo auditável para autorização de descontos por Edevaldo.

Deve ser analisado, entre outros aspectos:

- quem solicita;
- quem autoriza;
- validade da autorização;
- associação com a versão da proposta;
- comportamento quando valores são alterados;
- registro histórico;
- invalidação da autorização após determinadas mudanças.

### SMTP

Envio autenticado de propostas permanece uma trilha independente.

A existência de SMTP funcional não representa autorização automática para envio operacional.

### Homologação

Homologação deve possuir critérios próprios antes de utilizar informações ou fluxos reais.

### Produção

Produção constitui gate independente e deverá ocorrer apenas depois de validações técnicas, operacionais e de segurança apropriadas.

---

# 13. Regra de progressão

O projeto não deve avançar simplesmente porque existe uma próxima funcionalidade possível.

Antes de avançar para uma etapa tecnicamente relevante, deve-se responder:

1. O estágio anterior foi validado?
2. A desenvolvedora entende o que foi construído?
3. Há evidência de teste?
4. O estado do projeto está documentado?
5. Existe risco de perda ou corrupção de dados?
6. A próxima etapa está claramente delimitada?
7. É possível retornar ao estado anterior?

---

# 14. Checkpoint de aprendizagem

Periodicamente devem ser realizadas sessões sem implementação destinadas apenas à compreensão.

Nessas sessões, a desenvolvedora deve tentar explicar com suas próprias palavras conceitos utilizados recentemente.

Exemplos para o estado atual:

- diferença entre Git e GitHub;
- diferença entre `git add`, `commit`, `push` e `pull`;
- o que é frontend;
- o que é backend;
- o que é banco de dados;
- o que é uma API;
- o que é autenticação;
- diferença entre autenticação e autorização;
- o que é uma sessão;
- o que significa tenant;
- por que existe isolamento entre tenants;
- o que é uma migration;
- por que B1, B2 e B3 foram separados;
- por que dados fictícios são utilizados;
- diferença entre ambiente local, homologação e produção.

Não é necessário saber responder perfeitamente na primeira tentativa.

A incapacidade de explicar um conceito indica apenas que ele precisa ser revisitado.

---

# 15. Evidências de aprendizagem

Ao longo do Plano de Voo, registrar experiências reais como:

- bugs investigados;
- hipóteses erradas e corretas;
- erros de configuração;
- comandos de Terminal aprendidos;
- conflitos Git;
- testes escritos;
- migrations criadas;
- problemas de autenticação;
- problemas de autorização;
- decisões arquiteturais;
- regressões encontradas;
- correções realizadas.

Essas experiências serão utilizadas posteriormente para preparação de entrevistas.

O objetivo é poder responder perguntas com experiências concretas, e não somente definições decoradas.

---

# 16. Regra para entrevistas futuras

Até setembro de 2027, o objetivo é possuir um conjunto de projetos e experiências que permitam explicar situações como:

- uma funcionalidade construída do início ao fim;
- um bug difícil investigado;
- uma decisão técnica tomada;
- uso de Git em projeto real;
- integração entre frontend e backend;
- persistência em banco de dados;
- autenticação e autorização;
- testes;
- falhas e correções;
- evolução de uma aplicação ao longo do tempo.

O foco não é aparentar conhecimento que ainda não existe.

O foco é construir conhecimento real e demonstrável.

---

# 17. Fonte de verdade técnica

Este documento registra o objetivo de aprendizagem e o contexto geral da evolução.

Ele **não substitui** a documentação técnica específica do EQUIPESOM.

Para determinar o estado técnico preciso de uma etapa, consultar principalmente:

- `REGISTRO_DE_ALTERACOES.md`;
- `Pacote_Continuidade_EQUIPESOM_v0.1/03_ROADMAP_E_STATUS.md`;
- `Pacote_Continuidade_EQUIPESOM_v0.1/07_ESTADO_DO_PROJETO.json`;
- provas técnicas correspondentes à etapa;
- código e testes atuais do repositório.

Em caso de divergência, o estado técnico deve ser revalidado antes de continuar.

## 18. Ritual diário — Mapa do Dia

Toda sessão prática do Plano de Voo deve começar com a identificação consciente do conhecimento que será utilizado.

Antes de implementar ou investigar uma tarefa relevante, registrar ou apresentar:

**Área:** qual área da engenharia de software está sendo praticada.

**Conceito do dia:** principal conceito técnico relacionado à tarefa.

**Onde aparece no projeto:** arquivos, comandos, componentes ou fluxos nos quais o conceito pode ser observado.

**Objetivo prático:** o que será construído, investigado ou validado naquela sessão.

**Por que importa:** qual problema técnico ou de produto aquele conceito resolve.

**Nível atual de domínio:**

🟡 **Contato** — já encontrou ou utilizou o conceito, mas ainda não consegue explicá-lo ou aplicá-lo conscientemente.

🟠 **Praticando** — já consegue reconhecer o conceito, acompanhar sua utilização e executar tarefas orientadas.

🟢 **Consigo explicar e executar** — consegue explicar o conceito com suas palavras e utilizá-lo com autonomia razoável.

### Microestudo diário

Sempre que possível, cada sessão deve incluir aproximadamente 10 minutos de conteúdo didático diretamente relacionado ao conceito utilizado naquele dia.

Priorizar vídeos curtos, claros e aplicáveis ao trabalho atual.

Não escolher temas aleatórios apenas para cumprir carga de estudo.

Exemplo:

Se a tarefa envolve chamadas entre frontend e Supabase, estudar APIs e HTTP.

Se a tarefa envolve migrations, estudar SQL e estrutura de bancos relacionais.

Se a tarefa envolve componentes `.tsx`, estudar React e TypeScript.

Se a tarefa envolve `git commit`, `pull` ou conflitos, estudar Git.

### Prática consciente

Depois do conteúdo curto, realizar pelo menos uma pequena ação prática relacionada ao conceito.

Exemplos:

- identificar uma chamada de API no código;
- interpretar um `SELECT`;
- alterar conscientemente um componente React simples;
- executar e interpretar um comando Git;
- localizar uma migration e explicar seu efeito;
- identificar entrada, processamento e saída de uma função.

### Debrief

Ao terminar uma etapa relevante, a desenvolvedora deve tentar responder:

**O que eu fiz?**

**Qual conceito técnico apareceu?**

**Por que essa tecnologia ou mecanismo existe?**

**Onde isso aparece no código?**

**Como eu sei que funcionou?**

**O que eu ainda não entendi?**

As respostas não precisam estar corretas ou completas na primeira tentativa.

Dúvidas e erros de explicação devem orientar o próximo estudo.

---

## 19. Mapa de competências

As competências encontradas nos projetos devem ser acompanhadas progressivamente.

Utilizar:

🟡 Contato  
🟠 Praticando  
🟢 Consigo explicar e executar

O nível representa conhecimento demonstrado, não apenas presença da tecnologia no projeto.

Uma ferramenta utilizada majoritariamente por Codex ou ChatGPT não deve ser marcada automaticamente como dominada pela desenvolvedora.

O mapa deve ser revisado periodicamente com base em práticas, explicações e pequenos desafios realizados pela própria desenvolvedora.
