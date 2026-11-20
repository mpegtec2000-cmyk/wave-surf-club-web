'use client';

import { useState, useEffect, useCallback } from 'react';
import { getFinancialSummary, getBranches } from '@/lib/data';
import { 
  TrendingUp, TrendingDown, DollarSign, BarChart3, Calendar, 
  RefreshCw, Landmark, CalendarDays, ArrowUpRight, ArrowDownRight,
  Building2, Percent
} from 'lucide-react';

const fmt = (n) => '$ ' + (n || 0).toLocaleString('es-CL');

export default function FinanzasGlobales() {
  const today = new Date().toISOString().slice(0, 10);

  const [summary, setSummary] = useState({});
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Date filter
  const [periodMode, setPeriodMode] = useState('total'); // total | dia | mes | año
  const [selectedDay, setSelectedDay] = useState(today);
  const [selectedMonth, setSelectedMonth] = useState(today.slice(0, 7));
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));

  // Build date range from current filter
  const getRange = useCallback(() => {
    if (periodMode === 'dia') {
      return { from: `${selectedDay}T00:00:00-04:00`, to: `${selectedDay}T23:59:59.999-04:00` };
    }
    if (periodMode === 'mes') {
      const [y, m] = selectedMonth.split('-');
      const last = new Date(Number(y), Number(m), 0).getDate();
      return { from: `${selectedMonth}-01T00:00:00-04:00`, to: `${selectedMonth}-${String(last).padStart(2,'0')}T23:59:59.999-04:00` };
    }
    if (periodMode === 'año') {
      return { from: `${selectedYear}-01-01T00:00:00-04:00`, to: `${selectedYear}-12-31T23:59:59.999-04:00` };
    }
    return {};
  }, [periodMode, selectedDay, selectedMonth, selectedYear]);

  const load = useCallback(async () => {
    setLoading(true);
    const b = await getBranches();
    const range = getRange();
    const s = await getFinancialSummary(range.from || null, range.to || null);
    setBranches(b);
    setSummary(s);
    setLoading(false);
  }, [getRange]);

  useEffect(() => { load(); }, [load]);

  const periodLabel = () => {
    if (periodMode === 'dia') return new Date(selectedDay + 'T12:00:00').toLocaleDateString('es-CL', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
    if (periodMode === 'mes') return new Date(selectedMonth + '-01').toLocaleString('es-CL', { month:'long', year:'numeric' }).toUpperCase();
    if (periodMode === 'año') return `Año ${selectedYear}`;
    return 'Histórico Consolidado';
  };

  const consolidated = Object.values(summary).reduce((s, b) => ({ 
    net: s.net + (b.net || 0), 
    income: s.income + (b.income || 0), 
    expense: s.expense + (b.expense || 0) 
  }), { net: 0, income: 0, expense: 0 });

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
            Control de Gestión &amp; Rentabilidad
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight mt-0.5">
            Finanzas Globales &amp; Centros de Costo
          </h1>
          <p className="text-xs text-neutral-500 mt-1">Período: {periodLabel()}</p>
        </div>

        <button
          onClick={load}
          className="h-9 px-4 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-xs font-bold text-neutral-700 transition-colors inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>

      {/* ── Bento Metrics KPI Summary ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              Ingresos Totales
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
              <TrendingUp size={15} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight font-mono">
            {fmt(consolidated.income)}
          </div>
          <div className="text-[10px] font-mono text-neutral-400 mt-1 font-bold">Todas las sedes operativas</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              Gastos Operativos
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200/60 flex items-center justify-center text-rose-600">
              <TrendingDown size={15} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight font-mono">
            {fmt(consolidated.expense)}
          </div>
          <div className="text-[10px] font-mono text-neutral-400 mt-1 font-bold">Salidas y costos registrados</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border-2 border-neutral-900 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500">
              Utilidad Neta Consolidada
            </span>
            <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight font-mono">
            {fmt(consolidated.net)}
          </div>
          <div className="text-[10px] font-mono text-neutral-500 mt-1 font-bold">Margen operacional real</div>
        </div>
      </div>

      {/* ── Period Selector Toolbar ── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mr-1">
            Filtro Temporal:
          </span>
          <div className="inline-flex p-1 rounded-xl bg-neutral-100 border border-neutral-200/60 gap-0.5">
            {[
              { k: 'total', l: 'Histórico' },
              { k: 'dia', l: 'Por Día' },
              { k: 'mes', l: 'Por Mes' },
              { k: 'año', l: 'Por Año' },
            ].map(tab => (
              <button
                key={tab.k}
                onClick={() => setPeriodMode(tab.k)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  periodMode === tab.k ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {tab.l}
              </button>
            ))}
          </div>
        </div>

        <div>
          {periodMode === 'dia' && (
            <input 
              type="date" 
              value={selectedDay} 
              onChange={e => setSelectedDay(e.target.value)} 
              className="h-9 px-3 rounded-xl border border-neutral-200 bg-neutral-50/60 text-xs font-semibold text-neutral-900 focus:bg-white outline-none" 
            />
          )}
          {periodMode === 'mes' && (
            <input 
              type="month" 
              value={selectedMonth} 
              onChange={e => setSelectedMonth(e.target.value)} 
              className="h-9 px-3 rounded-xl border border-neutral-200 bg-neutral-50/60 text-xs font-semibold text-neutral-900 focus:bg-white outline-none" 
            />
          )}
          {periodMode === 'año' && (
            <select 
              value={selectedYear} 
              onChange={e => setSelectedYear(e.target.value)} 
              className="h-9 px-3 rounded-xl border border-neutral-200 bg-neutral-50/60 text-xs font-semibold text-neutral-900 focus:bg-white outline-none"
            >
              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* ── Branch Performance Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {branches.map(branch => {
          const stats = summary[branch.id] || { income: 0, expense: 0, net: 0, count: 0 };
          const margin = stats.income > 0 ? ((stats.net / stats.income) * 100).toFixed(1) : 0;

          return (
            <div key={branch.id} className="p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-900">
                      <Building2 size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-neutral-900">{branch.name}</h3>
                      <div className="text-[10px] font-mono text-neutral-400 font-bold uppercase">{branch.short_name}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                    ID #{branch.id}
                  </span>
                </div>

                <div className="space-y-3 pt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500 font-medium">Ingresos Registrados:</span>
                    <span className="font-mono font-bold text-emerald-600">{fmt(stats.income)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500 font-medium">Gastos Operativos:</span>
                    <span className="font-mono font-bold text-rose-600">{fmt(stats.expense)}</span>
                  </div>
                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-900">Utilidad Neta:</span>
                    <span className="font-mono font-black text-base text-neutral-900">{fmt(stats.net)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100">
                <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mb-1.5 font-bold">
                  <span>MARGEN OPERACIONAL</span>
                  <span className="text-neutral-900">{margin}%</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-neutral-900 rounded-full" 
                    style={{ width: `${Math.max(0, Math.min(100, Number(margin)))}%` }}
                  />
                </div>
                <div className="text-[10px] font-mono text-neutral-400 mt-2">
                  Basado en {stats.count} cierres consolidados
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Comparative Visual Section ── */}
      <div className="p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-neutral-700" />
            <h3 className="text-sm font-bold text-neutral-900">Comparativa de Ingresos vs. Gastos por Sucursal</h3>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> Ingresos
            </span>
            <span className="inline-flex items-center gap-1.5 text-rose-700 font-bold">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span> Gastos
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {branches.map(branch => {
            const stats = summary[branch.id] || { income: 0, expense: 0, net: 0 };
            const maxVal = Math.max(stats.income, stats.expense, 100000);
            const incPct = (stats.income / maxVal) * 100;
            const expPct = (stats.expense / maxVal) * 100;

            return (
              <div key={branch.id} className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/60 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-neutral-900">
                  <span>{branch.name}</span>
                  <span className="font-mono text-neutral-600">{fmt(stats.net)}</span>
                </div>
                <div className="space-y-1.5">
                  <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${incPct}%` }}></div>
                  </div>
                  <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${expPct}%` }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
