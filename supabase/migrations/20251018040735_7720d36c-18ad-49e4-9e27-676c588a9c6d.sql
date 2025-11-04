-- Create enum for transaction types
CREATE TYPE transaction_type AS ENUM ('donation', 'pooja_fee', 'prasadam', 'other');

-- Create enum for pooja status
CREATE TYPE pooja_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');

-- Create devotees table
CREATE TABLE public.devotees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create poojas table
CREATE TABLE public.poojas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  base_price DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create pooja_bookings table
CREATE TABLE public.pooja_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  devotee_id UUID REFERENCES public.devotees(id) ON DELETE CASCADE NOT NULL,
  pooja_id UUID REFERENCES public.poojas(id) ON DELETE CASCADE NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  status pooja_status DEFAULT 'scheduled' NOT NULL,
  special_requests TEXT,
  amount_paid DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  devotee_id UUID REFERENCES public.devotees(id) ON DELETE CASCADE NOT NULL,
  transaction_type transaction_type NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT,
  reference_number TEXT,
  description TEXT,
  transaction_date TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.devotees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poojas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pooja_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (public read for now - can be refined with auth later)
CREATE POLICY "Anyone can view devotees" ON public.devotees FOR SELECT USING (true);
CREATE POLICY "Anyone can insert devotees" ON public.devotees FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update devotees" ON public.devotees FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete devotees" ON public.devotees FOR DELETE USING (true);

CREATE POLICY "Anyone can view poojas" ON public.poojas FOR SELECT USING (true);
CREATE POLICY "Anyone can insert poojas" ON public.poojas FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update poojas" ON public.poojas FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete poojas" ON public.poojas FOR DELETE USING (true);

CREATE POLICY "Anyone can view pooja bookings" ON public.pooja_bookings FOR SELECT USING (true);
CREATE POLICY "Anyone can insert pooja bookings" ON public.pooja_bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update pooja bookings" ON public.pooja_bookings FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete pooja bookings" ON public.pooja_bookings FOR DELETE USING (true);

CREATE POLICY "Anyone can view transactions" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert transactions" ON public.transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update transactions" ON public.transactions FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete transactions" ON public.transactions FOR DELETE USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_devotees_updated_at
  BEFORE UPDATE ON public.devotees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pooja_bookings_updated_at
  BEFORE UPDATE ON public.pooja_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample poojas
INSERT INTO public.poojas (name, description, duration_minutes, base_price) VALUES
('Abhishekam', 'Sacred ritual bathing of the deity with milk, honey, and other sacred items', 60, 501.00),
('Archana', 'Offering of flowers and chanting of sacred names', 30, 101.00),
('Homam', 'Sacred fire ritual for prosperity and wellbeing', 120, 2100.00),
('Satyanarayana Pooja', 'Traditional worship for peace and prosperity', 90, 1100.00),
('Rudrabhishekam', 'Special worship of Lord Shiva', 75, 1500.00);