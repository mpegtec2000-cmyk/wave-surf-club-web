'use client';

import { useState, useEffect, useCallback } from 'react';
import { getVentasFisicas, getBranches } from '@/lib/data';
import {
  Store, TrendingUp, ShoppingBag, BookOpen, Clock,
  Download, RefreshCw, Filter, AlertCircle,
  DollarSign, GraduationCap, Waves, Calendar, Building2, CreditCard, Lock, Hourglass, Coffee, Tag, Banknote
} from 'lucide-react';

const fmt = (n) => '$ ' + (n || 0).toLocaleString('es-CL');
const TIME_OFFSET = -4;

function toChileTime(isoString) {
  if (!isoString) return { date: '—', time: '—', full: '—' };
  const d = new Date(isoString);
  const chile = new Date(d.getTime() + TIME_OFFSET * 3600000);
  return {
    date: chile.toISOString().slice(0, 10),
    time: chile.toISOString().slice(11, 16),
    full: chile.toLocaleString('es-CL', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
  };
}

const categoryInfo = {
  clase:     { label: 'Clase' },
  arriendo:  { label: 'Arriendo' },
  tienda:    { label: 'Tienda' },
  cafeteria: { label: 'Cafetería' },
};

export default function VentasFisicas() {
  const today = new Date().toISOString().slice(0, 10);

  const [branches, setBranches] = useState([]);
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [branchId, setBranchId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [catFilter, setCatFilter] = useState('todos');
  const [methodFilter, setMethodFilter] = useState('todos');

  useEffect(() => { getBranches().then(setBranches); }, []);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    const { data, error: err } = await getVentasFisicas({
      branchId: branchId ? Number(branchId) : null,
      dateFrom: dateFrom || null,
      dateTo:   dateTo   || null,
    });
    if (err) setError(err.message);
    setTxs(data || []);
    setLoading(false);
  }, [branchId, dateFrom, dateTo]);

  useEffect(() => { load(); }, [load]);

  const filtered = txs.filter(tx => {
    if (catFilter !== 'todos' && tx.category !== catFilter) return false;
    if (methodFilter !== 'todos' && tx.method !== methodFilter) return false;
    return true;
  });

  const totalPagado = filtered
    .filter(t => t.method !== 'por_pagar')
    .reduce((s, t) => s + t.total, 0);

  const totalPendiente = filtered
    .filter(t => t.method === 'por_pagar')
    .reduce((s, t) => s + t.total, 0);

  const countClases    = filtered.filter(t => t.category === 'clase').length;
  const countArriendos = filtered.filter(t => t.category === 'arriendo').length;
  const countTienda    = filtered.filter(t => t.category === 'tienda').length;

  const branchName = (id) => {
    const b = branches.find(b => b.id === Number(id));
    return b ? `${b.name}` : `Sede ${id}`;
  };

  const setPreset = (preset) => {
    const d = new Date();
    if (preset === 'hoy')   { setDateFrom(today); setDateTo(today); }
    else if (preset === 'semana') {
      const mon = new Date(d); mon.setDate(d.getDate() - ((d.getDay()+6)%7));
      setDateFrom(mon.toISOString().slice(0,10)); setDateTo(today);
    } else if (preset === 'mes') {
      setDateFrom(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`); setDateTo(today);
    } else if (preset === 'todo') {
      setDateFrom(''); setDateTo('');
    }
  };

  const downloadCSV = () => {
    const rows = [
      ['Fecha', 'Hora', 'Sede', 'Categoría', 'Método', 'Estado Cierre', 'Total', 'RUT Cliente'],
      ...filtered.map(tx => {
        const { date, time } = toChileTime(tx.created_at);
        return [date, time, branchName(tx.branch_id), tx.category, tx.method,
                tx.finalized_at ? 'Consolidado' : 'Pendiente Cierre', tx.total, tx.client_rut || ''];
      }),
    ];
    const csv = rows.map(r => r.join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `ventas_fisicas_${today}.csv`; a.click();
  };

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
            Control de Caja Presencial &amp; Mostrador
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight mt-0.5">
            Ventas Físicas en Sucursal
          </h1>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={downloadCSV}
            disabled={filtered.length === 0}
            className="h-9 px-3.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-xs font-bold text-neutral-700 transition-colors inline-flex items-center gap-1.5 disabled:opacity-40"
          >
            <Download size={14} /> Exportar CSV
          </button>
          <button
            onClick={load}
            className="h-9 px-4 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-xs font-bold text-neutral-700 transition-colors inline-flex items-center gap-2"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Actualizar
          </button>
        </div>
      </div>

      {/* ── Bento Metrics KPI Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              Total Cobrado
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
              <DollarSign size={15} />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 tracking-tight font-mono">
            {fmt(totalPagado)}
          </div>
          <div className="text-[10px] font-mono text-neutral-400 mt-1 font-bold">Ingresos confirmados</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              Fiado / Pendiente
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600">
              <Hourglass size={15} />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 tracking-tight font-mono">
            {fmt(totalPendiente)}
          </div>
          <div className="text-[10px] font-mono text-amber-700 mt-1 font-bold">Por saldar en caja</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              Clases Surf
            </span>
            <div className="w-8 h-8 rounded-xl bg-neutral-100 border border-neutral-200/60 flex items-center justify-center text-neutral-700">
              <GraduationCap size={15} />
            </div>
          </div>
          <div className="text-2xl font-black text-neutral-900 tracking-tight font-mono">
            {countClases}
          </div>
          <div className="text-[10px] font-mono text-neutral-400 mt-1 font-bold">Sesiones vendidas</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              Arriendos
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200/60 flex items-center justify-center text-sky-600">
              <Waves size={15} />
            </div>
          </div>
          <div className="text-2xl font-black text-sky-600 tracking-tight font-mono">
            {countArriendos}
          </div>
          <div className="text-[10px] font-mono text-sky-700 mt-1 font-bold">Equipos arrendados</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              Tienda / Café
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200/60 flex items-center justify-center text-purple-600">
              <ShoppingBag size={15} />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-600 tracking-tight font-mono">
            {countTienda}
          </div>
          <div className="text-[10px] font-mono text-purple-700 mt-1 font-bold">Productos retail</div>
        </div>
      </div>

      {/* ── Filters Card ── */}
      <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Sede
            </label>
            <select
              value={branchId}
              onChange={e => setBranchId(e.target.value)}
              className="w-full h-9 px-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs font-semibold text-neutral-800 outline-none"
            >
              <option value="">Todas las sedes</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.short_name || b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Desde
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="w-full h-9 px-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs text-neutral-800 outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Hasta
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="w-full h-9 px-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs text-neutral-800 outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Categoría
            </label>
            <select
              value={catFilter}
              onChange={e => setCatFilter(e.target.value)}
              className="w-full h-9 px-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs font-semibold text-neutral-800 outline-none"
            >
              <option value="todos">Todas</option>
              {Object.entries(categoryInfo).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Medio de Pago
            </label>
            <select
              value={methodFilter}
              onChange={e => setMethodFilter(e.target.value)}
              className="w-full h-9 px-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs font-semibold text-neutral-800 outline-none"
            >
              <option value="todos">Todos</option>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="por_pagar">Por Pagar (Fiado)</option>
            </select>
          </div>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-neutral-100">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mr-1">
            Atajos:
          </span>
          {[
            { k: 'hoy', l: 'Hoy' },
            { k: 'semana', l: 'Esta Semana' },
            { k: 'mes', l: 'Este Mes' },
            { k: 'todo', l: 'Todo' },
          ].map(p => (
            <button
              key={p.k}
              onClick={() => setPreset(p.k)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
            >
              {p.l}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="rounded-2xl bg-white border border-neutral-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-neutral-200/70 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">Detalle de Cobros Presenciales</h3>
            <p className="text-[11px] text-neutral-400">{filtered.length} transacciones registradas</p>
          </div>
          <span className="text-xs font-mono font-bold text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-lg">
            {filtered.length} ventas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50/80 border-b border-neutral-200/70 text-neutral-500 uppercase font-mono text-[11px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Fecha y Hora</th>
                <th className="py-3 px-4">Sede</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4">Medio de Pago</th>
                <th className="py-3 px-4">RUT Cliente</th>
                <th className="py-3 px-4">Estado Caja</th>
                <th className="py-3 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400 font-mono">
                    Cargando ventas físicas...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    <Store size={32} className="mx-auto mb-2 text-neutral-300" />
                    <div className="font-bold text-sm text-neutral-600">No hay ventas físicas</div>
                    <div className="text-xs text-neutral-400 mt-0.5">No se encontraron movimientos para el filtro seleccionado</div>
                  </td>
                </tr>
              ) : (
                filtered.map(tx => {
                  const { full } = toChileTime(tx.created_at);
                  return (
                    <tr key={tx.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-neutral-600">{full}</td>
                      <td className="py-3.5 px-4 font-semibold text-neutral-700">{branchName(tx.branch_id)}</td>
                      <td className="py-3.5 px-4 font-medium capitalize">{tx.category}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 font-mono uppercase text-[10px] font-bold">
                          {tx.method}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-neutral-500">{tx.client_rut || '—'}</td>
                      <td className="py-3.5 px-4">
                        {tx.finalized_at ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Consolidado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> En Sesión Activa
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-neutral-900 text-sm">
                        {fmt(tx.total)}
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
            Mostrando <strong>{filtered.length}</strong> de <strong>{txs.length}</strong> transacciones
          </div>
        </div>
      </div>

    </div>
  );
}
