begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(19);

insert into public.roles (id, code, name, scope)
values ('31000000-0000-4000-8000-000000000001', 'proposal_tenant_admin', 'Admin fictício', 'tenant');

insert into public.tenants (id, name)
values
  ('21000000-0000-4000-8000-000000000001', 'Tenant Fictício Propostas A'),
  ('21000000-0000-4000-8000-000000000002', 'Tenant Fictício Propostas B');

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  (
    '00000000-0000-0000-0000-000000000000',
    '11000000-0000-4000-8000-000000000001',
    'authenticated', 'authenticated', 'proposal-one@example.invalid',
    crypt('Fictitious1!', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '11000000-0000-4000-8000-000000000002',
    'authenticated', 'authenticated', 'proposal-two@example.invalid',
    crypt('Fictitious2!', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now()
  );

insert into public.memberships (user_id, tenant_id, role_id)
values
  ('11000000-0000-4000-8000-000000000001', '21000000-0000-4000-8000-000000000001', '31000000-0000-4000-8000-000000000001'),
  ('11000000-0000-4000-8000-000000000002', '21000000-0000-4000-8000-000000000002', '31000000-0000-4000-8000-000000000001');

insert into public.proposals (id, tenant_id, created_by, status)
values
  ('51000000-0000-4000-8000-000000000001', '21000000-0000-4000-8000-000000000001', '11000000-0000-4000-8000-000000000001', 'draft'),
  ('51000000-0000-4000-8000-000000000002', '21000000-0000-4000-8000-000000000002', '11000000-0000-4000-8000-000000000002', 'draft'),
  ('51000000-0000-4000-8000-000000000003', '21000000-0000-4000-8000-000000000001', '11000000-0000-4000-8000-000000000001', 'issued');

insert into public.proposal_drafts (proposal_id, tenant_id, content, updated_by)
values
  ('51000000-0000-4000-8000-000000000001', '21000000-0000-4000-8000-000000000001', '{"title":"Rascunho fictício A"}', '11000000-0000-4000-8000-000000000001'),
  ('51000000-0000-4000-8000-000000000002', '21000000-0000-4000-8000-000000000002', '{"title":"Rascunho fictício B"}', '11000000-0000-4000-8000-000000000002');

insert into public.proposal_versions (
  id, proposal_id, tenant_id, version_number, content_snapshot, issued_by, issued_at
) values (
  '61000000-0000-4000-8000-000000000001',
  '51000000-0000-4000-8000-000000000003',
  '21000000-0000-4000-8000-000000000001',
  1,
  '{"title":"Versão fictícia A"}',
  '11000000-0000-4000-8000-000000000001',
  now()
);

select has_table('public', 'proposals', 'Proposta tem identidade própria');
select has_table('public', 'proposal_drafts', 'Rascunho é separado da proposta');
select has_table('public', 'proposal_versions', 'Versão emitida é separada do rascunho');
select is(
  (select count(*)::integer from pg_policies where schemaname = 'public' and tablename in ('proposals', 'proposal_drafts', 'proposal_versions')),
  6,
  'As três tabelas possuem políticas explícitas de acesso'
);
select is(
  has_table_privilege('authenticated', 'public.proposal_versions', 'INSERT'),
  false,
  'Cliente autenticado não insere versão emitida diretamente'
);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"11000000-0000-4000-8000-000000000001","role":"authenticated","email":"proposal-one@example.invalid","session_id":"61000000-0000-4000-8000-000000000011"}',
  true
);

select is((select count(*)::integer from public.proposals), 2, 'Usuário A vê apenas propostas do seu tenant');
select is((select count(*)::integer from public.proposal_drafts), 1, 'Usuário A vê apenas rascunhos do seu tenant');
select is((select count(*)::integer from public.proposal_versions), 1, 'Usuário A vê apenas versões do seu tenant');
select lives_ok(
  $$insert into public.proposals (id, tenant_id, created_by)
    values ('51000000-0000-4000-8000-000000000004', '21000000-0000-4000-8000-000000000001', '11000000-0000-4000-8000-000000000001')$$,
  'Usuário A pode criar proposta em rascunho no próprio tenant'
);
select lives_ok(
  $$insert into public.proposal_drafts (proposal_id, tenant_id, content, updated_by)
    values ('51000000-0000-4000-8000-000000000004', '21000000-0000-4000-8000-000000000001', '{"title":"Novo rascunho fictício"}', '11000000-0000-4000-8000-000000000001')$$,
  'Usuário A pode salvar rascunho em proposta do próprio tenant'
);
select throws_like(
  $$insert into public.proposals (tenant_id, created_by)
    values ('21000000-0000-4000-8000-000000000002', '11000000-0000-4000-8000-000000000001')$$,
  '%row-level security%',
  'Usuário A não cria proposta no tenant B'
);
select throws_like(
  $$insert into public.proposal_drafts (proposal_id, tenant_id, content, updated_by)
    values ('51000000-0000-4000-8000-000000000002', '21000000-0000-4000-8000-000000000002', '{"title":"Ataque cruzado"}', '11000000-0000-4000-8000-000000000001')$$,
  '%row-level security%',
  'Usuário A não salva rascunho no tenant B'
);
select lives_ok(
  $$update public.proposal_drafts
    set content = '{"title":"Revisão fictícia"}', updated_by = '11000000-0000-4000-8000-000000000001'
    where proposal_id = '51000000-0000-4000-8000-000000000001'$$,
  'Rascunho do tenant A pode ser revisado'
);
select throws_ok(
  $$update public.proposal_drafts
    set tenant_id = '21000000-0000-4000-8000-000000000002'
    where proposal_id = '51000000-0000-4000-8000-000000000001'$$,
  '23514',
  'PROPOSAL_DRAFT_IDENTITY_IMMUTABLE',
  'Rascunho não pode trocar de tenant'
);

reset role;
select set_config('request.jwt.claims', '', true);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"11000000-0000-4000-8000-000000000002","role":"authenticated","email":"proposal-two@example.invalid","session_id":"61000000-0000-4000-8000-000000000012"}',
  true
);
select is((select count(*)::integer from public.proposals), 1, 'Usuário B vê apenas proposta do tenant B');

reset role;
select set_config('request.jwt.claims', '', true);
set local role authenticated;
select is((select count(*)::integer from public.proposals), 0, 'Sem sessão não há propostas visíveis');

reset role;
update public.memberships
set status = 'suspended'
where user_id = '11000000-0000-4000-8000-000000000002';
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"11000000-0000-4000-8000-000000000002","role":"authenticated","email":"proposal-two@example.invalid","session_id":"61000000-0000-4000-8000-000000000012"}',
  true
);
select is((select count(*)::integer from public.proposals), 0, 'Vínculo suspenso remove acesso às propostas');

reset role;
select set_config('request.jwt.claims', '', true);
select throws_ok(
  $$update public.proposal_versions
    set content_snapshot = '{"title":"Alterada"}'
    where id = '61000000-0000-4000-8000-000000000001'$$,
  '23514',
  'ISSUED_VERSION_IMMUTABLE',
  'Versão emitida não pode ser alterada'
);
select throws_ok(
  $$delete from public.proposal_versions
    where id = '61000000-0000-4000-8000-000000000001'$$,
  '23514',
  'ISSUED_VERSION_IMMUTABLE',
  'Versão emitida não pode ser apagada'
);

select * from finish();
rollback;
