-- ====================================================================
-- WAVE SURF CLUB — SCRIPT DEFINITIVO DE RESTAURACIÓN TOTAL DE BASE DE DATOS
-- Proyecto Supabase: keaoaxltnbdxysysxxem
-- ====================================================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. SUCURSALES (BRANCHES)
-- =============================================
CREATE TABLE IF NOT EXISTS public.branches (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    short_name VARCHAR(50) NOT NULL,
    emoji VARCHAR(10),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================
-- 2. PERFILES (PROFILES) Y ACCESO A SEDES
-- =============================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    rut VARCHAR(20),
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'caja' CHECK (role IN ('superadmin', 'caja', 'asistente', 'cliente', 'profesor', 'rider')),
    branch_id INTEGER REFERENCES public.branches(id) ON DELETE SET NULL,
    phone VARCHAR(50),
    debt_balance NUMERIC(10, 2) DEFAULT 0,
    is_staff BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.staff_branch_access (
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    branch_id INTEGER REFERENCES public.branches(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (profile_id, branch_id)
);

-- =============================================
-- 3. CLIENTES REGISTRADOS
-- =============================================
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rut VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    debt_balance NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Clientes web (auth sync)
CREATE TABLE IF NOT EXISTS public.clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    rut TEXT UNIQUE,
    email TEXT NOT NULL UNIQUE,
    telefono TEXT,
    fecha_nacimiento DATE,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 4. INVENTARIO LOGÍSTICO (TABLAS Y TRAJES - SISTEMA AV)
-- =============================================
CREATE TABLE IF NOT EXISTS public.inventory (
    item_code VARCHAR(50) PRIMARY KEY,
    branch_id INTEGER REFERENCES public.branches(id) ON DELETE RESTRICT,
    category VARCHAR(50) DEFAULT 'tabla',
    color VARCHAR(100),
    size VARCHAR(50),
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    av_override VARCHAR(20),
    is_rented BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================
-- 5. CIERRES DE CAJA CONSOLIDADOS (CASH CLOSINGS)
-- =============================================
CREATE TABLE IF NOT EXISTS public.cash_closings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id INTEGER REFERENCES public.branches(id) ON DELETE RESTRICT,
    closed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_income NUMERIC(10, 2) DEFAULT 0,
    total_expense NUMERIC(10, 2) DEFAULT 0,
    net_utility NUMERIC(10, 2) DEFAULT 0,
    total_cash NUMERIC(10, 2) DEFAULT 0,
    total_transfer NUMERIC(10, 2) DEFAULT 0,
    total_card NUMERIC(10, 2) DEFAULT 0,
    total_debt NUMERIC(10, 2) DEFAULT 0,
    grand_total NUMERIC(10, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================
-- 6. TRANSACCIONES (PUNTO DE VENTA POS Y CAJA)
-- =============================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id INTEGER REFERENCES public.branches(id) ON DELETE RESTRICT,
    staff_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    client_rut VARCHAR(20),
    type VARCHAR(20) CHECK (type IN ('ingreso', 'salida')) NOT NULL,
    category VARCHAR(50) NOT NULL,
    method VARCHAR(50),
    total NUMERIC(10, 2) NOT NULL,
    is_incident BOOLEAN DEFAULT false,
    incident_note TEXT,
    rental_status VARCHAR(50) DEFAULT 'en_curso',
    rental_details TEXT,
    finalized_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    id_sesion UUID REFERENCES public.cash_closings(id) ON DELETE SET NULL,
    valid_until TIMESTAMPTZ,
    subscription_period VARCHAR(50),
    is_web_tx BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================
-- 7. TIENDA ONLINE, CATEGORÍAS, PRODUCTOS Y RESERVAS
-- =============================================
CREATE TABLE IF NOT EXISTS public.categorias_tienda (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    orden INTEGER DEFAULT 0,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.productos_tienda (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio INTEGER NOT NULL,
    precio_final INTEGER NOT NULL,
    aplica_comision_flow BOOLEAN DEFAULT false,
    porcentaje_comision NUMERIC DEFAULT 0,
    stock INTEGER DEFAULT 0,
    stock_ilimitado BOOLEAN DEFAULT true,
    requiere_reserva BOOLEAN DEFAULT false,
    tipo TEXT DEFAULT 'producto',
    duracion_bloque INTEGER DEFAULT 60,
    categoria_id UUID REFERENCES public.categorias_tienda(id) ON DELETE SET NULL,
    imagen_url TEXT,
    activo BOOLEAN DEFAULT true,
    destacado BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ordenes_tienda (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
    flow_order_id TEXT,
    flow_token TEXT,
    productos JSONB NOT NULL,
    reservas JSONB,
    subtotal INTEGER NOT NULL,
    comision_flow INTEGER DEFAULT 0,
    total INTEGER NOT NULL,
    estado TEXT DEFAULT 'pendiente',
    email_cliente TEXT,
    nombre_cliente TEXT,
    telefono_cliente TEXT,
    rut_cliente TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reservas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
    producto_id UUID REFERENCES public.productos_tienda(id) ON DELETE CASCADE,
    orden_id UUID REFERENCES public.ordenes_tienda(id) ON DELETE SET NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    estado TEXT DEFAULT 'pendiente',
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(producto_id, fecha, hora_inicio)
);

CREATE TABLE IF NOT EXISTS public.app_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT,
    recipient TEXT,
    subject TEXT,
    content TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 8. DATOS SEMILLA (SEED DATA)
-- =============================================

-- Sedes
INSERT INTO public.branches (id, name, short_name, emoji, is_active) VALUES
(1, 'WAVE SURF PUNTA PIEDRA', 'Punta Piedra', '🏖️', true),
(2, 'WAVE SURF CONCÓN', 'Concón', '🌊', true),
(3, 'WAVE SURF PICHILEMU', 'Pichilemu', '🏄', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, short_name = EXCLUDED.short_name, emoji = EXCLUDED.emoji;

-- Personal / Usuarios Staff
INSERT INTO public.profiles (id, email, rut, name, role, branch_id, phone, debt_balance, is_staff, is_active) VALUES
('a0000000-0000-0000-0000-000000000001', 'WAVE_SURF_CLUB@outlook.com', '11.111.111-1', 'Matías Wave', 'superadmin', 1, '+56 9 1234 5678', 0, true, true),
('a0000000-0000-0000-0000-000000000002', 'francisco@wavesurf.cl', '19.999.999-9', 'Francisco Lusiño', 'superadmin', 1, '+56 9 9999 9999', 0, true, true),
('a0000000-0000-0000-0000-000000000003', 'caja@wavesurf.cl', '22.222.222-2', 'Carlos Caja', 'caja', 1, '+56 9 2222 2222', 0, true, true),
('a0000000-0000-0000-0000-000000000004', 'asistente@wavesurf.cl', '33.333.333-3', 'Ana Asistente', 'asistente', 1, '+56 9 3333 3333', 0, true, true)
ON CONFLICT (email) DO UPDATE SET is_staff = true, is_active = true, role = EXCLUDED.role;

-- Permisos de sedes
INSERT INTO public.staff_branch_access (profile_id, branch_id) VALUES
('a0000000-0000-0000-0000-000000000001', 1),
('a0000000-0000-0000-0000-000000000001', 2),
('a0000000-0000-0000-0000-000000000001', 3),
('a0000000-0000-0000-0000-000000000002', 1),
('a0000000-0000-0000-0000-000000000002', 2),
('a0000000-0000-0000-0000-000000000002', 3),
('a0000000-0000-0000-0000-000000000003', 1),
('a0000000-0000-0000-0000-000000000003', 2),
('a0000000-0000-0000-0000-000000000004', 1)
ON CONFLICT DO NOTHING;

-- Clientes de ejemplo
INSERT INTO public.clients (rut, name, email, phone, debt_balance) VALUES
('12.345.678-5', 'Pedro Soto', 'pedro@mail.com', '+56 9 5555 1111', 45000),
('98.765.432-1', 'María López', 'maria@mail.com', '+56 9 5555 2222', 0),
('11.222.333-4', 'Juan Pérez', 'juan@mail.com', '+56 9 5555 3333', 12500),
('44.555.666-7', 'Camila Reyes', 'camila@mail.com', '+56 9 5555 4444', 0),
('77.888.999-0', 'Diego Fuentes', 'diego@mail.com', '+56 9 5555 5555', 78000)
ON CONFLICT (rut) DO NOTHING;

-- Inventario con semáforo AV (0 a 11 meses)
INSERT INTO public.inventory (item_code, branch_id, category, color, size, entry_date, is_rented, notes) VALUES
('T-001', 1, 'tabla', 'Azul', '7''2"', CURRENT_DATE - INTERVAL '1 month', false, 'Tabla shortboard nueva'),
('T-002', 1, 'tabla', 'Blanco', '6''8"', CURRENT_DATE - INTERVAL '2 months', true, 'Tabla fish'),
('T-003', 1, 'tabla', 'Negro', '8''0"', CURRENT_DATE - INTERVAL '4 months', false, 'Tabla funboard'),
('T-004', 1, 'tabla', 'Rojo', '9''0"', CURRENT_DATE - INTERVAL '7 months', false, 'Longboard — necesita revisión'),
('T-005', 1, 'tabla', 'Verde', '5''10"', CURRENT_DATE - INTERVAL '10 months', false, 'Tabla VENCIDA — bloquear'),
('TR-001', 1, 'traje', 'Negro', 'M', CURRENT_DATE - INTERVAL '1 month', false, 'Traje 3/2mm'),
('TR-002', 1, 'traje', 'Negro', 'L', CURRENT_DATE - INTERVAL '5 months', true, 'Traje 4/3mm'),
('T-010', 2, 'tabla', 'Amarillo', '7''6"', CURRENT_DATE, false, 'Tabla nueva Concón'),
('T-011', 2, 'tabla', 'Celeste', '6''4"', CURRENT_DATE - INTERVAL '3 months', false, 'Tabla retro twin'),
('T-012', 2, 'tabla', 'Gris', '8''6"', CURRENT_DATE - INTERVAL '8 months', false, 'Tabla mini-mal reparación'),
('TR-010', 2, 'traje', 'Negro/Rojo', 'S', CURRENT_DATE - INTERVAL '11 months', false, 'Traje VENCIDO Concón'),
('T-020', 3, 'tabla', 'Blanco/Azul', '6''0"', CURRENT_DATE - INTERVAL '1 month', true, 'Performance shortboard'),
('T-021', 3, 'tabla', 'Naranja', '7''0"', CURRENT_DATE - INTERVAL '5 months', false, 'Tabla escuela Pichilemu'),
('TR-020', 3, 'traje', 'Full Black', 'XL', CURRENT_DATE - INTERVAL '2 months', false, 'Traje premium 4/3mm')
ON CONFLICT (item_code) DO NOTHING;

-- Categorías de la Tienda
INSERT INTO public.categorias_tienda (nombre, slug, orden) VALUES
('Arriendos', 'arriendos', 1),
('Clases', 'clases', 2),
('Bodega', 'bodega', 3),
('Poleras', 'poleras', 4),
('Polerones', 'polerones', 5),
('Pantalones', 'pantalones', 6),
('Shorts', 'shorts', 7),
('Gorros', 'gorros', 8),
('Tablas', 'tablas', 9),
('Trajes', 'trajes', 10),
('Cremas solares', 'cremas-solares', 11)
ON CONFLICT (slug) DO NOTHING;

-- Productos de la Tienda
WITH cat AS (SELECT id, slug FROM public.categorias_tienda)
INSERT INTO public.productos_tienda (nombre, descripcion, precio, precio_final, aplica_comision_flow, porcentaje_comision, stock_ilimitado, requiere_reserva, tipo, duracion_bloque, categoria_id, activo) VALUES
('Traje de surf', 'Arriendo de traje de surf por sesión. Incluye uso de camarines, locker y duchas.', 4000, 4400, true, 10, true, true, 'arriendo', 60, (SELECT id FROM cat WHERE slug='arriendos'), true),
('Tabla / Bodyboard / Skate', 'Arriendo de tabla de surf, bodyboard o skate por sesión.', 4000, 4400, true, 10, true, true, 'arriendo', 60, (SELECT id FROM cat WHERE slug='arriendos'), true),
('Equipo completo surf', 'Tabla + Traje de surf. Todo lo necesario para surfear. Incluye uso de instalaciones.', 7000, 7700, true, 10, true, true, 'arriendo', 60, (SELECT id FROM cat WHERE slug='arriendos'), true),
('Equipo completo bodyboard', 'Tabla + Traje + Aletas. Pack completo para bodyboard. Incluye instalaciones.', 8000, 8800, true, 10, true, true, 'arriendo', 60, (SELECT id FROM cat WHERE slug='arriendos'), true),
('Aletas', 'Arriendo de aletas por sesión.', 3000, 3300, true, 10, true, true, 'arriendo', 60, (SELECT id FROM cat WHERE slug='arriendos'), true),
('Clase colectiva', 'Clase colectiva de surf / bodyboard / skate. Todos los días 10:00 am. Incluye instructor, equipo e instalaciones. Duración: 1:30 hrs + sesión libre.', 15000, 16500, true, 10, true, true, 'clase', 60, (SELECT id FROM cat WHERE slug='clases'), true),
('Clase personalizada', 'Clase personalizada con instructor dedicado, equipo completo e instalaciones. Duración: 1:30 hrs.', 20000, 22000, true, 10, true, true, 'clase', 60, (SELECT id FROM cat WHERE slug='clases'), true),
('Pack 3 clases', 'Pack de 3 clases de surf, bodyboard o skate con instructor y equipo incluido.', 50000, 55000, true, 10, true, false, 'clase', 60, (SELECT id FROM cat WHERE slug='clases'), true),
('Pack 5 clases', 'Pack de 5 clases con la mejor relación precio-valor. Equipo completo incluido.', 80000, 88000, true, 10, true, false, 'clase', 60, (SELECT id FROM cat WHERE slug='clases'), true),
('Bodega 15 días', 'Guarda tu tabla en la escuela por 15 días. Acceso en horario operativo.', 15000, 15000, false, 0, true, false, 'producto', 0, (SELECT id FROM cat WHERE slug='bodega'), true),
('Bodega mensual', 'Guarda tu tabla en la escuela por 30 días.', 20000, 20000, false, 0, true, false, 'producto', 0, (SELECT id FROM cat WHERE slug='bodega'), true);

-- Transacciones iniciales para el panel POS / Caja
INSERT INTO public.transactions (branch_id, staff_id, client_rut, type, category, method, total, is_incident, incident_note, created_at) VALUES
(1, 'a0000000-0000-0000-0000-000000000003', '12.345.678-5', 'ingreso', 'arriendo', 'efectivo', 15000, false, '', NOW() - INTERVAL '2 hours'),
(1, 'a0000000-0000-0000-0000-000000000003', '98.765.432-1', 'ingreso', 'clase', 'transferencia', 25000, false, '', NOW() - INTERVAL '3 hours'),
(1, 'a0000000-0000-0000-0000-000000000003', '12.345.678-5', 'ingreso', 'tienda', 'por_pagar', 45000, false, '', NOW() - INTERVAL '5 hours'),
(1, 'a0000000-0000-0000-0000-000000000003', '44.555.666-7', 'ingreso', 'cafeteria', 'tarjeta', 8500, false, '', NOW() - INTERVAL '6 hours'),
(2, 'a0000000-0000-0000-0000-000000000003', '77.888.999-0', 'ingreso', 'arriendo', 'efectivo', 20000, true, 'Tabla T-011 con ding en nose. Cargo extra $5.000', NOW() - INTERVAL '1 hour'),
(1, 'a0000000-0000-0000-0000-000000000003', '11.222.333-4', 'salida', 'otro', 'efectivo', 5000, false, '', NOW() - INTERVAL '4 hours'),
(3, 'a0000000-0000-0000-0000-000000000003', '98.765.432-1', 'ingreso', 'escuela', 'transferencia', 35000, false, '', NOW() - INTERVAL '1 hour');

-- Configuración por defecto del sistema
INSERT INTO public.site_settings (key, value) VALUES
('flow_api_key', ''),
('flow_secret_key', ''),
('flow_url', 'https://www.flow.cl/api')
ON CONFLICT (key) DO NOTHING;

-- Bucket para imágenes de productos
INSERT INTO storage.buckets (id, name, public)
VALUES ('productos-tienda', 'productos-tienda', true)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 9. SEGURIDAD RLS (ROW LEVEL SECURITY)
-- =============================================
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_branch_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_closings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias_tienda ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos_tienda ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordenes_tienda ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública
CREATE POLICY "Public read branches" ON public.branches FOR SELECT TO public USING (true);
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT TO public USING (true);
CREATE POLICY "Public read staff_access" ON public.staff_branch_access FOR SELECT TO public USING (true);
CREATE POLICY "Public read clients" ON public.clients FOR SELECT TO public USING (true);
CREATE POLICY "Public read inventory" ON public.inventory FOR SELECT TO public USING (true);
CREATE POLICY "Public read transactions" ON public.transactions FOR SELECT TO public USING (true);
CREATE POLICY "Public read closings" ON public.cash_closings FOR SELECT TO public USING (true);
CREATE POLICY "Public read categorias" ON public.categorias_tienda FOR SELECT TO public USING (true);
CREATE POLICY "Public read productos" ON public.productos_tienda FOR SELECT TO public USING (true);
CREATE POLICY "Public read reservas" ON public.reservas FOR SELECT TO public USING (true);
CREATE POLICY "Public read ordenes" ON public.ordenes_tienda FOR SELECT TO public USING (true);
CREATE POLICY "Public read settings" ON public.site_settings FOR SELECT TO public USING (true);

-- Políticas de escritura permisiva
CREATE POLICY "Public insert ordenes" ON public.ordenes_tienda FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public insert reservas" ON public.reservas FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public insert clients" ON public.clients FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public insert transactions" ON public.transactions FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public insert closings" ON public.cash_closings FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public insert notifications" ON public.app_notifications FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Public update transactions" ON public.transactions FOR UPDATE TO public USING (true);
CREATE POLICY "Public update inventory" ON public.inventory FOR UPDATE TO public USING (true);
CREATE POLICY "Public update ordenes" ON public.ordenes_tienda FOR UPDATE TO public USING (true);
CREATE POLICY "Public update settings" ON public.site_settings FOR UPDATE TO public USING (true);

-- Políticas de Storage
CREATE POLICY "Public view images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'productos-tienda');
CREATE POLICY "Auth upload images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'productos-tienda');
