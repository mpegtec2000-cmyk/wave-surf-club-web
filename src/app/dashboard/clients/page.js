'use client';

import { useState, useEffect, useMemo } from 'react';
import { getCurrentUser, getClients, addClient, getTransactions, findClientByRut } from '@/lib/data';
import { 
  Search, UserPlus, X, Save, User, FileText, AlertTriangle, CheckCircle2, 
  Users, Inbox, ArrowUpRight, ArrowDownRight, Check, ArrowLeft, Phone, Mail, ShieldAlert,
  DollarSign, TrendingUp, Sparkles, Filter
} from 'lucide-react';
import { formatRut, validateRut } from '@/lib/rut-validator';

const fmt = (n) => '$ ' + (n || 0).toLocaleString('es-CL');

export default function ClientsPage() {
  const [user, setUser] = useState(null);
  const [clientsData, setClientsData] = useState([]);
  const [view, setView] = useState('list'); // 'list', 'add', 'profile'
  const [searchRut, setSearchRut] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientHistory, setClientHistory] = useState([]);
  
  const [formData, setFormData] = useState({
    rut: '',
    nombre: '',
    apellidos: '',
    telefono: '',
    correo: '',
    role: 'cliente'
  });
  
  const [debtFilter, setDebtFilter] = useState('ALL'); // 'ALL', 'DEBT', 'CLEAR'
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setUser(getCurrentUser());
    async function load() {
      const c = await getClients();
      setClientsData(c);
    }
    load();
  }, []);

  const sortedClients = useMemo(() => {
    return [...clientsData].sort((a, b) => a.name.localeCompare(b.name));
  }, [clientsData]);

  const filteredClients = useMemo(() => {
    let result = sortedClients;

    if (debtFilter === 'DEBT') {
      result = result.filter(c => c.debt_balance > 0);
    } else if (debtFilter === 'CLEAR') {
      result = result.filter(c => c.debt_balance === 0);
    }

    const q = searchRut.toLowerCase().trim();
    if (q) {
      result = result.filter(c => 
        (c.rut || '').toLowerCase().includes(q) || 
        (c.name || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.phone || '').includes(q)
      );
    }

    return result;
  }, [sortedClients, searchRut, debtFilter]);

  // KPIs
  const totalClients = clientsData.length;
  const clientsWithDebt = clientsData.filter(c => c.debt_balance > 0);
  const totalDebt = clientsWithDebt.reduce((s, c) => s + (c.debt_balance || 0), 0);
  const activeMembers = clientsData.filter(c => c.role === 'cliente').length;

  const handleSearchClick = () => {
    const clean = searchRut.trim();
    if (!clean) return;
    const client = clientsData.find(c => c.rut === clean || c.rut.replace(/[.-]/g, '') === clean.replace(/[.-]/g, ''));
    if (client) {
      handleViewProfile(client);
    } else {
      showToast('Cliente no encontrado. Puedes registrarlo ahora.', 'error');
      setView('add');
      setFormData(prev => ({ ...prev, rut: clean }));
    }
  };

  const handleViewProfile = async (client) => {
    setSelectedClient(client);
    const txs = await getTransactions();
    const history = txs.filter(t => t.client_rut === client.rut);
    setClientHistory(history);
    setView('profile');
  };

  const handleSaveClient = async (e) => {
    e.preventDefault();
    if (!formData.rut || !formData.nombre || !formData.apellidos) {
      showToast('Por favor completa RUT, Nombre y Apellidos', 'error');
      return;
    }

    const rutCheck = validateRut(formData.rut);
    if (!rutCheck.valid) {
      showToast(rutCheck.error, 'error');
      return;
    }
    
    const normalizedRut = formData.rut.replace(/[^0-9kK]/g, '').toUpperCase();
    const existingGlobal = await findClientByRut(normalizedRut);
    
    if (existingGlobal) {
      showToast(`Este RUT ya existe como ${existingGlobal.role}: ${existingGlobal.name}`, 'error');
      return;
    }

    const newClient = {
      rut: formData.rut,
      name: `${formData.nombre} ${formData.apellidos}`.trim(),
      email: formData.correo,
      phone: formData.telefono,
      role: formData.role || 'cliente',
      is_staff: formData.role !== 'cliente',
      branch_id: null,
      debt_balance: 0
    };

    const result = await addClient(newClient);
    if (result.error) {
      showToast('Error al guardar: ' + result.error.message, 'error');
      return;
    }
    const updatedClients = await getClients();
    setClientsData(updatedClients);
    
    showToast(`Cliente ${newClient.name} agregado con éxito`, 'success');
    setFormData({ rut: '', nombre: '', apellidos: '', telefono: '', correo: '', role: 'cliente' });
    setView('list');
    setSearchRut('');
  };

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
            CRM &amp; Base de Datos de Clientes
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight mt-0.5">
            Gestión Integral de Clientes &amp; Cuentas
          </h1>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {view === 'list' ? (
            <button
              onClick={() => setView('add')}
              className="h-9 px-4 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-2"
            >
              <UserPlus size={14} /> Nuevo Cliente
            </button>
          ) : (
            <button
              onClick={() => { setView('list'); setSearchRut(''); }}
              className="h-9 px-4 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-xs font-bold text-neutral-700 transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft size={14} /> Volver a la Lista
            </button>
          )}
        </div>
      </div>

      {/* ── Bento Metrics KPI Grid ── */}
      {view === 'list' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                Total Clientes
              </span>
              <div className="w-8 h-8 rounded-xl bg-neutral-100 border border-neutral-200/60 flex items-center justify-center text-neutral-700">
                <Users size={15} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight font-mono">
              {totalClients}
            </div>
            <div className="text-[10px] font-mono text-neutral-400 mt-1 font-bold">Registrados en la plataforma</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                Clientes al Día
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
                <CheckCircle2 size={15} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight font-mono">
              {totalClients - clientsWithDebt.length}
            </div>
            <div className="text-[10px] font-mono text-emerald-700 mt-1 font-bold flex items-center gap-1">
              <span>●</span> Sin saldos pendientes
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                Cuentas con Deuda
              </span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200/60 flex items-center justify-center text-rose-600">
                <AlertTriangle size={15} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight font-mono">
              {clientsWithDebt.length}
            </div>
            <div className="text-[10px] font-mono text-rose-700 mt-1 font-bold">Por cobrar en sede</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                Total Deuda Activa
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600">
                <DollarSign size={15} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight font-mono">
              {fmt(totalDebt)}
            </div>
            <div className="text-[10px] font-mono text-amber-700 mt-1 font-bold">Monto consolidado fiado</div>
          </div>
        </div>
      )}

      {/* ── VIEW: LIST ── */}
      {view === 'list' && (
        <div className="rounded-2xl bg-white border border-neutral-200/80 shadow-2xs overflow-hidden">
          
          {/* Toolbar */}
          <div className="p-4 sm:p-5 border-b border-neutral-200/70 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white">
            <div className="relative flex-1 max-w-md">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Buscar por RUT (ej: 19.823.123-4), nombre o email..."
                value={searchRut}
                onChange={(e) => setSearchRut(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
                className="w-full h-9 pl-9 pr-4 rounded-xl border border-neutral-200 bg-neutral-50/60 text-xs text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-900 outline-none transition-all"
              />
            </div>

            <div className="inline-flex p-1 rounded-xl bg-neutral-100 border border-neutral-200/60 gap-0.5">
              {[
                { id: 'ALL', label: 'Todos' },
                { id: 'DEBT', label: 'Con Deuda' },
                { id: 'CLEAR', label: 'Al Día' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setDebtFilter(tab.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    debtFilter === tab.id ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50/80 border-b border-neutral-200/70 text-neutral-500 uppercase font-mono text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">RUT</th>
                  <th className="py-3 px-4">Teléfono</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Estado Cuenta</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-800">
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-neutral-400">
                      <Inbox size={32} className="mx-auto mb-2 text-neutral-300" />
                      <div className="font-bold text-sm text-neutral-600">No se encontraron clientes</div>
                      <div className="text-xs text-neutral-400 mt-0.5">Verifica el RUT ingresado o registra un nuevo cliente</div>
                    </td>
                  </tr>
                ) : (
                  filteredClients.map(c => (
                    <tr key={c.rut} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-neutral-900 text-white font-black text-xs flex items-center justify-center shrink-0">
                            {c.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-neutral-900">{c.name}</div>
                            <div className="text-[10px] font-mono text-neutral-400 uppercase">{c.role || 'cliente'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-neutral-700">
                        {c.rut}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-neutral-600">
                        {c.phone || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-600">
                        {c.email || '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        {c.debt_balance > 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle size={11} /> Debe {fmt(c.debt_balance)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Al Día
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleViewProfile(c)}
                          className="h-7 px-2.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-xs font-bold text-neutral-700 transition-colors inline-flex items-center gap-1.5"
                        >
                          <User size={12} /> Ver Ficha
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-neutral-200/70 bg-neutral-50/50 flex items-center justify-between text-xs font-mono text-neutral-500">
            <div>
              Mostrando <strong>{filteredClients.length}</strong> de <strong>{clientsData.length}</strong> clientes registrados
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW: PROFILE ── */}
      {view === 'profile' && selectedClient && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {selectedClient.debt_balance > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between text-rose-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider">Cliente con Deuda Pendiente</h4>
                  <p className="text-xs text-rose-600">{selectedClient.name} registra saldo por pagar en caja</p>
                </div>
              </div>
              <div className="text-lg font-black font-mono text-rose-700">
                {fmt(selectedClient.debt_balance)}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Client Card */}
            <div className="p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-5">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-neutral-900 text-white text-2xl font-black flex items-center justify-center mx-auto mb-3 shadow-xs">
                  {selectedClient.name?.charAt(0)?.toUpperCase()}
                </div>
                <h3 className="text-base font-black text-neutral-900">{selectedClient.name}</h3>
                <div className="text-xs font-mono font-bold text-neutral-400 mt-0.5">{selectedClient.rut}</div>
              </div>

              <div className="border-t border-neutral-100 pt-4 space-y-3 text-xs">
                <div>
                  <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-0.5">
                    Teléfono
                  </span>
                  <div className="font-semibold text-neutral-800">{selectedClient.phone || 'No registrado'}</div>
                </div>

                <div>
                  <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-0.5">
                    Correo Electrónico
                  </span>
                  <div className="font-semibold text-neutral-800">{selectedClient.email || 'No registrado'}</div>
                </div>

                <div>
                  <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-0.5">
                    Rol en Sistema
                  </span>
                  <div className="font-semibold text-neutral-800 uppercase">{selectedClient.role || 'cliente'}</div>
                </div>

                <div className="pt-2 border-t border-neutral-100">
                  <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-0.5">
                    Saldo en Cuenta
                  </span>
                  <div className={`text-xl font-black font-mono ${selectedClient.debt_balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {fmt(selectedClient.debt_balance)}
                  </div>
                </div>
              </div>
            </div>

            {/* History Table */}
            <div className="lg:col-span-2 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-neutral-200/70 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Historial de Transacciones</h3>
                  <p className="text-[11px] text-neutral-400">{clientHistory.length} movimientos asociados</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50/80 border-b border-neutral-200/70 text-neutral-500 uppercase font-mono text-[11px] font-bold tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Tipo</th>
                      <th className="py-3 px-4">Categoría</th>
                      <th className="py-3 px-4">Método</th>
                      <th className="py-3 px-4">Monto</th>
                      <th className="py-3 px-4">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-neutral-800">
                    {clientHistory.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-neutral-400">
                          Sin transacciones registradas para este cliente
                        </td>
                      </tr>
                    ) : (
                      clientHistory.map(tx => (
                        <tr key={tx.id} className="hover:bg-neutral-50/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold ${
                              tx.type === 'ingreso' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                            }`}>
                              {tx.type === 'ingreso' ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                              {tx.type}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold capitalize">{tx.category?.replace('_', ' ')}</td>
                          <td className="py-3.5 px-4 font-mono uppercase text-neutral-600">{tx.method}</td>
                          <td className="py-3.5 px-4 font-mono font-black text-neutral-900">
                            {fmt(tx.total)}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-neutral-500">
                            {new Date(tx.created_at).toLocaleString('es-CL')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── VIEW: ADD CLIENT ── */}
      {view === 'add' && (
        <div className="max-w-xl mx-auto rounded-2xl bg-white border border-neutral-200/80 shadow-2xs p-6 space-y-5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">Registro CRM</div>
              <h2 className="text-base font-black text-neutral-900 mt-0.5">
                Nuevo Cliente
              </h2>
            </div>
            <button
              onClick={() => setView('list')}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSaveClient} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
                RUT del Cliente *
              </label>
              <input
                type="text"
                placeholder="12.345.678-9"
                value={formData.rut}
                onChange={e => setFormData({ ...formData, rut: formatRut(e.target.value) })}
                className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 text-xs font-mono font-bold text-neutral-900 focus:border-neutral-900 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Nombres *
                </label>
                <input
                  type="text"
                  placeholder="Juan Carlos"
                  value={formData.nombre}
                  onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:border-neutral-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Apellidos *
                </label>
                <input
                  type="text"
                  placeholder="Pérez Silva"
                  value={formData.apellidos}
                  onChange={e => setFormData({ ...formData, apellidos: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:border-neutral-900 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Teléfono
                </label>
                <input
                  type="text"
                  placeholder="+56 9 1234 5678"
                  value={formData.telefono}
                  onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 text-xs font-mono text-neutral-900 focus:border-neutral-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  placeholder="cliente@ejemplo.cl"
                  value={formData.correo}
                  onChange={e => setFormData({ ...formData, correo: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:border-neutral-900 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setView('list')}
                className="h-10 px-4 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-xs font-bold text-neutral-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="h-10 px-5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-2"
              >
                <Save size={14} /> Registrar Cliente
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl border shadow-xl text-xs font-bold animate-in fade-in slide-in-from-bottom-3 duration-200 ${
          toast.type === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-700'
            : 'bg-neutral-900 border-neutral-800 text-white'
        }`}>
          {toast.msg}
        </div>
      )}

    </div>
  );
}
