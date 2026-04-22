'use client';

import { useState, useEffect } from 'react';
import { 
  getCurrentUser, 
  findClientByRut, 
  getOpenTransactions, 
  addTransaction, 
  finalizeTransaction, 
  deleteTransaction, 
  getBranches,
  addClient,
  queueNotification 
} from '@/lib/data';
import { PAYMENT_METHODS, TRANSACTION_CATEGORIES, TRANSACTION_TYPES } from '@/lib/constants';
import { formatRut } from '@/lib/rut-validator';
import { Search, Trash2, CheckCircle, RefreshCcw, UserPlus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useBranch } from '@/lib/branch-context';
import { useTranslation } from '@/lib/i18n-context';

const MySwal = withReactContent(Swal);

export default function POSPage() {
  const { activeBranchId, setActiveBranchId } = useBranch();
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [rut, setRut] = useState('');
  const [clientData, setClientData] = useState(null);
  const [debtAlert, setDebtAlert] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(activeBranchId || 1);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  // Transaction form
  const [txType, setTxType] = useState('ingreso');
  const [txCategory, setTxCategory] = useState('');
  const [txMethod, setTxMethod] = useState('');
  const [txTotal, setTxTotal] = useState('');
  const [txIsIncident, setTxIsIncident] = useState(false);
  const [txIncidentNote, setTxIncidentNote] = useState('');
  const [rentalDetails, setRentalDetails] = useState('');
  const [subscriptionPeriod, setSubscriptionPeriod] = useState('mensual');

  // Feedback
  const [toast, setToast] = useState(null);
  const [recentTx, setRecentTx] = useState([]);
  const [txDateFilter, setTxDateFilter] = useState('hoy');

  // Quick Stock (Contingency Mode)
  const [showQuickStock, setShowQuickStock] = useState(false);
  const [qsTablas, setQsTablas] = useState('');
  const [qsTrajes, setQsTrajes] = useState('');

  // New Client Form
  const [showNewClient, setShowNewClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientRut, setNewClientRut] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');

  useEffect(() => {
    const u = getCurrentUser();
    setUser(u);
  }, []);

  const loadOpenTx = async () => {
    // Priority to the local selected tab in POS
    const branchId = selectedBranchId;
    const txs = await getOpenTransactions(branchId, 50, txDateFilter);
    setRecentTx(txs);
  };

  useEffect(() => {
    loadOpenTx();
  }, [selectedBranchId, txDateFilter]);

  // Sync local selection when global branch changes (e.g. from Topbar)
  useEffect(() => {
    if (activeBranchId && activeBranchId !== selectedBranchId) {
      setSelectedBranchId(activeBranchId);
    }
  }, [activeBranchId]);

  useEffect(() => {
    async function fetchBranches() {
      const data = await getBranches();
      if (data) setBranches(data);
    }
    fetchBranches();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (rut.length >= 11) {
        handleSearchRUT();
      } else {
        setClientData(null);
        setDebtAlert(false);
        setSearchError('');
      }
    }, 400); // Debounce de 400ms para no saturar la red

    return () => clearTimeout(timer);
  }, [rut]);

  const handleSearchRUT = async () => {
    setSearchError('');
    setClientData(null);
    setDebtAlert(false);
    setSearching(true);

    if (!rut.trim()) {
      setSearching(false);
      return;
    }

    const data = await findClientByRut(rut);
    setSearching(false);
    
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
      subscription_period: (txCategory === 'mensualidad' || txCategory === 'bodega') ? subscriptionPeriod : null,
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
    setSubscriptionPeriod('mensual');
    // Clear client and refocus
    setRut('');
    setClientData(null);
    document.querySelector('.search-input-pos')?.focus();
  };

  const handleGenericClient = () => {
    setRut('1-9');
    setClientData({
      rut: '1-9',
      name: 'CONSUMIDOR FINAL',
      email: 'ventas@wavesurfclub.cl',
      debt_balance: 0
    });
    setSearchError('');
    setDebtAlert(false);
  };





  const handleQuickStockSubmit = async () => {
    if (!qsTablas && !qsTrajes) {
      showToast('Ingrese cantidades', 'error');
      return;
    }

    setLoading(true);
    // Logic for quick stock exit could be a special transaction category or a log
    const note = `SALIDA RÁPIDA (CONTINGENCIA): ${qsTablas || 0} Tablas, ${qsTrajes || 0} Trajes`;
    
    // We register it as an 'incident' or special 'salida' with zero cost or a generic cost if needed.
    // For now, just a success feedback as a "log" entry in transactions.
    const newTx = {
      branch_id: selectedBranchId,
      staff_id: user.id,
      client_rut: 'CONTINGENCIA',
      type: 'salida',
      category: 'otros',
      method: 'efectivo',
      total: 0,
      is_incident: true,
      incident_note: note,
      created_at: new Date().toISOString(),
    };

    const { error } = await addTransaction(newTx);
    setLoading(false);

    if (error) {
      showToast('Error: ' + error.message, 'error');
    } else {
      showToast('✅ Salida de Stock Registrada', 'success');
      setQsTablas('');
      setQsTrajes('');
      setShowQuickStock(false);
      await loadOpenTx();
    }
  };

  const handleRegisterNewClient = async (e) => {
    e.preventDefault();
    if (!newClientName || !newClientRut || !newClientEmail) {
      showToast('Nombre, RUT y Email son obligatorios', 'error');
      return;
    }

    setLoading(true);
    const { data: client, error } = await addClient({
      name: newClientName,
      rut: newClientRut,
      email: newClientEmail,
      phone: newClientPhone,
      role: 'cliente'
    });

    if (error) {
      setLoading(false);
      showToast('Error al registrar: ' + (error.message || 'RUT ya existe?'), 'error');
      return;
    }

    // MARKETING: Queue Welcome Email
    await queueNotification(
      'email',
      newClientEmail,
      '¡Bienvenido a Wave Surf Club! 🏄‍♂️',
      `Estimado ${newClientName}, ¡bienvenido a www.wavesurfclub.cl! Agradecemos tu visita a nuestra sede. Ya eres parte de la Wave Fam. Marketing puro bro! 😎`
    );

    setLoading(false);
    showToast('✅ Cliente registrado y correo enviado', 'success');
    
    // Auto-select
    setRut(newClientRut);
    setClientData(client);
    
    // Reset and close
    setNewClientName('');
    setNewClientRut('');
    setNewClientEmail('');
    setNewClientPhone('');
    setShowNewClient(false);
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
            onClick={() => {
              setSelectedBranchId(b.id);
              setActiveBranchId(b.id); // Also update global context for consistency
            }}
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
              <div className="rut-search-grid" style={{ maxWidth: 800, display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'center' }}>
                <input
                  type="text"
                  className="form-input search-input-pos"
                  style={{ width: '100%', margin: 0, borderRadius: 'var(--radius-md)', height: 60 }}
                  placeholder="Ingrese RUT del Cliente..."
                  value={rut}
                  onChange={(e) => setRut(formatRut(e.target.value))}
                  onKeyDown={handleKeyDown}
                />
                <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
                  <button 
                    className="rut-search-btn search-button-pos" 
                    style={{ borderRadius: 'var(--radius-md)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 60, height: 60 }}
                    onClick={handleSearchRUT}
                  >
                    <Search size={24} />
                  </button>
                  
                  <div style={{ width: '2px', height: '40px', background: 'var(--border-subtle)', margin: '0 4px' }} />

                  <button 
                    className="rut-search-btn" 
                    style={{ background: '#3b82f6', height: 60, width: 60, borderRadius: 'var(--radius-md)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px' }}
                    onClick={() => { setShowQuickStock(!showQuickStock); setShowNewClient(false); }}
                    title="Contingencia Stock (S)"
                  >
                    S
                  </button>
                  <button 
                    className="rut-search-btn" 
                    style={{ background: 'var(--color-success)', height: 60, width: 60, borderRadius: 'var(--radius-md)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => { setShowNewClient(!showNewClient); setShowQuickStock(false); }}
                    title="Nuevo Cliente (+)"
                  >
                    <UserPlus size={24} />
                  </button>
                </div>
              </div>
            </div>
          </div>

              {/* NEW CLIENT REGISTRATION FORM */}
              {showNewClient && (
                <div className="animate-slide-down" style={{ marginTop: 20, padding: 24, background: 'var(--bg-primary)', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--color-success)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                  <h4 style={{ color: 'var(--color-success)', margin: '0 0 20px 0', fontSize: 14, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>👤 REGISTRO EXPRESS DE CLIENTE</h4>
                  <form onSubmit={handleRegisterNewClient} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                    <div className="form-group">
                      <label style={{ fontSize: 11 }}>Nombre Completo *</label>
                      <input type="text" className="form-input" value={newClientName} onChange={e => setNewClientName(e.target.value)} required placeholder="Ej: Juan Perez" style={{ height: 48 }} />

                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: 11 }}>RUT *</label>
                      <input type="text" className="form-input" value={newClientRut} onChange={e => setNewClientRut(formatRut(e.target.value))} required placeholder="12.345.678-9" style={{ height: 48 }} />
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: 11 }}>Email *</label>
                      <input type="email" className="form-input" value={newClientEmail} onChange={e => setNewClientEmail(e.target.value)} required placeholder="email@ejemplo.com" style={{ height: 48 }} />
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: 11 }}>Teléfono (Opcional)</label>
                      <input type="text" className="form-input" value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} placeholder="+56 9..." style={{ height: 48 }} />
                    </div>
                    <div style={{ gridColumn: '1 / -1', marginTop: 8 }}>
                      <button type="submit" disabled={loading} className="btn-finalize" style={{ background: 'var(--color-success)', height: 54, fontSize: 16 }}>
                        {loading ? 'REGISTRANDO...' : 'GUARDAR Y ENVIAR BIENVENIDA'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* QUICK STOCK CONTINGENCY SECTION */}
              {showQuickStock && (
                <div className="animate-slide-down" style={{ marginTop: 20, padding: 20, background: '#0f172a', borderRadius: 'var(--radius-lg)', border: '1px solid #3b82f6' }}>
                  <h4 style={{ color: '#60a5fa', margin: '0 0 16px 0', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>🚀 REGISTRO RÁPIDO (SIN ETIQUETA)</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div style={{ background: '#1e293b', padding: 12, borderRadius: 'var(--radius-md)' }}>
                      <label style={{ display: 'block', fontSize: 10, color: '#94a3b8', marginBottom: 4 }}>TABLAS</label>
                      <input 
                        type="number" 
                        placeholder="Cant." 
                        value={qsTablas}
                        onChange={(e) => setQsTablas(e.target.value)}
                        style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid #475569', color: '#fff', outline: 'none', fontSize: 18, fontWeight: 'bold' }} 
                      />
                    </div>
                    <div style={{ background: '#1e293b', padding: 12, borderRadius: 'var(--radius-md)' }}>
                      <label style={{ display: 'block', fontSize: 10, color: '#94a3b8', marginBottom: 4 }}>TRAJES</label>
                      <input 
                        type="number" 
                        placeholder="Cant." 
                        value={qsTrajes}
                        onChange={(e) => setQsTrajes(e.target.value)}
                        style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid #475569', color: '#fff', outline: 'none', fontSize: 18, fontWeight: 'bold' }} 
                      />
                    </div>
                  </div>
                  <button 
                    onClick={handleQuickStockSubmit}
                    disabled={loading}
                    style={{ width: '100%', marginTop: 16, background: 'var(--color-success)', color: '#fff', padding: '12px', borderRadius: 'var(--radius-md)', border: 'none', fontWeight: 800, cursor: 'pointer', transition: '0.2s' }}
                  >
                    {loading ? 'REGISTRANDO...' : 'REGISTRAR SALIDA'}
                  </button>
                </div>
              )}

              {searchError && (
                <div style={{ marginTop: 16, padding: '20px', borderRadius: 'var(--radius-md)', background: 'rgba(239,68,68,0.05)', border: '1.5px solid rgba(239,68,68,0.2)', color: 'var(--color-danger)', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>⚠️ {searchError}</span>
                  <button 
                    onClick={() => {
                      setNewClientRut(rut);
                      setShowNewClient(true);
                      setSearchError('');
                    }}
                    style={{ background: 'var(--color-danger)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: 12, fontWeight: 800 }}
                  >
                    REGISTRAR AHORA
                  </button>
                </div>
              )}

              {clientData && (
                <div className={`client-card ${debtAlert ? 'has-debt' : ''}`} style={{ marginTop: 24, padding: 24, borderRadius: 'var(--radius-lg)', background: 'var(--bg-primary)', border: '1.5px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 24 }}>
                  <div className="client-avatar">
                    {clientData.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="client-data-box">
                    <h3 className="client-name-title">{clientData.name}</h3>
                    <p className="client-details-text">{clientData.rut} · {clientData.email}</p>
                    {debtAlert ? (
                      <span className="debt-status deudora">⚠️ SALDO DEUDOR: {formatMoney(clientData.debt_balance)}</span>
                    ) : (
                      <span className="debt-status al-dia">✅ CLIENTE AL DÍA</span>
                    )}
                  </div>
                </div>
              )}

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

                <div className="pos-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
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
                      className="form-input total-input-pos"
                      placeholder="0"
                      value={txTotal}
                      onChange={(e) => setTxTotal(e.target.value)}
                      required
                    />
                    <span className="currency-symbol">$</span>
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

                {(txCategory === 'mensualidad' || txCategory === 'bodega') && (
                  <div className="form-group animate-slide-down">
                    <label>Período de Contratación</label>
                    <select className="form-select" value={subscriptionPeriod} onChange={(e) => setSubscriptionPeriod(e.target.value)} required style={{ height: 60, fontSize: 16 }}>
                      <option value="15_dias">Cada 15 Días</option>
                      <option value="mensual">Mensual (1 Mes)</option>
                      <option value="anual">Anual (1 Año)</option>
                    </select>
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
            {/* Cash Breakdown Summary */}
            {recentTx.length > 0 && (
              <div className="pos-summary-bar" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--border-subtle)', borderBottom: '2px solid var(--border-subtle)' }}>
                <div style={{ background: '#fff', padding: '12px 8px', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800 }}>💵 EFECTIVO</div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--color-success)' }}>{formatMoney(recentTx.filter(t => t.method === 'efectivo').reduce((s, t) => t.type === 'ingreso' ? s + t.total : s - t.total, 0))}</div>
                </div>
                <div style={{ background: '#fff', padding: '12px 8px', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800 }}>🏦 TRANSF.</div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--accent-action)' }}>{formatMoney(recentTx.filter(t => t.method === 'transferencia').reduce((s, t) => t.type === 'ingreso' ? s + t.total : s - t.total, 0))}</div>
                </div>
                <div style={{ background: '#fff', padding: '12px 8px', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800 }}>💳 TARJETA</div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: '#8b5cf6' }}>{formatMoney(recentTx.filter(t => t.method === 'tarjeta' || t.method === 'debito').reduce((s, t) => t.type === 'ingreso' ? s + t.total : s - t.total, 0))}</div>
                </div>
              </div>
            )}

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
                   // Cálculos detallados para el cierre
                   const totalEfectivo = recentTx.filter(t => t.method === 'efectivo').reduce((s, t) => t.type === 'ingreso' ? s + t.total : s - t.total, 0);
                   const totalTransferencia = recentTx.filter(t => t.method === 'transferencia').reduce((s, t) => t.type === 'ingreso' ? s + t.total : s - t.total, 0);
                   const totalTarjeta = recentTx.filter(t => t.method === 'tarjeta').reduce((s, t) => t.type === 'ingreso' ? s + t.total : s - t.total, 0);
                   const totalDebito = recentTx.filter(t => t.method === 'debito').reduce((s, t) => t.type === 'ingreso' ? s + t.total : s - t.total, 0);
                   
                   const totalIngresos = recentTx.filter(t=>t.type==='ingreso').reduce((s,t)=>s+t.total,0);
                   const totalEgresos = recentTx.filter(t=>t.type==='salida').reduce((s,t)=>s+t.total,0);
                   const totalNeto = totalIngresos - totalEgresos;

                   const { value: notes, isConfirmed } = await MySwal.fire({
                    title: 'CIERRE DE CAJA OPERATIVA',
                    html: `
                      <div style="text-align:left; font-size: 14px; font-family: system-ui, sans-serif;">
                        <h4 style="margin: 0 0 15px 0; color: #0f172a; text-align: center; text-transform: uppercase;">Resumen — ${currentBranch.short_name}</h4>
                        
                        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
                          <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #cbd5e1; padding-bottom: 6px; margin-bottom: 6px;">
                            <span style="color: #64748b; font-weight: 600;">Efectivo Físico:</span> 
                            <strong style="color: #10b981; font-family: monospace; font-size: 15px;">${formatMoney(totalEfectivo)}</strong>
                          </div>
                          <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #cbd5e1; padding-bottom: 6px; margin-bottom: 6px;">
                            <span style="color: #64748b; font-weight: 600;">Débito:</span> 
                            <strong style="font-family: monospace; font-size: 15px;">${formatMoney(totalDebito)}</strong>
                          </div>
                          <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #cbd5e1; padding-bottom: 6px; margin-bottom: 6px;">
                            <span style="color: #64748b; font-weight: 600;">Crédito:</span> 
                            <strong style="font-family: monospace; font-size: 15px;">${formatMoney(totalTarjeta)}</strong>
                          </div>
                          <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #cbd5e1; padding-bottom: 6px; margin-bottom: 6px;">
                            <span style="color: #64748b; font-weight: 600;">Transferencias:</span> 
                            <strong style="color: #0ea5e9; font-family: monospace; font-size: 15px;">${formatMoney(totalTransferencia)}</strong>
                          </div>
                          <div style="display: flex; justify-content: space-between; font-size: 16px; margin-top: 12px; background: #e2e8f0; padding: 8px; border-radius: 4px;">
                            <span><strong>TOTAL GENERAL:</strong></span> 
                            <strong style="color: #0f172a; font-family: monospace; font-size: 18px;">${formatMoney(totalNeto)}</strong>
                          </div>
                        </div>
                        
                        <div style="margin-top: 15px;">
                          <label style="display: block; font-weight: 800; color: #334155; margin-bottom: 5px; font-size: 11px; text-transform: uppercase;">1. Seleccione su Turno</label>
                          <select id="swal-turno" style="width: 100%; padding: 10px; border: 2px solid #cbd5e1; border-radius: 6px; margin-bottom: 15px; font-size: 14px; outline: none; background: #fff;">
                            <option value="Mañana">☀️ Turno Mañana</option>
                            <option value="Tarde">🌙 Turno Tarde</option>
                            <option value="Día Completo">⏳ Día Completo</option>
                          </select>
                          
                          <label style="display: block; font-weight: 800; color: #334155; margin-bottom: 5px; font-size: 11px; text-transform: uppercase;">2. Notas de Cuadratura</label>
                          <input id="swal-notas" type="text" placeholder="Ej: Cuadratura perfecta, o faltan $2.000..." style="width: 100%; padding: 10px; border: 2px solid #cbd5e1; border-radius: 6px; font-size: 14px; outline: none;">
                        </div>
                      </div>
                    `,
                    icon: 'info',
                    showCancelButton: true,
                    confirmButtonText: '✅ CONFIRMAR CIERRE',
                    confirmButtonColor: 'var(--color-success)',
                    cancelButtonColor: 'var(--border-subtle)',
                    cancelButtonText: 'Revisar Montos',
                    preConfirm: () => {
                      const turno = document.getElementById('swal-turno').value;
                      const notas = document.getElementById('swal-notas').value;
                      return `[TURNO: ${turno}] ${notas}`;
                    }
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
