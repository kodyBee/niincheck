-- Enable the pg_trgm extension for fast partial text matching
create extension if not exists pg_trgm;

-- Index for exact/prefix lookups on NIIN (highly selective)
create index if not exists idx_pull2_niin on pull2 (niin);

-- Index for filtering by FSC
create index if not exists idx_pull2_fsc on pull2 (fsc);

-- GIN Index for fast case-insensitive partial text search on Item Name
create index if not exists idx_pull2_itemname_trgm on pull2 using gin ("itemName" gin_trgm_ops);

-- Analyze the table to update statistics for the query planner
analyze pull2;
