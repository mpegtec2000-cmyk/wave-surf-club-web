-- =============================================
-- WAVE SURF CLUB — Supabase Schema & Seed Data
-- =============================================

-- =============================================
-- SCHEMA DEFINITION
-- =============================================

-- 1. Branches
CREATE TABLE IF NOT EXISTS public.branches (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    short_name VARCHAR(50) NOT NULL,
    emoji VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Profiles (Users/Staff) 
-- Note: Assuming Firebase Auth or Supabase Auth is used, this stores additional profile info
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY, -- references auth.users(id)
    email VARCHAR(255) UNIQUE NOT NULL,
    rut VARCHAR(20),
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'caja' CHECK (role IN ('superadmin', 'caja', 'asistente', 'cliente')),
    branch_id INTEGER REFERENCES public.branches(id),
    phone VARCHAR(50),
    debt_balance NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Clients
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rut VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    debt_balance NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Inventory
CREATE TABLE IF NOT EXISTS public.inventory (
    item_code VARCHAR(50) PRIMARY KEY,
    branch_id INTEGER REFERENCES public.branches(id),
    color VARCHAR(100),
    size VARCHAR(50),
    entry_date DATE NOT NULL,
    is_rented BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Transactions (Ingresos/Salidas pos)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id INTEGER REFERENCES public.branches(id),
    staff_id UUID REFERENCES public.profiles(id),
    client_rut VARCHAR(20), -- Alternatively could reference clients(id), but rut is used in POS
    type VARCHAR(20) CHECK (type IN ('ingreso', 'salida')),
    category VARCHAR(50),
    method VARCHAR(50),
    total NUMERIC(10, 2) NOT NULL,
    is_incident BOOLEAN DEFAULT false,
    incident_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================
-- SEED DATA
-- =============================================

-- clear existing data to prevent conflicts during seed
TRUNCATE TABLE public.transactions, public.inventory, public.clients, public.profiles, public.branches RESTART IDENTITY CASCADE;

-- Insert Branches
INSERT INTO public.branches (id, name, short_name, emoji) VALUES
(1, 'Sede Central - Punta Piedra', 'Punta Piedra', '🏖️'),
(2, 'Agencia Secundario - Concón', 'Concón', '🏄'),
(3, 'Agencia Nómada - Pichilemu', 'Pichilemu', '🌊');

-- Note: In a real Supabase setup, you need to create auth users first and use their UUIDs. 
-- For testing purposes, we handle the profiles directly with dummy UUIDs (or rely on trigger).
-- We'll use random UUIDs for staff in the seed for now. 
DO $$
DECLARE
    superadmin_id UUID := gen_random_uuid();
    caja_id UUID := gen_random_uuid();
    asistente_id UUID := gen_random_uuid();
BEGIN
    INSERT INTO public.profiles (id, email, rut, name, role, branch_id, phone, debt_balance) VALUES
    (superadmin_id, 'WAVE_SURF_CLUB@outlook.com', '11.111.111-1', 'Matías Wave', 'superadmin', NULL, '+56 9 1234 5678', 0),
    (caja_id, 'caja@wavesurf.cl', '22.222.222-2', 'Carlos Caja', 'caja', 1, '+56 9 2222 2222', 0),
    (asistente_id, 'asistente@wavesurf.cl', '33.333.333-3', 'Ana Asistente', 'asistente', 1, '+56 9 3333 3333', 0);
END $$;

-- Insert Clients
INSERT INTO public.clients (rut, name, email, phone, debt_balance) VALUES
('12.345.678-5', 'Pedro Soto', 'pedro@mail.com', '+56 9 5555 1111', 45000),
('98.765.432-1', 'María López', 'maria@mail.com', '+56 9 5555 2222', 0),
('11.222.333-4', 'Juan Pérez', 'juan@mail.com', '+56 9 5555 3333', 12500),
('44.555.666-7', 'Camila Reyes', 'camila@mail.com', '+56 9 5555 4444', 0),
('77.888.999-0', 'Diego Fuentes', 'diego@mail.com', '+56 9 5555 5555', 78000);

-- Insert Inventory
INSERT INTO public.inventory (item_code, branch_id, color, size, entry_date, is_rented, notes) VALUES
('T-001', 1, 'Azul', '7''2"', CURRENT_DATE - INTERVAL '1 month', false, 'Tabla shortboard nueva'),
('T-002', 1, 'Blanco', '6''8"', CURRENT_DATE - INTERVAL '2 months', true, 'Tabla fish'),
('T-003', 1, 'Negro', '8''0"', CURRENT_DATE - INTERVAL '4 months', false, 'Tabla funboard'),
('T-004', 1, 'Rojo', '9''0"', CURRENT_DATE - INTERVAL '7 months', false, 'Longboard — necesita revisión'),
('T-005', 1, 'Verde', '5''10"', CURRENT_DATE - INTERVAL '10 months', false, 'Tabla VENCIDA — bloquear'),
('TR-001', 1, 'Negro', 'M', CURRENT_DATE - INTERVAL '1 month', false, 'Traje 3/2mm'),
('TR-002', 1, 'Negro', 'L', CURRENT_DATE - INTERVAL '5 months', true, 'Traje 4/3mm'),
('T-010', 2, 'Amarillo', '7''6"', CURRENT_DATE, false, 'Tabla nueva Concón'),
('T-011', 2, 'Celeste', '6''4"', CURRENT_DATE - INTERVAL '3 months', false, 'Tabla retro twin'),
('T-012', 2, 'Gris', '8''6"', CURRENT_DATE - INTERVAL '8 months', false, 'Tabla mini-mal reparación'),
('TR-010', 2, 'Negro/Rojo', 'S', CURRENT_DATE - INTERVAL '11 months', false, 'Traje VENCIDO Concón'),
('T-020', 3, 'Blanco/Azul', '6''0"', CURRENT_DATE - INTERVAL '1 month', true, 'Performance shortboard'),
('T-021', 3, 'Naranja', '7''0"', CURRENT_DATE - INTERVAL '5 months', false, 'Tabla escuela Pichilemu'),
('TR-020', 3, 'Full Black', 'XL', CURRENT_DATE - INTERVAL '2 months', false, 'Traje premium 4/3mm');

-- Transactions can also be scaffolded here using random staff profiles:
DO $$
DECLARE
    staff_userId UUID;
BEGIN
    SELECT id INTO staff_userId FROM public.profiles WHERE email = 'caja@wavesurf.cl' LIMIT 1;
    
    INSERT INTO public.transactions (branch_id, staff_id, client_rut, type, category, method, total, is_incident, incident_note, created_at) VALUES
    (1, staff_userId, '12.345.678-5', 'ingreso', 'arriendo', 'efectivo', 15000, false, '', NOW() - INTERVAL '2 hours'),
    (1, staff_userId, '98.765.432-1', 'ingreso', 'clase', 'transferencia', 25000, false, '', NOW() - INTERVAL '3 hours'),
    (1, staff_userId, '12.345.678-5', 'ingreso', 'tienda', 'por_pagar', 45000, false, '', NOW() - INTERVAL '5 hours'),
    (1, staff_userId, '44.555.666-7', 'ingreso', 'cafeteria', 'tarjeta', 8500, false, '', NOW() - INTERVAL '6 hours'),
    (2, staff_userId, '77.888.999-0', 'ingreso', 'arriendo', 'efectivo', 20000, true, 'Tabla T-011 con ding en nose. Cargo extra $5.000', NOW() - INTERVAL '1 hour'),
    (1, staff_userId, '11.222.333-4', 'salida', 'otro', 'efectivo', 5000, false, '', NOW() - INTERVAL '4 hours'),
    (3, staff_userId, '98.765.432-1', 'ingreso', 'escuela', 'transferencia', 35000, false, '', NOW() - INTERVAL '1 hour');
END $$;
