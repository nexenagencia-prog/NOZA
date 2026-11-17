-- Execute only in the ORIGINAL Supabase project linked to NOZA.
-- Default deny. An authenticated account is NOT an active subscription.
create table if not exists public.noza_entitlements (
 user_id uuid primary key references auth.users(id) on delete cascade,
 role text not null default 'member' check (role in ('member','admin')),
 plan text not null default 'free' check (plan in ('free','start','pro','business')),
 status text not null default 'trialing' check (status in ('trialing','active','expired','canceled','pending')),
 trial_started_at timestamptz,
 trial_ends_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.noza_entitlements enable row level security;
revoke all on public.noza_entitlements from anon,authenticated;
-- Only the service-role backend can read/write entitlements.
-- Existing accounts are NOT auto-granted free trials.
-- One trial per account, anchored to its first verified registration.
create or replace function public.noza_create_trial()
returns trigger language plpgsql security definer set search_path=public as $$
begin
 insert into public.noza_entitlements(user_id,role,plan,status,trial_started_at,trial_ends_at)
 values(new.id,'member','free','trialing',new.created_at,new.created_at+interval '7 days')
 on conflict(user_id) do nothing;
 return new;
end $$;
drop trigger if exists noza_new_user_trial on auth.users;
create trigger noza_new_user_trial after insert on auth.users
for each row execute function public.noza_create_trial();
-- IMPORTANT: verify the exact Evox Centro auth.users UUID before assigning admin.
-- Never authorize admin by an editable name, email claim, or client metadata.
-- UPDATE public.noza_entitlements SET role='admin' WHERE user_id='<VERIFIED_UUID>';
-- Migrate paid users from trusted Mercado Pago subscription status only.
