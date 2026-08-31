drop table if exists public.gift_access_attempts;
alter table public.gifts drop column if exists access_version;
alter table public.gifts drop column if exists pin_salt;
alter table public.gifts drop column if exists pin_hash;
