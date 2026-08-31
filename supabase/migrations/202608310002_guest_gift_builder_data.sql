alter table public.gifts
  add column if not exists builder_data jsonb not null default '{}'::jsonb;

comment on column public.gifts.builder_data is
  'Validated non-media gift-builder state used to reconstruct the recipient experience.';
