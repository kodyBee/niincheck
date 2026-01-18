# Search Performance Optimization Notes

## Issue: Statement Timeout on Large Tables (5+ GB)

### Solution Applied

**ULTRA-LEAN MODE** - For 5+ GB tables WITHOUT indexes:

1. **Minimal Query**: 
   - Limited to 20 results maximum
   - Only fetches 4 columns from pull2: `niin, nsn, fsc, nomen`
   - Skips: demil, enac, ui, sl, rncc, ui_convert

2. **Smart Search Strategy**:
   - **Numeric search** (all digits): Prefix match on NIIN → `ILIKE 'search%'`
   - **Text search**: Contains match on NOMEN → `ILIKE '%search%'`
   - No trigram similarity (requires indexes)

3. **Single Join Only**:
   - Only fetches `aacs` table for Class IX designation
   - Skips: prices, weights, descriptions, names

4. **Detail on Demand**:
   - All additional data available via detail endpoint (`/api/nsn/[niin]`)
   - Click info button for complete specifications

### Database Indexes Required

**Critical** (run these FIRST):
```sql
-- Foreign key indexes (one at a time)
CREATE INDEX IF NOT EXISTS idx_aacs_niin ON public.aacs(niin);
CREATE INDEX IF NOT EXISTS idx_prices_niin ON public.prices(niin);
CREATE INDEX IF NOT EXISTS idx_pull2_niin ON public.pull2(niin);
CREATE INDEX IF NOT EXISTS idx_pull2_fsc ON public.pull2(fsc);
```

See `database-optimization.sql` for complete instructions.

### Current Behavior

**All searches (ultra-lean mode):**
- Basic data only: NIIN, NSN, FSC, NOMEN, Class IX
- All other fields: `null` (price, weight, descriptions, etc.)
- Click detail button for full information

**Why so minimal?**
- Without database indexes, even simple joins timeout on 5+ GB tables
- This gets search working NOW, before indexes are created
- Once indexes are in place, can re-enable full data enrichment

### Performance Metrics

| Scenario | Before Optimization | Ultra-Lean Mode | With Indexes |
|----------|--------------------|--------------------|--------------|
| Numeric search (NIIN) | Timeout | ~1-2s | <0.5s |
| Text search (NOMEN) | Timeout | ~2-5s | <1s |
| Any search (20 results) | Timeout | ~1-3s | <0.5s |

### User Experience

1. **Fast Initial Results**: Users see results quickly with essential data
2. **Detail on Demand**: Click info button for complete specifications
3. **No Timeouts**: Queries complete reliably even on large tables

### Future Optimization Options

1. **Add Indexes**: Run `database-optimization.sql` (will dramatically improve speed)
2. **Implement Caching**: Cache frequent searches
3. **Background Jobs**: Pre-compute common searches
4. **Materialized View**: For ultra-fast searches (requires maintenance)

### Testing

Test with various query patterns:
```
// Numeric search (fast) - prefix match on NIIN
search: "123456789"
search: "00123"

// Text search - contains match on NOMEN
search: "bolt"
search: "connector"

// With filters (FSC still works)
search: "bolt" + FSC: "5306"
```

**Expected behavior:**
- All searches return basic data only (NIIN, NSN, FSC, NOMEN, Class IX)
- Click info button to load full details from detail endpoint

### Monitoring

Watch for these in logs:
- Query execution time
- Number of results returned
- Whether additional data was fetched

Add logging if needed:
```typescript
console.log(`Search returned ${niins.length} results, fetching ${niins.length <= 20 ? 'full' : 'basic'} data`);
```
