-- Add Google Review URL to company (for review campaigns)
ALTER TABLE public.company ADD COLUMN IF NOT EXISTS google_review_url text;
