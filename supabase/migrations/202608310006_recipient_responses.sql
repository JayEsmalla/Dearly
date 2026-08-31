create table if not exists public.gift_responses (
  gift_id uuid primary key references public.gifts(id) on delete cascade,
  response_token_hash text not null check (char_length(response_token_hash) = 64),
  reaction text check (reaction is null or reaction in ('This made me smile.', 'I love this.', 'This is so thoughtful.', 'You made my day.')),
  reply text check (reply is null or char_length(reply) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint gift_response_has_content check (reaction is not null or nullif(btrim(reply), '') is not null)
);

create trigger gift_responses_set_updated_at
before update on public.gift_responses
for each row execute function public.dearly_set_gifts_updated_at();

create table if not exists public.gift_response_attempts (
  id bigint generated always as identity primary key,
  gift_id uuid not null references public.gifts(id) on delete cascade,
  client_hash text not null,
  attempted_at timestamptz not null default now()
);

create index if not exists gift_response_attempts_lookup_idx
  on public.gift_response_attempts (gift_id, client_hash, attempted_at desc);

alter table public.gift_responses enable row level security;
alter table public.gift_response_attempts enable row level security;
revoke all on table public.gift_responses from anon, authenticated;
revoke all on table public.gift_response_attempts from anon, authenticated;
grant select, insert, update, delete on table public.gift_responses to service_role;
grant select, insert, delete on table public.gift_response_attempts to service_role;

comment on column public.gift_responses.response_token_hash is 'SHA-256 hash of the recipient device response token; plaintext is never stored.';
comment on table public.gift_responses is 'Recipient reaction and optional reply. Server routes enforce gift access before reads or writes.';
comment on table public.gift_response_attempts is 'Server-only throttling records for recipient response writes.';
