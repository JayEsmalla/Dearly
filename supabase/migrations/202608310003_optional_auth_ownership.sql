alter table public.gifts
  add column if not exists owner_id uuid references auth.users(id) on delete set null,
  add column if not exists claimed_at timestamptz;

create index if not exists gifts_owner_updated_idx
  on public.gifts (owner_id, updated_at desc)
  where owner_id is not null;

comment on column public.gifts.owner_id is
  'Optional Supabase Auth owner. Null keeps the gift guest-owned through its management token.';
