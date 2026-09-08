-- Add birthday field to customer
ALTER TABLE public.customer ADD COLUMN IF NOT EXISTS data_nascimento date;
