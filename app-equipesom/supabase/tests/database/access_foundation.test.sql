begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(27);

insert into public.roles (id, code, name, scope)
values ('30000000-0000-4000-8000-000000000001', 'tenant_admin', 'Administrador do tenant', 'tenant');

insert into public.tenants (id, name)
values
  ('20000000-0000-4000-8000-000000000001', 'Tenant Fictício Alfa'),
  ('20000000-0000-4000-8000-000000000002', 'Tenant Fictício Beta');

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) values
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-4000-8000-000000000001',
    'authenticated',
    'authenticated',
    'user-one@example.invalid',
    crypt('Fictitious1!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Usuário Fictício Um"}',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-4000-8000-000000000002',
    'authenticated',
    'authenticated',
    'user-two@example.invalid',
    crypt('Fictitious2!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Usuário Fictício Dois"}',
    now(),
    now()
  );

insert into public.memberships (id, user_id, tenant_id, role_id)
values
  (
    '40000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000001'
  ),
  (
    '40000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000002',
    '30000000-0000-4000-8000-000000000001'
  );

insert into public.proposal_probe (id, tenant_id, title, created_by)
values
  (
    '50000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'Proposta fictícia Alfa',
    '10000000-0000-4000-8000-000000000001'
  ),
  (
    '50000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000002',
    'Proposta fictícia Beta',
    '10000000-0000-4000-8000-000000000002'
  );

select has_table('public', 'tenants', 'Modela tenant separadamente');
select has_table('public', 'app_users', 'Modela identidade de aplicação separadamente');
select has_table('public', 'memberships', 'Modela vínculo separadamente');
select has_table('public', 'roles', 'Modela papel separadamente');
select has_table('public', 'invitations', 'Modela convite separadamente');
select has_table('public', 'commercial_activations', 'Modela ativação comercial separadamente');

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated","email":"user-one@example.invalid","session_id":"60000000-0000-4000-8000-000000000001"}',
  true
);

select is((select count(*)::integer from public.tenants), 1, 'Usuário Um enxerga somente o próprio tenant');
select is((select min(name) from public.tenants), 'Tenant Fictício Alfa', 'Tenant Alfa é a única fronteira visível');
select is((select count(*)::integer from public.proposal_probe), 1, 'RLS isola os registros de negócio do Tenant Alfa');
select lives_ok(
  $$insert into public.proposal_probe (tenant_id, title, created_by)
    values ('20000000-0000-4000-8000-000000000001', 'Nova Alfa', '10000000-0000-4000-8000-000000000001')$$,
  'Inserção no próprio tenant é permitida'
);
select throws_like(
  $$insert into public.proposal_probe (tenant_id, title, created_by)
    values ('20000000-0000-4000-8000-000000000002', 'Ataque cruzado', '10000000-0000-4000-8000-000000000001')$$,
  '%row-level security%',
  'Inserção em outro tenant é negada'
);
select throws_like(
  $$update public.proposal_probe
    set tenant_id = '20000000-0000-4000-8000-000000000002'
    where id = '50000000-0000-4000-8000-000000000001'$$,
  '%row-level security%',
  'Adulteração de tenant_id é negada'
);

reset role;
select set_config('request.jwt.claims', '', true);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000002","role":"authenticated","email":"user-two@example.invalid","session_id":"60000000-0000-4000-8000-000000000002"}',
  true
);
select is((select min(name) from public.tenants), 'Tenant Fictício Beta', 'Usuário Dois enxerga somente o Tenant Beta');

reset role;
update public.memberships
set status = 'suspended'
where id = '40000000-0000-4000-8000-000000000002';

set local role authenticated;
select is((select count(*)::integer from public.tenants), 0, 'Vínculo suspenso bloqueia o AppShell/tenant');
select lives_ok(
  $$insert into public.signup_requests (user_id, requested_company_name)
    values ('10000000-0000-4000-8000-000000000002', 'Empresa Fictícia Solicitante')$$,
  'Cadastro direto pode criar solicitação comercial sem liberar tenant'
);

reset role;
select is(
  (select count(*)::integer from public.memberships where user_id = '10000000-0000-4000-8000-000000000002' and status = 'active'),
  0,
  'Cadastro direto não cria vínculo ativo'
);
update public.memberships
set status = 'active'
where id = '40000000-0000-4000-8000-000000000002';

insert into public.session_revocations (session_id, user_id, reason)
values (
  '60000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001',
  'Revogação fictícia para a prova'
);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated","email":"user-one@example.invalid","session_id":"60000000-0000-4000-8000-000000000001"}',
  true
);
select is((select count(*)::integer from public.tenants), 0, 'Sessão revogada perde acesso imediatamente no banco');

reset role;
insert into public.invitations (
  id, tenant_id, role_id, email, token_hash, expires_at
) values
  (
    '70000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000001',
    'user-two@example.invalid',
    encode(digest('valid-fictitious-token', 'sha256'), 'hex'),
    now() + interval '1 day'
  ),
  (
    '70000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000001',
    'user-two@example.invalid',
    encode(digest('expired-fictitious-token', 'sha256'), 'hex'),
    now() - interval '1 minute'
  ),
  (
    '70000000-0000-4000-8000-000000000003',
    '20000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000001',
    'user-two@example.invalid',
    encode(digest('revoked-fictitious-token', 'sha256'), 'hex'),
    now() + interval '1 day'
  );
update public.invitations
set status = 'revoked', revoked_at = now()
where id = '70000000-0000-4000-8000-000000000003';

select isnt(
  (select token_hash from public.invitations where id = '70000000-0000-4000-8000-000000000001'),
  'valid-fictitious-token',
  'Convite persiste somente o hash, não o token em texto'
);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000002","role":"authenticated","email":"email-alterado@example.invalid","session_id":"60000000-0000-4000-8000-000000000002"}',
  true
);
select throws_ok(
  $$select public.accept_invitation('valid-fictitious-token')$$,
  '42501',
  'INVITATION_NOT_USABLE',
  'Convite não pode ser usado por outro e-mail'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000002","role":"authenticated","email":"user-two@example.invalid","session_id":"60000000-0000-4000-8000-000000000002"}',
  true
);
select is(
  public.accept_invitation('valid-fictitious-token'),
  '20000000-0000-4000-8000-000000000001'::uuid,
  'Convite válido cria acesso ao tenant vinculado'
);
select throws_ok(
  $$select public.accept_invitation('valid-fictitious-token')$$,
  '42501',
  'INVITATION_NOT_USABLE',
  'Convite aceito não pode ser reutilizado'
);
select throws_ok(
  $$select public.accept_invitation('expired-fictitious-token')$$,
  '42501',
  'INVITATION_NOT_USABLE',
  'Convite expirado é negado'
);
select throws_ok(
  $$select public.accept_invitation('revoked-fictitious-token')$$,
  '42501',
  'INVITATION_NOT_USABLE',
  'Convite revogado é negado'
);
select is(
  (select count(*)::integer from public.tenants),
  2,
  'Após o convite, o Usuário Dois vê os dois vínculos autorizados'
);

reset role;
select is(
  (select count(*)::integer from public.audit_events where event_type = 'invitation.accepted'),
  1,
  'Aceite do convite gera evento auditável'
);
update public.memberships
set status = 'ended'
where user_id = '10000000-0000-4000-8000-000000000002'
  and tenant_id = '20000000-0000-4000-8000-000000000001';

set local role authenticated;
select is(
  (select count(*)::integer from public.tenants where id = '20000000-0000-4000-8000-000000000001'),
  0,
  'Revogação do vínculo remove o acesso ao tenant convidado'
);
select is(
  (select count(*)::integer from public.tenants where id = '20000000-0000-4000-8000-000000000002'),
  1,
  'Revogação em um tenant não remove o vínculo ativo do outro'
);

reset role;
select * from finish();
rollback;
