# Modelos recomendados no Codex para o Projeto EQUIPESOM

Atualizado em 03/08/2026

Fontes oficiais:

- https://developers.openai.com/api/docs/guides/latest-model
- https://developers.openai.com/api/docs/models
- https://developers.openai.com/api/docs/models/all

## Recomendação prática

### GPT-5.4 Mini — rotina econômica e rápida

Usar para:

- organizar listas e notas;
- cadastrar novos itens de inventário;
- revisar ortografia;
- resumir reuniões;
- atualizar status e pendências;
- criar rascunhos simples;
- pequenas alterações repetitivas em arquivos já estruturados.

Não usar sozinho para congelar arquitetura, segurança, banco de dados, permissões ou decisões jurídicas. A documentação oficial descreve GPT-5.4 Mini como o modelo mini mais forte da família para codificação, uso de computador e subagentes, mas ele continua sendo a opção de menor porte.

### GPT-5.4 completo — planejamento intermediário

Se estiver disponível no seletor, usar para:

- analisar requisitos;
- comparar alternativas;
- revisar fluxos não críticos;
- elaborar textos institucionais;
- trabalhar em documentos de produto de complexidade média.

É uma boa alternativa na fase atual quando GPT-5.6 Terra não estiver disponível.

### GPT-5.6 Terra — padrão recomendado para o projeto

Se aparecer no seletor, usar como modelo principal para:

- descoberta de produto;
- modelo de dados;
- fluxos do MVP;
- arquitetura multiempresa;
- análise de inconsistências;
- protótipos e implementação cotidiana;
- revisão técnica antes de entregar.

A documentação oficial posiciona Terra como o equilíbrio entre inteligência e custo. Para a maior parte do Projeto EQUIPESOM, essa é a melhor escolha padrão.

### GPT-5.6 Sol — decisões difíceis e codificação crítica

Usar seletivamente para:

- fechar a arquitetura antes de programar;
- revisar banco de dados e isolamento multiempresa;
- segurança, autenticação e permissões;
- migrações e mudanças que possam exigir retrabalho;
- depuração difícil;
- revisão final de código importante;
- geração visual/frontend quando qualidade máxima justificar o custo;
- auditoria antes do piloto ou publicação.

A documentação oficial define Sol como o modelo de fronteira para trabalho profissional complexo e codificação. Não é necessário usá-lo para cadastrar equipamentos, revisar textos curtos ou atualizar pendências.

## Estratégia simples para Camila

| Trabalho | Modelo recomendado |
|---|---|
| Inventário, listas, atas e organização | GPT-5.4 Mini |
| Documentos de produto e fluxos comuns | GPT-5.6 Terra; se indisponível, GPT-5.4 |
| Modelo de dados e arquitetura | GPT-5.6 Terra, com revisão pontual no Sol |
| Programação normal do MVP | GPT-5.6 Terra |
| Segurança, permissões, migrations e bugs difíceis | GPT-5.6 Sol |
| Revisão final antes do piloto | GPT-5.6 Sol |

## Esforço de raciocínio

- **Low:** tarefas mecânicas e pequenas correções.
- **Medium:** padrão para planejamento, documentos e implementação cotidiana.
- **High:** arquitetura, revisão crítica e bugs difíceis.
- **Xhigh/Max:** reservar para problemas realmente difíceis e verificáveis; não melhora automaticamente toda tarefa.

## Regra de economia

Começar com o menor modelo que consiga realizar a tarefa com segurança. Subir de modelo quando houver decisão estrutural, ambiguidade importante, alto custo de erro ou falha real do modelo menor. Para a fase atual, GPT-5.4 Mini resolve a manutenção do material; Terra é o melhor padrão para projetar; Sol entra nos marcos críticos e na codificação de maior risco.
