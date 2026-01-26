-- Search History Table
create table if not exists public.search_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  query text not null,
  created_at timestamptz default now()
);

-- Inventories (Playlists) Table
create table if not exists public.inventories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now()
);

-- Inventory Items Table
create table if not exists public.inventory_items (
  id uuid default gen_random_uuid() primary key,
  inventory_id uuid references public.inventories(id) on delete cascade not null,
  niin text not null,
  data jsonb,
  added_at timestamptz default now(),
  unique(inventory_id, niin)
);

-- Enable RLS
alter table public.search_history enable row level security;
alter table public.inventories enable row level security;
alter table public.inventory_items enable row level security;

-- Policies for search_history
create policy "Users can view own history" on public.search_history
  for select using (auth.uid() = user_id);

create policy "Users can insert own history" on public.search_history
  for insert with check (auth.uid() = user_id);

-- Policies for inventories
create policy "Users can view own inventories" on public.inventories
  for select using (auth.uid() = user_id);

create policy "Users can insert own inventories" on public.inventories
  for insert with check (auth.uid() = user_id);

create policy "Users can update own inventories" on public.inventories
  for update using (auth.uid() = user_id);

create policy "Users can delete own inventories" on public.inventories
  for delete using (auth.uid() = user_id);

-- Policies for inventory_items
create policy "Users can view own inventory items" on public.inventory_items
  for select using (
    exists ( select 1 from public.inventories i where i.id = inventory_id and i.user_id = auth.uid() )
  );

create policy "Users can insert into own inventories" on public.inventory_items
  for insert with check (
    exists ( select 1 from public.inventories i where i.id = inventory_id and i.user_id = auth.uid() )
  );

create policy "Users can delete from own inventories" on public.inventory_items
  for delete using (
    exists ( select 1 from public.inventories i where i.id = inventory_id and i.user_id = auth.uid() )
  );

-- Indexes for performance
create index if not exists idx_search_history_user on public.search_history(user_id);
create index if not exists idx_inventories_user on public.inventories(user_id);
create index if not exists idx_inventory_items_inventory on public.inventory_items(inventory_id);

-- Migration for existing tables (Run if table already exists)
-- alter table public.inventory_items add column if not exists data jsonb;
