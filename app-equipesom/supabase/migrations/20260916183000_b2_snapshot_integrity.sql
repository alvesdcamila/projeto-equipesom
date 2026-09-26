-- Complemento B2: preservar o fuso da emissão e impedir que uma taxa com mais
-- casas do que a fotografia numérica produza desconto irreproduzível.

alter table public.proposal_versions
  add column issue_timezone text;

create or replace function private.complete_b2_version_snapshot()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_rate numeric;
begin
  if new.official_number is null then
    return new;
  end if;

  v_rate := (new.content_snapshot #>> '{values,discountPercentage}')::numeric;
  if v_rate is null or v_rate <> round(v_rate, 4) then
    raise exception 'B2_DISCOUNT_PRECISION_INVALID' using errcode = '22023';
  end if;

  select s.issue_timezone into new.issue_timezone
  from public.proposal_emission_settings s
  where s.tenant_id = new.tenant_id and s.b2_test_enabled;

  if new.issue_timezone is null
    or new.expires_on is distinct from
      ((new.issued_at at time zone new.issue_timezone)::date + new.validity_days) then
    raise exception 'B2_ISSUE_TIMEZONE_INVALID' using errcode = '22023';
  end if;

  return new;
end;
$$;

create trigger complete_b2_version_snapshot
before insert on public.proposal_versions
for each row execute function private.complete_b2_version_snapshot();

alter table public.proposal_versions
  add constraint b2_issued_timezone_present
  check (official_number is null or issue_timezone is not null);

revoke all on function private.complete_b2_version_snapshot()
  from public, anon, authenticated;
