# Instruções duráveis do Projeto EQUIPESOM

## Comunicação

- Responder em português do Brasil, em linguagem clara para uma usuária iniciante em tecnologia.
- Camila é a responsável pelo projeto e Edevaldo é seu sócio e responsável operacional/técnico da EQUIPESOM.
- Não apenas concordar: identificar inconsistências, riscos, dependências e decisões prematuras.
- Liderar pela conclusão e explicar termos técnicos somente quando ajudarem a decisão.

## Produto

- O produto inicial gera propostas profissionais e PDFs para eventos a partir de formulários.
- Validar primeiro com a EQUIPESOM, mas projetar como SaaS multiempresa desde o início.
- Não hardcode dados, preços ou regras específicas da EQUIPESOM como regras globais.
- Dados estruturados, modelos visuais, cláusulas, preços e permissões são módulos separados.
- Cada proposta emitida possui versão imutável. Alterações geram nova versão.
- Assinatura do fornecedor, aceite do cliente, contrato e ordem de serviço são eventos distintos.
- O MVP pode mostrar somente Administrador, mas o modelo interno deve separar usuário, empresa, vínculo, papel e permissão.
- Nunca recomendar senha compartilhada.

## Segurança e governança

- Isolar dados por `tenant_id`.
- Manter trilha de auditoria para emissão, preço, desconto, assinatura, aceite e cancelamento.
- Cláusulas são preliminares até revisão jurídica.
- Tratamento tributário deve ser validado pela contabilidade.
- Fotos de pessoas ou de terceiros exigem autorização de uso comercial.

## Fluxo de trabalho

- Antes de codificar, conferir o contexto mestre, registro de decisões, roadmap e planilha vigente.
- Atualizar documentos e versão quando uma decisão material for confirmada.
- Não apagar divergências do inventário: resolvê-las com evidência, preferencialmente foto de etiqueta.
- Verificar artefatos gerados antes da entrega.
