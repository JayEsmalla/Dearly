update public.gifts set status = 'published' where status in ('opened', 'replied');
alter table public.gifts drop constraint if exists gifts_status_check;
alter table public.gifts add constraint gifts_status_check
  check (status in ('draft', 'wrapped', 'published', 'disabled'));
drop index if exists public.gifts_public_lookup_idx;
create index gifts_public_lookup_idx on public.gifts (public_id) where status = 'published';
