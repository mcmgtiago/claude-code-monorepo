-- Enable Supabase Realtime for appointments (live notifications)
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointment;
