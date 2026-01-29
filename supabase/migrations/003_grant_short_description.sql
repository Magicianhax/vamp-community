-- Add short_description column to grants
ALTER TABLE public.grants ADD COLUMN IF NOT EXISTS short_description text;

-- Set short_description for existing grant
UPDATE public.grants
SET short_description = 'vibecode the Vamp Community web app'
WHERE title = 'Vamp Grant #1';
