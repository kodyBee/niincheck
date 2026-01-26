-- 1. Create indexes FIRST (Crucial for performance and future updates)
-- These might take a moment but are necessary.
CREATE INDEX IF NOT EXISTS idx_aacs_niin ON public.aacs (niin);
CREATE INDEX IF NOT EXISTS idx_prices_niin ON public.prices (niin);

-- 2. Add the Foreign Key constraint as NOT VALID
-- This skips the long "check every single row" process that is timing out.
-- It tells the database "Enforce this for NEW data, but assume old data is fine for now."
ALTER TABLE public.aacs
ADD CONSTRAINT aacs_niin_fkey
FOREIGN KEY (niin)
REFERENCES public.items (niin)
NOT VALID;

-- 3. Reload Supabase Schema
NOTIFY pgrst, 'reload schema';
