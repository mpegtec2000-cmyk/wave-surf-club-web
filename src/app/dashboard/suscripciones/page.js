'use client';

import { useState, useEffect } from 'react';
import { getSubscriptions, getCurrentUser, getBranches } from '@/lib/data';
import { 
  CalendarDays, Package, User, MapPin, Search, CreditCard, Phone,
  Clock, AlertTriangle, CheckCircle2, DollarSign, RefreshCw
} from 'lucide-react';
import { useBranch } from '@/lib/branch-context';

const fmt = (n) => '$ ' + (n || 0).toLocaleString('es-CL');

export default function SubscriptionsPage() {
  const { branches } = useBranch();
  const [subs, setSubs] = useState([]);
  const [filteredSubs, setFilteredSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSubscriptions();
  }, []);

  useEffect(() => {
    filterData();
  }, [subs, filterType, searchTerm]);

  async function loadSubscriptions() {
    setLoading(true);
    const data = await getSubscriptions();
    setSubs(data || []);
    setLoading(false);
  }

  function filterData() {
    let result = [...subs];

    if (filterType !== 'todos') {
      result = result.filter(s => s.category === filterType);
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(s => 
        (s.client_rut || '').toLowerCase().includes(q) || 
        (s.profiles?.name || '').toLowerCase().includes(q)
      );
    }

    setFilteredSubs(result);
  }

  const getDaysLeft = (validUntil) => {
    if (!validUntil) return 0;
    const now = new Date();
    const end = new Date(validUntil);
    const diff = end - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // KPI calculations
  const totalActivas = subs.filter(s => getDaysLeft(s.valid_until) > 0).length;
  const expiradas = subs.filter(s => getDaysLeft(s.valid_until) <= 0).length;
  const bodegaCount = subs.filter(s => s.category === 'bodega' && getDaysLeft(s.valid_until) > 0).length;
  const mensualCount = subs.filter(s => s.category === 'mensualidad' && getDaysLeft(s.valid_until) > 0).length;

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
            Fidelización &amp; Membresías Periódicas
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight mt-0.5">
            Mensualidades &amp; Espacios de Bodega
          </h1>
        </div>

        <button
          onClick={loadSubscriptions}
          className="h-9 px-4 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-xs font-bold text-neutral-700 transition-colors inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>

      {/* ── Bento Metrics KPI Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              Suscripciones Activas
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={15} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight font-mono">
            {totalActivas}
          </div>
          <div className="text-[10px] font-mono text-emerald-700 mt-1 font-bold">Vigentes en sistema</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              Suscripciones Vencidas
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200/60 flex items-center justify-center text-rose-600">
              <AlertTriangle size={15} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight font-mono">
            {expiradas}
          </div>
          <div className="text-[10px] font-mono text-rose-700 mt-1 font-bold">Requieren renovación</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              Cupos Bodega Activos
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200/60 flex items-center justify-center text-purple-600">
              <Package size={15} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-600 tracking-tight font-mono">
            {bodegaCount}
          </div>
          <div className="text-[10px] font-mono text-purple-700 mt-1 font-bold">Guardería de tablas</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              Mensualidades Activas
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200/60 flex items-center justify-center text-sky-600">
              <CalendarDays size={15} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-sky-600 tracking-tight font-mono">
            {mensualCount}
          </div>
          <div className="text-[10px] font-mono text-sky-700 mt-1 font-bold">Planes de entrenamiento</div>
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="rounded-2xl bg-white border border-neutral-200/80 shadow-2xs overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 sm:p-5 border-b border-neutral-200/70 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar por RUT o Nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-xl border border-neutral-200 bg-neutral-50/60 text-xs text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-900 outline-none transition-all"
            />
          </div>

          <div className="inline-flex p-1 rounded-xl bg-neutral-100 border border-neutral-200/60 gap-0.5">
            {[
              { id: 'todos', label: 'Todas' },
              { id: 'mensualidad', label: 'Mensualidades' },
              { id: 'bodega', label: 'Bodega' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterType === tab.id ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
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
                <th className="py-3 px-4">Cliente / Contacto</th>
                <th className="py-3 px-4">Tipo Suscripción</th>
                <th className="py-3 px-4">Sede</th>
                <th className="py-3 px-4">Fecha Pago</th>
                <th className="py-3 px-4">Monto</th>
                <th className="py-3 px-4 text-center">Días Restantes</th>
                <th className="py-3 px-4 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400 font-mono">
                    Cargando suscripciones...
                  </td>
                </tr>
              ) : filteredSubs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    <CalendarDays size={32} className="mx-auto mb-2 text-neutral-300" />
                    <div className="font-bold text-sm text-neutral-600">Sin suscripciones registradas</div>
                    <div className="text-xs text-neutral-400 mt-0.5">No hay membresías que coincidan con la búsqueda</div>
                  </td>
                </tr>
              ) : (
                filteredSubs.map(s => {
                  const daysLeft = getDaysLeft(s.valid_until);
                  const isBodega = s.category === 'bodega';
                  const shortBranch = branches?.find(b => b.id === s.branch_id)?.short_name || `Sede ${s.branch_id}`;

                  return (
                    <tr key={s.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-neutral-900">{s.profiles?.name || 'Cliente'}</div>
                        <div className="text-[11px] font-mono text-neutral-400">RUT: {s.client_rut}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold ${
                          isBodega ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-pink-50 text-pink-700 border border-pink-200'
                        }`}>
                          {isBodega ? <Package size={12} /> : <User size={12} />}
                          {s.category}
                        </span>
                        <div className="text-[10px] font-mono text-neutral-400 mt-1 uppercase">
                          {s.subscription_period?.replace('_', ' ')}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-neutral-700">
                        {shortBranch}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-neutral-500">
                        {new Date(s.created_at).toLocaleDateString('es-CL')}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-neutral-900">
                        {fmt(s.total)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`font-mono font-black text-sm ${
                          daysLeft > 7 ? 'text-emerald-600' : daysLeft > 0 ? 'text-amber-600' : 'text-rose-600'
                        }`}>
                          {daysLeft} d
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {daysLeft > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Activa
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            Vencida
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-neutral-200/70 bg-neutral-50/50 flex items-center justify-between text-xs font-mono text-neutral-500">
          <div>
            Mostrando <strong>{filteredSubs.length}</strong> de <strong>{subs.length}</strong> registros
          </div>
        </div>

      </div>

    </div>
  );
}
