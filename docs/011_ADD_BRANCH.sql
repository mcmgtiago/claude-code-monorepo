-- Add branch (filial) column to appointment
ALTER TABLE public.appointment ADD COLUMN IF NOT EXISTS branch text;

-- Add branch to financial_entry too (for reports)
ALTER TABLE public.financial_entry ADD COLUMN IF NOT EXISTS branch text;

-- Add branch to sale
ALTER TABLE public.sale ADD COLUMN IF NOT EXISTS branch text;
