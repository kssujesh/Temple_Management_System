-- Fix security issue: Set search_path for update_updated_at_column function
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Recreate the triggers
CREATE TRIGGER update_devotees_updated_at
  BEFORE UPDATE ON public.devotees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pooja_bookings_updated_at
  BEFORE UPDATE ON public.pooja_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();