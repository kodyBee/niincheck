-- Optimizations for Federated Search capability

-- Index for searching NIINs in the "prices" table
create index if not exists idx_prices_niin on prices (niin);

-- Index for searching NIINs in the "names" table
create index if not exists idx_names_niin on names (niin);

-- Index for searching NIINs in the "weights" table
create index if not exists idx_weights_niin on weights (niin);

-- Index for searching NIINs in the "items" table (if it contains data distinct from pull2)
create index if not exists idx_items_niin on items (niin);

-- Index for searching NIINs in the "aacs" table
create index if not exists idx_aacs_niin on aacs (niin);

-- Analyze tables to update statistics
analyze prices;
analyze names;
analyze weights;
analyze items;
analyze aacs;
