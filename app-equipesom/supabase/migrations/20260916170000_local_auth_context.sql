-- B1 local: contexto de acesso obtido da sessão Supabase Auth e dos vínculos no banco.
-- Não concede administração da plataforma nem conecta o protótipo ao backend.

create or replace function public.current_access_context()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select case
    when not private.session_is_active() then null
    else (
      select jsonb_build_object(
        'user', jsonb_build_object(
          'id', u.id,
          'displayName', u.display_name
        ),
        'memberships', coalesce((
          select jsonb_agg(
            jsonb_build_object(
              'tenantId', t.id,
              'tenantName', t.name,
              'roleCode', r.code
            ) order by t.name, t.id
          )
          from public.memberships m
          join public.tenants t on t.id = m.tenant_id
          join public.roles r on r.id = m.role_id
          where m.user_id = u.id
            and m.status = 'active'
            and m.valid_from <= now()
            and (m.valid_until is null or m.valid_until > now())
            and t.status = 'active'
            and r.scope = 'tenant'
        ), '[]'::jsonb)
      )
      from public.app_users u
      where u.id = auth.uid() and u.status = 'active'
    )
  end;
$$;

revoke all on function public.current_access_context() from public, anon, authenticated;
grant execute on function public.current_access_context() to authenticated;
