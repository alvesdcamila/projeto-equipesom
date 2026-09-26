-- Primeira fatia local do backend de propostas, solicitada por Camila em 16/09/2026.
-- Esquema experimental: não importa dados do navegador nem autoriza emissão operacional.

create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  created_by uuid not null references public.app_users(id) on delete restrict,
  status text not null default 'draft' check (status in ('draft', 'issued')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, tenant_id)
);

create table public.proposal_drafts (
  proposal_id uuid primary key,
  tenant_id uuid not null,
  content jsonb not null default '{}'::jsonb check (jsonb_typeof(content) = 'object'),
  updated_by uuid not null references public.app_users(id) on delete restrict,
  updated_at timestamptz not null default now(),
  foreign key (proposal_id, tenant_id) references public.proposals(id, tenant_id) on delete restrict
);

create table public.proposal_versions (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null,
  tenant_id uuid not null,
  version_number integer not null check (version_number > 0),
  content_snapshot jsonb not null check (jsonb_typeof(content_snapshot) = 'object'),
  issued_by uuid not null references public.app_users(id) on delete restrict,
  issued_at timestamptz not null,
  created_at timestamptz not null default now(),
  foreign key (proposal_id, tenant_id) references public.proposals(id, tenant_id) on delete restrict,
  unique (proposal_id, version_number)
);

create index proposals_tenant_created_at on public.proposals (tenant_id, created_at desc);
create index proposal_versions_tenant_proposal on public.proposal_versions (tenant_id, proposal_id);

-- Identidade e tenant da linha não podem ser deslocados para contornar a fronteira RLS.
create or replace function private.prevent_proposal_identity_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.proposal_id is distinct from old.proposal_id
    or new.tenant_id is distinct from old.tenant_id then
    raise exception 'PROPOSAL_DRAFT_IDENTITY_IMMUTABLE' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger proposal_draft_identity_immutable
before update on public.proposal_drafts
for each row execute function private.prevent_proposal_identity_change();

-- Versões emitidas não são editadas ou excluídas, inclusive por rotinas privilegiadas comuns.
create or replace function private.prevent_proposal_version_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'ISSUED_VERSION_IMMUTABLE' using errcode = '23514';
end;
$$;

create trigger proposal_version_immutable
before update or delete on public.proposal_versions
for each row execute function private.prevent_proposal_version_mutation();

revoke all on function private.prevent_proposal_identity_change() from public, anon, authenticated;
revoke all on function private.prevent_proposal_version_mutation() from public, anon, authenticated;

alter table public.proposals enable row level security;
alter table public.proposal_drafts enable row level security;
alter table public.proposal_versions enable row level security;

create policy tenant_members_view_proposals
on public.proposals for select to authenticated
using (private.has_active_membership(tenant_id));

create policy tenant_members_create_draft_proposals
on public.proposals for insert to authenticated
with check (
  private.has_active_membership(tenant_id)
  and created_by = auth.uid()
  and status = 'draft'
);

create policy tenant_members_view_drafts
on public.proposal_drafts for select to authenticated
using (private.has_active_membership(tenant_id));

create policy tenant_members_create_drafts
on public.proposal_drafts for insert to authenticated
with check (
  private.has_active_membership(tenant_id)
  and updated_by = auth.uid()
  and exists (
    select 1 from public.proposals p
    where p.id = proposal_id and p.tenant_id = tenant_id and p.status = 'draft'
  )
);

create policy tenant_members_edit_drafts
on public.proposal_drafts for update to authenticated
using (
  private.has_active_membership(tenant_id)
  and exists (
    select 1 from public.proposals p
    where p.id = proposal_id and p.tenant_id = tenant_id and p.status = 'draft'
  )
)
with check (
  private.has_active_membership(tenant_id)
  and updated_by = auth.uid()
  and exists (
    select 1 from public.proposals p
    where p.id = proposal_id and p.tenant_id = tenant_id and p.status = 'draft'
  )
);

create policy tenant_members_view_issued_versions
on public.proposal_versions for select to authenticated
using (private.has_active_membership(tenant_id));

revoke all on public.proposals, public.proposal_drafts, public.proposal_versions from anon, authenticated;
grant select, insert on public.proposals to authenticated;
grant select, insert, update on public.proposal_drafts to authenticated;
grant select on public.proposal_versions to authenticated;
