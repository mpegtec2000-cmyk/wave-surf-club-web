// =============================================
// WAVE SURF CLUB — Mock Data Store
// Simula Supabase hasta que se configure
// =============================================

// ---- USUARIOS DE EJEMPLO ----
export const MOCK_USERS = {
  'WAVE_SURF_CLUB@outlook.com': {
    id: 'u-001',
    email: 'WAVE_SURF_CLUB@outlook.com',
    password: 'WAVESURF2026',
    rut: '11.111.111-1',
    name: 'Matías Wave',
    role: 'superadmin',
    allowed_branches: [1, 2, 3],
    phone: '+56 9 1234 5678',
    debt_balance: 0,
  },
  'francisco@wavesurf.cl': {
    id: 'u-004',
    email: 'francisco@wavesurf.cl',
    password: 'francisco2026',
    rut: '19.999.999-9',
    name: 'Francisco Lusiño',
    role: 'superadmin',
    allowed_branches: [1, 2, 3],
    phone: '+56 9 9999 9999',
    debt_balance: 0,
  },
  'caja@wavesurf.cl': {
    id: 'u-002',
    email: 'caja@wavesurf.cl',
    password: 'caja2026',
    rut: '22.222.222-2',
    name: 'Carlos Caja',
    role: 'caja',
    allowed_branches: [1, 2],
    phone: '+56 9 2222 2222',
    debt_balance: 0,
  },
  'asistente@wavesurf.cl': {
    id: 'u-003',
    email: 'asistente@wavesurf.cl',
    password: 'asistente2026',
    rut: '33.333.333-3',
    name: 'Ana Asistente',
    role: 'asistente',
    allowed_branches: [1],
    phone: '+56 9 3333 3333',
    debt_balance: 0,
  },
};

export function getMockStaff() {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('wave_staff');
    if (stored) return JSON.parse(stored);
  }
  return Object.values(MOCK_USERS);
}

export function saveMockStaff(staffArray) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('wave_staff', JSON.stringify(staffArray));
  }
}

// ---- CLIENTES DE EJEMPLO ----
export const MOCK_CLIENTS = [
  { rut: '12.345.678-5', name: 'Pedro Soto', email: 'pedro@mail.com', phone: '+56 9 5555 1111', role: 'cliente', branch_id: null, debt_balance: 45000 },
  { rut: '98.765.432-1', name: 'María López', email: 'maria@mail.com', phone: '+56 9 5555 2222', role: 'cliente', branch_id: null, debt_balance: 0 },
  { rut: '11.222.333-4', name: 'Juan Pérez', email: 'juan@mail.com', phone: '+56 9 5555 3333', role: 'cliente', branch_id: null, debt_balance: 12500 },
  { rut: '44.555.666-7', name: 'Camila Reyes', email: 'camila@mail.com', phone: '+56 9 5555 4444', role: 'cliente', branch_id: null, debt_balance: 0 },
  { rut: '77.888.999-0', name: 'Diego Fuentes', email: 'diego@mail.com', phone: '+56 9 5555 5555', role: 'cliente', branch_id: null, debt_balance: 78000 },
];

// ---- INVENTARIO DE EJEMPLO ----
// entry_date variadas para probar todos los niveles AV
const today = new Date();
function monthsAgo(m) {
  const d = new Date(today);
  d.setMonth(d.getMonth() - m);
  return d.toISOString().split('T')[0];
}

export const MOCK_INVENTORY = [
  // Sede 1 - Punta Piedra
  { item_code: 'T-001', branch_id: 1, color: 'Azul', size: '7\'2"', entry_date: monthsAgo(1), is_rented: false, notes: 'Tabla shortboard nueva' },
  { item_code: 'T-002', branch_id: 1, color: 'Blanco', size: '6\'8"', entry_date: monthsAgo(2), is_rented: true, notes: 'Tabla fish' },
  { item_code: 'T-003', branch_id: 1, color: 'Negro', size: '8\'0"', entry_date: monthsAgo(4), is_rented: false, notes: 'Tabla funboard' },
  { item_code: 'T-004', branch_id: 1, color: 'Rojo', size: '9\'0"', entry_date: monthsAgo(7), is_rented: false, notes: 'Longboard — necesita revisión' },
  { item_code: 'T-005', branch_id: 1, color: 'Verde', size: '5\'10"', entry_date: monthsAgo(10), is_rented: false, notes: 'Tabla VENCIDA — bloquear' },
  { item_code: 'TR-001', branch_id: 1, color: 'Negro', size: 'M', entry_date: monthsAgo(1), is_rented: false, notes: 'Traje 3/2mm' },
  { item_code: 'TR-002', branch_id: 1, color: 'Negro', size: 'L', entry_date: monthsAgo(5), is_rented: true, notes: 'Traje 4/3mm' },
  // Sede 2 - Concón
  { item_code: 'T-010', branch_id: 2, color: 'Amarillo', size: '7\'6"', entry_date: monthsAgo(0), is_rented: false, notes: 'Tabla nueva Concón' },
  { item_code: 'T-011', branch_id: 2, color: 'Celeste', size: '6\'4"', entry_date: monthsAgo(3), is_rented: false, notes: 'Tabla retro twin' },
  { item_code: 'T-012', branch_id: 2, color: 'Gris', size: '8\'6"', entry_date: monthsAgo(8), is_rented: false, notes: 'Tabla mini-mal reparación' },
  { item_code: 'TR-010', branch_id: 2, color: 'Negro/Rojo', size: 'S', entry_date: monthsAgo(11), is_rented: false, notes: 'Traje VENCIDO Concón' },
  // Sede 3 - Pichilemu
  { item_code: 'T-020', branch_id: 3, color: 'Blanco/Azul', size: '6\'0"', entry_date: monthsAgo(1), is_rented: true, notes: 'Performance shortboard' },
  { item_code: 'T-021', branch_id: 3, color: 'Naranja', size: '7\'0"', entry_date: monthsAgo(5), is_rented: false, notes: 'Tabla escuela Pichilemu' },
  { item_code: 'TR-020', branch_id: 3, color: 'Full Black', size: 'XL', entry_date: monthsAgo(2), is_rented: false, notes: 'Traje premium 4/3mm' },
];

// ---- TRANSACCIONES DE EJEMPLO ----
function hoursAgo(h) {
  const d = new Date(today);
  d.setHours(d.getHours() - h);
  return d.toISOString();
}

export const MOCK_TRANSACTIONS = [
  { id: 'tx-001', branch_id: 1, staff_id: 'u-002', client_rut: '12.345.678-5', type: 'ingreso', category: 'arriendo', method: 'efectivo', total: 15000, is_incident: false, incident_note: '', rental_status: 'en_curso', rental_details: 'Tabla 7\'2" y Traje 4/3mm', created_at: hoursAgo(2) },
  { id: 'tx-002', branch_id: 1, staff_id: 'u-002', client_rut: '98.765.432-1', type: 'ingreso', category: 'clase', method: 'transferencia', total: 25000, is_incident: false, incident_note: '', created_at: hoursAgo(3) },
  { id: 'tx-003', branch_id: 1, staff_id: 'u-002', client_rut: '12.345.678-5', type: 'ingreso', category: 'tienda', method: 'por_pagar', total: 45000, is_incident: false, incident_note: '', created_at: hoursAgo(5) },
  { id: 'tx-004', branch_id: 1, staff_id: 'u-002', client_rut: '44.555.666-7', type: 'ingreso', category: 'cafeteria', method: 'tarjeta', total: 8500, is_incident: false, incident_note: '', created_at: hoursAgo(6) },
  { id: 'tx-005', branch_id: 2, staff_id: 'u-002', client_rut: '77.888.999-0', type: 'ingreso', category: 'arriendo', method: 'efectivo', total: 20000, is_incident: true, incident_note: 'Tabla T-011 con ding en nose. Cargo extra $5.000', rental_status: 'finalizado', rental_details: 'Tabla T-011 (con daño)', created_at: hoursAgo(1) },
  { id: 'tx-006', branch_id: 1, staff_id: 'u-002', client_rut: '11.222.333-4', type: 'salida', category: 'otro', method: 'efectivo', total: 5000, is_incident: false, incident_note: '', created_at: hoursAgo(4) },
  { id: 'tx-007', branch_id: 3, staff_id: 'u-002', client_rut: '98.765.432-1', type: 'ingreso', category: 'escuela', method: 'transferencia', total: 35000, is_incident: false, incident_note: '', created_at: hoursAgo(1) },
];

// ---- Mock Auth State ----
let currentUser = null;

export function mockLogin(email, password) {
  const user = MOCK_USERS[email];
  if (!user) return { error: 'Usuario no encontrado' };
  if (user.password !== password) return { error: 'Contraseña incorrecta' };
  currentUser = { ...user };
  if (typeof window !== 'undefined') {
    localStorage.setItem('wave_user', JSON.stringify(currentUser));
  }
  return { user: currentUser, error: null };
}

export function mockLogout() {
  currentUser = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('wave_user');
  }
}

export function getMockUser() {
  if (currentUser) return currentUser;
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('wave_user');
    if (stored) {
      currentUser = JSON.parse(stored);
      return currentUser;
    }
  }
  return null;
}

export function getMockClients() {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('wave_clients');
    if (stored) return JSON.parse(stored);
  }
  return MOCK_CLIENTS;
}

export function saveMockClient(client) {
  const clients = getMockClients();
  clients.push(client);
  if (typeof window !== 'undefined') {
    localStorage.setItem('wave_clients', JSON.stringify(clients));
  }
}

export function getMockInventory() {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('wave_inventory');
    if (stored) return JSON.parse(stored);
  }
  return MOCK_INVENTORY;
}

export function saveMockInventory(inventoryArray) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('wave_inventory', JSON.stringify(inventoryArray));
  }
}

export function findClientByRut(rut) {
  const clean = rut.replace(/[^0-9kK.-]/g, '');
  const clients = getMockClients();
  return clients.find(c => c.rut === clean) || null;
}
