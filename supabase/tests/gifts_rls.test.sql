begin;

select plan(13);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.gifts'::regclass),
  'gifts has row level security enabled'
);

select ok(not has_table_privilege('anon', 'public.gifts', 'select'), 'anon cannot select gifts');
select ok(not has_table_privilege('anon', 'public.gifts', 'insert'), 'anon cannot insert gifts');
select ok(not has_table_privilege('anon', 'public.gifts', 'update'), 'anon cannot update gifts');
select ok(not has_table_privilege('authenticated', 'public.gifts', 'select'), 'authenticated cannot select gifts directly');
select ok(not has_table_privilege('authenticated', 'public.gifts', 'insert'), 'authenticated cannot insert gifts directly');
select ok(not has_table_privilege('authenticated', 'public.gifts', 'update'), 'authenticated cannot update gifts directly');
select ok(has_table_privilege('service_role', 'public.gifts', 'select,insert,update,delete'), 'service role owns server access');

select ok(
  (select relrowsecurity from pg_class where oid = 'public.gift_media'::regclass),
  'gift_media has row level security enabled'
);
select ok(not has_table_privilege('anon', 'public.gift_media', 'select'), 'anon cannot select gift media');
select ok(not has_table_privilege('authenticated', 'public.gift_media', 'select'), 'authenticated cannot select gift media directly');
select ok(has_table_privilege('service_role', 'public.gift_media', 'select,insert,update,delete'), 'service role owns gift media access');
select ok((select not public from storage.buckets where id = 'gift-media'), 'gift-media bucket is private');

select * from finish();
rollback;
