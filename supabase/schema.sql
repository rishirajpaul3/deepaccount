-- Run this in your Supabase SQL editor

-- User usage table
create table if not exists user_usage (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  plan          text not null default 'free',   -- 'free' | 'pro'
  analyses_this_month integer not null default 0,
  reset_at      timestamptz not null default date_trunc('month', now()) + interval '1 month',
  stripe_customer_id text,
  created_at    timestamptz not null default now()
);

-- Analyses table
create table if not exists analyses (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  company_url   text not null,
  company_name  text,
  icp           text,
  result        jsonb,
  created_at    timestamptz not null default now()
);

-- Indexes
create index if not exists analyses_user_id_idx on analyses(user_id);
create index if not exists analyses_created_at_idx on analyses(created_at desc);

-- Row Level Security
alter table user_usage enable row level security;
alter table analyses enable row level security;

create policy "Users own their usage" on user_usage
  for all using (auth.uid() = user_id);

create policy "Users own their analyses" on analyses
  for all using (auth.uid() = user_id);

-- Function to increment usage (atomic)
create or replace function increment_usage(uid uuid)
returns void language plpgsql security definer as $$
begin
  -- Reset counter if past reset date
  update user_usage
  set analyses_this_month = 0,
      reset_at = date_trunc('month', now()) + interval '1 month'
  where user_id = uid and reset_at <= now();

  -- Upsert with increment
  insert into user_usage (user_id, analyses_this_month)
  values (uid, 1)
  on conflict (user_id) do update
  set analyses_this_month = user_usage.analyses_this_month + 1;
end;
$$;

-- Auto-create usage row on new user signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into user_usage (user_id) values (new.id)
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
