'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser, findClientByRut, getOpenTransactions, addTransaction, finalizeTransaction, deleteTransaction } from '@/lib/data';
import { PAYMENT_METHODS, TRANSACTION_CATEGORIES, TRANSACTION_TYPES } from '@/lib/constants';
import { formatRut } from '@/lib/rut-validator';
import { Search, Trash2, CheckCircle, RefreshCcw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useBranch } from '@/lib/branch-context';
import { useTranslation } from '@/lib/i18n-context';

const MySwal = withReactContent(Swal);

export default function POSPage() {
  const { activeBranchId } = useBranch();
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [rut, setRut] = useState('');
  const [clientData, setClientData] = useState(null);
  const [debtAlert, setDebtAlert] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(1);
  const [loading, setLoading] = useState(false);

  // Transaction form
  const [txType, setTxType] = useState('ingreso');
  const [txCategory, setTxCategory] = useState('');
  const [txMethod, setTxMethod] = useState('');
  const [txTotal, setTxTotal] = useState('');
  const [txIsIncident, setTxIsIncident] = useState(false);
  const [txIncidentNote, setTxIncidentNote] = useState('');
  const [rentalDetails, setRentalDetails] = useState('');

  // Feedback
  const [toast, setToast] = useState(null);
  const [recentTx, setRecentTx] = useState([]);
  const [txDateFilter, setTxDateFilter] = useState('hoy');

  useEffect(() => {
    const u = getCurrentUser();
    setUser(u);
  }, []);

  const loadOpenTx = async () => {
    const branchId = activeBranchId || selectedBranchId;
    const txs = await getOpenTransactions(branchId, 50, txDateFilter);
    setRecentTx(txs);
  };

  useEffect(() => {
    loadOpenTx();
  }, [activeBranchId, selectedBranchId, txDateFilter]);

  useEffect(() => {
    async function fetchBranches() {
      const { data } = await supabase.from('branches').select('*').eq('is_active', true).order('id');
      if (data) setBranches(data);
    }
    fetchBranches();
  }, []);

  useEffect(() => {
    if (rut.length >= 11) {
      handleSearchRUT();
    } else {
      setClientData(null);
      setDebtAlert(false);
      setSearchError('');
    }
  }, [rut]);

  const handleSearchRUT = async () => {
    setSearchError('');
    setClientData(null);
    setDebtAlert(false);

    if (!rut.trim()) return;

    const data = await findClientByRut(rut);
    if (data) {
      setClientData(data);
      setDebtAlert(data.debt_balance > 0);
    } else if (rut.length >= 11) {
      setSearchError('Cliente no encontrado. Debe registrarlo primero.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearchRUT();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isAuthorized = user?.role === 'superadmin' || user?.role === 'admin' || user?.role === 'caja' || user?.role === 'pos_staff';
    
    if (!isAuthorized) {
      showToast("Error: Sin permisos", "error");
      return;
    }
    if (!clientData) {
      showToast('Busque un cliente primero', 'error');
      return;
    }
    const total = parseFloat(txTotal);
    if (isNaN(total) || total <= 0) {
      showToast('Monto inválido', 'error');
      return;
    }

    setLoading(true);
    const newTx = {
      branch_id: selectedBranchId,
      staff_id: user.id,
      client_rut: clientData.rut,
      type: txType,
      category: txCategory,
      method: txMethod,
      total,
      is_incident: txIsIncident,
      incident_note: txIncidentNote,
      rental_status: 'en_curso',
      rental_details: txCategory === 'arriendo' ? rentalDetails : null,
      created_at: new Date().toISOString(),
    };

    const { error } = await addTransaction(newTx);
    setLoading(false);

    if (error) {
      showToast('Error: ' + error.message, 'error');
      return;
    }

    showToast(`✅ Registrado "En Curso": $${total.toLocaleString('es-CL')}`, 'success');
    await loadOpenTx();

    setTxCategory('');
    setTxMethod('');
    setTxTotal('');
    setTxIsIncident(false);
    setTxIncidentNote('');
    setRentalDetails('');
  };

  const handleFinalizeIndividual = async (txId, label) => {
    const { isConfirmed } = await MySwal.fire({
      title: '¿Finalizar esta tarea?',
      text: `Se marcará como completada y se enviará al balance general: ${label}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'SÍ, FINALIZAR',
      confirmButtonColor: 'var(--color-success)',
    });

    if (isConfirmed) {
      setLoading(true);
      const { error } = await finalizeTransaction(txId);
      setLoading(false);

      if (error) {
        showToast('Error: ' + error.message, 'error');
      } else {
        showToast('✅ Tarea Finalizada Correctamente', 'success');
        await loadOpenTx();
      }
    }
  };

  const handleDeleteTransaction = async (tx) => {
    const { isConfirmed } = await MySwal.fire({
      title: '¿Anular transacción?',
      text: "Se eliminará del sistema.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Sí, anular',
    });

    if (isConfirmed) {
      setDeletingId(tx.id);
      await deleteTransaction(tx.id);
      await loadOpenTx();
      setDeletingId(null);
    }
  };

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const formatMoney = (n) => '$ ' + (n || 0).toLocaleString('es-CL');

  if (!user) return null;

  const currentBranch = branches.find(b => b.id === selectedBranchId) || branches[0];

  return (
    <div className="pos-page-wrap">
      {/* Top Fixed Branch Tabs */}
      <div className="branch-tabs">
        {branches.map(b => (
          <button
            key={b.id}
            className={`branch-tab ${selectedBranchId === b.id ? 'active' : ''}`}
            onClick={() => setSelectedBranchId(b.id)}
          >
            <span style={{ fontSize: 20 }}>{b.id === 1 ? '🏖️' : b.id === 2 ? '🌊' : '🏄'}</span>
            {b.short_name?.toUpperCase() || b.name?.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="pos-grid">
        {/* LEFT: Main Transaction Form */}
        <div className="pos-main">
          {/* IDENTIFICAR CLIENTE */}
          <div className="data-section" style={{ marginBottom: 24, borderRadius: 'var(--radius-lg)', background: '#fff' }}>
            <div className="data-section-header">
              <h3 className="data-section-title">
                <Search size={22} style={{ color: 'var(--accent-action)' }} /> IDENTIFICAR CLIENTE
              </h3>
            </div>
            <div style={{ padding: '32px' }}>
              <div className="rut-search-wrap" style={{ maxWidth: 540 }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ fontSize: 18, height: 64, border: '2px solid var(--border-subtle)', paddingLeft: 24 }}
                  placeholder="Ingrese RUT del Cliente..."
                  value={rut}
                  onChange={(e) => setRut(formatRut(e.target.value))}
                  onKeyDown={handleKeyDown}
                />
                <button className="rut-search-btn" onClick={handleSearchRUT} style={{ height: 64, padding: '0 24px' }}>
                  <Search size={24} />
                </button>
              </div>

              {searchError && (
                <div style={{ marginTop: 16, padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(239,68,68,0.05)', border: '1.5px solid rgba(239,68,68,0.2)', color: 'var(--color-danger)', fontWeight: 600 }}>
                  ⚠️ {searchError}
                </div>
              )}

              {clientData && (
                <div className={`client-card ${debtAlert ? 'has-debt' : ''}`} style={{ marginTop: 24, padding: 24, borderRadius: 'var(--radius-lg)', background: 'var(--bg-primary)', border: '1.5px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 24 }}>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: debtAlert ? 'var(--color-danger)' : 'var(--color-success)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 900 }}>
                    {clientData.name?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: 22, color: 'var(--accent-primary)', fontWeight: 800 }}>{clientData.name}</h3>
                    <p style={{ margin: '4px 0', color: 'var(--text-muted)', fontSize: 14 }}>{clientData.rut} · {clientData.email}</p>
                    {debtAlert ? (
                      <span style={{ color: 'var(--color-danger)', fontWeight: 800 }}>⚠️ SALDO DEUDOR: {formatMoney(clientData.debt_balance)}</span>
                    ) : (
                      <span style={{ color: 'var(--color-success)', fontWeight: 800 }}>✅ CLIENTE AL DÍA</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* NUEVA TRANSACCION */}
          <div className="data-section" style={{ background: '#fff', borderRadius: 'var(--radius-lg)' }}>
            <div className="data-section-header" style={{ borderLeft: `8px solid ${selectedBranchId === 1 ? '#F59E0B' : selectedBranchId === 2 ? '#0EA5E9' : '#10B981'}` }}>
              <h3 className="data-section-title">🗳️ NUEVA ACTIVIDAD — {currentBranch?.short_name?.toUpperCase()}</h3>
            </div>
            <div style={{ padding: '32px' }}>
              <form className="pos-form" onSubmit={handleSubmit} style={{ display: 'grid', gap: 32 }}>
                <div className="form-group">
                  <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 16, display: 'block', letterSpacing: '0.05em' }}>TIPO DE OPERACIÓN</label>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <button
                      type="button"
                      className={`btn ${txType === 'ingreso' ? 'active' : ''}`}
                      style={{ flex: 1, height: 72, background: txType === 'ingreso' ? 'var(--color-success)' : 'var(--bg-primary)', color: txType === 'ingreso' ? '#fff' : 'var(--text-muted)', border: 'none', borderRadius: 'var(--radius-lg)', fontWeight: 800, fontSize: 16, transition: '0.3s' }}
                      onClick={() => setTxType('ingreso')}
                    >
                      ↗ INGRESO +
                    </button>
                    <button
                      type="button"
                      className={`btn ${txType === 'salida' ? 'active' : ''}`}
                      style={{ flex: 1, height: 72, background: txType === 'salida' ? 'var(--color-danger)' : 'var(--bg-primary)', color: txType === 'salida' ? '#fff' : 'var(--text-muted)', border: 'none', borderRadius: 'var(--radius-lg)', fontWeight: 800, fontSize: 16, transition: '0.3s' }}
                      onClick={() => setTxType('salida')}
                    >
                      ↘ SALIDA -
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                  <div className="form-group">
                    <label>Categoría del Movimiento</label>
                    <select className="form-select" value={txCategory} onChange={(e) => setTxCategory(e.target.value)} required style={{ height: 60, fontSize: 16 }}>
                      <option value="">Seleccionar...</option>
                      {TRANSACTION_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Medio de Recaudo / Pago</label>
                    <select className="form-select" value={txMethod} onChange={(e) => setTxMethod(e.target.value)} required style={{ height: 60, fontSize: 16 }}>
                      <option value="">Seleccionar...</option>
                      {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.icon} {m.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Monto de la Operación ($)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      className="form-input"
                      style={{ fontSize: 44, height: 100, textAlign: 'right', fontWeight: 950, fontFamily: 'var(--font-mono)', border: '2.5px solid var(--accent-action)', color: 'var(--accent-action)', paddingRight: 32, borderRadius: 'var(--radius-lg)' }}
                      placeholder="0"
                      value={txTotal}
                      onChange={(e) => setTxTotal(e.target.value)}
                      required
                    />
                    <span style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', fontSize: 32, fontWeight: 900, color: 'var(--text-muted)' }}>$</span>
                  </div>
                </div>

                {txCategory === 'arriendo' && (
                  <div className="form-group animate-slide-down">
                    <label>Equipamiento (Tablas T- / Trajes TR-)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ height: 60, fontSize: 16 }} 
                      placeholder="Ej: T-002, TR-015..." 
                      value={rentalDetails} 
                      onChange={(e) => setRentalDetails(e.target.value.toUpperCase())} 
                      required 
                    />
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <label className="checkbox-label" style={{ fontWeight: 800, fontSize: 14, userSelect: 'none' }}>
                    <input type="checkbox" checked={txIsIncident} onChange={(e) => setTxIsIncident(e.target.checked)} />
                    🚨 REGISTRAR INCIDENCIA / DAÑO
                  </label>
                </div>

                {txIsIncident && (
                  <div className="form-group animate-slide-down">
                    <label>Nota de Auditoría (Hito de Incidencia)</label>
                    <input type="text" className="form-input" style={{ height: 60 }} placeholder="Detalles de la incidencia..." value={txIncidentNote} onChange={(e) => setTxIncidentNote(e.target.value)} />
                  </div>
                )}

                <button type="submit" className="btn-finalize" disabled={!clientData || loading} style={{ background: 'var(--accent-primary)', height: 84, fontSize: 20, boxShadow: '0 12px 30px rgba(15, 23, 42, 0.15)' }}>
                  {loading ? 'PROCESANDO...' : '➕ REGISTRAR ACTIVIDAD OPERATIVA'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* RIGHT: Sidebar "En Curso" (Session) */}
        <div className="pos-sidebar">
          <div className="pos-sidebar-header">
            <div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 950 }}>⚡ CAJA CHICA ACTIVA</h3>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Balance de Sesión actual</p>
            </div>
            <button className="refresh-btn" onClick={loadOpenTx} style={{ background: 'var(--bg-primary)' }}><RefreshCcw size={18} /></button>
          </div>

          <div className="pos-sidebar-content" style={{ background: 'var(--bg-primary)' }}>
            {recentTx.length === 0 ? (
              <div style={{ padding: '64px 32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 64, marginBottom: 20 }}>📦</div>
                <p style={{ fontSize: 14, fontWeight: 600 }}>Sin movimientos<br/>pendientes de balance.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {recentTx.map(tx => (
                  <div key={tx.id} style={{ padding: 24, borderBottom: '1px solid var(--border-subtle)', background: '#fff', margin: '1px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
                      <span className={`type-badge ${tx.type}`} style={{ fontSize: 10, padding: '3px 8px' }}>{tx.type?.toUpperCase()}</span>
                      <span className="mono" style={{ fontSize: 18, fontWeight: 900, color: tx.type === 'ingreso' ? 'var(--color-success)' : 'var(--color-danger)' }}>
                        {tx.type === 'ingreso' ? '+' : '-'}{formatMoney(tx.total)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 850 }}>{tx.client_name || tx.client_rut}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{tx.category} · {tx.method}</div>
                        {tx.rental_details && <div style={{ fontSize: 10, color: 'var(--accent-action)', fontWeight: 700, marginTop: 4 }}>🏄 {tx.rental_details}</div>}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <button 
                          className="btn-finalize" 
                          onClick={() => handleFinalizeIndividual(tx.id, tx.category?.toUpperCase())} 
                          style={{ fontSize: 9, padding: '6px 10px', height: 'auto', background: 'var(--color-success)' }}
                        >
                          CERRAR
                        </button>
                        <button 
                          className="btn-void" 
                          onClick={() => handleDeleteTransaction(tx)} 
                          style={{ fontSize: 9, padding: '6px 10px', height: 'auto' }}
                        >
                          ANULAR
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pos-sidebar-footer" style={{ borderTop: '2px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>SALDO OPERATIVO:</span>
              <span className="mono" style={{ fontSize: 28, fontWeight: 950, color: 'var(--accent-primary)' }}>{formatMoney(recentTx.reduce((s, t) => t.type === 'ingreso' ? s + t.total : s - t.total, 0))}</span>
            </div>
            
            {recentTx.length > 0 && (
              <button 
                className="btn-finalize"
                disabled={loading}
                onClick={async () => {
                   const { value: notes, isConfirmed } = await MySwal.fire({
                    title: '¿CONSOLIDAR CIERRE DE CAJA?',
                    html: `
                      <div style="text-align:left; font-size: 14px;">
                        <p>Se consolidarán <b>${recentTx.length}</b> registros para <b>${currentBranch.short_name}</b>.</p>
                        <p>Total Ingresos: <b>${formatMoney(recentTx.filter(t=>t.type==='ingreso').reduce((s,t)=>s+t.total,0))}</b></p>
                        <p>Total Egresos: <b>${formatMoney(recentTx.filter(t=>t.type==='salida').reduce((s,t)=>s+t.total,0))}</b></p>
                        <hr/>
                        <p>¿Coincide el saldo físico con lo registrado?</p>
                      </div>
                    `,
                    input: 'text',
                    inputPlaceholder: 'Notas de cierre (opcional)...',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'SÍ, CERRAR SESIÓN',
                    confirmButtonColor: 'var(--color-success)',
                    cancelButtonColor: 'var(--border-subtle)'
                  });
                  if (isConfirmed) {
                    setLoading(true);
                    const { error } = await import('@/lib/data').then(m => m.closeBranchSession(selectedBranchId, user.id, notes));
                    setLoading(false);

                    if (error) {
                      MySwal.fire('Error', error, 'error');
                    } else {
                      showToast('✅ Sesión Consolidada Correctamente', 'success');
                      await loadOpenTx();
                      MySwal.fire('Éxito', 'El balance ha sido enviado a Finanzas Globales.', 'success');
                    }
                  }
                }}
                style={{ height: 72 }}
              >
                <CheckCircle size={22} /> FINALIZAR SESIÓN [{currentBranch?.short_name?.toUpperCase()}]
              </button>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div className={`toast ${toast.type}`}>
          <span className="toast-message">{toast.msg}</span>
        </div>
      )}
    </div>
  );
}
