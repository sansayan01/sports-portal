-- =========================================================
-- TRACKDAY Sports Portal — enforce teacher and temporary-admin boundaries
-- =========================================================

-- Teachers may read all student records, but can only create students for
-- their linked school. All student edits/deletes remain admin-only.
drop policy if exists students_update on public.students;
create policy students_update on public.students
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Assigning students to games is a write operation. Teachers have read-only
-- access to events, games, entries, and results.
drop policy if exists entries_insert on public.entries;
create policy entries_insert on public.entries
for insert to authenticated
with check (public.is_admin());

drop policy if exists entries_delete on public.entries;
create policy entries_delete on public.entries
for delete to authenticated
using (public.is_admin());

-- Only the Super Admin can grant, revoke, or change the expiry of temporary
-- admin privileges. A regular Temp Admin still has full operational admin
-- permissions, but cannot delegate those elevated privileges.
create or replace function public.protect_temp_admin_grants()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if auth.role() <> 'service_role' and not public.is_super_admin() then
    if new.is_temp_admin is distinct from old.is_temp_admin
       or new.temp_admin_until is distinct from old.temp_admin_until then
      raise exception 'Only the super admin can change temporary admin grants';
    end if;
  end if;
  return new;
end;
$$;

revoke all on function public.protect_temp_admin_grants() from public;
drop trigger if exists profiles_protect_temp_admin_grants on public.profiles;
create trigger profiles_protect_temp_admin_grants
before update on public.profiles
for each row execute function public.protect_temp_admin_grants();

-- Reserve the configured Super Admin email and permit role bootstrap only
-- from Supabase service-role operations or the trusted SQL administrator.
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if new.role = 'super_admin' then
    if lower(new.email) <> 'msayan9733@gmail.com' then
      raise exception 'Super admin email is reserved';
    end if;
    if auth.role() <> 'service_role'
       and session_user not in ('postgres', 'supabase_admin')
       and coalesce(current_setting('app.allow_role_escalation', true), '') <> 'on' then
      raise exception 'Cannot create or promote a super admin';
    end if;
  end if;
  return new;
end;
$$;

revoke all on function public.prevent_role_escalation() from public;

-- Derived-result helpers are SECURITY DEFINER and must not be directly callable
-- by clients. Keep their use behind admin-checked operations/triggers.
revoke all on function public.recalc_positions(uuid) from public, anon, authenticated;
revoke all on function public.recompute_game_entries(uuid) from public, anon, authenticated;

create or replace function public.recompute_game_entries(p_game_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  m text;
begin
  if not public.is_admin() then
    raise exception 'Only admins can recompute results';
  end if;

  select metric into m from public.games where id = p_game_id;
  if m is null then
    return;
  end if;

  if m = 'manual' then
    update public.entries
       set score_num = null,
           position = case when dnf then null else public.parse_manual_position(score_text) end
     where game_id = p_game_id;
  else
    update public.entries
       set score_num = public.parse_score(score_text, m),
           position = null
     where game_id = p_game_id;
  end if;

  perform public.recalc_positions(p_game_id);
end;
$$;

revoke all on function public.recompute_game_entries(uuid) from public, anon, authenticated;

-- SECURITY DEFINER is safe here because the routine verifies the caller's
-- current database role before touching any results.
create or replace function public.save_game_entries(p_game_id uuid, p_items jsonb)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  it jsonb;
begin
  if not public.is_admin() then
    raise exception 'Only admins can enter results';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'Items must be a JSON array';
  end if;

  for it in select value from jsonb_array_elements(p_items) loop
    update public.entries
       set score_text = nullif(btrim(coalesce(it->>'score', '')), ''),
           dnf = coalesce((it->>'dnf')::boolean, false)
     where id = (it->>'id')::uuid
       and game_id = p_game_id;
  end loop;

  perform public.recompute_game_entries(p_game_id);
end;
$$;

revoke all on function public.save_game_entries(uuid, jsonb) from public;
grant execute on function public.save_game_entries(uuid, jsonb) to authenticated;
