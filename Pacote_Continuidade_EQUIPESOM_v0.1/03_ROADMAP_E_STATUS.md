# Roadmap e status — Projeto EQUIPESOM

Atualizado em 25/08/2026

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

## Próximo passo imediato — revisão e preparação da fundação

1. Produto transforma somente os pontos conceitualmente aprovados em critérios verificáveis para banco, autenticação e armazenamento de objetos.
2. Candidatos reais são comparados por isolamento, transações, auditoria, backup, portabilidade, segurança, região, custo e operação, sem instalação nem escolha presumida.
3. Camila decide o fornecedor somente depois de receber evidências, riscos, custos e alternativa de saída.
4. Camila, Edevaldo, jurídico e contabilidade continuam resolvendo as pendências de seus respectivos domínios em paralelo.
5. A implementação da fundação começa apenas depois do registro da escolha e de uma estratégia de migração que não oficialize dados simulados.

## Requisitos confirmados com fase de implementação pendente

- propostas aceitas originarão acompanhamento financeiro;
- valor proposto, valor aceito, valor final executado, ajustes e pagamentos permanecerão separados;
- haverá relatório financeiro anual de apoio, sem caráter de declaração tributária;
- a proposta suportará pelo menos três cláusulas, mas os textos dependem de fonte e revisão jurídica.

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
