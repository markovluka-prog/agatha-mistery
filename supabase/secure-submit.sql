create table if not exists submission_rate_limits (
  fingerprint text not null,
  action text not null check (action in ('review', 'fanfic')),
  last_attempt_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (fingerprint, action)
);

alter table submission_rate_limits enable row level security;

drop policy if exists "deny all rate limits anon" on submission_rate_limits;

comment on table submission_rate_limits is 'Server-side rate limits for public submissions. Managed only by service role / edge functions.';
