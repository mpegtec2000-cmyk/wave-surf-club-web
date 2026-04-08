'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser, getClients, getClosedTransactions, getInventory, getBranches, deleteTransaction } from '@/lib/data';
import { calculateAV } from '@/lib/av-system';
import { Trash2, RefreshCcw } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalDebt, setTotalDebt] = useState(0);
  const [clientsWithDebt, setClientsWithDebt] = useState(0);
  const [closedTx, setClosedTx] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [branches, setBranches] = useState([]);
  const [closedBranchFilter, setClosedBranchFilter] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) return;
    setUser(u);
    loadData();
  }, []);

  async function loadData() {
    try {
      const [clients, inv, br] = await Promise.all([
        getClients(),
        getInventory(),
        getBranches(),
      ]);

      setTotalDebt(clients.reduce((sum, c) => sum + (c.debt_balance || 0), 0));
      setClientsWithDebt(clients.filter(c => c.debt_balance > 0).length);
      setInventory(inv);
      setBranches(br);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
    setLoading(false);
  }

  const loadClosedTx = async () => {
    const branchId = closedBranchFilter ? parseInt(closedBranchFilter) : null;
    const txs = await getClosedTransactions(branchId, 100);
    setClosedTx(txs);
  };

  useEffect(() => {
    loadClosedTx();
  }, [closedBranchFilter]);

  const handleDeleteClosedTx = async (tx) => {
    const isAuthorized = user?.role === 'superadmin' || user?.role === 'admin' || user?.role === 'caja';
    if (!isAuthorized) {
      showToast("Error: Privilegios insuficientes", "error");
      return;
    }

    const { isConfirmed } = await MySwal.fire({
      title: '¿Eliminar transacción cerrada?',
      text: `Se eliminará la transacción de $${tx.total.toLocaleString('es-CL')} del balance para corregir ingresos erróneos.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Sí, eliminar',
    });

    if (isConfirmed) {
      setDeletingId(tx.id);
      await deleteTransaction(tx.id);
      showToast("Transacción eliminada", "success");
      await loadClosedTx();
      setDeletingId(null);
    }
  };

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const formatMoney = (n) => '$ ' + (n || 0).toLocaleString('es-CL');

  if (!user) return null;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 12 }}>
        <span style={{ fontSize: 32 }}>🏄</span>
        <span style={{ fontSize: 18, color: 'var(--text-muted)' }}>Cargando datos de balance...</span>
      </div>
    );
  }

  const isSuperAdmin = user.role === 'superadmin';
  const branchFilter = isSuperAdmin ? null : user.allowed_branches?.[0];

  const filteredClosedForStats = branchFilter
    ? closedTx.filter(t => t.branch_id === branchFilter)
    : closedTx;

  const todayIncome = filteredClosedForStats
    .filter(t => t.type === 'ingreso')
    .reduce((sum, t) => sum + t.total, 0);

  const todayExpense = filteredClosedForStats
    .filter(t => t.type === 'salida')
    .reduce((sum, t) => sum + t.total, 0);

  const filteredInv = branchFilter
    ? inventory.filter(i => i.branch_id === branchFilter)
    : inventory;

  const avStats = filteredInv.reduce((acc, item) => {
    const av = calculateAV(item.entry_date);
    acc[av.level] = (acc[av.level] || 0) + 1;
    return acc;
  }, {});

  const canDelete = user?.role === 'superadmin' || user?.role === 'admin' || user?.role === 'caja';

  return (
    <div className="dashboard-wrap">
      {/* Stats Grid - Professional KPI Cards */}
      <div className="stats-grid" style={{ marginBottom: 32 }}>
        <div className="stat-card" style={{ borderLeft: '5px solid var(--color-success)', background: '#fff' }}>
          <div className="stat-card-label">Ingresos de Sesión</div>
          <div className="stat-card-value mono" style={{ color: 'var(--color-success)', fontSize: 32 }}>
            {formatMoney(todayIncome)}
          </div>
          <div className="stat-card-change" style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            {filteredClosedForStats.filter(t => t.type === 'ingreso').length} Operaciones Finalizadas
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '5px solid var(--color-danger)', background: '#fff' }}>
          <div className="stat-card-label">Egresos de Sesión</div>
          <div className="stat-card-value mono" style={{ color: 'var(--color-danger)', fontSize: 32 }}>
            {formatMoney(todayExpense)}
          </div>
          <div className="stat-card-change" style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            {filteredClosedForStats.filter(t => t.type === 'salida').length} Operaciones Finalizadas
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '5px solid var(--accent-action)', background: '#fff' }}>
          <div className="stat-card-label">Capital Neto Operativo</div>
          <div className="stat-card-value mono" style={{ color: 'var(--accent-primary)', fontSize: 32 }}>
            {formatMoney(todayIncome - todayExpense)}
          </div>
          <div className="stat-card-change" style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            {isSuperAdmin ? 'Resumen Multi-Sede' : 'Balance de Sucursal'}
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '5px solid var(--color-warning)', background: '#fff' }}>
          <div className="stat-card-label">Deuda Externa Actual</div>
          <div className="stat-card-value mono" style={{ color: 'var(--color-warning)', fontSize: 32 }}>
            {formatMoney(totalDebt)}
          </div>
          <div className="stat-card-change" style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            {clientsWithDebt} Clientes con Saldo Pendiente
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 24 }}>
        {/* Inventory Column */}
        <div className="data-section">
          <div className="data-section-header">
            <h3 className="data-section-title">🏄 Salud del Inventario (AV)</h3>
          </div>
          <div style={{ padding: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 28 }}>✅</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 24, fontWeight: 900, fontFamily: 'var(--font-mono)' }}>{avStats.AV1 || 0}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>AV1 — Estado Óptimo</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 28 }}>🕒</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 24, fontWeight: 900, fontFamily: 'var(--font-mono)' }}>{avStats.AV2 || 0}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>AV2 — En Revisión</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 28 }}>⚠️</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 24, fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--color-danger)' }}>{(avStats.AV3 || 0) + (avStats.URGENTE || 0)}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-danger)', textTransform: 'uppercase' }}>Requiere Intervención</div>
                </div>
              </div>
            </div>
            <button className="btn btn-secondary btn-full" style={{ marginTop: 24, fontSize: 12, fontWeight: 800 }}>MANTENCIONES →</button>
          </div>
        </div>

        {/* BALANCE COLUMN */}
        <div className="data-section">
          <div className="data-section-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h3 className="data-section-title">📊 Balance de Sucursal</h3>
              <button className="refresh-btn" onClick={loadClosedTx}><RefreshCcw size={14} /></button>
            </div>
            <select
              className="form-input"
              style={{ width: 'auto', padding: '6px 12px', fontSize: 12, height: 'auto', background: '#fff', border: '1.5px solid var(--border-subtle)', fontWeight: 700 }}
              value={closedBranchFilter}
              onChange={(e) => setClosedBranchFilter(e.target.value)}
            >
              <option value="">TODAS LAS SEDES</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.emoji} {b.short_name?.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fecha/Hora</th>
                  <th>Operación</th>
                  <th>Concepto</th>
                  <th>Método</th>
                  <th style={{ textAlign: 'right' }}>Monto</th>
                  {canDelete && <th style={{ textAlign: 'center' }}>AUDIT</th>}
                </tr>
              </thead>
              <tbody>
                {closedTx.length === 0 ? (
                  <tr>
                    <td colSpan={canDelete ? 6 : 5} style={{ textAlign: 'center', padding: 64, color: 'var(--text-muted)' }}>
                      <div style={{ fontSize: 32, marginBottom: 16 }}>📉</div>
                      <p style={{ fontWeight: 600 }}>Sin movimientos registrados en el balance.</p>
                    </td>
                  </tr>
                ) : (
                  closedTx.map(tx => (
                    <tr key={tx.id}>
                      <td style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>
                        {new Date(tx.created_at).toLocaleString('es-CL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).toUpperCase()}
                      </td>
                      <td>
                        <span className={`type-badge ${tx.type}`} style={{ fontSize: 10, fontWeight: 900 }}>
                          {tx.type.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ textTransform: 'uppercase', fontSize: 11, fontWeight: 800, color: 'var(--text-primary)' }}>{tx.category.replace('_', ' ')}</td>
                      <td style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{tx.method.replace('_', ' ')}</td>
                      <td style={{ textAlign: 'right' }}>
                        <span className={`mono ${tx.type === 'ingreso' ? 'positive' : 'negative'}`} style={{ fontSize: 15, fontWeight: 900 }}>
                          {tx.type === 'ingreso' ? '+' : '-'}{formatMoney(tx.total)}
                        </span>
                      </td>
                      {canDelete && (
                        <td style={{ textAlign: 'center' }}>
                          <button
                            onClick={() => handleDeleteClosedTx(tx)}
                            disabled={deletingId === tx.id}
                            className="btn-void"
                            style={{ fontSize: 9, padding: '4px 8px' }}
                          >
                            ELIMINAR
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SUPERADMIN VIEW */}
      {isSuperAdmin && (
        <div className="data-section" style={{ marginTop: 24 }}>
          <div className="data-section-header">
            <h3 className="data-section-title">🏢 Monitoreo de Centros de Costos</h3>
          </div>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sede / Centro</th>
                  <th style={{ textAlign: 'right' }}>Ingresos</th>
                  <th style={{ textAlign: 'right' }}>Egresos</th>
                  <th style={{ textAlign: 'right' }}>Neto</th>
                  <th>Stocks</th>
                  <th>Alertas AV</th>
                </tr>
              </thead>
              <tbody>
                {branches.map(branch => {
                  const bTx = closedTx.filter(t => t.branch_id === branch.id);
                  const bIncome = bTx.filter(t => t.type === 'ingreso').reduce((s, t) => s + t.total, 0);
                  const bExpense = bTx.filter(t => t.type === 'salida').reduce((s, t) => s + t.total, 0);
                  const bInv = inventory.filter(i => i.branch_id === branch.id);
                  const bAlerts = bInv.filter(i => {
                    const av = calculateAV(i.entry_date);
                    return av.level === 'AV3' || av.level === 'URGENTE';
                  }).length;

                  return (
                    <tr key={branch.id}>
                      <td style={{ fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                        {branch.emoji} {branch.short_name}
                      </td>
                      <td style={{ textAlign: 'right' }}><span className="mono positive" style={{ fontWeight: 800 }}>+{formatMoney(bIncome)}</span></td>
                      <td style={{ textAlign: 'right' }}><span className="mono negative" style={{ fontWeight: 800 }}>-{formatMoney(bExpense)}</span></td>
                      <td style={{ textAlign: 'right', fontWeight: 950, color: 'var(--accent-primary)' }} className="mono">{formatMoney(bIncome - bExpense)}</td>
                      <td style={{ fontWeight: 600 }}>{bInv.length} ÍTEMS</td>
                      <td>
                        {bAlerts > 0 ? (
                          <span className="av-badge av-urgent" style={{ borderRadius: 'var(--radius-sm)' }}>⚠️ {bAlerts} CRÍTICOS</span>
                        ) : (
                          <span className="av-badge av-optimal" style={{ borderRadius: 'var(--radius-sm)' }}>✅ SANO</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast ${toast.type}`}>
          <span className="toast-message">{toast.msg}</span>
        </div>
      )}
    </div>
  );
}
