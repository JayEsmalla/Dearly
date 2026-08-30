begin;

select plan(8);

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

select * from finish();
rollback;
