// =============================================
// WAVE SURF CLUB — Data Layer (Supabase)
// Reemplaza mock-data.js con llamadas reales
// =============================================

import { supabase } from './supabase';

// ── AUTH ─────────────────────────────────────

export async function loginUser(email, password) {
  // Buscar perfil por email en nuestra tabla profiles
  const { data: profile, error } = await supabase
    .from('profiles')
    .select(`
      *,
      staff_branch_access ( branch_id )
    `)
    .eq('email', email)
    .eq('is_staff', true)
    .single();

  if (error || !profile) {
    return { error: 'Usuario no encontrado' };
  }

  // Verificar contraseña simple (en producción usaríamos Supabase Auth)
  // Por ahora verificamos contra contraseñas hardcoded del staff
  const STAFF_PASSWORDS = {
    'WAVE_SURF_CLUB@outlook.com': 'WAVESURF2026',
    'francisco@wavesurf.cl': 'francisco2026',
    'caja@wavesurf.cl': 'caja2026',
    'asistente@wavesurf.cl': 'asistente2026',
  };

  if (STAFF_PASSWORDS[email] !== password) {
    return { error: 'Contraseña incorrecta' };
  }

  const user = {
    id: profile.id,
    email: profile.email,
    rut: profile.rut,
    name: profile.name,
    role: profile.role,
    phone: profile.phone,
    allowed_branches: profile.staff_branch_access.map(a => a.branch_id),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem('wave_user', JSON.stringify(user));
  }

  return { user, error: null };
}

export function logoutUser() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('wave_user');
  }
}

export function getCurrentUser() {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('wave_user');
    if (stored) return JSON.parse(stored);
  }
  return null;
}

// ── BRANCHES ────────────────────────────────

export async function getBranches() {
  const { data, error } = await supabase
    .from('branches')
    .select('*')
    .eq('is_active', true)
    .order('id');
  return data || [];
}

// ── PROFILES / CLIENTS ──────────────────────

export async function getClients() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'cliente')
    .eq('is_active', true)
    .order('name');
  return data || [];
}

export async function addClient(client) {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      rut: client.rut,
      name: client.name,
      email: client.email,
      phone: client.phone,
      role: client.role || 'cliente',
      is_staff: client.is_staff || false,
      debt_balance: 0,
    })
    .select()
    .single();
  return { data, error };
}

export async function findClientByRut(rut) {
  const clean = rut.replace(/[^0-9kK.\-]/g, '');
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('rut', clean)
    .single();
  return data || null;
}

// ── STAFF ───────────────────────────────────

export async function getStaff() {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      staff_branch_access ( branch_id )
    `)
    .eq('is_staff', true)
    .eq('is_active', true)
    .order('name');
  return (data || []).map(s => ({
    ...s,
    allowed_branches: s.staff_branch_access.map(a => a.branch_id),
  }));
}

export async function addStaffMember(profileId, role, branchIds) {
  // Update profile to staff
  await supabase
    .from('profiles')
    .update({ is_staff: true, role })
    .eq('id', profileId);

  // Add branch access
  const accessRows = branchIds.map(bid => ({
    profile_id: profileId,
    branch_id: bid,
  }));
  await supabase
    .from('staff_branch_access')
    .upsert(accessRows, { onConflict: 'profile_id,branch_id' });
}

export async function removeStaffMember(profileId) {
  await supabase
    .from('staff_branch_access')
    .delete()
    .eq('profile_id', profileId);

  await supabase
    .from('profiles')
    .update({ is_staff: false, role: 'cliente' })
    .eq('id', profileId);
}

// ── INVENTORY ───────────────────────────────

export async function getInventory(branchId = null) {
  let query = supabase
    .from('inventory')
    .select('*')
    .eq('is_active', true)
    .order('item_code');

  if (branchId) {
    query = query.eq('branch_id', branchId);
  }

  const { data, error } = await query;
  return data || [];
}

export async function addInventoryItem(item) {
  const { data, error } = await supabase
    .from('inventory')
    .insert({
      item_code: item.item_code,
      branch_id: item.branch_id,
      category: item.item_code.startsWith('TR') ? 'traje' : 'tabla',
      color: item.color,
      size: item.size,
      entry_date: item.entry_date,
      is_rented: item.is_rented || false,
      notes: item.notes,
    })
    .select()
    .single();
  return { data, error };
}

export async function updateInventoryItem(itemCode, updates) {
  const { data, error } = await supabase
    .from('inventory')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('item_code', itemCode)
    .select()
    .single();
  return { data, error };
}

export async function deleteInventoryItem(itemCode) {
  const { error } = await supabase
    .from('inventory')
    .update({ is_active: false })
    .eq('item_code', itemCode);
  return { error };
}

// ── INVENTORY SYNC HELPERS ──────────────────

/**
 * Busca códigos de inventario (T- o TR-) en un texto y actualiza su estado.
 */
async function toggleItemsRented(text, isRented) {
  if (!text) return;
  
  // Regex para encontrar códigos T-XXXX o TR-XXXX
  const codes = text.match(/(T-|TR-)[A-Z0-9-]+/gi);
  if (!codes || codes.length === 0) return;

  for (const code of codes) {
    const cleanCode = code.toUpperCase().trim();
    await supabase
      .from('inventory')
      .update({ is_rented: isRented, updated_at: new Date().toISOString() })
      .eq('item_code', cleanCode);
  }
}

// ── TRANSACTIONS (SAP-STYLE LIFECYCLE) ──────

/**
 * Transacciones ABIERTAS (en_curso) — Para POS
 * Solo muestra transacciones que aún no han sido finalizadas.
 */
export async function getOpenTransactions(branchId = null, limit = 50, dateFilter = 'recientes') {
  let query = supabase
    .from('transactions')
    .select('*')
    .is('deleted_at', null)
    .or('rental_status.eq.en_curso,rental_status.is.null')
    .order('created_at', { ascending: false });

  if (branchId) {
    query = query.eq('branch_id', branchId);
  }

  if (dateFilter === 'hoy') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    query = query.gte('created_at', today.toISOString());
  } else if (dateFilter === 'recientes') {
    query = query.limit(limit);
  } else if (dateFilter === 'todos') {
    // No limit
  }

  const { data, error } = await query;
  return data || [];
}

/**
 * Transacciones CERRADAS (finalizado) — Para Dashboard
 * Solo muestra transacciones que ya fueron enviadas al balance de sucursal.
 */
export async function getClosedTransactions(branchId = null, limit = 50) {
  let query = supabase
    .from('transactions')
    .select('*')
    .is('deleted_at', null)
    .eq('rental_status', 'finalizado')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (branchId) {
    query = query.eq('branch_id', branchId);
  }

  const { data, error } = await query;
  return data || [];
}

/**
 * LEGACY: getTransactions — sigue existiendo para compatibilidad (e.g. cierre de caja)
 */
export async function getTransactions(branchId = null, limit = 50, dateFilter = 'recientes') {
  let query = supabase
    .from('transactions')
    .select('*')
    .is('deleted_at', null) 
    .order('created_at', { ascending: false });

  if (branchId) {
    query = query.eq('branch_id', branchId);
  }

  if (dateFilter === 'hoy') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    query = query.gte('created_at', today.toISOString());
  } else if (dateFilter === 'ayer') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    query = query.gte('created_at', yesterday.toISOString())
                 .lt('created_at', today.toISOString());
  } else if (dateFilter === 'recientes') {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  return data || [];
}

/**
 * FINALIZAR transacción — Cambia estado a 'finalizado' y la envía al balance de sucursal
 */
export async function finalizeTransaction(txId) {
  // 1. Obtener datos de la transacción para liberar equipo
  const { data: tx } = await supabase.from('transactions').select('rental_details').eq('id', txId).single();
  
  // 2. Liberar equipo (is_rented = false)
  if (tx?.rental_details) {
    await toggleItemsRented(tx.rental_details, false);
  }

  const { data, error } = await supabase
    .from('transactions')
    .update({ 
      rental_status: 'finalizado',
      finalized_at: new Date().toISOString()
    })
    .eq('id', txId)
    .select()
    .single();
  return { data, error };
}

/**
 * Borrado lógico de transacción
 */
export async function deleteTransaction(txId) {
  // 1. Liberar equipo si estaba en curso (Rollback)
  const { data: tx } = await supabase.from('transactions').select('rental_details, rental_status').eq('id', txId).single();
  
  if (tx?.rental_status === 'en_curso' && tx?.rental_details) {
    await toggleItemsRented(tx.rental_details, false);
  }

  const { error } = await supabase
    .from('transactions')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', txId);
  return { error };
}

export async function addTransaction(tx) {
  // Asegurar que toda transacción nueva comienza en estado 'en_curso'
  const txWithStatus = {
    ...tx,
    rental_status: tx.rental_status || 'en_curso',
  };

  const { data, error } = await supabase
    .from('transactions')
    .insert(txWithStatus)
    .select()
    .single();

  if (!error && data) {
    // 3. Marcar equipo como OCUPADO (is_rented = true)
    if (data.rental_details) {
      await toggleItemsRented(data.rental_details, true);
    }
  }

  // Si es "por_pagar", actualizar deuda del cliente
  if (tx.method === 'por_pagar' && tx.client_rut) {
    const client = await findClientByRut(tx.client_rut);
    if (client) {
      await supabase
        .from('profiles')
        .update({ debt_balance: client.debt_balance + tx.total })
        .eq('id', client.id);
    }
  }

  // Si es pago de deuda, reducir deuda
  if (tx.category === 'pago_deuda' && tx.client_rut) {
    const client = await findClientByRut(tx.client_rut);
    if (client) {
      const { data: cData } = await supabase
        .from('profiles')
        .select('debt_balance')
        .eq('id', client.id)
        .single();
      
      await supabase
        .from('profiles')
        .update({ debt_balance: Math.max(0, (cData?.debt_balance || 0) - tx.total) })
        .eq('id', client.id);
    }
  }

  return { data, error };
}

/**
 * CIERRE DE CAJA / SESIÓN: Consolida todas las transacciones 'en_curso' de una sede
 * en un solo registro de sesión/balance.
 */
export async function closeBranchSession(branchId, staffId, notes = '') {
  // 1. Obtener todas las transacciones pendientes de esa sede
  const txs = await getOpenTransactions(branchId, 1000, 'todos');
  if (txs.length === 0) return { error: 'No hay transacciones pendientes para cerrar.' };

  const sessionId = crypto.randomUUID();
  
  // 2. Calcular totales desglosados
  const income = txs.filter(t => t.type === 'ingreso');
  const expense = txs.filter(t => t.type === 'salida');
  
  const totalIncome = income.reduce((s, t) => s + t.total, 0);
  const totalExpense = expense.reduce((s, t) => s + t.total, 0);
  
  const totalsByMethod = txs.reduce((acc, t) => {
    const m = t.method;
    const val = t.type === 'ingreso' ? t.total : -t.total;
    acc[m] = (acc[m] || 0) + val;
    return acc;
  }, {});

  // 3. Crear registro de Cierre de Caja
  const { data: session, error: sessionErr } = await supabase
    .from('cash_closings')
    .insert({
      id: sessionId,
      branch_id: branchId,
      closed_by: staffId,
      date: new Date().toISOString().split('T')[0],
      total_income: totalIncome,
      total_expense: totalExpense,
      net_utility: totalIncome - totalExpense,
      total_cash: totalsByMethod['efectivo'] || 0,
      total_transfer: totalsByMethod['transferencia'] || 0,
      total_card: totalsByMethod['tarjeta'] || 0,
      total_debt: totalsByMethod['por_pagar'] || 0,
      grand_total: totalIncome - totalExpense,
      notes: notes
    })
    .select()
    .single();

  if (sessionErr) return { error: sessionErr.message };

  // 4. Actualizar todas las transacciones vinculándolas a esta sesión y marcando como finalizadas
  for (const t of txs) {
    // Liberar equipo si era arriendo
    if (t.rental_details) {
      await toggleItemsRented(t.rental_details, false);
    }

    await supabase
      .from('transactions')
      .update({ 
        rental_status: 'finalizado', 
        finalized_at: new Date().toISOString(),
        id_sesion: sessionId 
      })
      .eq('id', t.id);
  }

  return { data: session, error: null };
}

/**
 * FINANZAS GLOBALES: Resumen comparativo por centro de costo
 */
export async function getFinancialSummary() {
  const { data: closings, error } = await supabase
    .from('cash_closings')
    .select('*')
    .order('created_at', { ascending: false });
    
  // Agrupar por branch_id
  const summary = closings?.reduce((acc, c) => {
    if (!acc[c.branch_id]) {
      acc[c.branch_id] = { income: 0, expense: 0, net: 0, count: 0 };
    }
    acc[c.branch_id].income += c.total_income;
    acc[c.branch_id].expense += c.total_expense;
    acc[c.branch_id].net += c.net_utility;
    acc[c.branch_id].count += 1;
    return acc;
  }, {});

  return summary || {};
}

// ── DASHBOARD STATS ─────────────────────────

export async function getDashboardStats(branchId = null) {
  const clients = await getClients();
  const totalDebt = clients.reduce((sum, c) => sum + (c.debt_balance || 0), 0);
  const clientsWithDebt = clients.filter(c => c.debt_balance > 0).length;

  // Stats se calculan SOLO con transacciones cerradas (finalizadas)
  const txs = await getClosedTransactions(branchId);
  const today = new Date().toISOString().split('T')[0];
  const todayTxs = txs.filter(t => t.created_at.startsWith(today));

  const totalIncome = todayTxs
    .filter(t => t.type === 'ingreso')
    .reduce((sum, t) => sum + t.total, 0);
  const totalExpense = todayTxs
    .filter(t => t.type === 'salida')
    .reduce((sum, t) => sum + t.total, 0);

  return {
    totalDebt,
    clientsWithDebt,
    totalIncome,
    totalExpense,
    todayTransactions: todayTxs,
    allTransactions: txs,
  };
}
