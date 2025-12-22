-- SECURITY DEFINER functions run with the privileges of the creator (postgres/admin)
-- This allows workers to insert sales with correct profit calculations without seeing buy_price.

-- 1. Function to process a sale item
create or replace function process_sale_transaction(
  p_worker_id uuid,
  p_store_id uuid,
  p_items jsonb -- Array of {product_id, quantity, unit_price}
)
returns uuid -- Returns the new sale_id
language plpgsql
security definer
as $$
declare
  v_sale_id uuid;
  v_total_price numeric := 0;
  v_total_profit numeric := 0;
  v_item jsonb;
  v_product record;
  v_profit numeric;
begin
  -- Calculate totals
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_product from products where id = (v_item->>'product_id')::uuid;
    
    if not found then
      raise exception 'Product not found: %', v_item->>'product_id';
    end if;

    if v_product.stock < (v_item->>'quantity')::int then
      raise exception 'Insufficient stock for product: %', v_product.name;
    end if;
    
    -- Check price limits
    if (v_item->>'unit_price')::numeric < v_product.min_sell_price or 
       (v_item->>'unit_price')::numeric > v_product.max_sell_price then
       raise exception 'Price out of range for: %', v_product.name;
    end if;

    v_total_price := v_total_price + ((v_item->>'unit_price')::numeric * (v_item->>'quantity')::int);
    v_profit := ((v_item->>'unit_price')::numeric - v_product.buy_price) * (v_item->>'quantity')::int;
    v_total_profit := v_total_profit + v_profit;
  end loop;

  -- Create Sale
  insert into sales (store_id, worker_id, total_price, profit, status)
  values (p_store_id, p_worker_id, v_total_price, v_total_profit, 'active')
  returning id into v_sale_id;

  -- Create Items and Update Stock
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_product from products where id = (v_item->>'product_id')::uuid;
    
    insert into sale_items (sale_id, product_id, quantity, unit_price, buy_price_snap)
    values (
      v_sale_id,
      (v_item->>'product_id')::uuid,
      (v_item->>'quantity')::int,
      (v_item->>'unit_price')::numeric,
      v_product.buy_price
    );
    
    -- Decrement stock
    update products 
    set stock = stock - (v_item->>'quantity')::int
    where id = (v_item->>'product_id')::uuid;
  end loop;
  
  -- Log activity
  insert into activity_logs (action, performed_by, details)
  values ('sale_created', p_worker_id, jsonb_build_object('sale_id', v_sale_id, 'total', v_total_price));

  return v_sale_id;
end;
$$;

-- 2. Function to Undo a sale
create or replace function undo_sale(p_sale_id uuid, p_admin_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_sale record;
  v_item record;
begin
  -- Check if admin (optional check if RLS usually handles it, but good to be safe)
  if not exists (select 1 from profiles where id = p_admin_id and role = 'admin') then
    raise exception 'Unauthorized';
  end if;

  select * into v_sale from sales where id = p_sale_id;
  
  if v_sale.status != 'active' then
    raise exception 'Sale is not active';
  end if;

  -- Restore stock
  for v_item in select * from sale_items where sale_id = p_sale_id
  loop
    update products
    set stock = stock + v_item.quantity
    where id = v_item.product_id;
  end loop;

  -- Mark as undone
  update sales
  set status = 'undone', total_price = 0, profit = 0 -- Reset financials or keep original and use status to filter? 
                                                     -- Usually keep original for audit, but if we want logs to reflect "0" revenue, status is key.
                                                     -- Let's keep the `total_price` but `status='undone'` means it doesn't count.
  where id = p_sale_id;

  -- Log
  insert into activity_logs (action, performed_by, details)
  values ('sale_undone', p_admin_id, jsonb_build_object('sale_id', p_sale_id));

end;
$$;
