-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES (Users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin', 'seller', 'buyer')) DEFAULT 'buyer',
  whatsapp TEXT,
  balance DECIMAL(10, 2) DEFAULT 0.00, -- Cached balance
  trust_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CATALOG SERVICES (For standardizing "Netflix", "Spotify", etc.)
CREATE TABLE public.catalog_services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL, -- e.g. "Netflix"
  slug TEXT UNIQUE NOT NULL, -- e.g. "netflix"
  category TEXT NOT NULL, -- e.g. "Streaming"
  logo_url TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

-- LISTINGS (Offers from Sellers)
CREATE TABLE public.listings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.catalog_services(id), -- Optional link to official service
  custom_service_name TEXT, -- If service not in catalog
  title TEXT NOT NULL, -- e.g. "Netflix Premium 4K Shared"
  description TEXT,
  price_per_slot DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  total_slots INTEGER NOT NULL DEFAULT 1,
  duration_days INTEGER NOT NULL,
  expiry_date DATE,
  credentials_vault TEXT, -- Protected field for credentials
  proof_image_url TEXT, -- Proof that seller owns the sub
  status TEXT CHECK (status IN ('pending_approval', 'active', 'rejected', 'sold_out', 'expired')) DEFAULT 'pending_approval',
  admin_feedback TEXT,
  is_trial BOOLEAN DEFAULT FALSE, -- NEW: Flag for free trial listings
  upsell_listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL, -- NEW: Link to a paid listing for upsell
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SLOTS (Inventory Units)
CREATE TABLE public.slots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES public.profiles(id), -- Null initially
  status TEXT CHECK (status IN ('available', 'reserved', 'sold')) DEFAULT 'available',
  access_code TEXT, -- Specific PIN or profile name for this slot
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ORDERS
CREATE TABLE public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  slot_id UUID REFERENCES public.slots(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT CHECK (status IN ('pending_proof', 'verification', 'completed', 'failed', 'cancelled')) DEFAULT 'pending_proof',
  payment_method_type TEXT,
  payment_proof_url TEXT,
  transaction_ref TEXT,
  contact_info JSONB, -- { "email": "...", "whatsapp": "..." }
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LEDGER (Double Entry Bookkeeping)
CREATE TABLE public.ledger_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) NOT NULL,
  order_id UUID REFERENCES public.orders(id),
  amount DECIMAL(10, 2) NOT NULL, -- Positive = Credit (Money In), Negative = Debit (Money Out)
  entry_type TEXT CHECK (entry_type IN ('credit', 'debit')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PAYMENT METHODS (Admin managed)
CREATE TABLE public.payment_methods (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  details JSONB NOT NULL,
  type TEXT CHECK (type IN ('crypto', 'bank', 'wallet', 'other')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS POLICIES

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES
CREATE POLICY "Public profiles viewable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. CATALOG
CREATE POLICY "Catalog is public" ON public.catalog_services FOR SELECT USING (true);

-- 3. LISTINGS
-- Public can see active/sold_out listings. Sellers see all their own. Admins see all.
-- (Note: 'admin' role check is simplified here as logic is often in app, but ideally stored in profiles.role)
CREATE POLICY "Public view active listings" ON public.listings FOR SELECT USING (status IN ('active', 'sold_out'));
CREATE POLICY "Sellers see own listings" ON public.listings FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "Sellers insert own listings" ON public.listings FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers update own listings" ON public.listings FOR UPDATE USING (auth.uid() = seller_id);

-- 4. SLOTS
-- Buyers can see slots they bought. Sellers can see slots of their listings.
CREATE POLICY "Public see available slots count" ON public.slots FOR SELECT USING (status = 'available'); -- Actually we might need COUNT, simpler to just allow read for now
CREATE POLICY "Sellers manage slots" ON public.slots FOR ALL USING (EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND seller_id = auth.uid()));

-- 5. ORDERS
CREATE POLICY "Buyers see own orders" ON public.orders FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Sellers see orders for their listings" ON public.orders FOR SELECT USING (EXISTS (SELECT 1 FROM public.slots s JOIN public.listings l ON s.listing_id = l.id WHERE s.id = slot_id AND l.seller_id = auth.uid()));
CREATE POLICY "Buyers create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Buyers update own orders" ON public.orders FOR UPDATE USING (auth.uid() = buyer_id);

-- 6. LEDGER
-- Users can see their own ledger
CREATE POLICY "Users see own ledger" ON public.ledger_entries FOR SELECT USING (auth.uid() = profile_id);

-- 7. PAYMENT METHODS
CREATE POLICY "Payment methods public" ON public.payment_methods FOR SELECT USING (is_active = true);
