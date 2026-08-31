drop trigger if exists gift_media_set_updated_at on public.gift_media;
drop table if exists public.gift_media;

delete from storage.buckets
where id = 'gift-media'
  and not exists (select 1 from storage.objects where bucket_id = 'gift-media');
