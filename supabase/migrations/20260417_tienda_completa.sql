-- =============================================
-- CATEGORÍAS DE TIENDA
-- =============================================
CREATE TABLE IF NOT EXISTS categorias_tienda (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  orden INTEGER DEFAULT 0,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO categorias_tienda (nombre, slug, orden) VALUES
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

-- =============================================
-- PRODUCTOS
-- =============================================
CREATE TABLE IF NOT EXISTS productos_tienda (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio INTEGER NOT NULL,
  precio_final INTEGER NOT NULL,
  aplica_comision_flow BOOLEAN DEFAULT false,
  porcentaje_comision NUMERIC DEFAULT 0,
  stock INTEGER DEFAULT 0,
  stock_ilimitado BOOLEAN DEFAULT true,
  requiere_reserva BOOLEAN DEFAULT false,
  tipo TEXT DEFAULT 'producto', -- 'producto', 'clase', 'arriendo'
  duracion_bloque INTEGER DEFAULT 60, -- minutos
  categoria_id uuid REFERENCES categorias_tienda(id) ON DELETE SET NULL,
  imagen_url TEXT,
  activo BOOLEAN DEFAULT true,
  destacado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- CLIENTES (registro público)
-- =============================================
CREATE TABLE IF NOT EXISTS clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
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
-- RESERVAS (bloques de 1 hora, 08:00 - 20:00)
-- =============================================
CREATE TABLE IF NOT EXISTS reservas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES clientes(id),
  producto_id uuid REFERENCES productos_tienda(id),
  orden_id uuid,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  estado TEXT DEFAULT 'pendiente', -- pendiente, confirmada, cancelada, completada
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(producto_id, fecha, hora_inicio) -- evitar doble reserva mismo bloque
);

-- =============================================
-- ÓRDENES
-- =============================================
CREATE TABLE IF NOT EXISTS ordenes_tienda (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES clientes(id),
  flow_order_id TEXT,
  flow_token TEXT,
  productos JSONB NOT NULL,
  reservas JSONB,
  subtotal INTEGER NOT NULL,
  comision_flow INTEGER DEFAULT 0,
  total INTEGER NOT NULL,
  estado TEXT DEFAULT 'pendiente', -- pendiente, pagado, fallido, cancelado
  email_cliente TEXT,
  nombre_cliente TEXT,
  telefono_cliente TEXT,
  rut_cliente TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Relación reservas -> orden
ALTER TABLE reservas ADD CONSTRAINT fk_orden 
  FOREIGN KEY (orden_id) REFERENCES ordenes_tienda(id) ON DELETE SET NULL;

-- =============================================
-- PRODUCTOS INICIALES
-- =============================================
WITH cat AS (SELECT id, slug FROM categorias_tienda)
INSERT INTO productos_tienda (nombre, descripcion, precio, precio_final, aplica_comision_flow, porcentaje_comision, stock_ilimitado, requiere_reserva, tipo, duracion_bloque, categoria_id, activo) VALUES

-- ARRIENDOS
('Traje de surf',
 'Arriendo de traje de surf por sesión. Incluye: uso de camarines, locker y duchas.',
 4000, 4400, true, 10, true, true, 'arriendo', 60,
 (SELECT id FROM cat WHERE slug='arriendos'), true),

('Tabla / Bodyboard / Skate',
 'Arriendo de tabla de surf, bodyboard o skate por sesión.',
 4000, 4400, true, 10, true, true, 'arriendo', 60,
 (SELECT id FROM cat WHERE slug='arriendos'), true),

('Equipo completo surf',
 'Tabla + Traje de surf. Todo lo que necesitas para surfear. Incluye uso de instalaciones.',
 7000, 7700, true, 10, true, true, 'arriendo', 60,
 (SELECT id FROM cat WHERE slug='arriendos'), true),

('Equipo completo bodyboard',
 'Tabla + Traje + Aletas. Pack completo para bodyboard. Incluye uso de instalaciones.',
 8000, 8800, true, 10, true, true, 'arriendo', 60,
 (SELECT id FROM cat WHERE slug='arriendos'), true),

('Aletas',
 'Arriendo de aletas por sesión.',
 3000, 3300, true, 10, true, true, 'arriendo', 60,
 (SELECT id FROM cat WHERE slug='arriendos'), true),

-- CLASES
('Clase colectiva',
 'Clase colectiva de surf / bodyboard / skate. Todos los días 10:00 am. Incluye: instructor calificado, equipo completo (tabla + traje), uso de instalaciones (camarines, locker, duchas), agua potable y wifi. Duración: 1:30 hrs + sesión libre con equipamiento.',
 15000, 16500, true, 10, true, true, 'clase', 60,
 (SELECT id FROM cat WHERE slug='clases'), true),

('Clase personalizada',
 'Clase de surf / bodyboard / skate personalizada. Incluye instructor dedicado, equipo completo y uso de todas las instalaciones. Duración: 1:30 hrs + tiempo libre con equipamiento.',
 20000, 22000, true, 10, true, true, 'clase', 60,
 (SELECT id FROM cat WHERE slug='clases'), true),

('Pack 3 clases',
 'Pack de 3 clases de surf, bodyboard o skate. Cada clase incluye instructor, equipo completo e instalaciones. Coordinar horarios al momento de la compra.',
 50000, 55000, true, 10, true, false, 'clase', 60,
 (SELECT id FROM cat WHERE slug='clases'), true),

('Pack 5 clases',
 'Pack de 5 clases. La mejor relación precio-valor. Incluye todo el equipamiento y uso de instalaciones en cada sesión.',
 80000, 88000, true, 10, true, false, 'clase', 60,
 (SELECT id FROM cat WHERE slug='clases'), true),

-- BODEGA
('Bodega 15 días',
 'Guarda tu tabla en la escuela por 15 días. Acceso disponible en horario de apertura.',
 15000, 15000, false, 0, true, false, 'producto', 0,
 (SELECT id FROM cat WHERE slug='bodega'), true),

('Bodega mensual',
 'Guarda tu tabla en la escuela por 30 días. La option más cómoda para surfistas frecuentes.',
 20000, 20000, false, 0, true, false, 'producto', 0,
 (SELECT id FROM cat WHERE slug='bodega'), true);

-- =============================================
-- STORAGE BUCKET PARA IMÁGENES
-- =============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('productos-tienda', 'productos-tienda', true)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE categorias_tienda ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos_tienda ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_tienda ENABLE ROW LEVEL SECURITY;

-- Categorías: lectura pública, escritura autenticada
CREATE POLICY "Public read categorias" ON categorias_tienda FOR SELECT TO public USING (activa = true);
CREATE POLICY "Auth manage categorias" ON categorias_tienda FOR ALL TO authenticated USING (true);

-- Productos: lectura pública, escritura autenticada
CREATE POLICY "Public read productos" ON productos_tienda FOR SELECT TO public USING (activo = true);
CREATE POLICY "Auth manage productos" ON productos_tienda FOR ALL TO authenticated USING (true);

-- Clientes: registro público, lectura propia
CREATE POLICY "Public insert clientes" ON clientes FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Auth manage clientes" ON clientes FOR ALL TO authenticated USING (true);
CREATE POLICY "Client read own" ON clientes FOR SELECT TO authenticated USING (auth.uid() = auth_user_id);

-- Reservas: lectura pública de disponibilidad, escritura pública
CREATE POLICY "Public read reservas disponibilidad" ON reservas FOR SELECT TO public USING (true);
CREATE POLICY "Public insert reservas" ON reservas FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Auth manage reservas" ON reservas FOR ALL TO authenticated USING (true);

-- Órdenes
CREATE POLICY "Public insert ordenes" ON ordenes_tienda FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Auth manage ordenes" ON ordenes_tienda FOR ALL TO authenticated USING (true);

-- Storage policies
CREATE POLICY "Public view images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'productos-tienda');
CREATE POLICY "Auth upload images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'productos-tienda');
CREATE POLICY "Auth update images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'productos-tienda');
CREATE POLICY "Auth delete images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'productos-tienda');
