-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES (Users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin', 'seller', 'buyer')) DEFAULT 'buyer',
  whatsapp TEXT,
  balance DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PAYMENT METHODS (Admin managed)
CREATE TABLE public.payment_methods (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL, -- e.g. "USDT TRC20", "Bank Transfer"
  details JSONB NOT NULL, -- { "account_number": "...", "bank_name": "...", "qr_code_url": "..." }
  type TEXT CHECK (type IN ('crypto', 'bank', 'wallet', 'other')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LISTINGS (Subscriptions)
CREATE TABLE public.listings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL, -- e.g. "Netflix Premium 4K"
  description TEXT,
  category TEXT, -- e.g. "Streaming", "VPN", "Education"
  image_url TEXT,
  price DECIMAL(10, 2) NOT NULL, -- Selling price for the slot/account
  original_price DECIMAL(10, 2), -- For showing discount
  slots_total INTEGER NOT NULL DEFAULT 1,
  slots_available INTEGER NOT NULL DEFAULT 1,
  duration_days INTEGER NOT NULL, -- e.g. 30
  expires_at TIMESTAMP WITH TIME ZONE, -- When the subscription actually ends
  credentials_details TEXT, -- Encrypted or plain text credentials (only visible to buyer after purchase/delivery)
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'sold_out', 'expired')) DEFAULT 'pending',
  admin_feedback TEXT, -- If rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ORDERS
CREATE TABLE public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT CHECK (status IN ('pending_payment', 'checking_payment', 'delivered', 'cancelled')) DEFAULT 'pending_payment',
  payment_method_snapshot JSONB, -- Copy of payment method details used
  payment_proof_url TEXT, -- Screenshot
  contact_info JSONB, -- { "email": "...", "whatsapp": "...", "social": "..." }
  delivered_credentials TEXT, -- Credentials sent by admin/system
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS POLICIES (Simplified for initial setup)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read (for now, maybe restrict later), Self update
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Listings:
-- Read: Active/Approved listings are public. Sellers see their own. Admins see all.
CREATE POLICY "Approved listings are public" ON public.listings FOR SELECT USING (status = 'active' OR status = 'approved' OR status = 'sold_out');
CREATE POLICY "Sellers see own listings" ON public.listings FOR SELECT USING (auth.uid() = seller_id);
-- Insert: Authenticated users can create
CREATE POLICY "Users can create listings" ON public.listings FOR INSERT WITH CHECK (auth.uid() = seller_id);
-- Update: Sellers update own, Admins update all
CREATE POLICY "Sellers can update own listings" ON public.listings FOR UPDATE USING (auth.uid() = seller_id);

-- Orders:
-- Read: Buyers see own, Sellers see orders for their listings, Admins see all.
CREATE POLICY "Buyers see own orders" ON public.orders FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Sellers see orders for their listings" ON public.orders FOR SELECT USING (EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND seller_id = auth.uid()));

-- Payment Methods:
-- Read: Public
CREATE POLICY "Payment methods are public" ON public.payment_methods FOR SELECT USING (is_active = true);
