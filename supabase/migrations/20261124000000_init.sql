-- =========================================================
-- TRACKDAY Sports Portal — initial schema
-- Auth + RLS + realtime + audit
-- =========================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------
-- Tables
-- ---------------------------------------------------------
create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  principal text,
  mobile text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role text not null default 'teacher' check (role in ('super_admin', 'teacher')),
  school_id uuid unique references public.schools(id) on delete set null,
  is_temp_admin boolean not null default false,
  temp_admin_until timestamptz,
  is_active boolean not null default true,
  must_change_password boolean not null default false,
  language text not null default 'bn' check (language in ('bn', 'en')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint super_admin_has_no_school check (role <> 'super_admin' or school_id is null)
);

-- Exactly one super admin
create unique index if not exists one_super_admin
  on public.profiles ((role))
  where role = 'super_admin';

create sequence if not exists public.student_id_seq start 1;

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  student_id text not null unique,
  chest_no text,
  name text not null,
  dob date not null,
  gender text not null check (gender in ('boys', 'girls')),
  father_name text,
  group_code char(1) generated always as (
    case
      when dob >= date '2019-01-01' then 'A'
      when dob between date '2017-01-01' and date '2018-12-31' then 'B'
      when dob between date '2015-01-01' and date '2016-12-31' then 'C'
      else null
    end
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists students_school_chest_unique
  on public.students (school_id, chest_no)
  where chest_no is not null;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  date date,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  group_code char(1) not null check (group_code in ('A', 'B', 'C')),
  metric text not null default 'manual'
    check (metric in ('manual', 'time', 'distance', 'height', 'points')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists games_event_group_name_ci
  on public.games (event_id, group_code, lower(name));

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  score_text text,
  score_num numeric,
  dnf boolean not null default false,
  position integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (game_id, student_id)
);

create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  actor_email text,
  action text not null,
  target_type text,
  target_id text,
  details jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- Helper functions
-- ---------------------------------------------------------
create or replace function public.is_active_user()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_active
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'super_admin' and is_active
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and is_active
      and (
        role = 'super_admin'
        or (
          is_temp_admin
          and (temp_admin_until is null or temp_admin_until > now())
        )
      )
  );
$$;

create or replace function public.current_school_id()
returns uuid
language sql stable security definer set search_path = public
as $$
  select school_id from public.profiles
  where id = auth.uid() and is_active;
$$;

create or replace function public.is_teacher()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and is_active
      and role = 'teacher'
      and school_id is not null
  );
$$;

revoke all on function public.is_active_user() from public;
revoke all on function public.is_super_admin() from public;
revoke all on function public.is_admin() from public;
revoke all on function public.current_school_id() from public;
revoke all on function public.is_teacher() from public;
grant execute on function public.is_active_user() to authenticated;
grant execute on function public.is_super_admin() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.current_school_id() to authenticated;
grant execute on function public.is_teacher() to authenticated;

-- ---------------------------------------------------------
-- Generic updated_at
-- ---------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------
-- Student ID + chest number generation
-- ---------------------------------------------------------
create or replace function public.set_student_ids()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  next_chest integer;
begin
  if new.student_id is null or btrim(new.student_id) = '' then
    new.student_id := 'STU-' || lpad(nextval('public.student_id_seq')::text, 4, '0');
  end if;

  if new.chest_no is null or btrim(new.chest_no) = '' then
    perform pg_advisory_xact_lock(hashtext(new.school_id::text)::bigint);
    select coalesce(max(chest_no::integer), 0) + 1
      into next_chest
      from public.students
      where school_id = new.school_id
        and chest_no ~ '^[0-9]+$';
    new.chest_no := lpad(next_chest::text, 2, '0');
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------
-- Score parsing + position recalculation
-- ---------------------------------------------------------
create or replace function public.parse_score(p_text text, p_metric text)
returns numeric
language plpgsql immutable
as $$
declare
  v text;
  parts text[];
  mm numeric;
  ss numeric;
begin
  v := btrim(coalesce(p_text, ''));
  if v = '' then
    return null;
  end if;

  if p_metric = 'time' then
    if strpos(v, ':') > 0 then
      parts := string_to_array(v, ':');
      if array_length(parts, 1) <> 2 then
        return null;
      end if;
      begin
        mm := coalesce(nullif(btrim(parts[1]), '')::numeric, 0);
        ss := nullif(btrim(parts[2]), '')::numeric;
      exception when others then
        return null;
      end;
      if ss is null then
        return null;
      end if;
      return mm * 60 + ss;
    end if;
    begin
      return v::numeric;
    exception when others then
      return null;
    end;
  end if;

  if p_metric in ('distance', 'height', 'points') then
    begin
      return v::numeric;
    exception when others then
      return null;
    end;
  end if;

  return null;
end;
$$;

create or replace function public.set_entry_score_num()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  m text;
begin
  select metric into m from public.games where id = new.game_id;

  if m = 'manual' then
    new.score_num := null;
    if new.dnf then
      new.position := null;
    else
      begin
        new.position := nullif(regexp_replace(coalesce(new.score_text, ''), '[^0-9]', '', 'g'), '')::integer;
      exception when others then
        new.position := null;
      end;
    end if;
  else
    new.score_num := public.parse_score(new.score_text, m);
  end if;

  return new;
end;
$$;

create or replace function public.recalc_positions(p_game_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  m text;
begin
  select metric into m from public.games where id = p_game_id;
  if m is null or m = 'manual' then
    return;
  end if;

  if m = 'time' then
    execute
      'with ranked as (
         select id, rank() over (order by score_num asc) as rnk
         from public.entries
         where game_id = $1 and dnf = false and score_num is not null
       )
       update public.entries e
          set position = r.rnk
         from ranked r
        where e.id = r.id'
    using p_game_id;
  else
    execute
      'with ranked as (
         select id, rank() over (order by score_num desc) as rnk
         from public.entries
         where game_id = $1 and dnf = false and score_num is not null
       )
       update public.entries e
          set position = r.rnk
         from ranked r
        where e.id = r.id'
    using p_game_id;
  end if;

  update public.entries
     set position = null
   where game_id = p_game_id
     and (dnf = true or score_num is null)
     and position is not null;
end;
$$;

create or replace function public.entries_after_change()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  gid uuid;
begin
  gid := coalesce(new.game_id, old.game_id);
  perform public.recalc_positions(gid);
  return null;
end;
$$;

-- Validate that a student's group matches the game's group
create or replace function public.validate_entry()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  sg char(1);
  gg char(1);
begin
  select group_code into sg from public.students where id = new.student_id;
  select group_code into gg from public.games where id = new.game_id;
  if sg is null or gg is null or sg <> gg then
    raise exception 'Student group does not match game group';
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------
-- Profile protection triggers
-- ---------------------------------------------------------
create or replace function public.protect_super_admin()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    if old.role = 'super_admin' then
      raise exception 'Super admin cannot be deleted';
    end if;
    return old;
  end if;

  -- service_role may update the super admin profile (e.g. name)
  if auth.role() = 'service_role' then
    return new;
  end if;

  if old.role = 'super_admin' then
    if auth.uid() is distinct from old.id then
      raise exception 'Super admin cannot be modified by another user';
    end if;
    if new.role is distinct from old.role
       or new.school_id is distinct from old.school_id
       or new.is_temp_admin is distinct from old.is_temp_admin
       or new.temp_admin_until is distinct from old.temp_admin_until
       or new.is_active is distinct from old.is_active
       or new.email is distinct from old.email then
      raise exception 'Super admin protected fields cannot be changed';
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.protect_profile_self()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if auth.uid() = new.id and not public.is_super_admin() then
    if new.school_id is distinct from old.school_id
       or new.is_temp_admin is distinct from old.is_temp_admin
       or new.temp_admin_until is distinct from old.temp_admin_until
       or new.is_active is distinct from old.is_active then
      raise exception 'You cannot change your own protected profile fields';
    end if;
  end if;
  return new;
end;
$$;

create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if new.role = 'super_admin' then
    if tg_op = 'INSERT' then
      if auth.role() <> 'service_role'
         and coalesce(current_setting('app.allow_role_escalation', true), '') <> 'on' then
        raise exception 'Cannot create a super admin';
      end if;
    elsif old.role is distinct from 'super_admin' then
      if auth.role() <> 'service_role'
         and coalesce(current_setting('app.allow_role_escalation', true), '') <> 'on' then
        raise exception 'Cannot promote a user to super admin';
      end if;
    end if;
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------
-- Audit trigger for profile changes
-- ---------------------------------------------------------
create or replace function public.log_profile_change()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  actor_email text;
begin
  select email into actor_email from public.profiles where id = auth.uid();

  insert into public.audit_log(actor_id, actor_email, action, target_type, target_id, details)
  values (
    auth.uid(),
    actor_email,
    case
      when tg_op = 'INSERT' then 'profile_created'
      when tg_op = 'UPDATE' then 'profile_updated'
      else 'profile_deleted'
    end,
    'profile',
    coalesce(new.id, old.id)::text,
    jsonb_build_object(
      'role', coalesce(new.role, old.role),
      'school_id', coalesce(new.school_id, old.school_id),
      'is_temp_admin', coalesce(new.is_temp_admin, old.is_temp_admin),
      'temp_admin_until', coalesce(new.temp_admin_until, old.temp_admin_until),
      'is_active', coalesce(new.is_active, old.is_active)
    )
  );

  return coalesce(new, old);
end;
$$;

-- ---------------------------------------------------------
-- Attach triggers
-- ---------------------------------------------------------
drop trigger if exists schools_touch on public.schools;
create trigger schools_touch before update on public.schools
for each row execute function public.touch_updated_at();

drop trigger if exists students_touch on public.students;
create trigger students_touch before update on public.students
for each row execute function public.touch_updated_at();

drop trigger if exists events_touch on public.events;
create trigger events_touch before update on public.events
for each row execute function public.touch_updated_at();

drop trigger if exists games_touch on public.games;
create trigger games_touch before update on public.games
for each row execute function public.touch_updated_at();

drop trigger if exists entries_touch on public.entries;
create trigger entries_touch before update on public.entries
for each row execute function public.touch_updated_at();

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists students_set_ids on public.students;
create trigger students_set_ids before insert on public.students
for each row execute function public.set_student_ids();

drop trigger if exists entries_set_score on public.entries;
create trigger entries_set_score before insert or update of score_text, game_id, dnf
on public.entries
for each row execute function public.set_entry_score_num();

drop trigger if exists entries_recalc on public.entries;
create trigger entries_recalc
after insert or update of score_text, score_num, dnf or delete
on public.entries
for each row execute function public.entries_after_change();

drop trigger if exists entries_validate on public.entries;
create trigger entries_validate before insert or update of student_id, game_id
on public.entries
for each row execute function public.validate_entry();

drop trigger if exists profiles_protect_super on public.profiles;
create trigger profiles_protect_super before update or delete on public.profiles
for each row execute function public.protect_super_admin();

drop trigger if exists profiles_protect_self on public.profiles;
create trigger profiles_protect_self before update on public.profiles
for each row execute function public.protect_profile_self();

drop trigger if exists profiles_prevent_escalation on public.profiles;
create trigger profiles_prevent_escalation before insert or update on public.profiles
for each row execute function public.prevent_role_escalation();

drop trigger if exists profiles_audit on public.profiles;
create trigger profiles_audit after insert or update or delete on public.profiles
for each row execute function public.log_profile_change();

-- ---------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------
alter table public.schools enable row level security;
alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.events enable row level security;
alter table public.games enable row level security;
alter table public.entries enable row level security;
alter table public.audit_log enable row level security;

-- schools
drop policy if exists schools_select on public.schools;
create policy schools_select on public.schools
for select to authenticated using (public.is_active_user());

drop policy if exists schools_insert on public.schools;
create policy schools_insert on public.schools
for insert to authenticated with check (public.is_admin());

drop policy if exists schools_update on public.schools;
create policy schools_update on public.schools
for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists schools_delete on public.schools;
create policy schools_delete on public.schools
for delete to authenticated using (public.is_admin());

-- profiles
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
for select to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
for update to authenticated
using (public.is_admin() or id = auth.uid())
with check (public.is_admin() or id = auth.uid());

-- students
drop policy if exists students_select on public.students;
create policy students_select on public.students
for select to authenticated using (public.is_active_user());

drop policy if exists students_insert on public.students;
create policy students_insert on public.students
for insert to authenticated
with check (
  public.is_admin()
  or (public.is_teacher() and school_id = public.current_school_id())
);

drop policy if exists students_update on public.students;
create policy students_update on public.students
for update to authenticated
using (
  public.is_admin()
  or (public.is_teacher() and school_id = public.current_school_id())
)
with check (
  public.is_admin()
  or (public.is_teacher() and school_id = public.current_school_id())
);

drop policy if exists students_delete on public.students;
create policy students_delete on public.students
for delete to authenticated using (public.is_admin());

-- events
drop policy if exists events_select on public.events;
create policy events_select on public.events
for select to authenticated using (public.is_active_user());

drop policy if exists events_write on public.events;
create policy events_write on public.events
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- games
drop policy if exists games_select on public.games;
create policy games_select on public.games
for select to authenticated using (public.is_active_user());

drop policy if exists games_write on public.games;
create policy games_write on public.games
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- entries
drop policy if exists entries_select on public.entries;
create policy entries_select on public.entries
for select to authenticated using (public.is_active_user());

drop policy if exists entries_update on public.entries;
create policy entries_update on public.entries
for update to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists entries_insert on public.entries;
create policy entries_insert on public.entries
for insert to authenticated
with check (
  public.is_admin()
  or (
    public.is_teacher()
    and exists (
      select 1 from public.students s
      where s.id = entries.student_id
        and s.school_id = public.current_school_id()
    )
    and coalesce(score_text, '') = ''
    and score_num is null
    and position is null
    and dnf = false
  )
);

drop policy if exists entries_delete on public.entries;
create policy entries_delete on public.entries
for delete to authenticated
using (
  public.is_admin()
  or (
    public.is_teacher()
    and exists (
      select 1 from public.students s
      where s.id = entries.student_id
        and s.school_id = public.current_school_id()
    )
    and coalesce(score_text, '') = ''
    and score_num is null
    and position is null
    and dnf = false
  )
);

-- audit log (read-only for admins; writes only through security definer / service role)
drop policy if exists audit_select on public.audit_log;
create policy audit_select on public.audit_log
for select to authenticated using (public.is_admin());

-- ---------------------------------------------------------
-- Privileges
-- ---------------------------------------------------------
revoke all on public.schools, public.profiles, public.students,
  public.events, public.games, public.entries, public.audit_log
from anon;

revoke all on public.profiles from authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, school_id, is_temp_admin, temp_admin_until,
  is_active, must_change_password, language) on public.profiles to authenticated;

grant select, insert, update, delete on public.schools to authenticated;
grant select, insert, update, delete on public.students to authenticated;
grant select, insert, update, delete on public.events to authenticated;
grant select, insert, update, delete on public.games to authenticated;
grant select, insert, update, delete on public.entries to authenticated;
grant select on public.audit_log to authenticated;

-- ---------------------------------------------------------
-- Realtime
-- ---------------------------------------------------------
alter table public.schools replica identity full;
alter table public.profiles replica identity full;
alter table public.students replica identity full;
alter table public.events replica identity full;
alter table public.games replica identity full;
alter table public.entries replica identity full;

do $$
begin
  begin
    alter publication supabase_realtime add table public.schools;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.profiles;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.students;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.events;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.games;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.entries;
  exception when duplicate_object then null;
  end;
end;
$$;
