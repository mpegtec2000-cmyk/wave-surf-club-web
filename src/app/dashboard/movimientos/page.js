'use client';

import { useState, useEffect, useCallback } from 'react';
import { getMovimientos, getBranches } from '@/lib/data';
import { TRANSACTION_CATEGORIES, BRANCHES } from '@/lib/constants';
import {
  TrendingUp, TrendingDown, Filter, Download, RefreshCw,
  Calendar, Building2, BarChart2, ChevronDown, Clock, AlertCircle
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n) => '$ ' + (n || 0).toLocaleString('es-CL');

const TIME_ZONES_OFFSET = -4; // Chile UTC-4

function toChileTime(isoString) {
  if (!isoString) return { date: '—', time: '—' };
  const d = new Date(isoString);
  // Adjust to Chile UTC-4
  const chile = new Date(d.getTime() + TIME_ZONES_OFFSET * 60 * 60 * 1000);
  const date = chile.toISOString().slice(0, 10);
  const time = chile.toISOString().slice(11, 16);
  return { date, time };
}

const categoryLabel = (cat) => {
  const found = TRANSACTION_CATEGORIES.find(c => c.value === cat);
  return found ? `${found.icon} ${found.label}` : cat;
};

const methodBadge = {
  efectivo:      { label: 'Efectivo',      bg: '#d1fae5', color: '#065f46' },
  transferencia: { label: 'Transferencia', bg: '#dbeafe', color: '#1e3a8a' },
  tarjeta:       { label: 'Tarjeta',       bg: '#ede9fe', color: '#4c1d95' },
  por_pagar:     { label: 'Por Pagar',     bg: '#fee2e2', color: '#991b1b' },
};

// Agrupa movimientos por período para las vistas resumidas
function groupBy(txs, view) {
  const map = {};
  txs.forEach(tx => {
    const { date } = toChileTime(tx.created_at);
    let key;
    if (view === 'diaria') {
      key = date; // YYYY-MM-DD
    } else if (view === 'semanal') {
      const d = new Date(date);
      const monday = new Date(d);
      monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
      key = monday.toISOString().slice(0, 10);
    } else if (view === 'mensual') {
      key = date.slice(0, 7); // YYYY-MM
    } else {
      key = date.slice(0, 4); // YYYY
    }

    if (!map[key]) map[key] = { income: 0, expense: 0, count: 0, txs: [] };
    if (tx.type === 'ingreso') map[key].income += tx.total;
    else map[key].expense += tx.total;
    map[key].count += 1;
    map[key].txs.push(tx);
  });

  // Sort descending
  return Object.entries(map)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, val]) => ({ key, ...val, net: val.income - val.expense }));
}

// ── Component ─────────────────────────────────────────────────────────────────

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
  const [typeFilter, setTypeFilter] = useState('todos'); // todos | ingreso | salida
  const [catFilter, setCatFilter] = useState('todos');
  const [view, setView] = useState('diaria'); // diaria | semanal | mensual | anual
  const [showDetail, setShowDetail] = useState({}); // expanded groups

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
    setTxs(data);
    setLoading(false);
  }, [branchId, dateFrom, dateTo]);

  useEffect(() => { load(); }, [load]);

  // Filtered list (type + category)
  const filtered = txs.filter(tx => {
    if (typeFilter !== 'todos' && tx.type !== typeFilter) return false;
    if (catFilter !== 'todos' && tx.category !== catFilter) return false;
    return true;
  });

  const totalIncome  = filtered.filter(t => t.type === 'ingreso').reduce((s, t) => s + t.total, 0);
  const totalExpense = filtered.filter(t => t.type === 'salida').reduce((s, t) => s + t.total, 0);
  const totalNet     = totalIncome - totalExpense;

  // Quick date shortcuts
  const setPreset = (preset) => {
    const d = new Date();
    if (preset === 'hoy') {
      setDateFrom(today); setDateTo(today);
    } else if (preset === 'ayer') {
      const y = new Date(d); y.setDate(d.getDate() - 1);
      const ys = y.toISOString().slice(0, 10);
      setDateFrom(ys); setDateTo(ys);
    } else if (preset === 'semana') {
      const mon = new Date(d); mon.setDate(d.getDate() - ((d.getDay() + 6) % 7));
      setDateFrom(mon.toISOString().slice(0, 10)); setDateTo(today);
    } else if (preset === 'mes') {
      const m = new Date(d.getFullYear(), d.getMonth(), 1);
      setDateFrom(m.toISOString().slice(0, 10)); setDateTo(today);
    } else if (preset === 'año') {
      setDateFrom(`${d.getFullYear()}-01-01`); setDateTo(today);
    }
  };

  const grouped = groupBy(filtered, view);

  const toggleDetail = (key) => setShowDetail(prev => ({ ...prev, [key]: !prev[key] }));

  const branchName = (id) => {
    if (!id) return '—';
    const b = branches.find(b => b.id === Number(id));
    return b ? `${b.emoji} ${b.short_name}` : `Sede ${id}`;
  };

  // CSV download
  const downloadCSV = () => {
    const rows = [
      ['Fecha', 'Hora', 'Sede', 'Tipo', 'Categoría', 'Método', 'Total', 'RUT Cliente'],
      ...filtered.map(tx => {
        const { date, time } = toChileTime(tx.created_at);
        return [
          date, time,
          branchName(tx.branch_id),
          tx.type, tx.category, tx.method,
          tx.total, tx.client_rut || '',
        ];
      }),
    ];
    const csv = rows.map(r => r.join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `movimientos_${dateFrom}_${dateTo}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>

      {/* ── Header ── */}
      <header style={{ marginBottom: '32px', borderBottom: '2px solid var(--border-subtle)', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '30px', fontWeight: 950, color: 'var(--accent-primary)', margin: 0 }}>
              📋 REGISTRO DE MOVIMIENTOS
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px' }}>
              Ingresos y Salidas Generales — Wave Surf Club
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={load}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', background: 'var(--bg-primary)', border: '1.5px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}
            >
              <RefreshCw size={14} /> Actualizar
            </button>
            <button
              onClick={downloadCSV}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', background: 'var(--accent-action)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}
            >
              <Download size={14} /> Exportar CSV
            </button>
          </div>
        </div>
      </header>

      {/* ── Filters Panel ── */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', border: '1.5px solid var(--border-subtle)', padding: '24px', marginBottom: '28px', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <Filter size={16} color="var(--accent-action)" />
          <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--accent-primary)' }}>FILTROS</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {/* Sede */}
          <div>
            <label style={labelStyle}>🏖️ Sede</label>
            <select value={branchId} onChange={e => setBranchId(e.target.value)} style={selectStyle}>
              <option value="">Todas las sedes</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.emoji} {b.short_name}</option>
              ))}
            </select>
          </div>

          {/* Desde */}
          <div>
            <label style={labelStyle}>📅 Desde</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={inputStyle} />
          </div>

          {/* Hasta */}
          <div>
            <label style={labelStyle}>📅 Hasta</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={inputStyle} />
          </div>

          {/* Tipo */}
          <div>
            <label style={labelStyle}>↕️ Tipo</label>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={selectStyle}>
              <option value="todos">Todos</option>
              <option value="ingreso">Solo Ingresos</option>
              <option value="salida">Solo Salidas</option>
            </select>
          </div>

          {/* Categoría */}
          <div>
            <label style={labelStyle}>🏷️ Categoría</label>
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={selectStyle}>
              <option value="todos">Todas</option>
              {TRANSACTION_CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
              ))}
            </select>
          </div>

          {/* Vista */}
          <div>
            <label style={labelStyle}>📊 Vista</label>
            <select value={view} onChange={e => setView(e.target.value)} style={selectStyle}>
              <option value="diaria">Diaria</option>
              <option value="semanal">Semanal</option>
              <option value="mensual">Mensual</option>
              <option value="anual">Anual</option>
            </select>
          </div>
        </div>

        {/* Presets */}
        <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { k: 'hoy', l: 'Hoy' },
            { k: 'ayer', l: 'Ayer' },
            { k: 'semana', l: 'Esta Semana' },
            { k: 'mes', l: 'Este Mes' },
            { k: 'año', l: 'Este Año' },
          ].map(p => (
            <button key={p.k} onClick={() => setPreset(p.k)} style={{
              padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
              border: '1.5px solid var(--border-subtle)', background: 'var(--bg-primary)',
              cursor: 'pointer', transition: 'all .15s',
            }}>
              {p.l}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '28px' }}>
        <KpiCard label="Total Ingresos" value={fmt(totalIncome)} icon={<TrendingUp size={20} />} color="var(--color-success)" />
        <KpiCard label="Total Salidas"  value={fmt(totalExpense)} icon={<TrendingDown size={20} />} color="var(--color-danger)" />
        <KpiCard label="Resultado Neto" value={fmt(totalNet)} icon={<BarChart2 size={20} />} color={totalNet >= 0 ? 'var(--accent-action)' : 'var(--color-danger)'} note={`${filtered.length} movimientos`} />
      </div>

      {/* Error */}
      {error && (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#fee2e2', color: '#991b1b', padding: '12px 18px', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', fontWeight: 700 }}>
          Cargando movimientos...
        </div>
      )}

      {/* ── Grouped Table ── */}
      {!loading && grouped.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '48px', margin: '0 0 16px' }}>📭</p>
          <p style={{ fontWeight: 700 }}>Sin movimientos para el período seleccionado.</p>
        </div>
      )}

      {!loading && grouped.map(group => (
        <div key={group.key} style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--border-subtle)', marginBottom: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          {/* Group Header */}
          <button
            onClick={() => toggleDetail(group.key)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 24px', background: 'var(--bg-primary)', border: 'none', cursor: 'pointer', textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Calendar size={16} color="var(--accent-action)" />
              <span style={{ fontWeight: 900, fontSize: '15px', color: 'var(--accent-primary)' }}>
                {view === 'semanal' ? `Semana del ${group.key}` :
                 view === 'mensual' ? new Date(group.key + '-01').toLocaleString('es-CL', { month: 'long', year: 'numeric' }).toUpperCase() :
                 view === 'anual'   ? `Año ${group.key}` :
                 new Date(group.key + 'T12:00:00').toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span style={{ background: '#e0f2fe', color: '#0369a1', borderRadius: '12px', padding: '2px 10px', fontSize: '11px', fontWeight: 800 }}>
                {group.count} mov.
              </span>
            </div>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <span style={{ color: 'var(--color-success)', fontWeight: 800, fontSize: '14px' }}>+{fmt(group.income)}</span>
              <span style={{ color: 'var(--color-danger)',  fontWeight: 800, fontSize: '14px' }}>-{fmt(group.expense)}</span>
              <span style={{ color: 'var(--accent-primary)', fontWeight: 950, fontSize: '16px' }}>{fmt(group.net)}</span>
              <ChevronDown size={16} style={{ transform: showDetail[group.key] ? 'rotate(180deg)' : '', transition: '.2s' }} />
            </div>
          </button>

          {/* Detail Rows */}
          {showDetail[group.key] && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(15,23,42,0.03)', borderTop: '1px solid var(--border-subtle)' }}>
                    {['Hora', 'Sede', 'Tipo', 'Categoría', 'Método', 'RUT Cliente', 'Total'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textAlign: 'left', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {group.txs.map(tx => {
                    const { time } = toChileTime(tx.created_at);
                    const mb = methodBadge[tx.method] || { label: tx.method, bg: '#f3f4f6', color: '#374151' };
                    return (
                      <tr key={tx.id} style={{ borderTop: '1px solid var(--border-subtle)', transition: 'background .1s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,.04)'}
                          onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <td style={tdStyle}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '13px' }}>
                            <Clock size={12} /> {time}
                          </span>
                        </td>
                        <td style={tdStyle}><span style={{ fontSize: '13px' }}>{branchName(tx.branch_id)}</span></td>
                        <td style={tdStyle}>
                          <span style={{
                            display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800,
                            background: tx.type === 'ingreso' ? '#d1fae5' : '#fee2e2',
                            color:      tx.type === 'ingreso' ? '#065f46' : '#991b1b',
                          }}>
                            {tx.type === 'ingreso' ? '▲ INGRESO' : '▼ SALIDA'}
                          </span>
                        </td>
                        <td style={tdStyle}><span style={{ fontSize: '13px', fontWeight: 600 }}>{categoryLabel(tx.category)}</span></td>
                        <td style={tdStyle}>
                          <span style={{ background: mb.bg, color: mb.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
                            {mb.label}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-muted)' }}>
                          {tx.client_rut || '—'}
                        </td>
                        <td style={tdStyle}>
                          <span style={{ fontWeight: 950, fontSize: '15px', color: tx.type === 'ingreso' ? 'var(--color-success)' : 'var(--color-danger)' }}>
                            {tx.type === 'ingreso' ? '+' : '-'}{fmt(tx.total)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function KpiCard({ label, value, icon, color, note }) {
  return (
    <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', border: '1.5px solid var(--border-subtle)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</span>
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="mono" style={{ fontSize: '26px', fontWeight: 950, color }}>{value}</div>
      {note && <p style={{ margin: '8px 0 0', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>{note}</p>}
    </div>
  );
}

// ── Shared Styles ─────────────────────────────────────────────────────────────

const labelStyle = { display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' };

const inputStyle = {
  width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)',
  border: '1.5px solid var(--border-subtle)', fontSize: '14px',
  fontFamily: 'inherit', background: 'var(--bg-primary)', boxSizing: 'border-box',
};

const selectStyle = { ...inputStyle, cursor: 'pointer' };

const tdStyle = { padding: '11px 16px', fontSize: '13px', verticalAlign: 'middle' };
