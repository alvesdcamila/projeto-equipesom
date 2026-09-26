begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(34);

insert into public.roles (id, code, name, scope)
values ('32000000-0000-4000-8000-000000000001', 'b2_fake_role', 'Papel fictício B2', 'tenant');

insert into public.tenants (id, name)
values
  ('22000000-0000-4000-8000-000000000001', 'Tenant Fictício B2 A'),
  ('22000000-0000-4000-8000-000000000002', 'Tenant Fictício B2 B');

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000',
   '12000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated',
   'b2-a@example.invalid', crypt('FictitiousB2A!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000',
   '12000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated',
   'b2-b@example.invalid', crypt('FictitiousB2B!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{}', now(), now());

insert into public.memberships (user_id, tenant_id, role_id)
values
  ('12000000-0000-4000-8000-000000000001', '22000000-0000-4000-8000-000000000001', '32000000-0000-4000-8000-000000000001'),
  ('12000000-0000-4000-8000-000000000002', '22000000-0000-4000-8000-000000000002', '32000000-0000-4000-8000-000000000001');

insert into public.proposal_emission_settings (tenant_id, number_prefix, issue_timezone)
values
  ('22000000-0000-4000-8000-000000000001', 'EQ', 'UTC'),
  ('22000000-0000-4000-8000-000000000002', 'ZZ', 'UTC');

insert into public.proposals (id, tenant_id, created_by)
values
  ('52000000-0000-4000-8000-000000000001', '22000000-0000-4000-8000-000000000001', '12000000-0000-4000-8000-000000000001'),
  ('52000000-0000-4000-8000-000000000002', '22000000-0000-4000-8000-000000000001', '12000000-0000-4000-8000-000000000001'),
  ('52000000-0000-4000-8000-000000000003', '22000000-0000-4000-8000-000000000002', '12000000-0000-4000-8000-000000000002'),
  ('52000000-0000-4000-8000-000000000004', '22000000-0000-4000-8000-000000000001', '12000000-0000-4000-8000-000000000001');

insert into public.proposals (id, tenant_id, created_by)
values ('52000000-0000-4000-8000-000000000006',
  '22000000-0000-4000-8000-000000000001',
  '12000000-0000-4000-8000-000000000001');

insert into public.proposal_drafts (proposal_id, tenant_id, content, updated_by)
values
  ('52000000-0000-4000-8000-000000000001', '22000000-0000-4000-8000-000000000001',
   '{"client":{"name":"Cliente fictício"},"event":{"name":"Evento fictício"},"values":{"pricingModel":"percentage","currency":"BRL","baseValue":1000,"travelFee":250,"discountPercentage":10,"total":1},"conditions":{"validityDays":30}}',
   '12000000-0000-4000-8000-000000000001'),
  ('52000000-0000-4000-8000-000000000002', '22000000-0000-4000-8000-000000000001',
   '{"values":{"pricingModel":"percentage","currency":"BRL","baseValue":100,"travelFee":0,"discountPercentage":0},"conditions":{"validityDays":15}}',
   '12000000-0000-4000-8000-000000000001'),
  ('52000000-0000-4000-8000-000000000003', '22000000-0000-4000-8000-000000000002',
   '{"values":{"pricingModel":"percentage","currency":"BRL","baseValue":200,"travelFee":0,"discountPercentage":0},"conditions":{"validityDays":20}}',
   '12000000-0000-4000-8000-000000000002'),
  ('52000000-0000-4000-8000-000000000004', '22000000-0000-4000-8000-000000000001',
   '{"values":{"pricingModel":"percentage","currency":"BRL","baseValue":100,"travelFee":0,"discountPercentage":120},"conditions":{"validityDays":30}}',
   '12000000-0000-4000-8000-000000000001'),
  ('52000000-0000-4000-8000-000000000006', '22000000-0000-4000-8000-000000000001',
   '{"values":{"pricingModel":"percentage","currency":"BRL","baseValue":100,"travelFee":0,"discountPercentage":1.12345},"conditions":{"validityDays":30}}',
   '12000000-0000-4000-8000-000000000001');

select has_table('public', 'proposal_emission_settings', 'Configuração de emissão é separada por tenant');
select has_table('public', 'proposal_number_counters', 'Contador transacional é separado por tenant e ano');
select is(has_function_privilege('anon', 'public.issue_proposal_b2(uuid,uuid)', 'EXECUTE'), false,
  'Anônimo não pode executar emissão');
select is(has_table_privilege('authenticated', 'public.proposal_number_counters', 'UPDATE'), false,
  'Cliente não modifica contador diretamente');
select is(has_table_privilege('authenticated', 'public.proposal_versions', 'INSERT'), false,
  'Cliente não insere versão diretamente');

set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"12000000-0000-4000-8000-000000000001","role":"authenticated","session_id":"62000000-0000-4000-8000-000000000001"}', true);

select throws_ok(
  $$select public.issue_proposal_b2('22000000-0000-4000-8000-000000000001', '52000000-0000-4000-8000-000000000001')$$,
  '42501', 'B2_TEST_GATE_CLOSED', 'Emissão fica bloqueada por padrão');
select is((select count(*)::integer from public.proposal_versions), 0,
  'Portão fechado não cria versão');
select throws_ok(
  $$select public.issue_proposal_b2('22000000-0000-4000-8000-000000000002', '52000000-0000-4000-8000-000000000003')$$,
  '42501', 'ISSUE_NOT_AUTHORIZED', 'Usuário A não emite no tenant B');

reset role;
select set_config('request.jwt.claims', '', true);
update public.proposal_emission_settings set b2_test_enabled = true;

set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"12000000-0000-4000-8000-000000000001","role":"authenticated","session_id":"62000000-0000-4000-8000-000000000001"}', true);

select lives_ok(
  $$select public.issue_proposal_b2('22000000-0000-4000-8000-000000000001', '52000000-0000-4000-8000-000000000001')$$,
  'Primeira emissão fictícia conclui em uma transação');
select is((select official_number from public.proposals where id = '52000000-0000-4000-8000-000000000001'),
  'EQ-' || extract(year from now() at time zone 'UTC')::integer || '-0001',
  'Primeiro número usa prefixo e ano do tenant A');
select is((select version_number from public.proposal_versions where proposal_id = '52000000-0000-4000-8000-000000000001'),
  1, 'Primeira emissão cria a versão 1');
select is((select status from public.proposals where id = '52000000-0000-4000-8000-000000000001'),
  'issued', 'Proposta passa a emitida');
select results_eq(
  $$select base_amount, travel_amount, subtotal_amount, discount_percentage, discount_amount, total_amount
    from public.proposal_versions where proposal_id = '52000000-0000-4000-8000-000000000001'$$,
  $$values (1000.00::numeric, 250.00::numeric, 1250.00::numeric, 10.00::numeric, 125.00::numeric, 1125.00::numeric)$$,
  'Valores e desconto são fotografados pelo banco');
select is((select content_snapshot #>> '{values,total}' from public.proposal_versions
  where proposal_id = '52000000-0000-4000-8000-000000000001'),
  '1125.00', 'Total adulterado no rascunho é substituído');
select ok((select expires_on = ((issued_at at time zone 'UTC')::date + 30)
  from public.proposal_versions where proposal_id = '52000000-0000-4000-8000-000000000001'),
  'Validade final parte da data de emissão no fuso configurado');
select is((select issue_timezone from public.proposal_versions
  where proposal_id = '52000000-0000-4000-8000-000000000001'),
  'UTC', 'Versão preserva o fuso usado na emissão');
select ok((select snapshot_sha256 = encode(extensions.digest(content_snapshot::text, 'sha256'), 'hex')
  from public.proposal_versions where proposal_id = '52000000-0000-4000-8000-000000000001'),
  'Hash corresponde à fotografia imutável');
select is((select count(*)::integer from public.audit_events where event_type = 'proposal.issued.b2_test'),
  1, 'Emissão cria exatamente um evento de auditoria');
select ok((select actor_user_id = '12000000-0000-4000-8000-000000000001'
    and tenant_id = '22000000-0000-4000-8000-000000000001'
    and metadata ->> 'number' = 'EQ-' || extract(year from now() at time zone 'UTC')::integer || '-0001'
    and metadata ->> 'discount_approval_pending' = 'true'
  from public.audit_events where event_type = 'proposal.issued.b2_test'),
  'Auditoria identifica ator, tenant, número e aprovação pendente');
select throws_ok(
  $$select public.issue_proposal_b2('22000000-0000-4000-8000-000000000001', '52000000-0000-4000-8000-000000000001')$$,
  '23514', 'PROPOSAL_NOT_ISSUABLE', 'Reemissão da mesma proposta é rejeitada');
reset role;
select is((select last_number from public.proposal_number_counters
  where tenant_id = '22000000-0000-4000-8000-000000000001'),
  1, 'Reemissão rejeitada não consome número');
insert into public.proposals (id, tenant_id, created_by, official_number)
values (
  '52000000-0000-4000-8000-000000000005',
  '22000000-0000-4000-8000-000000000001',
  '12000000-0000-4000-8000-000000000001',
  'EQ-' || extract(year from now() at time zone 'UTC')::integer || '-0002'
);
set local role authenticated;
select throws_like(
  $$select public.issue_proposal_b2('22000000-0000-4000-8000-000000000001', '52000000-0000-4000-8000-000000000002')$$,
  '%duplicate key value violates unique constraint%',
  'Colisão tardia de número desfaz toda a emissão');
reset role;
select is((select last_number from public.proposal_number_counters
  where tenant_id = '22000000-0000-4000-8000-000000000001'),
  1, 'Falha tardia reverte incremento do contador');
select is((select count(*)::integer from public.proposal_versions
  where proposal_id = '52000000-0000-4000-8000-000000000002'),
  0, 'Falha tardia não deixa versão parcial');
delete from public.proposals where id = '52000000-0000-4000-8000-000000000005';
set local role authenticated;
select throws_ok(
  $$select public.issue_proposal_b2('22000000-0000-4000-8000-000000000001', '52000000-0000-4000-8000-000000000004')$$,
  '22023', 'B2_FINANCIAL_INPUT_INVALID', 'Percentual inválido bloqueia emissão');
select throws_ok(
  $$select public.issue_proposal_b2('22000000-0000-4000-8000-000000000001', '52000000-0000-4000-8000-000000000006')$$,
  '22023', 'B2_DISCOUNT_PRECISION_INVALID', 'Taxa além da precisão da fotografia é rejeitada');
select is((select count(*)::integer from public.audit_events where event_type = 'proposal.issued.b2_test'),
  1, 'Falha de valor não grava auditoria');
select lives_ok(
  $$select public.issue_proposal_b2('22000000-0000-4000-8000-000000000001', '52000000-0000-4000-8000-000000000002')$$,
  'Outra proposta do tenant A recebe próximo número');
select is((select issue_sequence from public.proposals where id = '52000000-0000-4000-8000-000000000002'),
  2, 'Sequência do tenant A avança para 2');

reset role;
select set_config('request.jwt.claims', '', true);
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"12000000-0000-4000-8000-000000000002","role":"authenticated","session_id":"62000000-0000-4000-8000-000000000002"}', true);
select lives_ok(
  $$select public.issue_proposal_b2('22000000-0000-4000-8000-000000000002', '52000000-0000-4000-8000-000000000003')$$,
  'Tenant B pode emitir somente sua proposta fictícia');
select is((select issue_sequence from public.proposals where id = '52000000-0000-4000-8000-000000000003'),
  1, 'Tenant B mantém sequência independente');

reset role;
select set_config('request.jwt.claims', '', true);
select throws_ok(
  $$update public.proposal_versions set total_amount = 1
    where proposal_id = '52000000-0000-4000-8000-000000000001'$$,
  '23514', 'ISSUED_VERSION_IMMUTABLE', 'Versão emitida não permite alterar valor');
select throws_ok(
  $$delete from public.proposal_versions
    where proposal_id = '52000000-0000-4000-8000-000000000001'$$,
  '23514', 'ISSUED_VERSION_IMMUTABLE', 'Versão emitida não permite exclusão');

update public.memberships set status = 'suspended'
where user_id = '12000000-0000-4000-8000-000000000001';
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"12000000-0000-4000-8000-000000000001","role":"authenticated","session_id":"62000000-0000-4000-8000-000000000001"}', true);
select throws_ok(
  $$select public.issue_proposal_b2('22000000-0000-4000-8000-000000000001', '52000000-0000-4000-8000-000000000004')$$,
  '42501', 'ISSUE_NOT_AUTHORIZED', 'Vínculo suspenso bloqueia emissão');

select * from finish();
rollback;
