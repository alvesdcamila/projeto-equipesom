# Contexto mestre — Projeto EQUIPESOM

Versão: 0.1  
Atualizado em: 03/08/2026

## 1. Pessoas

- **Camila:** conduz o projeto do aplicativo, organiza e revisa propostas com Edevaldo.
- **Edevaldo Alves:** sócio de Camila, responsável pela operação, assinatura e envio das propostas. Quando o nome Edevaldo aparecer, refere-se ao sócio e responsável técnico/comercial da EQUIPESOM.

## 2. Empresa

- Marca comercial: **EQUIPESOM**.
- Razão social: **17.681.110 EDEVALDO ALVES**.
- CNPJ: **17.681.110/0001-69**.
- Abertura: **04/03/2013**.
- Situação cadastral no cartão apresentado: **ATIVA**.
- Porte: **ME**.
- Natureza jurídica: **213-5 — Empresário (Individual)**.
- Atividade principal: **90.01-9-06 — Atividades de sonorização e de iluminação**.
- Atividade secundária: **47.53-9-00 — Comércio varejista especializado de eletrodomésticos e equipamentos de áudio e vídeo**.
- Endereço: **SRV MANOEL DAVID DA COSTA, 38, TAPERA, FLORIANÓPOLIS/SC, CEP 88.049-525**.
- Telefone operacional informado: **(48) 98457-7422**.
- Telefone constante no cartão CNPJ: **(48) 8457-7422**. Divergência ainda precisa ser reconciliada.
- E-mail constante no cartão CNPJ: **dscamila@hotmail.com**.
- Rede social informada: **@djedevaldo**; confirmar plataforma e endereço completo.
- O cartão CNPJ apresentado não exibe nome fantasia. EQUIPESOM deve ser tratada como marca comercial; eventual atualização oficial será discutida com a contabilidade.

## 3. História e posicionamento

A empresa atua oficialmente desde 2013, mas a ligação de Edevaldo com música e som começou na adolescência. Nos primeiros anos, a atuação concentrou-se em casamentos, festas de 15 anos e eventos diversos. Depois da pandemia, o foco se fortaleceu em campeonatos de surf, conectando a operação profissional à paixão de Edevaldo pelo surfe e pela música.

Pilares definidos por Camila:

- **Qualidade**
- **Comprometimento**
- **Parceria**

Essência identificada: **paixão pelo som e cuidado verdadeiro com cada entrega**.

A marca não deve transmitir amadorismo, improviso, desorganização, descuido, aparência genérica/barata, frieza ou distanciamento. O visual deve ser profissional e tecnicamente confiável, mas humano e próximo.

## 4. Problema que originou o produto

As propostas são feitas manualmente no Word. Camila precisa inserir dados, equipamentos, imagens e identidade visual a cada novo evento. O processo depende de notebook, consome tempo, varia de documento para documento e dificulta enviar uma proposta profissional imediatamente pelo celular.

O objetivo inicial é permitir que Camila ou Edevaldo preencham campos e obtenham um PDF padronizado em poucos instantes. O documento poderá ser assinado digitalmente fora do aplicativo no primeiro ciclo. A visão futura é oferecer o sistema a outras empresas com necessidades semelhantes.

## 5. Visão do produto

Aplicativo web responsivo, com prioridade para uso no celular, capaz de:

1. cadastrar empresa, usuários e clientes;
2. registrar evento, datas, local e logística;
3. selecionar equipamentos e serviços;
4. montar preço e condições;
5. gerar proposta profissional em PDF;
6. controlar número, status e versões;
7. registrar assinatura do fornecedor e aceite do cliente separadamente;
8. gerar contrato e ordem de serviço em etapas futuras.

## 6. Princípios de arquitetura já definidos

- Multiempresa desde o início, com isolamento por `tenant_id`.
- Validar primeiro com a EQUIPESOM sem tornar suas regras universais.
- Usuário e empresa são entidades diferentes, ligadas por vínculo e papel.
- Dados estruturados são independentes do layout visual.
- Modelos de proposta possuem versões próprias.
- Uma proposta emitida é imutável; alteração gera nova versão.
- Itens da proposta guardam uma fotografia histórica dos dados exibidos.
- Regras de preço possuem vigência, escopo e possibilidade de exceção justificada.
- Cláusulas possuem biblioteca e versão; publicação depende de revisão jurídica.
- Assinatura do fornecedor não equivale a aceite do cliente.
- Contrato e ordem de serviço derivam da versão aceita.
- Trilha de auditoria é obrigatória para ações sensíveis.

## 7. MVP

MVP significa Produto Mínimo Viável: a menor versão utilizável que resolve o problema principal com qualidade.

Escopo recomendado do MVP:

- login administrativo;
- usuários individuais, mesmo que a interface mostre apenas o perfil Administrador;
- cadastro mestre da empresa;
- cadastro de clientes e contatos autorizados;
- cadastro de evento;
- catálogo de equipamentos e serviços;
- composição de escopo e preço;
- condições comerciais;
- dois modelos de proposta, um compacto e um institucional;
- geração de PDF com número e versão;
- histórico de propostas e status;
- registro de quem criou, revisou e emitiu.

Fora do primeiro MVP, salvo revisão: automação jurídica completa, assinatura eletrônica integrada, financeiro completo, agenda avançada, inteligência artificial para escolher imagens, múltiplos perfis visíveis e marketplace.

## 8. Processo atual

1. Edevaldo recebe a solicitação, geralmente por WhatsApp.
2. Camila e Edevaldo definem escopo e preço.
3. Ambos revisam.
4. Edevaldo assina.
5. Edevaldo envia o PDF.
6. O contratante confirma ou apresenta a autorização necessária.
7. A EQUIPESOM executa o evento.
8. O pagamento vence após o evento.

O processo futuro desejado é:

`solicitação → proposta → revisão → emissão → aceite → contrato → ordem de serviço → execução`

## 9. Regras comerciais confirmadas ou em uso

- Campeonato de surf costuma partir de R$ 1.000 por dia, mas isso é sugestão, não regra fixa.
- Documentos históricos mostram diárias equivalentes de R$ 1.000, R$ 1.500 e R$ 2.700.
- Deslocamento atual: sem acréscimo em Florianópolis e R$ 250 fora do município; modelar como regra geográfica configurável.
- Descontos: somente Edevaldo autoriza.
- Validade padrão da proposta: 30 dias, configurável.
- Pagamento: até 5 dias úteis após a data final do evento. O PDF deve exibir o vencimento calculado.
- Sinal: pode existir em eventos grandes, mas critérios ainda não foram definidos.
- Alimentação: geralmente fornecida no local; precisa ser condição configurável.
- Hospedagem: depende do evento.
- Horas extras: o dia geralmente é fechado, mas o produto precisa suportar limite e cobrança.
- Montagem antecipada: possível e deve ser um serviço opcional.
- Impostos: não assumir “sem imposto”; tratamento depende de validação contábil.

## 10. Serviços e responsabilidades atuais

Responsabilidade principal da EQUIPESOM: transporte próprio, montagem, desmontagem, operação técnica, passagem de som, deslocamento e produção.

Responsabilidade ainda descrita como compartilhada ou variável: suporte durante o evento, alimentação, horas adicionais, visita técnica, locação de estruturas e serviços terceirizados.

Hospedagem depende do evento. Energia, acesso e segurança do local foram indicados como responsabilidade do contratante/local, mas os textos precisam de definição técnica e revisão jurídica.

## 11. Eventos atendidos

- campeonato de surf;
- evento público;
- evento privado;
- evento corporativo;
- evento com banda;
- evento de vários dias;
- evento externo;
- evento em local fechado;
- festa de 15 anos;
- evento emergencial;
- evento com estrutura de terceiros.

O tipo de evento deve sugerir perguntas, alertas e pacotes editáveis. Não deve impor uma lista fixa de equipamentos.

## 12. Exceções importantes

O aplicativo deverá suportar chuva/vento, mudança de local ou data, cancelamento, atraso, item adicional, falta de energia, acesso difícil, dano/furto, mudança de dias, solicitação após assinatura, substituição de equipamento e cliente público sem empenho ou ordem de serviço.

Política atual de cancelamento mencionada: aviso prévio de 48 horas. Consequência financeira, força maior, remarcação e custos incorridos ainda precisam ser definidos e revisados juridicamente.

## 13. Clientes públicos

Prefeituras frequentemente solicitam três orçamentos para seus processos, mas isso não deve ser hardcoded como regra universal. O produto precisa permitir checklist e documentos configuráveis por órgão, como empenho, autorização de compra e ordem de serviço.

## 14. Identidade, domínio e e-mail

- Não existe logotipo ou fonte oficial.
- Direção de cores: praia e verão, sem caricatura e com contraste adequado para impressão.
- Fotos próprias foram solicitadas; ainda é necessário confirmar recebimento, autoria e autorização.
- Domínio desejado: `equipesom.com.br`. Camila informou que estava disponível e pretendia registrar; confirmar se o registro foi concluído.
- Endereço institucional desejado: `contato@equipesom.com.br`.
- Caixa pessoal proposta: `edevaldo@equipesom.com.br`.
- `camila@equipesom.com.br` permanece uma decisão operacional.
- `contato@` não deve usar senha compartilhada; deve ser alias ou caixa compartilhada direcionada às pessoas responsáveis.
- O futuro SaaS deverá possuir marca e domínio diferentes de EQUIPESOM.

## 15. Documentos analisados

1. `ORCAMENTO_KIDS_AND_KINGS.pdf`
2. `Orcamento1_-_CONFEDERACAO_BRASILEIRA_DE_SURF_assinado.pdf`
3. `ORCAMENTO_Lista de Equipamentos.pdf`
4. `ORCAMENTO_JOAQUINA_assinado.pdf`
5. `ORCAMENTO_EVENTO_MORRO_DAS_PEDRAS_assinado.pdf`
6. `CARTAO CNPJ EDEVALDO.pdf`

Constatações:

- três propostas possuem campo de assinatura digital;
- quatro possuem valor total;
- nenhuma comprova aceite do cliente;
- nenhuma usa número e versão de proposta;
- EQUIPESOM/EQUIPSOM e dados cadastrais aparecem de modo inconsistente;
- `ORCAMENTO_Lista de Equipamentos.pdf` possui maior impacto visual por usar foto de praia, mas não é uma proposta completa.

## 16. Inventário inicial recebido em 03/08/2026

O levantamento inicial contém som, iluminação, energia e sinalização. Ele foi estruturado na planilha v0.2.0 e no CSV do pacote.

Divergências prioritárias:

- cabeçalho informa seis caixas de 15 polegadas, enquanto as linhas listam 14 caixas ativas, duas EON 615 e dois subs;
- Smart Vux 08 Pro pode corresponder ao SmartVox SV8PRO dos documentos históricos;
- Mak Áudio/Mark Audio precisa de confirmação;
- Equalizador de 32 bandas diverge da descrição histórica FBQ 31 Band;
- kits de microfone “duplo” precisam separar kits, receptores e transmissores;
- “Delanha Metaltex” está pouco legível;
- itens históricos como amplificadores, line array, racks, talhas e tripés ainda não aparecem na lista inicial.

Ausência na lista não significa indisponibilidade. Nenhum cálculo de disponibilidade deve ser feito antes da reconciliação.

## 17. Próximo marco

### Gate 1 — Fechar a base operacional

- concluir inventário físico;
- fotografar etiquetas dos itens duvidosos;
- informar estado, propriedade e disponibilidade;
- reconciliar itens das propostas antigas;
- confirmar domínio e fotos;
- definir sinal, cancelamento/remarcação e tratamento contábil.

### Gate 2 — Modelo de Dados e Fluxos v0.2

Depois do Gate 1, desenhar e aprovar entidades, campos, estados, permissões, versionamento e os fluxos do MVP antes da programação completa.

## 18. Postura esperada do Codex

O Codex deve trabalhar como desenvolvedor e parceiro de produto, não como aprovador automático. Deve questionar dados contraditórios, separar decisão de hipótese, preservar escalabilidade, explicar riscos sem jargão e impedir que regras informais frágeis virem limitações permanentes do sistema.
