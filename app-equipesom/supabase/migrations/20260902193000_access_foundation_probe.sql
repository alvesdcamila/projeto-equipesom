-- Prova técnica descartável aprovada por Camila em 02/09/2026.
-- Não constitui o esquema definitivo de produção nem autoriza cobrança ou publicação.

create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;
revoke all on schema private from public;

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  scope text not null check (scope in ('tenant', 'platform')),
  created_at timestamptz not null default now()
);

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'active' check (status in ('active', 'suspended', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- A senha permanece exclusivamente no Supabase Auth. Esta tabela é o perfil da aplicação.
create table public.app_users (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  status text not null default 'active' check (status in ('active', 'suspended', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  role_id uuid not null references public.roles(id),
  status text not null default 'active' check (status in ('invited', 'active', 'suspended', 'ended')),
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, tenant_id),
  check (valid_until is null or valid_until > valid_from)
);

-- O cadastro direto cria somente identidade e solicitação. Ele não escolhe nem ativa tenant.
create table public.signup_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.app_users(id) on delete cascade,
  requested_company_name text not null,
  status text not null default 'pending_commercial_activation'
    check (status in ('pending_commercial_activation', 'approved', 'rejected', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Cobrança não é implementada: esta entidade apenas preserva a separação da decisão comercial.
create table public.commercial_activations (
  id uuid primary key default gen_random_uuid(),
  signup_request_id uuid not null unique references public.signup_requests(id) on delete restrict,
  tenant_id uuid references public.tenants(id) on delete restrict,
  status text not null default 'pending' check (status in ('pending', 'active', 'suspended', 'revoked')),
  activation_method text check (activation_method in ('manual_approval', 'future_payment')),
  activated_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status <> 'active' or (tenant_id is not null and activated_at is not null))
);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  role_id uuid not null references public.roles(id),
  email text not null check (email = lower(btrim(email))),
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked', 'expired')),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  accepted_by uuid references public.app_users(id),
  revoked_at timestamptz,
  created_by uuid references public.app_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (status = 'pending' and accepted_at is null and accepted_by is null and revoked_at is null)
    or (status = 'accepted' and accepted_at is not null and accepted_by is not null and revoked_at is null)
    or (status = 'revoked' and accepted_at is null and accepted_by is null and revoked_at is not null)
    or (status = 'expired' and accepted_at is null and accepted_by is null and revoked_at is null)
  )
);

create table public.session_revocations (
  session_id uuid primary key,
  user_id uuid not null references public.app_users(id) on delete cascade,
  reason text not null,
  revoked_at timestamptz not null default now()
);

create table public.audit_events (
  id bigint generated always as identity primary key,
  tenant_id uuid references public.tenants(id) on delete restrict,
  actor_user_id uuid references public.app_users(id) on delete set null,
  event_type text not null,
  subject_type text not null,
  subject_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

-- Tabela mínima de negócio usada somente para comprovar a fronteira por tenant_id.
create table public.proposal_probe (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  title text not null,
  created_by uuid not null references public.app_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index memberships_active_lookup
  on public.memberships (user_id, tenant_id, status);
create index invitations_lookup
  on public.invitations (token_hash, status, expires_at);
create index proposal_probe_tenant
  on public.proposal_probe (tenant_id);
create index audit_events_tenant_time
  on public.audit_events (tenant_id, occurred_at desc);

create or replace function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.app_users (id, display_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_auth_user();

create or replace function private.current_session_id()
returns uuid
language sql
stable
set search_path = ''
as $$
  select case
    when coalesce(auth.jwt() ->> 'session_id', '') ~
      '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$'
    then (auth.jwt() ->> 'session_id')::uuid
    else null
  end;
$$;

create or replace function private.session_is_active()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid() is not null
    and private.current_session_id() is not null
    and exists (
      select 1
      from public.app_users u
      where u.id = auth.uid()
        and u.status = 'active'
    )
    and not exists (
      select 1
      from public.session_revocations r
      where r.session_id = private.current_session_id()
        and r.user_id = auth.uid()
    );
$$;

create or replace function private.has_active_membership(target_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.session_is_active()
    and exists (
      select 1
      from public.memberships m
      join public.tenants t on t.id = m.tenant_id
      join public.roles r on r.id = m.role_id and r.scope = 'tenant'
      where m.user_id = auth.uid()
        and m.tenant_id = target_tenant_id
        and m.status = 'active'
        and m.valid_from <= now()
        and (m.valid_until is null or m.valid_until > now())
        and t.status = 'active'
    );
$$;

create or replace function private.audit_invitation_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  event_name text;
begin
  event_name := case
    when tg_op = 'INSERT' then 'invitation.created'
    else 'invitation.' || new.status
  end;

  if tg_op = 'INSERT' or old.status is distinct from new.status then
    insert into public.audit_events (
      tenant_id,
      actor_user_id,
      event_type,
      subject_type,
      subject_id,
      metadata
    ) values (
      new.tenant_id,
      auth.uid(),
      event_name,
      'invitation',
      new.id,
      jsonb_build_object('email', new.email, 'expires_at', new.expires_at)
    );
  end if;

  return new;
end;
$$;

create trigger audit_invitation_changes
after insert or update on public.invitations
for each row execute function private.audit_invitation_change();

create or replace function public.accept_invitation(invitation_token text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  invitation_record public.invitations%rowtype;
begin
  if not private.session_is_active() then
    raise exception 'SESSION_NOT_ACTIVE' using errcode = '42501';
  end if;

  select i.*
    into invitation_record
  from public.invitations i
  where i.token_hash = encode(extensions.digest(invitation_token, 'sha256'), 'hex')
    and i.email = lower(auth.jwt() ->> 'email')
    and i.status = 'pending'
    and i.expires_at > now()
  for update;

  if not found then
    raise exception 'INVITATION_NOT_USABLE' using errcode = '42501';
  end if;

  insert into public.memberships (user_id, tenant_id, role_id, status)
  values (auth.uid(), invitation_record.tenant_id, invitation_record.role_id, 'active');

  update public.invitations
  set status = 'accepted',
      accepted_at = now(),
      accepted_by = auth.uid(),
      updated_at = now()
  where id = invitation_record.id;

  return invitation_record.tenant_id;
end;
$$;

alter table public.roles enable row level security;
alter table public.tenants enable row level security;
alter table public.app_users enable row level security;
alter table public.memberships enable row level security;
alter table public.signup_requests enable row level security;
alter table public.commercial_activations enable row level security;
alter table public.invitations enable row level security;
alter table public.session_revocations enable row level security;
alter table public.audit_events enable row level security;
alter table public.proposal_probe enable row level security;

create policy roles_visible_to_active_identity
on public.roles for select to authenticated
using (private.session_is_active());

create policy tenants_visible_through_membership
on public.tenants for select to authenticated
using (private.has_active_membership(id));

create policy users_can_view_own_profile
on public.app_users for select to authenticated
using (private.session_is_active() and id = auth.uid());

create policy users_can_view_own_memberships
on public.memberships for select to authenticated
using (private.session_is_active() and user_id = auth.uid());

create policy users_can_view_own_signup_request
on public.signup_requests for select to authenticated
using (private.session_is_active() and user_id = auth.uid());

create policy identities_can_request_commercial_activation
on public.signup_requests for insert to authenticated
with check (
  private.session_is_active()
  and user_id = auth.uid()
  and status = 'pending_commercial_activation'
);

create policy users_can_view_own_commercial_activation
on public.commercial_activations for select to authenticated
using (
  private.session_is_active()
  and exists (
    select 1
    from public.signup_requests request
    where request.id = signup_request_id
      and request.user_id = auth.uid()
  )
);

create policy tenant_members_can_view_audit
on public.audit_events for select to authenticated
using (tenant_id is not null and private.has_active_membership(tenant_id));

create policy tenant_members_can_view_probes
on public.proposal_probe for select to authenticated
using (private.has_active_membership(tenant_id));

create policy tenant_members_can_insert_probes
on public.proposal_probe for insert to authenticated
with check (private.has_active_membership(tenant_id) and created_by = auth.uid());

create policy tenant_members_can_update_probes
on public.proposal_probe for update to authenticated
using (private.has_active_membership(tenant_id))
with check (private.has_active_membership(tenant_id));

create policy tenant_members_can_delete_probes
on public.proposal_probe for delete to authenticated
using (private.has_active_membership(tenant_id));

revoke all on all tables in schema public from anon, authenticated;
revoke all on all functions in schema private from public, anon, authenticated;
revoke all on function public.accept_invitation(text) from public, anon;

grant usage on schema public, private to authenticated;
grant execute on function private.current_session_id() to authenticated;
grant execute on function private.session_is_active() to authenticated;
grant execute on function private.has_active_membership(uuid) to authenticated;
grant execute on function public.accept_invitation(text) to authenticated;

grant select on public.roles to authenticated;
grant select on public.tenants to authenticated;
grant select on public.app_users to authenticated;
grant select on public.memberships to authenticated;
grant select, insert on public.signup_requests to authenticated;
grant select on public.commercial_activations to authenticated;
grant select on public.audit_events to authenticated;
grant select, insert, update, delete on public.proposal_probe to authenticated;

revoke all on public.invitations from anon, authenticated;
revoke all on public.session_revocations from anon, authenticated;
