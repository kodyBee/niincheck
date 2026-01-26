-- Fix missing foreign key relationship for aacs table
ALTER TABLE public.aacs
ADD CONSTRAINT aacs_niin_fkey
FOREIGN KEY (niin)
REFERENCES public.items (niin);

-- Re-analyze to update schema cache
NOTIFY pgrst, 'reload schema';
