-- FactoryMind AI Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE user_role AS ENUM ('factory_owner', 'production_manager', 'maintenance_engineer', 'inventory_manager', 'worker', 'admin');
CREATE TYPE machine_status AS ENUM ('running', 'idle', 'maintenance', 'offline');
CREATE TYPE order_status AS ENUM ('pending', 'in_progress', 'completed', 'delayed');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE inventory_category AS ENUM ('raw_material', 'finished_goods', 'spare_parts');
CREATE TYPE maintenance_type AS ENUM ('preventive', 'corrective', 'predictive');
CREATE TYPE maintenance_status AS ENUM ('scheduled', 'in_progress', 'completed');
CREATE TYPE notification_type AS ENUM ('inventory', 'maintenance', 'machine', 'energy', 'order', 'attendance');
CREATE TYPE severity_level AS ENUM ('info', 'warning', 'critical');

-- Factories
CREATE TABLE factories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT,
  industry TEXT,
  established INTEGER,
  total_area NUMERIC,
  employee_count INTEGER DEFAULT 0,
  shift_count INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  factory_id UUID REFERENCES factories(id),
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'worker',
  department TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Machines
CREATE TABLE machines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  factory_id UUID REFERENCES factories(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT,
  status machine_status DEFAULT 'idle',
  health_score NUMERIC DEFAULT 100,
  utilization NUMERIC DEFAULT 0,
  location TEXT,
  energy_consumption NUMERIC DEFAULT 0,
  production_rate NUMERIC DEFAULT 0,
  last_maintenance DATE,
  next_maintenance DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workers
CREATE TABLE workers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  factory_id UUID REFERENCES factories(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT,
  department TEXT,
  shift TEXT,
  performance NUMERIC DEFAULT 0,
  productivity NUMERIC DEFAULT 0,
  overtime_hours NUMERIC DEFAULT 0,
  skills TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  factory_id UUID REFERENCES factories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  industry TEXT,
  total_orders INTEGER DEFAULT 0,
  revenue NUMERIC DEFAULT 0,
  profit NUMERIC DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Production Orders
CREATE TABLE production_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  factory_id UUID REFERENCES factories(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  product TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  completed INTEGER DEFAULT 0,
  status order_status DEFAULT 'pending',
  priority priority_level DEFAULT 'medium',
  machine_id UUID REFERENCES machines(id),
  customer_id UUID REFERENCES customers(id),
  start_date DATE,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  factory_id UUID REFERENCES factories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category inventory_category NOT NULL,
  quantity NUMERIC DEFAULT 0,
  unit TEXT,
  reorder_level NUMERIC DEFAULT 0,
  supplier TEXT,
  unit_cost NUMERIC DEFAULT 0,
  abc_class TEXT DEFAULT 'C',
  last_restocked DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Maintenance Records
CREATE TABLE maintenance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  factory_id UUID REFERENCES factories(id) ON DELETE CASCADE,
  machine_id UUID REFERENCES machines(id) ON DELETE CASCADE,
  type maintenance_type NOT NULL,
  status maintenance_status DEFAULT 'scheduled',
  description TEXT,
  scheduled_date DATE,
  completed_date DATE,
  cost NUMERIC DEFAULT 0,
  technician TEXT,
  downtime_hours NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Energy Records
CREATE TABLE energy_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  factory_id UUID REFERENCES factories(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  total_consumption NUMERIC,
  peak_consumption NUMERIC,
  cost NUMERIC,
  carbon_footprint NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sales Orders
CREATE TABLE sales_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  factory_id UUID REFERENCES factories(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  customer_id UUID REFERENCES customers(id),
  product TEXT,
  quantity INTEGER,
  unit_price NUMERIC,
  total_amount NUMERIC,
  status TEXT DEFAULT 'pending',
  order_date DATE,
  delivery_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  factory_id UUID REFERENCES factories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  severity severity_level DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Conversations
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  factory_id UUID REFERENCES factories(id),
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  factory_id UUID REFERENCES factories(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB,
  UNIQUE(factory_id, key)
);

-- Indexes
CREATE INDEX idx_machines_factory ON machines(factory_id);
CREATE INDEX idx_machines_status ON machines(status);
CREATE INDEX idx_production_orders_status ON production_orders(status);
CREATE INDEX idx_inventory_category ON inventory_items(category);
CREATE INDEX idx_maintenance_status ON maintenance_records(status);
CREATE INDEX idx_notifications_user ON notifications(user_id, read);
CREATE INDEX idx_ai_conversations_user ON ai_conversations(user_id);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies (factory-scoped access)
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Factory members can view machines" ON machines FOR SELECT
  USING (factory_id IN (SELECT factory_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Factory members can view workers" ON workers FOR SELECT
  USING (factory_id IN (SELECT factory_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Factory members can view production orders" ON production_orders FOR SELECT
  USING (factory_id IN (SELECT factory_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Factory members can view inventory" ON inventory_items FOR SELECT
  USING (factory_id IN (SELECT factory_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT
  USING (user_id = auth.uid() OR factory_id IN (SELECT factory_id FROM profiles WHERE id = auth.uid()));

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 'worker');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
