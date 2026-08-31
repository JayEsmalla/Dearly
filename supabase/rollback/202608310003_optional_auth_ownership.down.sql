drop index if exists public.gifts_owner_updated_idx;
alter table public.gifts drop column if exists claimed_at;
alter table public.gifts drop column if exists owner_id;
