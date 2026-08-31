alter table public.gifts
  add column if not exists pin_hash text,
  add column if not exists pin_salt text,
  add column if not exists access_version integer not null default 1 check (access_version > 0);

create table if not exists public.gift_access_attempts (
  id bigint generated always as identity primary key,
  gift_id uuid not null references public.gifts(id) on delete cascade,
  client_hash text not null,
  attempted_at timestamptz not null default now()
);

create index if not exists gift_access_attempts_lookup_idx
  on public.gift_access_attempts (gift_id, client_hash, attempted_at desc);

alter table public.gift_access_attempts enable row level security;
revoke all on table public.gift_access_attempts from anon, authenticated;
grant select, insert, delete on table public.gift_access_attempts to service_role;

comment on column public.gifts.pin_hash is 'scrypt-derived PIN hash; never stores plaintext PIN.';
comment on table public.gift_access_attempts is 'Server-only throttling records for protected gift PIN verification.';
