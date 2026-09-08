-- Fix: add missing columns to service_category
ALTER TABLE public.service_category ADD COLUMN IF NOT EXISTS active boolean DEFAULT true;
ALTER TABLE public.service_category ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();
