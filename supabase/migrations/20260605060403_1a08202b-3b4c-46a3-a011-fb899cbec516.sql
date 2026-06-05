ALTER PUBLICATION supabase_realtime ADD TABLE public.audiobooks;
ALTER TABLE public.audiobooks REPLICA IDENTITY FULL;