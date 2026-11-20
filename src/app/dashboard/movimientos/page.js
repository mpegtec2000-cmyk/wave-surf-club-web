'use client';

import { useState, useEffect, useCallback } from 'react';
import { getMovimientos, getBranches } from '@/lib/data';
import { TRANSACTION_CATEGORIES, BRANCHES } from '@/lib/constants';
import {
  TrendingUp, TrendingDown, Filter, Download, RefreshCw,
  Calendar, Building2, BarChart2, ChevronDown, Clock, AlertCircle,
  ClipboardList, Tag, BarChart3, Inbox, ArrowUpDown, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

const fmt = (n) => '$ ' + (n || 0).toLocaleString('es-CL');
const TIME_ZONES_OFFSET = -4; // Chile UTC-4

function toChileTime(isoString) {
  if (!isoString) return { date: '—', time: '—' };
  const d = new Date(isoString);
  const chile = new Date(d.getTime() + TIME_ZONES_OFFSET * 60 * 60 * 1000);
  const date = chile.toISOString().slice(0, 10);
  const time = chile.toISOString().slice(11, 16);
  return { date, time };
}

const categoryLabel = (cat) => {
  const found = TRANSACTION_CATEGORIES.find(c => c.value === cat);
  return found ? found.label : cat;
};

function groupBy(txs, view) {
  const map = {};
  txs.forEach(tx => {
    const { date } = toChileTime(tx.created_at);
    let key;
    if (view === 'diaria') {
      key = date;
    } else if (view === 'semanal') {
      const d = new Date(date);
      const monday = new Date(d);
      monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
      key = monday.toISOString().slice(0, 10);
    } else if (view === 'mensual') {
      key = date.slice(0, 7);
    } else {
      key = date.slice(0, 4);
    }

    if (!map[key]) map[key] = { income: 0, expense: 0, count: 0, txs: [] };
    if (tx.type === 'ingreso') map[key].income += tx.total;
    else map[key].expense += tx.total;
    map[key].count += 1;
    map[key].txs.push(tx);
  });

  return Object.entries(map)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, val]) => ({ key, ...val, net: val.income - val.expense }));
}

export default function RegistroMovimientos() {
  const today = new Date().toISOString().slice(0, 10);

  const [branches, setBranches] = useState([]);
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [branchId, setBranchId] = useState('');
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [typeFilter, setTypeFilter] = useState('todos');
  const [catFilter, setCatFilter] = useState('todos');
  const [view, setView] = useState('diaria');
  const [showDetail, setShowDetail] = useState({});

  useEffect(() => {
    getBranches().then(setBranches);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await getMovimientos({
      branchId: branchId ? Number(branchId) : null,
      dateFrom,
      dateTo,
    });
    if (err) setError(err.message);
    else setTxs(data || []);
    setLoading(false);
  }, [branchId, dateFrom, dateTo]);

  useEffect(() => { load(); }, [load]);

  const filtered = txs.filter(tx => {
    if (typeFilter !== 'todos' && tx.type !== typeFilter) return false;
    if (catFilter !== 'todos' && tx.category !== catFilter) return false;
    return true;
  });

  const totalIncome = filtered.filter(t => t.type === 'ingreso').reduce((s, t) => s + t.total, 0);
  const totalExpense = filtered.filter(t => t.type === 'salida').reduce((s, t) => s + t.total, 0);
  const totalNet = totalIncome - totalExpense;

  const grouped = groupBy(filtered, view);

  const toggleDetail = (key) => {
    setShowDetail(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const branchName = (id) => {
    const b = branches.find(x => x.id === id);
    return b ? b.short_name : `Sede ${id}`;
  };

  const setPreset = (preset) => {
    const d = new Date();
    if (preset === 'hoy') {
      const s = d.toISOString().slice(0, 10);
      setDateFrom(s); setDateTo(s);
    } else if (preset === 'ayer') {
      d.setDate(d.getDate() - 1);
      const s = d.toISOString().slice(0, 10);
      setDateFrom(s); setDateTo(s);
    } else if (preset === 'semana') {
      const mon = new Date(d);
      mon.setDate(d.getDate() - ((d.getDay() + 6) % 7));
      setDateFrom(mon.toISOString().slice(0, 10));
      setDateTo(d.toISOString().slice(0, 10));
    } else if (preset === 'mes') {
      setDateFrom(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`);
      setDateTo(d.toISOString().slice(0, 10));
    } else if (preset === 'año') {
      setDateFrom(`${d.getFullYear()}-01-01`);
      setDateTo(d.toISOString().slice(0, 10));
    }
  };

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
            Auditoría &amp; Bitácora Financiera
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight mt-0.5">
            Registro de Movimientos de Caja
          </h1>
        </div>

        <button
          onClick={load}
          className="h-9 px-4 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-xs font-bold text-neutral-700 transition-colors inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>

      {/* ── Bento Metrics KPI Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              Total Ingresos
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
              <TrendingUp size={15} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight font-mono">
            {fmt(totalIncome)}
          </div>
          <div className="text-[10px] font-mono text-neutral-400 mt-1 font-bold">Cobros y arriendos</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              Total Salidas
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200/60 flex items-center justify-center text-rose-600">
              <TrendingDown size={15} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight font-mono">
            {fmt(totalExpense)}
          </div>
          <div className="text-[10px] font-mono text-neutral-400 mt-1 font-bold">Gastos operacionales</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border-2 border-neutral-900 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500">
              Resultado Neto
            </span>
            <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
              <BarChart2 size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight font-mono">
            {fmt(totalNet)}
          </div>
          <div className="text-[10px] font-mono text-neutral-500 mt-1 font-bold">
            {filtered.length} transacciones auditadas
          </div>
        </div>
      </div>

      {/* ── Filters Card ── */}
      <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
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
              Tipo
            </label>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="w-full h-9 px-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs font-semibold text-neutral-800 outline-none"
            >
              <option value="todos">Todos</option>
              <option value="ingreso">Ingresos</option>
              <option value="salida">Salidas</option>
            </select>
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
              {TRANSACTION_CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Vista
            </label>
            <select
              value={view}
              onChange={e => setView(e.target.value)}
              className="w-full h-9 px-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs font-semibold text-neutral-800 outline-none"
            >
              <option value="diaria">Diaria</option>
              <option value="semanal">Semanal</option>
              <option value="mensual">Mensual</option>
              <option value="anual">Anual</option>
            </select>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-neutral-100">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mr-1">
            Accesos:
          </span>
          {[
            { k: 'hoy', l: 'Hoy' },
            { k: 'ayer', l: 'Ayer' },
            { k: 'semana', l: 'Esta Semana' },
            { k: 'mes', l: 'Este Mes' },
            { k: 'año', l: 'Este Año' },
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

      {/* ── Grouped Results ── */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-16 text-center text-xs font-mono text-neutral-400 bg-white rounded-2xl border border-neutral-200/80">
            Cargando bitácora de transacciones...
          </div>
        ) : grouped.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-2xl border border-neutral-200/80 shadow-2xs">
            <Inbox size={36} className="mx-auto mb-2 text-neutral-300" />
            <div className="font-bold text-sm text-neutral-700">Sin movimientos</div>
            <div className="text-xs text-neutral-400 mt-0.5">No hay transacciones para el período y filtros seleccionados</div>
          </div>
        ) : (
          grouped.map(group => {
            const isExpanded = showDetail[group.key];
            return (
              <div key={group.key} className="rounded-2xl bg-white border border-neutral-200/80 shadow-2xs overflow-hidden">
                <button
                  onClick={() => toggleDetail(group.key)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-neutral-50/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Calendar size={15} className="text-neutral-500" />
                    <div>
                      <span className="font-bold text-sm text-neutral-900">
                        {view === 'semanal' ? `Semana del ${group.key}` :
                         view === 'mensual' ? new Date(group.key + '-01').toLocaleString('es-CL', { month: 'long', year: 'numeric' }).toUpperCase() :
                         view === 'anual' ? `Año ${group.key}` :
                         new Date(group.key + 'T12:00:00').toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                      <span className="ml-2 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                        {group.count} mov.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="text-emerald-600 font-bold hidden sm:inline">+{fmt(group.income)}</span>
                    <span className="text-rose-600 font-bold hidden sm:inline">-{fmt(group.expense)}</span>
                    <span className="text-neutral-900 font-black text-sm">{fmt(group.net)}</span>
                    <ChevronDown size={16} className={`text-neutral-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-neutral-100 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-50/80 border-b border-neutral-200/70 text-neutral-500 uppercase font-mono text-[10px] font-bold tracking-wider">
                        <tr>
                          <th className="py-2.5 px-4">Hora</th>
                          <th className="py-2.5 px-4">Sede</th>
                          <th className="py-2.5 px-4">Tipo</th>
                          <th className="py-2.5 px-4">Categoría</th>
                          <th className="py-2.5 px-4">Método</th>
                          <th className="py-2.5 px-4">RUT Cliente</th>
                          <th className="py-2.5 px-4 text-right">Monto</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 text-neutral-800">
                        {group.txs.map(tx => {
                          const { time } = toChileTime(tx.created_at);
                          return (
                            <tr key={tx.id} className="hover:bg-neutral-50/60 transition-colors">
                              <td className="py-2.5 px-4 font-mono text-neutral-500">{time}</td>
                              <td className="py-2.5 px-4 font-semibold text-neutral-700">{branchName(tx.branch_id)}</td>
                              <td className="py-2.5 px-4">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold ${
                                  tx.type === 'ingreso' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                }`}>
                                  {tx.type === 'ingreso' ? '+' : '-'} {tx.type}
                                </span>
                              </td>
                              <td className="py-2.5 px-4 font-medium capitalize">{categoryLabel(tx.category)}</td>
                              <td className="py-2.5 px-4 font-mono uppercase text-neutral-600">{tx.method}</td>
                              <td className="py-2.5 px-4 font-mono text-neutral-500">{tx.client_rut || '—'}</td>
                              <td className="py-2.5 px-4 text-right font-mono font-bold text-neutral-900">
                                {fmt(tx.total)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
