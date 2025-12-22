-- CUSTOMERS table was in plan but not in initial schema artifact, adding here for completeness
create table if not exists customers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text,
  total_debt numeric default 0,
  created_at timestamptz default now()
);

-- RLS for Customers
-- Workers can view and insert/update customers? 
-- Let's say workers CAN view all and insert.
alter table customers enable row level security;
create policy "Workers view customers" on customers for select using (true);
create policy "Workers insert customers" on customers for insert with check (true);
create policy "Workers update customers" on customers for update using (true);
