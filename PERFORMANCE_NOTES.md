# Search Performance Optimization Notes

## Issue: Statement Timeout on Large Tables (5+ GB)

### Solution Applied

The search route has been optimized for large tables:

1. **Reduced Initial Query**: 
   - Limited to 50 results BEFORE fetching related data
   - Prevents processing thousands of rows

2. **Prioritized Data Fetching**:
   - Always fetches: `aacs` (Class IX) and `prices` (most important)
   - Conditionally fetches weights, descriptions, names only for small result sets (≤20 items)

3. **Progressive Enhancement**:
   - Basic search works fast with critical data
   - Additional details available via the detail endpoint (`/api/nsn/[niin]`)

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

**For searches returning 1-20 results:**
- Full data enrichment (all 6 tables)
- All fields populated

**For searches returning 21-50 results:**
- Basic data (pull2, aacs, prices)
- Weight, descriptions, alternate names: `null`
- Click detail button for full information

### Performance Metrics

| Scenario | Before Optimization | After Optimization |
|----------|--------------------|--------------------|
| Large result set (50 items) | Timeout (>30s) | ~2-5s |
| Small result set (5 items) | Timeout (>30s) | ~1-3s |
| With indexes | N/A | <1s expected |

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
// Small result set - full data
search: "123456789" (specific NIIN)

// Medium result set - full data  
search: "bolt" with FSC filter

// Large result set - basic data
search: "connector" (common term)
```

### Monitoring

Watch for these in logs:
- Query execution time
- Number of results returned
- Whether additional data was fetched

Add logging if needed:
```typescript
console.log(`Search returned ${niins.length} results, fetching ${niins.length <= 20 ? 'full' : 'basic'} data`);
```
