-- Execute no Supabase SQL Editor antes de habilitar a Experiência Free.
-- O período é criado uma única vez no cadastro, nunca renovado por login.
create table if not exists public.free_experiences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  started_at timestamptz not null default now(),
  ends_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now(),
  constraint free_experience_window check (ends_at > started_at)
);
alter table public.free_experiences enable row level security;
revoke all on public.free_experiences from anon, authenticated;
grant select on public.free_experiences to authenticated;
drop policy if exists "Users read own free experience" on public.free_experiences;
create policy "Users read own free experience" on public.free_experiences
for select to authenticated using ((select auth.uid()) = user_id);

create or replace function public.create_free_experience()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.free_experiences(user_id,started_at,ends_at)
  values(new.id,new.created_at,new.created_at + interval '7 days')
  on conflict (user_id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created_free_experience on auth.users;
create trigger on_auth_user_created_free_experience
after insert on auth.users for each row execute function public.create_free_experience();
-- Contas anteriores não recebem novo período automaticamente.
