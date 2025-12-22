-- ==========================================
-- AISSA PHONE - COMPLETE CLEAN RESET SCHEMA
-- WARNING: This will drop existing data!
-- ==========================================

-- 1. DROP EVERYTHING (Clean start)
drop function if exists process_sale_transaction(uuid, uuid, jsonb) cascade;
drop function if exists is_admin() cascade;

drop table if exists activity_logs cascade;
drop table if exists sale_items cascade;
drop table if exists sales cascade;
drop table if exists products cascade;
drop table if exists product_templates cascade;
drop table if exists profiles cascade;
drop table if exists stores cascade;

drop type if exists user_role cascade;
drop type if exists sale_status cascade;

-- 2. CREATE EXTENSIONS
create extension if not exists "uuid-ossp";

-- 3. CREATE TYPES
create type user_role as enum ('admin', 'worker');
create type sale_status as enum ('active', 'undone', 'deleted');

-- 4. CREATE TABLES

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
  email text,
  role user_role default 'worker',
  store_id uuid references stores(id),
  created_at timestamptz default now()
);

-- PRODUCT TEMPLATES (Shared Catalog)
create table product_templates (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  barcode text unique, -- Global unique barcode
  image_url text,      -- Shared image
  created_at timestamptz default now()
);

-- PRODUCTS (Store-specific Inventory)
create table products (
  id uuid primary key default uuid_generate_v4(),
  template_id uuid references product_templates(id) on delete cascade not null,
  store_id uuid references stores(id) on delete cascade not null,
  stock int default 0,
  buy_price numeric not null default 0, -- SENSITIVE
  min_sell_price numeric not null default 0,
  max_sell_price numeric not null default 0,
  created_at timestamptz default now(),
  unique(template_id, store_id) -- Only one inventory row per product per store
);

-- Fix Storage Image Visibility (RLS)
-- Note: Assuming 'product-images' bucket exists. These policies ensure workers can see images.
-- CREATE POLICY "Allow public read on product-images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
-- CREATE POLICY "Allow authenticated read on product-images" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'product-images');

-- Initialize Storage (Optional but helpful if SQL access allows)
-- insert into storage.buckets (id, name, public) 
-- values ('product-images', 'product-images', true)
-- on conflict (id) do nothing;

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

-- 5. RLS POLICIES

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

-- Stores
alter table stores enable row level security;
create policy "Admin full access stores" on stores for all using (is_admin());
create policy "Workers view stores" on stores for select using (true);

-- Profiles
alter table profiles enable row level security;
create policy "Admin full access profiles" on profiles for all using (is_admin());
create policy "Users view own profile" on profiles for select using (auth.uid() = id);

-- Product Templates
alter table product_templates enable row level security;
create policy "Admin full access templates" on product_templates for all using (is_admin());
create policy "Authenticated view templates" on product_templates for select to authenticated using (true);

-- Products
alter table products enable row level security;
create policy "Admin full access products" on products for all using (is_admin());
create policy "Workers view products" on products for select to authenticated using (
  is_admin() or exists (
    select 1 from profiles
    where id = auth.uid() and store_id = products.store_id
  )
);

-- Sales
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

-- Sale Items
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

-- Activity Logs
alter table activity_logs enable row level security;
create policy "Admin view logs" on activity_logs for select using (is_admin());
create policy "System insert logs" on activity_logs for insert with check (true);

-- 6. RPC FUNCTIONS

drop function if exists process_sale_transaction(uuid, uuid, jsonb);
create or replace function process_sale_transaction(
  p_worker_id uuid,
  p_store_id uuid,
  p_items jsonb
) returns jsonb as $$
declare
  v_sale_id uuid;
  v_item jsonb;
  v_product_record record;
  v_total_price numeric := 0;
  v_total_profit numeric := 0;
  v_item_profit numeric;
begin
  -- 1. Create the Sale record
  insert into sales (store_id, worker_id, total_price, profit, status)
  values (p_store_id, p_worker_id, 0, 0, 'active')
  returning id into v_sale_id;

  -- 2. Process each item
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select p.*, t.name into v_product_record 
    from products p
    join product_templates t on p.template_id = t.id
    where p.id = (v_item->>'product_id')::uuid and p.store_id = p_store_id
    for update;

    if not found then
      raise exception 'Product % not found', v_item->>'product_id';
    end if;

    if v_product_record.stock < (v_item->>'quantity')::int then
      raise exception 'Insufficient stock for % (Available: %)', v_product_record.name, v_product_record.stock;
    end if;

    v_item_profit := ((v_item->>'unit_price')::numeric - v_product_record.buy_price) * (v_item->>'quantity')::int;
    v_total_price := v_total_price + ((v_item->>'unit_price')::numeric * (v_item->>'quantity')::int);
    v_total_profit := v_total_profit + v_item_profit;

    insert into sale_items (sale_id, product_id, quantity, unit_price, buy_price_snap)
    values (v_sale_id, v_product_record.id, (v_item->>'quantity')::int, (v_item->>'unit_price')::numeric, v_product_record.buy_price);

    update products set stock = stock - (v_item->>'quantity')::int where id = v_product_record.id;
  end loop;

  update sales set total_price = v_total_price, profit = v_total_profit where id = v_sale_id;

  return jsonb_build_object('success', true, 'sale_id', v_sale_id);
end;
$$ language plpgsql security definer;

-- 7. UNDO SALE
drop function if exists undo_sale(uuid, uuid);
create or replace function undo_sale(
  p_sale_id uuid,
  p_admin_id uuid
) returns jsonb as $$
declare
  v_sale_record record;
  v_item record;
begin
  -- 1. Get the sale and lock it
  select * into v_sale_record from sales where id = p_sale_id for update;
  
  if not found then
    raise exception 'Sale not found';
  end if;
  
  if v_sale_record.status = 'undone' then
    raise exception 'Sale is already undone';
  end if;

  -- 2. Iterate through items and revert stock
  for v_item in select * from sale_items where sale_id = p_sale_id
  loop
    update products 
    set stock = stock + v_item.quantity 
    where id = v_item.product_id;
  end loop;

  -- 3. Mark sale as undone
  update sales set status = 'undone' where id = p_sale_id;

  -- 4. Log activity
  insert into activity_logs (action, performed_by, details)
  values ('UNDO_SALE', p_admin_id, jsonb_build_object('sale_id', p_sale_id, 'total_price', v_sale_record.total_price));

  return jsonb_build_object('success', true);
end;
$$ language plpgsql security definer;




-- 8. STORAGE BUCKETS & POLICIES
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'product-images' );

create policy "Admin Upload"
on storage.objects for insert
with check ( (bucket_id = 'product-images') AND is_admin() );

create policy "Admin Update"
on storage.objects for update
using ( (bucket_id = 'product-images') AND is_admin() );

create policy "Admin Delete"
on storage.objects for delete
using ( (bucket_id = 'product-images') AND is_admin() );
