-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'devotee');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles"
  ON public.user_roles FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  phone TEXT,
  language_preference TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Trigger to create profile and assign devotee role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'devotee');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update updated_at trigger
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Donation campaigns table
CREATE TABLE public.donation_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  target_amount NUMERIC NOT NULL,
  current_amount NUMERIC DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.donation_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active campaigns"
  ON public.donation_campaigns FOR SELECT
  USING (is_active = true OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

CREATE POLICY "Only admins can manage campaigns"
  ON public.donation_campaigns FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Subscription poojas table
CREATE TABLE public.subscription_poojas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pooja_id UUID NOT NULL REFERENCES public.poojas(id) ON DELETE CASCADE,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  start_date DATE NOT NULL,
  end_date DATE,
  next_occurrence DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  amount NUMERIC NOT NULL,
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.subscription_poojas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
  ON public.subscription_poojas FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

CREATE POLICY "Users can create their own subscriptions"
  ON public.subscription_poojas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON public.subscription_poojas FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Staff can manage all subscriptions"
  ON public.subscription_poojas FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

-- Virtual darshan slots table
CREATE TABLE public.virtual_darshan_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_date DATE NOT NULL,
  slot_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 15,
  max_bookings INTEGER DEFAULT 50,
  current_bookings INTEGER DEFAULT 0,
  price NUMERIC DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  meeting_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.virtual_darshan_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available slots"
  ON public.virtual_darshan_slots FOR SELECT
  USING (is_available = true OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

CREATE POLICY "Only admins can manage slots"
  ON public.virtual_darshan_slots FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Virtual darshan bookings table
CREATE TABLE public.virtual_darshan_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slot_id UUID NOT NULL REFERENCES public.virtual_darshan_slots(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.virtual_darshan_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own darshan bookings"
  ON public.virtual_darshan_bookings FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

CREATE POLICY "Users can create their own darshan bookings"
  ON public.virtual_darshan_bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can manage all darshan bookings"
  ON public.virtual_darshan_bookings FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

-- Festival calendar table
CREATE TABLE public.festival_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  image_url TEXT,
  location TEXT,
  is_major_festival BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.festival_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view festivals"
  ON public.festival_events FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage festivals"
  ON public.festival_events FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Community forum posts table
CREATE TABLE public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  likes_count INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved posts"
  ON public.community_posts FOR SELECT
  USING (is_approved = true OR auth.uid() = user_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

CREATE POLICY "Authenticated users can create posts"
  ON public.community_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON public.community_posts FOR UPDATE
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

CREATE POLICY "Staff can manage all posts"
  ON public.community_posts FOR DELETE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

-- Inventory items table
CREATE TABLE public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name TEXT NOT NULL,
  category TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit TEXT,
  reorder_level INTEGER DEFAULT 10,
  price_per_unit NUMERIC,
  supplier_name TEXT,
  last_restocked DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only staff can view inventory"
  ON public.inventory_items FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

CREATE POLICY "Only admins can manage inventory"
  ON public.inventory_items FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Donations table (separate from transactions)
CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES public.donation_campaigns(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL,
  donor_name TEXT NOT NULL,
  donor_email TEXT,
  donor_phone TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT,
  payment_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own donations"
  ON public.donations FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

CREATE POLICY "Anyone can create donations"
  ON public.donations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Only staff can manage donations"
  ON public.donations FOR UPDATE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

-- Update triggers for new tables
CREATE TRIGGER update_donation_campaigns_updated_at
  BEFORE UPDATE ON public.donation_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscription_poojas_updated_at
  BEFORE UPDATE ON public.subscription_poojas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_festival_events_updated_at
  BEFORE UPDATE ON public.festival_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Update existing table RLS policies to use authentication

-- Update devotees RLS policies
DROP POLICY IF EXISTS "Anyone can view devotees" ON public.devotees;
DROP POLICY IF EXISTS "Anyone can insert devotees" ON public.devotees;
DROP POLICY IF EXISTS "Anyone can update devotees" ON public.devotees;
DROP POLICY IF EXISTS "Anyone can delete devotees" ON public.devotees;

CREATE POLICY "Authenticated staff can view devotees"
  ON public.devotees FOR SELECT
  USING (auth.role() = 'authenticated' AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff')));

CREATE POLICY "Staff can insert devotees"
  ON public.devotees FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

CREATE POLICY "Staff can update devotees"
  ON public.devotees FOR UPDATE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

CREATE POLICY "Only admins can delete devotees"
  ON public.devotees FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Update poojas RLS policies
DROP POLICY IF EXISTS "Anyone can view poojas" ON public.poojas;
DROP POLICY IF EXISTS "Anyone can insert poojas" ON public.poojas;
DROP POLICY IF EXISTS "Anyone can update poojas" ON public.poojas;
DROP POLICY IF EXISTS "Anyone can delete poojas" ON public.poojas;

CREATE POLICY "Anyone can view poojas"
  ON public.poojas FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage poojas"
  ON public.poojas FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Update pooja_bookings RLS policies
DROP POLICY IF EXISTS "Anyone can view pooja bookings" ON public.pooja_bookings;
DROP POLICY IF EXISTS "Anyone can insert pooja bookings" ON public.pooja_bookings;
DROP POLICY IF EXISTS "Anyone can update pooja bookings" ON public.pooja_bookings;
DROP POLICY IF EXISTS "Anyone can delete pooja bookings" ON public.pooja_bookings;

ALTER TABLE public.pooja_bookings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE POLICY "Users can view their own bookings"
  ON public.pooja_bookings FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

CREATE POLICY "Authenticated users can create bookings"
  ON public.pooja_bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can manage all bookings"
  ON public.pooja_bookings FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

-- Update transactions RLS policies
DROP POLICY IF EXISTS "Anyone can view transactions" ON public.transactions;
DROP POLICY IF EXISTS "Anyone can insert transactions" ON public.transactions;
DROP POLICY IF EXISTS "Anyone can update transactions" ON public.transactions;
DROP POLICY IF EXISTS "Anyone can delete transactions" ON public.transactions;

CREATE POLICY "Staff can view all transactions"
  ON public.transactions FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

CREATE POLICY "Staff can create transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

CREATE POLICY "Only admins can update transactions"
  ON public.transactions FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete transactions"
  ON public.transactions FOR DELETE
  USING (has_role(auth.uid(), 'admin'));