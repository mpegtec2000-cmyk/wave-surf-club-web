-- ============================================================
-- WAVE SURF CLUB — Script SQL Completo para Supabase
-- Ejecutar en: Dashboard > SQL Editor > New Query
-- ============================================================

-- 1. Crear ENUMs
<<<<<<< HEAD
CREATE TYPE user_role AS ENUM ('superadmin', 'caja', 'asistente', 'cliente', 'profesor', 'ryder');
=======
CREATE TYPE user_role AS ENUM ('superadmin', 'caja', 'asistente', 'cliente', 'profesor', 'rider');
>>>>>>> 893568468ee5be2213dbb313ca60a3eb42ff5fd7
CREATE TYPE payment_method AS ENUM ('efectivo', 'transferencia', 'tarjeta', 'por_pagar');
CREATE TYPE trans_category AS ENUM ('arriendo', 'clase', 'tienda', 'cafeteria', 'escuela', 'pago_deuda', 'otro');

-- 2. Tabla de Sucursales
CREATE TABLE branches (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

INSERT INTO branches (name) VALUES
  ('WAVE SURF PUNTA PIEDRA'),
  ('WAVE SURF CONCÓN'),
  ('WAVE SURF PICHILEMU');

-- 3. Tabla de Perfiles (vinculada a auth.users)
CREATE TABLE profiles (
  id            UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  rut           VARCHAR(12) UNIQUE NOT NULL,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(100) UNIQUE NOT NULL,
  phone         VARCHAR(20),
  role          user_role DEFAULT 'cliente',
  branch_id     INTEGER REFERENCES branches(id),
  debt_balance  DECIMAL(10,2) DEFAULT 0.00
);

-- 4. Trigger: crear perfil automáticamente al registrar usuario en Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, rut, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'rut',
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'cliente'::user_role)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Tabla de Inventario
CREATE TABLE inventory (
  item_code  VARCHAR(20) PRIMARY KEY,
  branch_id  INTEGER REFERENCES branches(id) NOT NULL,
  color      VARCHAR(50),
  size       VARCHAR(20),
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_rented  BOOLEAN DEFAULT FALSE,
  notes      TEXT
);

-- 6. Tabla de Transacciones (POS)
CREATE TABLE transactions (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id      INTEGER REFERENCES branches(id) NOT NULL,
  staff_id       UUID REFERENCES profiles(id) NOT NULL,
  client_rut     VARCHAR(12) REFERENCES profiles(rut),
  type           VARCHAR(20) CHECK (type IN ('ingreso', 'salida')) NOT NULL,
  category       trans_category NOT NULL,
  method         payment_method,
  total          DECIMAL(10,2) NOT NULL,
  is_incident    BOOLEAN DEFAULT FALSE,
  incident_note  TEXT,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 7. ACTIVAR RLS
-- ============================================================
ALTER TABLE branches     ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory    ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 8. POLÍTICAS RLS
-- ============================================================

-- BRANCHES: todos pueden leer
CREATE POLICY "All_Read_Branches" ON branches
  FOR SELECT USING (true);

-- PROFILES: cada usuario ve el suyo; SuperAdmin ve todos
CREATE POLICY "Own_Profile_Or_Admin" ON profiles
  FOR SELECT USING (
    id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

-- PROFILES: SuperAdmin puede actualizar (para resetear deudas, roles)
CREATE POLICY "Admin_Update_Profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

-- INVENTORY: SuperAdmin tiene acceso total
CREATE POLICY "Superadmin_All_Inventory" ON inventory
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

-- INVENTORY: Caja puede leer inventario de su sede
CREATE POLICY "Caja_Read_Own_Branch_Inventory" ON inventory
  FOR SELECT USING (
    branch_id = (SELECT branch_id FROM profiles WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'caja')
  );

-- INVENTORY: Asistente NO puede leer inventario (política permisiva vacía = bloqueo)

-- TRANSACTIONS: SuperAdmin tiene acceso total
CREATE POLICY "Superadmin_All_Transactions" ON transactions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

-- TRANSACTIONS: Caja y Asistente pueden operar su sede
CREATE POLICY "Staff_All_Own_Branch_Transactions" ON transactions
  FOR ALL USING (
    branch_id = (SELECT branch_id FROM profiles WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('caja', 'asistente'))
  );

-- ============================================================
-- 9. FUNCIÓN: Actualizar deuda al crear transacción
-- ============================================================
CREATE OR REPLACE FUNCTION update_debt_balance()
RETURNS trigger AS $$
BEGIN
  -- Si el método es 'por_pagar', sumar a la deuda del cliente
  IF NEW.method = 'por_pagar' AND NEW.client_rut IS NOT NULL THEN
    UPDATE profiles
    SET debt_balance = debt_balance + NEW.total
    WHERE rut = NEW.client_rut;
  END IF;

  -- Si la categoría es 'pago_deuda', restar de la deuda del cliente
  IF NEW.category = 'pago_deuda' AND NEW.client_rut IS NOT NULL THEN
    UPDATE profiles
    SET debt_balance = GREATEST(0, debt_balance - NEW.total)
    WHERE rut = NEW.client_rut;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_transaction_created
  AFTER INSERT ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_debt_balance();

-- ============================================================
-- 10. SEED: SuperAdmin inicial
-- (Ejecutar DESPUÉS de crear el usuario en Supabase Auth Dashboard)
-- Email: WAVE_SURF_CLUB@outlook.com | Clave: WAVESURF2026
-- ============================================================
-- UPDATE profiles
-- SET role = 'superadmin', name = 'Matías Wave', rut = '11.111.111-1'
-- WHERE email = 'WAVE_SURF_CLUB@outlook.com';

-- ============================================================
-- FIN DEL SCRIPT — WAVE SURF CLUB SINCE 2015
-- ============================================================
