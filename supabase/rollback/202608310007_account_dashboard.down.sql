drop trigger if exists gift_templates_set_updated_at on public.gift_templates;
drop table if exists public.gift_templates;

update public.gifts
set status = coalesce(archived_from_status, 'disabled')
where status = 'archived';

alter table public.gifts drop column if exists archived_from_status;
alter table public.gifts drop constraint if exists gifts_status_check;
alter table public.gifts add constraint gifts_status_check
  check (status in ('draft', 'wrapped', 'published', 'opened', 'replied', 'disabled'));
