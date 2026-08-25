# Registro de decisões — Projeto EQUIPESOM

Atualizado em 25/08/2026

| ID | Decisão | Estado | Observação |
|---|---|---|---|
| DEC-001 | Validar o produto primeiro com a EQUIPESOM | Confirmada | Arquitetura continua multiempresa. |
| DEC-002 | Construir como SaaS multiempresa desde o início | Confirmada | Isolamento por `tenant_id`. |
| DEC-003 | Separar dados estruturados dos modelos visuais | Confirmada | Um dado pode alimentar vários layouts. |
| DEC-004 | Propostas emitidas são imutáveis | Confirmada | Alteração gera nova versão. |
| DEC-005 | Assinatura do fornecedor e aceite do cliente são distintos | Confirmada | Aceite deve referenciar uma versão específica. |
| DEC-006 | Contrato será etapa posterior ao aceite | Confirmada como direção | Texto e gatilho ainda dependem de jurídico. |
| DEC-007 | MVP pode exibir somente Administrador | Confirmada | Estrutura interna já deve suportar usuários, vínculos e papéis. |
| DEC-008 | Não compartilhar senha | Confirmada | Camila e Edevaldo terão identidades próprias quando ambos acessarem. |
| DEC-009 | Validade padrão da proposta: 30 dias | Confirmada | Configurável por empresa e por proposta. |
| DEC-010 | Pagamento: até 5 dias úteis após a data final do evento | Confirmada | Exibir data de vencimento calculada. |
| DEC-011 | Descontos exigem autorização de Edevaldo | Confirmada para EQUIPESOM | Futuro SaaS terá permissão configurável. |
| DEC-012 | R$ 1.000/dia não será hardcoded | Confirmada | É somente sugestão inicial para parte dos campeonatos. |
| DEC-013 | Deslocamento será regra geográfica configurável | Confirmada | Prática atual: R$ 250 fora de Florianópolis. |
| DEC-014 | EQUIPESOM é a marca comercial | Confirmada | Razão social fica separada. Nome fantasia não aparece no cartão atual. |
| DEC-015 | Pilares da marca: qualidade, comprometimento e parceria | Confirmada | Paixão pelo som é a essência. |
| DEC-016 | `equipesom.com.br` será domínio da empresa, não do SaaS | Confirmada | Confirmar se o registro foi concluído. |
| DEC-017 | Criar `contato@equipesom.com.br` | Confirmada | Não usar senha compartilhada. |
| DEC-018 | O tipo de evento sugere itens, mas não fixa equipamentos | Confirmada | Pacotes serão editáveis. |
| DEC-019 | Cláusulas serão versionadas e revisadas juridicamente | Confirmada | Textos atuais são preliminares. |
| DEC-020 | Inventário inicial não controla disponibilidade ainda | Confirmada | Precisa de reconciliação, condição e propriedade. |
| DEC-021 | Numeração oficial exibida no formato `EQ-AAAA-NNNN` | Confirmada | Ano com quatro dígitos e sequência com quatro dígitos e zeros à esquerda, por exemplo `EQ-2026-0001`. Rascunhos permanecem sem número oficial; atribuição transacional e imutável será definida no fluxo de emissão. |
| DEC-022 | EQUIPESOM será a primeira empresa cliente do futuro SaaS e não a marca da plataforma | Confirmada | A marca do SaaS ainda não foi definida. |
| DEC-023 | Para a EQUIPESOM, desconto será percentual sobre o subtotal anterior ao desconto | Confirmada para EQUIPESOM | A versão guardará o percentual e o valor monetário calculado; arredondamento e limites permanecem pendentes. |
| DEC-024 | Eventos existirão independentemente de propostas e poderão registrar realizações anteriores ou externas ao sistema | Confirmada | Importação histórica não deve fabricar proposta, aceite ou financeiro sem evidência. |
| DEC-025 | O calendário distinguirá o estado do Evento do estado das Propostas relacionadas | Confirmada | Nomes, cores e transições finais ainda dependem de validação. |
| DEC-026 | Proposta aceita originará acompanhamento financeiro | Confirmada | Aceite não equivale automaticamente a contrato ou execução autorizada. |
| DEC-027 | Valor proposto, valor aceito, valor final executado, ajustes e pagamentos permanecerão separados | Confirmada | Saldos e totais serão derivados sem sobrescrever o histórico. |
| DEC-028 | O sistema oferecerá relatório financeiro anual de apoio | Confirmada como requisito | Não será apresentado como declaração tributária; critérios dependem da contabilidade. |
| DEC-029 | A proposta suportará pelo menos três cláusulas, sem inventar ou publicar texto jurídico sem fonte e revisão | Confirmada | Capacidade mínima não significa obrigação de selecionar exatamente três cláusulas. |
| DEC-030 | Pagamento, cancelamento/remarcação, energia, acesso e segurança são temas candidatos a cláusulas | Confirmada como escopo de análise | Redação, aplicação e exceções continuam pendentes de Camila, operação e jurídico. |
| DEC-031 | Aprovar o Modelo de Dados e Fluxos v0.2 como modelo conceitual | Confirmada por Camila em 25/08/2026 | A aprovação não escolhe fornecedor de banco, autenticação ou armazenamento; não aprova esquema físico definitivo, hipóteses ou estados pendentes, textos jurídicos, tratamento contábil ou tributário, disponibilidade de equipamentos nem migração ou oficialização de dados do `localStorage`. |

## Decisões em aberto

- criação imediata de `camila@equipesom.com.br`;
- critério e valor de sinal;
- meio de pagamento;
- calendário de feriados para os cinco dias úteis;
- consequências por atraso;
- cancelamento, remarcação, clima e custos incorridos;
- tratamento tributário validado pela contabilidade;
- forma de aceite do cliente no MVP;
- ferramenta ou integração futura de assinatura;
- marca e domínio do SaaS;
- tecnologia de implementação, a escolher após o desenho do modelo e dos fluxos.
