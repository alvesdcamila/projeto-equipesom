-- B2 experimental, somente local: a emissão fica desligada por tenant até decisão
-- de Camila sobre permissão de emissão e evidência de autorização de desconto.
-- Não conecta o site nem substitui a emissão existente no navegador.

create table public.proposal_emission_settings (
  tenant_id uuid primary key references public.tenants(id) on delete restrict,
  number_prefix text not null check (number_prefix ~ '^[A-Z]{2,8}$'),
  issue_timezone text not null,
  b2_test_enabled boolean not null default false
);

create table public.proposal_number_counters (
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  issue_year integer not null check (issue_year between 2000 and 9999),
  last_number integer not null check (last_number between 1 and 9999),
  primary key (tenant_id, issue_year)
);

alter table public.proposal_emission_settings enable row level security;
alter table public.proposal_number_counters enable row level security;
revoke all on public.proposal_emission_settings, public.proposal_number_counters
  from public, anon, authenticated;

alter table public.proposals
  add column official_number text,
  add column issue_year integer,
  add column issue_sequence integer;

create unique index proposals_tenant_official_number
  on public.proposals (tenant_id, official_number)
  where official_number is not null;
create unique index proposals_tenant_year_sequence
  on public.proposals (tenant_id, issue_year, issue_sequence)
  where issue_year is not null and issue_sequence is not null;

alter table public.proposal_versions
  add column official_number text,
  add column currency text,
  add column base_amount numeric(14, 2),
  add column travel_amount numeric(14, 2),
  add column subtotal_amount numeric(14, 2),
  add column discount_percentage numeric(7, 4),
  add column discount_amount numeric(14, 2),
  add column total_amount numeric(14, 2),
  add column validity_days integer,
  add column expires_on date,
  add column snapshot_sha256 text;

alter table public.proposal_versions
  add constraint b2_issued_financial_snapshot_complete check (
    official_number is null or (
      currency ~ '^[A-Z]{3}$'
      and base_amount >= 0 and travel_amount >= 0
      and subtotal_amount >= 0 and discount_percentage between 0 and 100
      and discount_amount >= 0 and total_amount > 0
      and validity_days > 0 and expires_on is not null
      and snapshot_sha256 ~ '^[0-9a-f]{64}$'
    )
  );

create or replace function public.issue_proposal_b2(
  p_tenant_id uuid,
  p_proposal_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_setting public.proposal_emission_settings%rowtype;
  v_proposal public.proposals%rowtype;
  v_draft public.proposal_drafts%rowtype;
  v_values jsonb;
  v_conditions jsonb;
  v_snapshot jsonb;
  v_base numeric;
  v_travel numeric;
  v_subtotal numeric;
  v_percentage numeric;
  v_discount numeric;
  v_total numeric;
  v_days numeric;
  v_currency text;
  v_issued_at timestamptz;
  v_issue_date date;
  v_expires_on date;
  v_year integer;
  v_sequence integer;
  v_number text;
  v_version_id uuid;
  v_hash text;
begin
  if auth.role() is distinct from 'authenticated'
    or not private.has_active_membership(p_tenant_id) then
    raise exception 'ISSUE_NOT_AUTHORIZED' using errcode = '42501';
  end if;

  select * into v_setting
  from public.proposal_emission_settings
  where tenant_id = p_tenant_id;

  -- Somente os tenants fictícios da prova recebem este sinalizador. Não é RBAC.
  if not found or not v_setting.b2_test_enabled then
    raise exception 'B2_TEST_GATE_CLOSED' using errcode = '42501';
  end if;

  if not exists (
    select 1 from pg_catalog.pg_timezone_names
    where name = v_setting.issue_timezone
  ) then
    raise exception 'INVALID_ISSUE_TIMEZONE' using errcode = '22023';
  end if;

  -- O lock da proposta serializa duas emissões da mesma negociação.
  select * into v_proposal
  from public.proposals
  where id = p_proposal_id and tenant_id = p_tenant_id
  for update;

  if not found or v_proposal.status <> 'draft'
    or v_proposal.official_number is not null
    or exists (
      select 1 from public.proposal_versions
      where proposal_id = p_proposal_id and tenant_id = p_tenant_id
    ) then
    raise exception 'PROPOSAL_NOT_ISSUABLE' using errcode = '23514';
  end if;

  select * into v_draft
  from public.proposal_drafts
  where proposal_id = p_proposal_id and tenant_id = p_tenant_id
  for update;

  if not found then
    raise exception 'DRAFT_NOT_FOUND' using errcode = '23514';
  end if;

  v_values := v_draft.content -> 'values';
  v_conditions := v_draft.content -> 'conditions';
  if jsonb_typeof(v_values) is distinct from 'object'
    or jsonb_typeof(v_conditions) is distinct from 'object'
    or v_values ->> 'pricingModel' is distinct from 'percentage'
    or jsonb_typeof(v_values -> 'baseValue') is distinct from 'number'
    or jsonb_typeof(v_values -> 'travelFee') is distinct from 'number'
    or jsonb_typeof(v_values -> 'discountPercentage') is distinct from 'number'
    or jsonb_typeof(v_conditions -> 'validityDays') is distinct from 'number' then
    raise exception 'B2_FINANCIAL_INPUT_INVALID' using errcode = '22023';
  end if;

  v_currency := v_values ->> 'currency';
  v_base := (v_values ->> 'baseValue')::numeric;
  v_travel := (v_values ->> 'travelFee')::numeric;
  v_percentage := (v_values ->> 'discountPercentage')::numeric;
  v_days := (v_conditions ->> 'validityDays')::numeric;

  if v_currency is null or v_currency !~ '^[A-Z]{3}$'
    or v_base < 0 or v_base > 999999999999
    or v_travel < 0 or v_travel > 999999999999
    or v_percentage < 0 or v_percentage > 100
    or v_days < 1 or v_days > 3650 or v_days <> trunc(v_days) then
    raise exception 'B2_FINANCIAL_INPUT_INVALID' using errcode = '22023';
  end if;

  -- Arredondamento em centavos é técnico nesta prova, não política financeira global.
  v_base := round(v_base, 2);
  v_travel := round(v_travel, 2);
  v_subtotal := v_base + v_travel;
  v_discount := round(v_subtotal * v_percentage / 100, 2);
  v_total := v_subtotal - v_discount;
  if v_subtotal > 999999999999.99 or v_total <= 0 then
    raise exception 'B2_FINANCIAL_INPUT_INVALID' using errcode = '22023';
  end if;

  v_issued_at := clock_timestamp();
  v_issue_date := (v_issued_at at time zone v_setting.issue_timezone)::date;
  v_year := extract(year from v_issue_date)::integer;
  v_expires_on := v_issue_date + v_days::integer;

  -- A chave (tenant, ano) e o UPSERT serializam a sequência entre propostas.
  insert into public.proposal_number_counters (tenant_id, issue_year, last_number)
  values (p_tenant_id, v_year, 1)
  on conflict (tenant_id, issue_year)
  do update set last_number = public.proposal_number_counters.last_number + 1
    where public.proposal_number_counters.last_number < 9999
  returning last_number into v_sequence;

  if v_sequence is null then
    raise exception 'PROPOSAL_NUMBER_EXHAUSTED' using errcode = '22003';
  end if;
  v_number := v_setting.number_prefix || '-' || v_year::text || '-'
    || lpad(v_sequence::text, 4, '0');

  -- Dados derivados fornecidos pelo cliente são substituídos pelos cálculos do banco.
  v_snapshot := jsonb_set(v_draft.content, '{values}',
    v_values || jsonb_build_object(
      'baseValue', v_base,
      'travelFee', v_travel,
      'subtotalBeforeDiscount', v_subtotal,
      'discountPercentage', v_percentage,
      'discountAmount', v_discount,
      'total', v_total
    )
  );
  v_hash := encode(extensions.digest(v_snapshot::text, 'sha256'), 'hex');

  insert into public.proposal_versions (
    proposal_id, tenant_id, version_number, content_snapshot,
    issued_by, issued_at, official_number, currency,
    base_amount, travel_amount, subtotal_amount, discount_percentage,
    discount_amount, total_amount, validity_days, expires_on, snapshot_sha256
  ) values (
    p_proposal_id, p_tenant_id, 1, v_snapshot,
    auth.uid(), v_issued_at, v_number, v_currency,
    v_base, v_travel, v_subtotal, v_percentage,
    v_discount, v_total, v_days::integer, v_expires_on, v_hash
  ) returning id into v_version_id;

  update public.proposals
  set status = 'issued', official_number = v_number,
      issue_year = v_year, issue_sequence = v_sequence,
      updated_at = v_issued_at
  where id = p_proposal_id and tenant_id = p_tenant_id;

  insert into public.audit_events (
    tenant_id, actor_user_id, event_type, subject_type, subject_id, metadata
  ) values (
    p_tenant_id, auth.uid(), 'proposal.issued.b2_test', 'proposal_version',
    v_version_id,
    jsonb_build_object(
      'proposal_id', p_proposal_id,
      'number', v_number,
      'version', 1,
      'currency', v_currency,
      'subtotal', v_subtotal,
      'discount_percentage', v_percentage,
      'discount_amount', v_discount,
      'total', v_total,
      'snapshot_sha256', v_hash,
      'discount_approval_pending', v_percentage > 0,
      'b2_test_only', true
    )
  );

  return v_version_id;
end;
$$;

revoke all on function public.issue_proposal_b2(uuid, uuid) from public, anon, authenticated;
grant execute on function public.issue_proposal_b2(uuid, uuid) to authenticated;
