begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(10);

insert into public.roles (id, code, name, scope)
values ('32000000-0000-4000-8000-000000000001', 'local_auth_test_admin', 'Papel fictício', 'tenant');

insert into public.tenants (id, name)
values
  ('22000000-0000-4000-8000-000000000001', 'Tenant Fictício Acesso A'),
  ('22000000-0000-4000-8000-000000000002', 'Tenant Fictício Acesso B');

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '00000000-0000-0000-0000-000000000000',
  '12000000-0000-4000-8000-000000000001',
  'authenticated', 'authenticated', 'auth-context@example.invalid',
  crypt('Fictitious1!', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Pessoa Fictícia"}', now(), now()
);

select has_function('public', 'current_access_context', ARRAY[]::text[], 'Contexto é função explícita');
select is(
  has_function_privilege('anon', 'public.current_access_context()', 'EXECUTE'),
  false,
  'Usuário anônimo não executa o contexto'
);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"12000000-0000-4000-8000-000000000001","role":"authenticated","email":"auth-context@example.invalid","session_id":"62000000-0000-4000-8000-000000000001"}',
  true
);
select is(
  (public.current_access_context() -> 'user' ->> 'id')::uuid,
  '12000000-0000-4000-8000-000000000001'::uuid,
  'Sessão ativa identifica a pessoa'
);
select is(
  jsonb_array_length(public.current_access_context() -> 'memberships'),
  0,
  'Identidade sem vínculo não ganha tenant'
);
select is((select count(*)::integer from public.tenants), 0, 'Sem vínculo não há tenant legível');

reset role;
insert into public.memberships (user_id, tenant_id, role_id)
values (
  '12000000-0000-4000-8000-000000000001',
  '22000000-0000-4000-8000-000000000001',
  '32000000-0000-4000-8000-000000000001'
);

set local role authenticated;
select is(
  jsonb_array_length(public.current_access_context() -> 'memberships'),
  1,
  'Vínculo ativo retorna somente um tenant'
);
select is(
  public.current_access_context() -> 'memberships' -> 0 ->> 'tenantName',
  'Tenant Fictício Acesso A',
  'Contexto não retorna o tenant B'
);
select is((select count(*)::integer from public.tenants), 1, 'RLS coincide com o contexto de acesso');

reset role;
update public.memberships set status = 'suspended'
where user_id = '12000000-0000-4000-8000-000000000001';
set local role authenticated;
select is(
  jsonb_array_length(public.current_access_context() -> 'memberships'),
  0,
  'Vínculo suspenso remove tenant do contexto'
);

reset role;
insert into public.session_revocations (session_id, user_id, reason)
values (
  '62000000-0000-4000-8000-000000000001',
  '12000000-0000-4000-8000-000000000001',
  'Revogação fictícia B1'
);
set local role authenticated;
select is(public.current_access_context() is null, true, 'Sessão revogada não possui contexto');

select * from finish();
rollback;
