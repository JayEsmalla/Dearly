create table if not exists public.gift_media (
  id uuid primary key default gen_random_uuid(),
  gift_id uuid not null references public.gifts(id) on delete cascade,
  media_type text not null check (media_type in ('image', 'background_audio', 'voice')),
  storage_path text not null unique check (char_length(storage_path) between 8 and 300),
  thumbnail_path text unique check (thumbnail_path is null or char_length(thumbnail_path) between 8 and 300),
  mime_type text not null check (char_length(mime_type) between 3 and 100),
  bytes bigint not null check (bytes > 0 and bytes <= 20971520),
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  caption text check (caption is null or char_length(caption) <= 72),
  sort_order smallint not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gift_media_gift_order_idx
  on public.gift_media (gift_id, sort_order, created_at);
create unique index if not exists gift_media_one_background_audio_idx
  on public.gift_media (gift_id) where media_type = 'background_audio';
create unique index if not exists gift_media_one_voice_idx
  on public.gift_media (gift_id) where media_type = 'voice';

create trigger gift_media_set_updated_at
before update on public.gift_media
for each row execute function public.dearly_set_gifts_updated_at();

alter table public.gift_media enable row level security;
revoke all on table public.gift_media from anon, authenticated;
grant select, insert, update, delete on table public.gift_media to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'gift-media',
  'gift-media',
  false,
  20971520,
  array['image/webp','audio/mpeg','audio/mp4','audio/ogg','audio/webm','audio/wav']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

comment on table public.gift_media is
  'Private gift media metadata. Files live in the private gift-media Storage bucket and are served only with short-lived signed URLs after server authorization.';
