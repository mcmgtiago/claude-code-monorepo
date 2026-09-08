-- Add media_type to mensagens (image, audio, video, document)
ALTER TABLE public.mensagens ADD COLUMN IF NOT EXISTS media_type text;
