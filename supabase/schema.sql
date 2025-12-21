-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create custom types
create type user_role as enum ('admin', 'worker');
create type sale_status as enum ('active', 'undone', 'deleted');

-- STORES
create table stores (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  location text,
  created_at timestamptz default now()
);

-- PROFILES
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role user_role default 'worker',
  store_id uuid references stores(id),
  created_at timestamptz default now()
);

-- PRODUCTS
create table products (
  id uuid primary key default uuid_generate_v4(),
  store_id uuid references stores(id) not null,
  name text not null,
  barcode text,
  stock int default 0,
  buy_price numeric not null default 0, -- SENSITIVE
  min_sell_price numeric not null default 0,
  max_sell_price numeric not null default 0,
  created_at timestamptz default now()
);

-- SALES
create table sales (
  id uuid primary key default uuid_generate_v4(),
  store_id uuid references stores(id) not null,
  worker_id uuid references profiles(id),
  total_price numeric not null default 0,
  profit numeric default 0, -- SENSITIVE
  status sale_status default 'active',
  created_at timestamptz default now()
);

-- SALE ITEMS
create table sale_items (
  id uuid primary key default uuid_generate_v4(),
  sale_id uuid references sales(id) on delete cascade,
  product_id uuid references products(id),
  quantity int not null default 1,
  unit_price numeric not null,
  buy_price_snap numeric not null, -- SENSITIVE
  created_at timestamptz default now()
);

-- ACTIVITY LOGS
create table activity_logs (
  id uuid primary key default uuid_generate_v4(),
  action text not null,
  performed_by uuid references auth.users(id),
  details jsonb,
  created_at timestamptz default now()
);

-- RLS POLICIES

-- Helper function to check if user is admin
create or replace function is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- Stores: Admin full access, Workers view only
alter table stores enable row level security;
create policy "Admin full access stores" on stores for all using (is_admin());
create policy "Workers view stores" on stores for select using (true);

-- Profiles: Admin full access, Users view own
alter table profiles enable row level security;
create policy "Admin full access profiles" on profiles for all using (is_admin());
create policy "Users view own profile" on profiles for select using (auth.uid() = id);

-- Products: Admin full access, Workers view (Buy price hidden via API, but allowed to select rows)
alter table products enable row level security;
create policy "Admin full access products" on products for all using (is_admin());
create policy "Workers view products" on products for select using (
  exists (
    select 1 from profiles
    where id = auth.uid() and store_id = products.store_id
  )
);

-- Sales: Admin full access, Workers insert only (and select own store/sales)
alter table sales enable row level security;
create policy "Admin full access sales" on sales for all using (is_admin());
create policy "Workers view store sales" on sales for select using (
  exists (
    select 1 from profiles
    where id = auth.uid() and store_id = sales.store_id
  )
);
create policy "Workers insert sales" on sales for insert with check (
  exists (
    select 1 from profiles
    where id = auth.uid() and store_id = sales.store_id
  )
);
-- Workers CANNOT update or delete sales

-- Sale Items: Same as Sales
alter table sale_items enable row level security;
create policy "Admin full access sale_items" on sale_items for all using (is_admin());
create policy "Workers view sale_items" on sale_items for select using (
  exists (
    select 1 from sales
    where sales.id = sale_items.sale_id
    and exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.store_id = sales.store_id
    )
  )
);
create policy "Workers insert sale_items" on sale_items for insert with check (
   exists (
    select 1 from sales
    where sales.id = sale_items.sale_id
    and exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.store_id = sales.store_id
    )
  )
);

-- Activity Logs: Admin view all, Workers insert/view own actions (maybe?)
alter table activity_logs enable row level security;
create policy "Admin view logs" on activity_logs for select using (is_admin());
create policy "System insert logs" on activity_logs for insert with check (true);
