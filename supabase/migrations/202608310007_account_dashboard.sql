alter table public.gifts drop constraint if exists gifts_status_check;
alter table public.gifts add constraint gifts_status_check
  check (status in ('draft', 'wrapped', 'published', 'opened', 'replied', 'disabled', 'archived'));

alter table public.gifts
  add column if not exists archived_from_status text
    check (archived_from_status is null or archived_from_status in ('draft', 'wrapped', 'published', 'opened', 'replied', 'disabled'));

create table if not exists public.gift_templates (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  source_gift_id uuid references public.gifts(id) on delete set null,
  name text not null check (char_length(name) between 1 and 80),
  occasion text check (occasion is null or char_length(occasion) between 1 and 80),
  gift_type text not null check (char_length(gift_type) between 1 and 80),
  theme text not null check (theme in ('rose', 'wine', 'sage', 'gold')),
  builder_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gift_templates_owner_updated_idx
  on public.gift_templates (owner_id, updated_at desc);

create trigger gift_templates_set_updated_at
before update on public.gift_templates
for each row execute function public.dearly_set_gifts_updated_at();

alter table public.gift_templates enable row level security;
revoke all on table public.gift_templates from anon, authenticated;
grant select, insert, update, delete on table public.gift_templates to service_role;

comment on column public.gifts.archived_from_status is
  'Previous lifecycle status used when an account owner restores an archived gift.';
comment on table public.gift_templates is
  'Account-owned reusable gift templates. Server routes enforce ownership.';
