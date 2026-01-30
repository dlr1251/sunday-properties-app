-- Negotiations schema (local supabase)
-- Safe to run alongside existing property-level offers/contracts

create extension if not exists "uuid-ossp";

-- Negotiations root entity
create table if not exists negotiations (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  status text not null default 'open' check (status in ('open','closed','archived')),
  participants uuid[] not null, -- supabase auth users
  created_at timestamptz default now()
);

-- Offers within a negotiation (avoid name conflict with public.offers)
create table if not exists negotiation_offers (
  id uuid primary key default uuid_generate_v4(),
  negotiation_id uuid not null references negotiations(id) on delete cascade,
  author uuid not null,
  payload jsonb not null, -- { price, downPayment, annualRate, termMonths, fees[], dates }
  status text not null check (status in ('offer','counter','accepted','rejected')),
  created_at timestamptz default now()
);

-- Documents authored within a negotiation (collaborative editor content)
create table if not exists negotiation_documents (
  id uuid primary key default uuid_generate_v4(),
  negotiation_id uuid not null references negotiations(id) on delete cascade,
  kind text not null check (kind in ('promise_of_sale')),
  content jsonb not null, -- tiptap json snapshot
  version int default 1,
  updated_by uuid,
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists idx_negotiation_offers_neg on negotiation_offers(negotiation_id);
create index if not exists idx_negotiation_documents_neg on negotiation_documents(negotiation_id);

-- Triggers for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language 'plpgsql';

drop trigger if exists trg_negotiation_documents_updated_at on negotiation_documents;
create trigger trg_negotiation_documents_updated_at
before update on negotiation_documents
for each row execute function update_updated_at_column();

-- RLS
alter table negotiations enable row level security;
alter table negotiation_offers enable row level security;
alter table negotiation_documents enable row level security;

-- Policies: only participants can access a negotiation and its resources
create policy if not exists "participants can select negotiations" on negotiations
for select using (
  auth.uid() = any(participants)
);
create policy if not exists "participants can insert negotiations" on negotiations
for insert with check (
  auth.uid() = any(participants)
);
create policy if not exists "participants can update negotiations" on negotiations
for update using (
  auth.uid() = any(participants)
);

create policy if not exists "participants read offers" on negotiation_offers
for select using (
  auth.uid() = any((select participants from negotiations where id = negotiation_id))
);
create policy if not exists "participants insert offers" on negotiation_offers
for insert with check (
  auth.uid() = any((select participants from negotiations where id = negotiation_id))
);

create policy if not exists "participants read documents" on negotiation_documents
for select using (
  auth.uid() = any((select participants from negotiations where id = negotiation_id))
);
create policy if not exists "participants upsert documents" on negotiation_documents
for all using (
  auth.uid() = any((select participants from negotiations where id = negotiation_id))
);


