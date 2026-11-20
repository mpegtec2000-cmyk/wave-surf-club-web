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
import { PAYMENT_METHODS, TRANSACTION_CATEGORIES, TRANSACTION_TYPES, BRANCHES as CONST_BRANCHES } from '@/lib/constants';
import { formatRut } from '@/lib/rut-validator';
import { 
  Search, Trash2, CheckCircle, RefreshCcw, UserPlus,
  Palmtree, Waves, Compass, AlertTriangle, AlertCircle, CheckCircle2,
  CreditCard, Banknote, Building2, Package, Plus, Zap, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
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

    showToast(`Registrado "En Curso": $${total.toLocaleString('es-CL')}`, 'success');
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
      showToast('Salida de Stock Registrada', 'success');
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
      '¡Bienvenido a Wave Surf Club!',
      `Estimado ${newClientName}, ¡bienvenido a www.wavesurfclub.cl! Agradecemos tu visita a nuestra sede. Ya eres parte de la Wave Fam.`
    );

    setLoading(false);
    showToast('Cliente registrado y correo enviado', 'success');
    
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
        showToast('Tarea Finalizada Correctamente', 'success');
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

  const currentBranch = branches.find(b => b.id === selectedBranchId) || CONST_BRANCHES.find(b => b.id === selectedBranchId) || CONST_BRANCHES[0];

  return (
    <div className="pos-page-wrap">
      <div className="pos-grid">
        {/* LEFT: Main Transaction Form */}
        <div className="pos-main space-y-5">
          {/* IDENTIFICAR CLIENTE */}
          <div className="vc-card white !p-5 sm:!p-6 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 mb-4 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-800 shrink-0">
                  <Search size={15} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 tracking-tight leading-none">IDENTIFICAR CLIENTE</h3>
                  <p className="text-[10px] font-mono text-neutral-400 mt-1 uppercase">Búsqueda rápida por RUT o código</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => { setShowNewClient(!showNewClient); setShowQuickStock(false); }}
                  className={`vc-btn plain !h-9 !px-3.5 !rounded-xl !text-xs ${showNewClient ? 'lime' : 'ghost'}`}
                >
                  <UserPlus size={14} />
                  <span>Nuevo Cliente</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setShowQuickStock(!showQuickStock); setShowNewClient(false); }}
                  className={`vc-btn plain !h-9 !px-3 !rounded-xl !text-xs ${showQuickStock ? 'lime' : 'ghost'}`}
                  title="Contingencia Stock Rápido (S)"
                >
                  <Zap size={13} />
                  <span>Stock (S)</span>
                </button>
              </div>
            </div>

            {/* Input Bar */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  className="vc-input !h-11 !pl-4 !pr-10 !rounded-xl font-mono text-sm font-semibold tracking-wide"
                  placeholder="Ingrese RUT del cliente (ej: 12.345.678-9)..."
                  value={rut}
                  onChange={(e) => setRut(formatRut(e.target.value))}
                  onKeyDown={handleKeyDown}
                />
                {searching && (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
                )}
              </div>
              <button
                type="button"
                onClick={handleSearchRUT}
                className="vc-btn !h-11 !px-5 !rounded-xl text-xs font-bold shrink-0 !bg-[#171717] !text-white hover:!bg-black"
              >
                <Search size={14} className="text-white" />
                <span className="text-white">Buscar</span>
              </button>
            </div>
          </div>

              {/* NEW CLIENT REGISTRATION FORM */}
              {showNewClient && (
                <div className="animate-slide-down" style={{ marginTop: 20, padding: 24, background: 'var(--bg-primary)', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--color-success)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                  <h4 style={{ color: 'var(--color-success)', margin: '0 0 20px 0', fontSize: 14, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 8 }}><UserPlus size={16} /> REGISTRO EXPRESS DE CLIENTE</h4>
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
                <div className="animate-slide-down mt-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-2">
                    <Zap size={14} className="text-amber-500" /> Registro Rápido (Contingencia sin Etiqueta)
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-neutral-200">
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">TABLAS</label>
                      <input 
                        type="number" 
                        placeholder="Cant." 
                        value={qsTablas}
                        onChange={(e) => setQsTablas(e.target.value)}
                        className="w-full bg-transparent border-0 border-b border-neutral-200 focus:border-neutral-900 text-neutral-900 outline-none text-base font-mono font-bold" 
                      />
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-neutral-200">
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">TRAJES</label>
                      <input 
                        type="number" 
                        placeholder="Cant." 
                        value={qsTrajes}
                        onChange={(e) => setQsTrajes(e.target.value)}
                        className="w-full bg-transparent border-0 border-b border-neutral-200 focus:border-neutral-900 text-neutral-900 outline-none text-base font-mono font-bold" 
                      />
                    </div>
                  </div>
                  <button 
                    onClick={handleQuickStockSubmit}
                    disabled={loading}
                    className="w-full h-10 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs"
                  >
                    {loading ? 'REGISTRANDO...' : 'REGISTRAR SALIDA'}
                  </button>
                </div>
              )}

              {searchError && (
                <div style={{ marginTop: 16, padding: '20px', borderRadius: 'var(--radius-md)', background: 'rgba(239,68,68,0.05)', border: '1.5px solid rgba(239,68,68,0.2)', color: 'var(--color-danger)', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><AlertCircle size={16} /> {searchError}</span>
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
                <div className={`mt-3 p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                  debtAlert ? 'bg-amber-50/80 border-amber-200' : 'bg-neutral-50 border-neutral-200/80'
                }`}>
                  <div className="flex items-center gap-3 truncate">
                    <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white font-bold flex items-center justify-center text-xs shrink-0">
                      {clientData.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-neutral-900 truncate">{clientData.name}</div>
                      <div className="text-[10px] font-mono text-neutral-400 truncate">{clientData.rut} · {clientData.email}</div>
                    </div>
                  </div>
                  {debtAlert ? (
                    <span className="vc-tag bg-amber-100 text-amber-900 border-amber-300 font-bold shrink-0">
                      <AlertTriangle size={12} /> DEUDA: {formatMoney(clientData.debt_balance)}
                    </span>
                  ) : (
                    <span className="vc-tag bg-emerald-50 text-emerald-700 border-emerald-200 font-bold shrink-0">
                      <CheckCircle2 size={12} /> AL DÍA
                    </span>
                  )}
                </div>
              )}

          {/* NUEVA TRANSACCION */}
          <div className="vc-card white !p-5 sm:!p-6 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 mb-5 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0">
                  <CreditCard size={15} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 tracking-tight leading-none">
                    NUEVA ACTIVIDAD OPERATIVA — {currentBranch?.short_name?.toUpperCase() || currentBranch?.name?.toUpperCase()}
                  </h3>
                  <p className="text-[10px] font-mono text-neutral-400 mt-1 uppercase">Registro de cobro o egreso de caja</p>
                </div>
              </div>
              <span className="vc-tag font-mono">
                {txType === 'ingreso' ? 'Ingreso a Caja' : 'Salida de Caja'}
              </span>
            </div>

            <form className="pos-form space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-[11px] font-bold text-neutral-500 uppercase font-mono tracking-wider mb-2">
                  Tipo de Operación
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTxType('ingreso')}
                    className={`h-11 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all border ${
                      txType === 'ingreso'
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                        : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                    <ArrowUpRight size={14} /> INGRESO
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxType('salida')}
                    className={`h-11 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all border ${
                      txType === 'salida'
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                        : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <ArrowDownRight size={14} /> SALIDA
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 mb-1.5">Categoría del Movimiento</label>
                  <select
                    className="vc-select !h-11 !rounded-xl !text-xs font-medium"
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value)}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {TRANSACTION_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 mb-1.5">Medio de Recaudo / Pago</label>
                  <select
                    className="vc-select !h-11 !rounded-xl !text-xs font-medium"
                    value={txMethod}
                    onChange={(e) => setTxMethod(e.target.value)}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1.5">Monto de la Operación ($)</label>
                <div className="relative">
                  <input
                    type="number"
                    className="vc-input !h-12 !pl-8 !rounded-xl font-mono text-xl font-black text-neutral-900 tracking-tight"
                    placeholder="0"
                    value={txTotal}
                    onChange={(e) => setTxTotal(e.target.value)}
                    required
                  />
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-bold font-mono text-sm">$</span>
                </div>
              </div>

              {txCategory === 'arriendo' && (
                <div className="animate-slide-down">
                  <label className="block text-[11px] font-semibold text-neutral-600 mb-1.5">Equipamiento (Tablas T- / Trajes TR-)</label>
                  <input 
                    type="text" 
                    className="vc-input !h-11 !rounded-xl text-xs font-medium uppercase font-mono" 
                    placeholder="Ej: T-002, TR-015..." 
                    value={rentalDetails} 
                    onChange={(e) => setRentalDetails(e.target.value.toUpperCase())} 
                    required 
                  />
                </div>
              )}

              {(txCategory === 'mensualidad' || txCategory === 'bodega') && (
                <div className="animate-slide-down">
                  <label className="block text-[11px] font-semibold text-neutral-600 mb-1.5">Período de Contratación</label>
                  <select
                    className="vc-select !h-11 !rounded-xl text-xs font-medium"
                    value={subscriptionPeriod}
                    onChange={(e) => setSubscriptionPeriod(e.target.value)}
                    required
                  >
                    <option value="15_dias">Cada 15 Días</option>
                    <option value="mensual">Mensual (1 Mes)</option>
                    <option value="anual">Anual (1 Año)</option>
                  </select>
                </div>
              )}

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-700 select-none">
                  <input
                    type="checkbox"
                    checked={txIsIncident}
                    onChange={(e) => setTxIsIncident(e.target.checked)}
                    className="w-4 h-4 rounded text-neutral-900 border-neutral-300 focus:ring-0"
                  />
                  <AlertTriangle size={14} className="text-amber-500" />
                  <span>Registrar incidencia / daño en equipo</span>
                </label>
              </div>

              {txIsIncident && (
                <div className="animate-slide-down">
                  <label className="block text-[11px] font-semibold text-neutral-600 mb-1.5">Nota de Auditoría (Hito de Incidencia)</label>
                  <input
                    type="text"
                    className="vc-input !h-11 !rounded-xl text-xs font-medium"
                    placeholder="Detalles de la incidencia..."
                    value={txIncidentNote}
                    onChange={(e) => setTxIncidentNote(e.target.value)}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={!clientData || loading}
                className={`vc-btn !h-12 w-full !rounded-xl text-xs font-bold shadow-xs transition-all ${
                  !clientData ? '!bg-neutral-200 !text-neutral-500 cursor-not-allowed' : '!bg-[#171717] !text-white hover:!bg-black'
                }`}
              >
                <Plus size={16} />
                <span>{loading ? 'PROCESANDO...' : 'REGISTRAR ACTIVIDAD OPERATIVA'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: Sidebar "En Curso" (Session) */}
        <div className="pos-sidebar vc-card white !p-0 shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-neutral-100 bg-white">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                <Zap size={14} className="text-amber-500" /> CAJA CHICA ACTIVA
              </h3>
              <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider mt-0.5">Balance de Sesión actual</p>
            </div>
            <button
              className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 transition-colors"
              onClick={loadOpenTx}
              title="Refrescar balance"
            >
              <RefreshCcw size={13} />
            </button>
          </div>

          <div className="pos-sidebar-content bg-neutral-50/40">
            {/* Cash Breakdown Summary */}
            {recentTx.length > 0 && (
              <div className="grid grid-cols-3 divide-x divide-neutral-200/80 border-b border-neutral-200/80 bg-white">
                <div className="py-2.5 px-2 text-center">
                  <div className="text-[9px] text-neutral-400 font-bold uppercase flex items-center justify-center gap-1">
                    <Banknote size={11} /> EFECTIVO
                  </div>
                  <div className="text-xs font-mono font-bold text-[#10b981] mt-0.5 truncate">
                    {formatMoney(recentTx.filter(t => t.method === 'efectivo').reduce((s, t) => t.type === 'ingreso' ? s + t.total : s - t.total, 0))}
                  </div>
                </div>
                <div className="py-2.5 px-2 text-center">
                  <div className="text-[9px] text-neutral-400 font-bold uppercase flex items-center justify-center gap-1">
                    <Building2 size={11} /> TRANSF.
                  </div>
                  <div className="text-xs font-mono font-bold text-neutral-900 mt-0.5 truncate">
                    {formatMoney(recentTx.filter(t => t.method === 'transferencia').reduce((s, t) => t.type === 'ingreso' ? s + t.total : s - t.total, 0))}
                  </div>
                </div>
                <div className="py-2.5 px-2 text-center">
                  <div className="text-[9px] text-neutral-400 font-bold uppercase flex items-center justify-center gap-1">
                    <CreditCard size={11} /> TARJETA
                  </div>
                  <div className="text-xs font-mono font-bold text-neutral-900 mt-0.5 truncate">
                    {formatMoney(recentTx.filter(t => t.method === 'tarjeta' || t.method === 'debito').reduce((s, t) => t.type === 'ingreso' ? s + t.total : s - t.total, 0))}
                  </div>
                </div>
              </div>
            )}

            {recentTx.length === 0 ? (
              <div className="p-10 text-center text-neutral-400">
                <Package size={40} className="mx-auto mb-3 text-neutral-300" />
                <p className="text-xs font-medium text-neutral-500">Sin movimientos pendientes de balance.</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 max-h-[380px] overflow-y-auto">
                {recentTx.map(tx => (
                  <div key={tx.id} className="p-3 bg-white hover:bg-neutral-50/70 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                        tx.type === 'ingreso' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {tx.type}
                      </span>
                      <span className={`font-mono text-xs font-bold ${tx.type === 'ingreso' ? 'text-[#10b981]' : 'text-red-600'}`}>
                        {tx.type === 'ingreso' ? '+' : '-'}{formatMoney(tx.total)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-neutral-900 truncate">{tx.client_name || tx.client_rut}</div>
                        <div className="text-[10px] text-neutral-400 capitalize truncate">{tx.category} · {tx.method}</div>
                        {tx.rental_details && (
                          <div className="text-[9.5px] text-neutral-600 font-medium mt-0.5 flex items-center gap-1 truncate">
                            <Waves size={10} className="text-neutral-400 shrink-0" />
                            <span className="truncate">{tx.rental_details}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <button 
                          onClick={() => handleFinalizeIndividual(tx.id, tx.category?.toUpperCase())} 
                          className="px-2 py-1 rounded text-[9px] font-bold bg-neutral-900 text-white hover:bg-black transition-colors"
                        >
                          CERRAR
                        </button>
                        <button 
                          onClick={() => handleDeleteTransaction(tx)} 
                          className="px-2 py-1 rounded text-[9px] font-bold bg-white border border-neutral-200 text-neutral-500 hover:text-red-600 hover:border-red-200 transition-colors"
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

          <div className="p-4 bg-neutral-50/80 border-t border-neutral-200/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10.5px] font-bold font-mono text-neutral-400 uppercase">SALDO OPERATIVO:</span>
              <span className="font-mono text-lg font-black text-neutral-900">
                {formatMoney(recentTx.reduce((s, t) => t.type === 'ingreso' ? s + t.total : s - t.total, 0))}
              </span>
            </div>
            
            {recentTx.length > 0 && (
              <button 
                className="vc-btn lime w-full !h-12 !rounded-xl !text-xs font-bold shadow-xs flex items-center justify-center gap-2"
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
                            <strong style="color: #171717; font-family: monospace; font-size: 15px;">${formatMoney(totalTransferencia)}</strong>
                          </div>
                          <div style="display: flex; justify-content: space-between; font-size: 16px; margin-top: 12px; background: #e2e8f0; padding: 8px; border-radius: 4px;">
                            <span><strong>TOTAL GENERAL:</strong></span> 
                            <strong style="color: #0f172a; font-family: monospace; font-size: 18px;">${formatMoney(totalNeto)}</strong>
                          </div>
                        </div>
                        
                        <div style="margin-top: 15px;">
                          <label style="display: block; font-weight: 800; color: #334155; margin-bottom: 5px; font-size: 11px; text-transform: uppercase;">1. Seleccione su Turno</label>
                          <select id="swal-turno" style="width: 100%; padding: 10px; border: 2px solid #cbd5e1; border-radius: 6px; margin-bottom: 15px; font-size: 14px; outline: none; background: #fff;">
                            <option value="Mañana">Turno Mañana</option>
                            <option value="Tarde">Turno Tarde</option>
                            <option value="Día Completo">Día Completo</option>
                          </select>
                          
                          <label style="display: block; font-weight: 800; color: #334155; margin-bottom: 5px; font-size: 11px; text-transform: uppercase;">2. Notas de Cuadratura</label>
                          <input id="swal-notas" type="text" placeholder="Ej: Cuadratura perfecta, o faltan $2.000..." style="width: 100%; padding: 10px; border: 2px solid #cbd5e1; border-radius: 6px; font-size: 14px; outline: none;">
                        </div>
                      </div>
                    `,
                    icon: 'info',
                    showCancelButton: true,
                    confirmButtonText: 'CONFIRMAR CIERRE',
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
                      showToast('Sesión Consolidada Correctamente', 'success');
                      await loadOpenTx();
                      MySwal.fire('Éxito', 'El balance ha sido enviado a Finanzas Globales.', 'success');
                    }
                  }
                }}
              >
                <CheckCircle size={15} /> <span>FINALIZAR SESIÓN [{currentBranch?.short_name?.toUpperCase()}]</span>
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
