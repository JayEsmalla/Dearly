create extension if not exists pgcrypto;

create table public.gifts (
  id uuid primary key default gen_random_uuid(),
  public_id text not null unique,
  management_token_hash text not null,
  status text not null default 'draft'
    check (status in ('draft', 'wrapped', 'published', 'disabled')),
  occasion text not null check (char_length(occasion) between 1 and 80),
  gift_type text not null check (char_length(gift_type) between 1 and 80),
  recipient_name text not null check (char_length(recipient_name) between 1 and 80),
  sender_name text not null check (char_length(sender_name) between 1 and 80),
  message text not null check (char_length(message) between 1 and 240),
  theme text not null check (theme in ('rose', 'wine', 'sage', 'gold')),
  opens_at timestamptz,
  expires_at timestamptz,
  published_at timestamptz,
  opened_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint gifts_schedule_order check (
    opens_at is null or expires_at is null or opens_at < expires_at
  )
);

create index gifts_public_lookup_idx
  on public.gifts (public_id)
  where status = 'published';

create function public.dearly_set_gifts_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger gifts_set_updated_at
before update on public.gifts
for each row execute function public.dearly_set_gifts_updated_at();

alter table public.gifts enable row level security;

revoke all on table public.gifts from anon, authenticated;
grant select, insert, update, delete on table public.gifts to service_role;

revoke all on function public.dearly_set_gifts_updated_at() from public, anon, authenticated;
grant execute on function public.dearly_set_gifts_updated_at() to service_role;

comment on table public.gifts is
  'Digital gifts. Client roles have no direct access; validated server routes own reads and writes.';

