# Especificação verificável de ambientes e retomada do backend — v0.2

Data: 16/09/2026  
Estado: diretrizes atualizadas por Camila; critérios de implantação ainda pendentes

Esta versão sucede a v0.1 sem apagá-la. Mantém suas exigências de isolamento, promoção, backup e reversão, mas corrige três premissas após a manifestação de Camila nesta conversa: ela é a única administradora das chaves e autorizações de pessoas; a **futura homologação poderá usar dados reais durante testes em fases**; e AWS é uma intenção de hospedagem posterior, sem orçamento ou serviço escolhido agora. Nenhuma dessas decisões autoriza criar recursos, transferir dados ou publicar o sistema nesta etapa.

## 1. Situação verificável e prioridade

- A prova Supabase/PostgreSQL exclusivamente local aplicou a migração de identidade/tenant e passou nas 27 asserções originais com `ROLLBACK`.
- A primeira fatia local do backend de propostas separa `proposals`, `proposal_drafts` e `proposal_versions`; a migração `20260916160000_proposal_backend_foundation.sql` foi aplicada no mesmo banco local. A suíte completa passou com 46 asserções, e a consulta posterior encontrou zero tenants, usuários, propostas, rascunhos e versões fictícios persistidos.
- A migração é experimental, não importa dados reais e ainda não implementa emissão, numeração, PDF, login, API operacional ou integração do frontend. A versão emitida já possui proteção contra `UPDATE` e `DELETE`; a criação de versão não é concedida diretamente ao usuário autenticado.
- Prioridade definida por Camila: desenvolver e validar o backend local por fatias antes de investir em nuvem ou habilitar o site. Não chamar a fundação atual de backend completo.

## 2. Ambientes e política de dados

| Ambiente | Estado agora | Dados permitidos na próxima fase, após o portão indicado |
|---|---|---|
| Local | Protótipo no navegador e banco técnico Supabase local, sem ligação entre eles | Dados do protótipo preservados; testes de banco continuam com massa fictícia e `ROLLBACK`. Importação de registros reais exige roteiro e aprovação próprios. |
| Homologação | Não criada | Pode receber dados reais selecionados para testes em fases, **somente depois** de identidade individual, isolamento por `tenant_id`, permissões, registro de acesso, backup/restauração e autorização de Camila para a lista concreta de dados. Dados sintéticos continuam necessários para testes negativos entre tenants. |
| Produção | Não criada | Dados reais e operação somente após aceite separado de segurança, restauração, reversão e publicação. Homologação com dados reais não equivale a produção aprovada. |

Dados reais de homologação não serão copiados automaticamente do `localStorage`, de PDFs históricos ou de produção. Antes de cada lote, Camila aprova origem, finalidade do teste, campos/arquivos necessários, pessoas com acesso, prazo de retenção, procedimento de retirada e reconciliação. Preservar o original e identificar o que é rascunho, emitido ou histórico. Não inventar aceite, assinatura, disponibilidade de equipamento ou condição comercial. O inventário incompleto não comprova disponibilidade.

## 3. Configuração e segurança

O contrato atual em `app-equipesom/config/environment-contract.json` distingue `local`, `homologation` e `production`, mas só o local existe. `VITE_APP_ENV` e `VITE_DATA_MODE` identificam o build; não autenticam nem autorizam pessoas. O backend deverá validar sessão, usuário, vínculo ativo, papel e tenant em todas as operações. A barreira atual do frontend permanece preventiva até essa conexão estar testada.

Cada ambiente futuro precisa de recursos e segredos próprios. Tokens administrativos, senha/URL privilegiada de banco e `service_role` ficam apenas sob custódia de Camila e em mecanismo server-side apropriado; nunca em variáveis `VITE_`, repositório, logs ou mensagens. Pessoas que venham a operar propostas terão identidades individuais e permissões concedidas por Camila, sem receber automaticamente administração da plataforma. O hostname `app.consolegroup.com.br` continua pretendido, sem verificação de propriedade, DNS, certificado ou publicação.

Supabase está comprovado como ferramenta da prova local e poderá sustentar as próximas fatias locais. Isso não decide sozinho se o backend final continuará no Supabase, será operado na AWS ou combinará serviços. Camila pretende investir futuramente em hospedagem AWS, mas não há orçamento, contratação, projeto ou definição de serviços nesta data. A decisão de infraestrutura virá antes de criar qualquer recurso hospedado; código, migrações e dados devem permanecer rastreáveis e exportáveis.

## 4. Administração e continuidade

Camila é a única administradora do sistema para chaves de acesso, concessão/revogação de pessoas e trocas de credenciais. Implementação técnica e execução de testes podem ser delegadas sem transferir essa autoridade. Edevaldo mantém responsabilidade operacional, assinatura e envio das propostas; isso não o torna administrador da plataforma nem libera desconto sem a regra aplicável.

O procedimento de backup ainda precisa cobrir separadamente banco, identidades, arquivos e configuração. Antes de usar dados reais em homologação: comprovar cópia recuperável, acesso restrito, teste de restauração em destino isolado e responsável pelo acionamento. Antes de produção: Camila define perda máxima tolerada (RPO), tempo máximo de recuperação (RTO), retenção, frequência e custo. A exportação SQL **de esquema** da prova local não é backup dos dados do produto. Nenhum comando destrutivo de reset ou exclusão constitui estratégia de reversão.

## 5. Portões e evidências de aceite

| Portão | Entrega verificável | Bloqueio se faltar |
|---|---|---|
| B1 — backend local de acesso | Login real de teste, sessão/revogação, perfil, vínculo e tenant obtidos do servidor; acesso sem sessão ou vínculo negado | Não conectar dados reais |
| B2 — backend local de propostas | Rascunho por tenant, versão imutável, numeração e emissão transacionais, auditoria de ator/valores/desconto, testes de concorrência | Não migrar proposta real nem substituir emissão do navegador |
| B3 — integração do site local | Telas ligadas ao backend com preservação dos dados atuais e plano de migração opt-in; testes em celular e regressão de PDF | Não desligar `localStorage` nem afirmar PDF oficial |
| H1 — homologação controlada | Recursos isolados autorizados; testes de acesso cruzado em API, banco e arquivos; backup/restauração; usuários individuais e lote real aprovado por Camila | Não carregar dados reais nem abrir acesso externo |
| P1 — produção | Restauração e reversão ensaiadas, custos e responsáveis aceitos, privacidade/retenção definidas, autorização específica de dados, DNS e publicação | Não operar clientes reais |

Os 46 testes pgTAP locais são evidência dos portões técnicos iniciais, não de B1–P1 completos. Cada portão registra versão de código e migração, massa de teste, resultado, falhas, responsável e aprovação. Falha de isolamento, imutabilidade, restauração ou auditoria bloqueia avanço.

**Promoção:** nunca transportar credencial, banco ou arquivo de um ambiente para outro por simples cópia. Migrações versionadas e artefatos identificados por hash devem ser reproduzidos no destino autorizado; dados reais só entram por lote revisado. **Reversão:** manter artefato anterior, backup, plano de correção compatível e reconciliação do que foi criado após a mudança. Não apagar versões emitidas, PDFs ou auditoria para simular retorno.

## 6. SMTP autenticado — trilha independente

A prova offline continua separada. Não executar conexão autenticada nem envio por causa deste plano. Credencial, confirmação de conexão e eventual envio exigem autorização específica de Camila; envio real também exige versão emitida, destinatário, arquivo e tenant correspondentes, com auditoria.

## 7. Próxima entrega e decisões ainda necessárias

A próxima entrega é **B1**, acesso funcional local com usuários fictícios, sem criar identidade real ou alterar a experiência atual de propostas até os testes passarem. Depois vêm B2, B3, H1 e P1 nessa ordem. Antes de conectar o frontend, Camila deverá confirmar se Supabase Auth será usado como implementação inicial local ou se prefere outro provedor; antes de qualquer hospedagem, decidir infraestrutura, custos e autorização dos recursos. Endereço de homologação, MFA, RPO/RTO e seleção dos dados reais podem ser definidos quando seus respectivos portões se aproximarem.

| Versão | Data | Alteração |
|---|---|---|
| 0.1 | 16/09/2026 | Primeira especificação de separação, preservada como histórico. |
| 0.2 | 16/09/2026 | Administração exclusiva de Camila, homologação futura com dados reais controlados, AWS como intenção posterior e retomada local do backend por portões. |
