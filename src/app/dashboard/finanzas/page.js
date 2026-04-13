'use client';

import { useState, useEffect, useCallback } from 'react';
import { getFinancialSummary, getBranches } from '@/lib/data';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Calendar, RefreshCw } from 'lucide-react';

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
      return { from: `${selectedDay}T00:00:00`, to: `${selectedDay}T23:59:59.999` };
    }
    if (periodMode === 'mes') {
      const [y, m] = selectedMonth.split('-');
      const last = new Date(Number(y), Number(m), 0).getDate();
      return { from: `${selectedMonth}-01T00:00:00`, to: `${selectedMonth}-${String(last).padStart(2,'0')}T23:59:59.999` };
    }
    if (periodMode === 'año') {
      return { from: `${selectedYear}-01-01T00:00:00`, to: `${selectedYear}-12-31T23:59:59.999` };
    }
    return {}; // total — sin filtro de fecha
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

  const formatMoney = (n) => '$ ' + (n || 0).toLocaleString('es-CL');

  const periodLabel = () => {
    if (periodMode === 'dia') return new Date(selectedDay + 'T12:00:00').toLocaleDateString('es-CL', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
    if (periodMode === 'mes') return new Date(selectedMonth + '-01').toLocaleString('es-CL', { month:'long', year:'numeric' }).toUpperCase();
    if (periodMode === 'año') return `Año ${selectedYear}`;
    return 'Histórico Completo';
  };

  if (loading) return <div className="p-12 text-center animate-pulse">Cargando Auditoría Financiera...</div>;

  const consolidated = Object.values(summary).reduce((s, b) => ({ net: s.net + b.net, income: s.income + b.income, expense: s.expense + b.expense }), { net: 0, income: 0, expense: 0 });

  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>

      {/* ── Header ── */}
      <header style={{ marginBottom: '36px', borderBottom: '2px solid var(--border-subtle)', paddingBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '36px', fontWeight: 950, color: 'var(--accent-primary)', marginBottom: '8px' }}>🏦 FINANZAS GLOBALES</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '16px', fontWeight: 500 }}>Control Consolidado de Centros de Costo — {periodLabel()}</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button onClick={load} style={{ display:'flex',alignItems:'center',gap:'6px',padding:'9px 18px',background:'var(--bg-primary)',border:'1.5px solid var(--border-subtle)',borderRadius:'var(--radius-md)',fontWeight:700,cursor:'pointer',fontSize:'13px' }}>
              <RefreshCw size={14} /> Actualizar
            </button>
            <div style={{ padding: '12px 24px', background: '#fff', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-subtle)', textAlign: 'right' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Neto Consolidado</span>
              <div className="mono" style={{ fontSize: '24px', fontWeight: 950, color: 'var(--accent-action)' }}>
                {formatMoney(consolidated.net)}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Period Selector ── */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', border: '1.5px solid var(--border-subtle)', padding: '24px', marginBottom: '36px', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
          <Calendar size={16} color="var(--accent-action)" />
          <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: 'var(--accent-primary)' }}>FILTRO DE PERÍODO</h2>
        </div>

        {/* Mode tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {[
            { k: 'total', l: '📊 Histórico' },
            { k: 'dia',   l: '📅 Por Día' },
            { k: 'mes',   l: '🗓️ Por Mes' },
            { k: 'año',   l: '📆 Por Año' },
          ].map(({ k, l }) => (
            <button
              key={k}
              onClick={() => setPeriodMode(k)}
              style={{
                padding: '8px 20px', borderRadius: '20px', fontSize: '13px', fontWeight: 800,
                border: periodMode === k ? 'none' : '1.5px solid var(--border-subtle)',
                background: periodMode === k ? 'var(--accent-action)' : 'var(--bg-primary)',
                color: periodMode === k ? '#fff' : 'var(--accent-primary)',
                cursor: 'pointer', transition: 'all .15s',
              }}
            >{l}</button>
          ))}
        </div>

        {/* Date inputs */}
        {periodMode === 'dia' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={lbl}>Seleccionar Día:</label>
            <input type="date" value={selectedDay} onChange={e => setSelectedDay(e.target.value)} style={{ ...inp, maxWidth: '220px' }} />
          </div>
        )}
        {periodMode === 'mes' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={lbl}>Seleccionar Mes:</label>
            <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} style={{ ...inp, maxWidth: '220px' }} />
          </div>
        )}
        {periodMode === 'año' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={lbl}>Seleccionar Año:</label>
            <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} style={{ ...inp, maxWidth: '160px', cursor: 'pointer' }}>
              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* ── Branch Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '32px' }}>
        {branches.map(branch => {
          const stats = summary[branch.id] || { income: 0, expense: 0, net: 0, count: 0 };
          return (
            <div key={branch.id} className="data-header-section" style={{ background: '#fff', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: '1.5px solid var(--border-subtle)' }}>
              <div style={{ padding: '24px', borderBottom: '1.5px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-primary)' }}>
                <span style={{ fontSize: '24px' }}>{branch.emoji}</span>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: 'var(--accent-primary)' }}>{branch.name.toUpperCase()}</h3>
              </div>

              <div style={{ padding: '32px' }}>
                <StatRow icon={<TrendingUp size={18} color="var(--color-success)" />} label="Ingresos Totales"   value={formatMoney(stats.income)} valueColor="var(--color-success)" />
                <StatRow icon={<TrendingDown size={18} color="var(--color-danger)" />} label="Gastos Operativos" value={formatMoney(stats.expense)} valueColor="var(--color-danger)" />
                <hr style={{ border: 'none', borderTop: '1.5px dashed var(--border-subtle)', margin: '24px 0' }} />
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 800, fontSize: '14px' }}>UTILIDAD NETA</span>
                    <DollarSign size={18} color="var(--accent-action)" />
                  </div>
                  <div className="mono" style={{ fontSize: '32px', fontWeight: 950, color: stats.net >= 0 ? 'var(--accent-primary)' : 'var(--color-danger)' }}>
                    {formatMoney(stats.net)}
                  </div>
                  <p style={{ marginTop: '12px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>
                    Basado en {stats.count} sesiones consolidadas.
                  </p>
                </div>
              </div>

              <div style={{ padding: '16px 32px', background: 'rgba(15,23,42,0.03)', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ height: '8px', width: '100%', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, stats.income > 0 ? (stats.net / stats.income) * 100 : 0)}%`, background: 'var(--accent-action)' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)' }}>MARGEN OPERATIVO</span>
                  <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--accent-primary)' }}>
                    {stats.income > 0 ? ((stats.net / stats.income) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Bar Chart ── */}
      <div style={{ marginTop: '48px', background: '#fff', borderRadius: 'var(--radius-xl)', padding: '40px', border: '1.5px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <BarChart3 size={24} style={{ color: 'var(--accent-action)' }} />
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 950, color: 'var(--accent-primary)' }}>Métricas Comparativas por Sede</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', height: '300px', gap: '64px', padding: '0 40px' }}>
          {branches.map(branch => {
            const stats = summary[branch.id] || { income: 0, expense: 0, net: 0 };
            const incomes = Object.values(summary).map(s => s.income);
            const maxInc = incomes.length > 0 ? Math.max(...incomes, 100000) : 100000;
            const hIncome  = (stats.income  / maxInc) * 100;
            const hExpense = (stats.expense / maxInc) * 100;
            return (
              <div key={branch.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '100%', width: '100%' }}>
                  <div style={{ flex: 1, height: `${hIncome}%`, background: 'var(--color-success)', borderRadius: '4px 4px 0 0', opacity: 0.8 }} />
                  <div style={{ flex: 1, height: `${hExpense}%`, background: 'var(--color-danger)', borderRadius: '4px 4px 0 0', opacity: 0.8 }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)' }}>{branch.short_name}</span>
                  <div style={{ fontSize: '11px', color: 'var(--accent-action)', fontWeight: 700 }}>{formatMoney(stats.net)}</div>
                </div>
              </div>
            );
          })}
        </div>
        {/* Legend */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'var(--color-success)', opacity: 0.8 }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Ingresos</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'var(--color-danger)', opacity: 0.8 }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Gastos</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({ icon, label, value, valueColor }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '13px' }}>{label}</span>
        {icon}
      </div>
      <div className="mono" style={{ fontSize: '22px', fontWeight: 850, color: valueColor }}>{value}</div>
    </div>
  );
}

const lbl = { display: 'block', fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)', whiteSpace: 'nowrap' };
const inp = { padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-subtle)', fontSize: '14px', fontFamily: 'inherit', background: 'var(--bg-primary)' };
