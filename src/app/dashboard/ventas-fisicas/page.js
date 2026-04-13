'use client';

import { useState, useEffect, useCallback } from 'react';
import { getVentasFisicas, getBranches } from '@/lib/data';
import {
  Store, TrendingUp, ShoppingBag, BookOpen, Clock,
  Download, RefreshCw, Filter, AlertCircle
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────

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

const methodBadge = {
  efectivo:      { label: 'Efectivo',      bg: '#d1fae5', color: '#065f46' },
  transferencia: { label: 'Transferencia', bg: '#dbeafe', color: '#1e3a8a' },
  tarjeta:       { label: 'Tarjeta',       bg: '#ede9fe', color: '#4c1d95' },
  por_pagar:     { label: 'Por Pagar',     bg: '#fee2e2', color: '#991b1b' },
};

const categoryInfo = {
  clase:     { icon: '📚', label: 'Clase' },
  arriendo:  { icon: '🏄', label: 'Arriendo' },
  tienda:    { icon: '🛍️', label: 'Tienda' },
  cafeteria: { icon: '☕', label: 'Cafetería' },
  escuela:   { icon: '🎓', label: 'Escuela' },
};

// ── Component ─────────────────────────────────────────────────────────────────

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
    setTxs(data);
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
    return b ? `${b.emoji} ${b.short_name}` : `Sede ${id}`;
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
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>

      {/* ── Header ── */}
      <header style={{ marginBottom: '32px', borderBottom: '2px solid var(--border-subtle)', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--accent-action)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Store size={22} color="#fff" />
              </div>
              <h1 style={{ fontSize: '30px', fontWeight: 950, color: 'var(--accent-primary)', margin: 0 }}>
                VENTAS FÍSICAS
              </h1>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '8px', marginLeft: '54px' }}>
              Control directo de ingresos generados presencialmente en cada sede.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={load} style={{ display:'flex',alignItems:'center',gap:'6px',padding:'9px 18px',background:'var(--bg-primary)',border:'1.5px solid var(--border-subtle)',borderRadius:'var(--radius-md)',fontWeight:700,cursor:'pointer',fontSize:'13px' }}>
              <RefreshCw size={14} /> Actualizar
            </button>
            <button onClick={downloadCSV} disabled={filtered.length===0} style={{ display:'flex',alignItems:'center',gap:'6px',padding:'9px 18px',background:'var(--accent-action)',color:'#fff',border:'none',borderRadius:'var(--radius-md)',fontWeight:700,cursor:'pointer',fontSize:'13px',opacity:filtered.length===0?.5:1 }}>
              <Download size={14} /> Exportar CSV
            </button>
          </div>
        </div>
      </header>

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '28px' }}>
        <FisicasKpi icon="💰" label="Total Cobrado" value={fmt(totalPagado)} color="#0ea5e9" />
        <FisicasKpi icon="⏳" label="Fiado (Por Pagar)" value={fmt(totalPendiente)} color="#d97706" />
        <FisicasKpi icon="📚" label="Clases" value={countClases} color="#0891b2" />
        <FisicasKpi icon="🏄" label="Arriendos" value={countArriendos} color="#059669" />
        <FisicasKpi icon="🛍️" label="Tienda" value={countTienda} color="#8b5cf6" />
      </div>

      {/* ── Filters ── */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', border: '1.5px solid var(--border-subtle)', padding: '24px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <Filter size={16} color="var(--accent-action)" />
          <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--accent-primary)' }}>FILTROS</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px' }}>
          <div>
            <label style={lbl}>🏖️ Sede</label>
            <select value={branchId} onChange={e => setBranchId(e.target.value)} style={sel}>
              <option value="">Todas</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.emoji} {b.short_name}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>📅 Desde</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={inp} />
          </div>
          <div>
            <label style={lbl}>📅 Hasta</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={inp} />
          </div>
          <div>
            <label style={lbl}>🏷️ Especialidad</label>
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={sel}>
              <option value="todos">Todas</option>
              {Object.entries(categoryInfo).map(([k, v]) => (
                <option key={k} value={k}>{v.icon} {v.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={lbl}>💳 Medio de Pago</label>
            <select value={methodFilter} onChange={e => setMethodFilter(e.target.value)} style={sel}>
              <option value="todos">Todos</option>
              <option value="efectivo">💵 Efectivo</option>
              <option value="transferencia">🏦 Transferencia</option>
              <option value="tarjeta">💳 Tarjeta</option>
              <option value="por_pagar">⏳ Por Pagar (Fiado)</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[['hoy','Hoy'],['semana','Esta Semana'],['mes','Este Mes'],['todo','Todo']].map(([k,l]) => (
            <button key={k} onClick={() => setPreset(k)} style={{ padding:'4px 12px',borderRadius:'20px',fontSize:'12px',fontWeight:700,border:'1.5px solid var(--border-subtle)',background:'var(--bg-primary)',cursor:'pointer' }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Error / Loading */}
      {error && <div style={{ display:'flex',gap:'10px',alignItems:'center',background:'#fee2e2',color:'#991b1b',padding:'12px 18px',borderRadius:'var(--radius-md)',marginBottom:'20px' }}><AlertCircle size={16}/>{error}</div>}
      {loading && <div style={{ textAlign:'center',padding:'60px',color:'var(--text-muted)',fontWeight:700 }}>Cargando ventas físicas...</div>}

      {/* Empty */}
      {!loading && filtered.length === 0 && !error && (
        <div style={{ textAlign:'center',padding:'80px',color:'var(--text-muted)' }}>
          <p style={{ fontSize:'48px',margin:'0 0 16px' }}>🏪</p>
          <p style={{ fontWeight:700,fontSize:'16px' }}>No hay ventas físicas para el período.</p>
        </div>
      )}

      {/* ── Table ── */}
      {!loading && filtered.length > 0 && (
        <div style={{ background:'#fff',borderRadius:'var(--radius-xl)',border:'1.5px solid var(--border-subtle)',overflow:'hidden',boxShadow:'var(--shadow-sm)' }}>
          <div style={{ padding:'16px 24px',borderBottom:'1.5px solid var(--border-subtle)',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
            <span style={{ fontWeight:900,fontSize:'15px',color:'var(--accent-primary)' }}>Detalle de Ingresos Físicos</span>
            <span style={{ background:'#e0f2fe',color:'#0284c7',padding:'4px 12px',borderRadius:'20px',fontSize:'12px',fontWeight:800 }}>{filtered.length} transacciones</span>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%',borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'rgba(15,23,42,0.03)' }}>
                  {['Fecha y Hora','Sede','Especialidad','Medio de Pago','RUT Cliente','Cierre de Caja','Total'].map(h => (
                    <th key={h} style={{ padding:'10px 16px',fontSize:'11px',fontWeight:800,color:'var(--text-muted)',textAlign:'left',textTransform:'uppercase',whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(tx => {
                  const { full } = toChileTime(tx.created_at);
                  const mb = methodBadge[tx.method] || { label: tx.method, bg:'#f3f4f6',color:'#374151' };
                  const catI = categoryInfo[tx.category] || { icon:'📦', label: tx.category };
                  return (
                    <tr key={tx.id}
                        style={{ borderTop:'1px solid var(--border-subtle)' }}
                        onMouseEnter={e => e.currentTarget.style.background='rgba(99,102,241,.04)'}
                        onMouseLeave={e => e.currentTarget.style.background=''}>
                      <td style={td}>
                        <span style={{ display:'flex',alignItems:'center',gap:'5px',fontSize:'13px',fontWeight:600 }}>
                          <Clock size={12} color="var(--accent-action)" /> {full}
                        </span>
                      </td>
                      <td style={td}><span style={{ fontSize:'13px' }}>{branchName(tx.branch_id)}</span></td>
                      <td style={td}>
                        <span style={{ background:'#f1f5f9',color:'#475569',padding:'3px 10px',borderRadius:'20px',fontSize:'12px',fontWeight:700 }}>
                          {catI.icon} {catI.label}
                        </span>
                      </td>
                      <td style={td}>
                        <span style={{ background:mb.bg,color:mb.color,padding:'3px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:800 }}>
                          {mb.label}
                        </span>
                      </td>
                      <td style={{ ...td,fontFamily:'monospace',fontSize:'12px',color:'var(--text-muted)' }}>
                        {tx.client_rut || '—'}
                      </td>
                      <td style={td}>
                        {tx.finalized_at
                          ? <span style={{ color:'#059669',fontWeight:700,fontSize:'12px' }}>🔒 Consolidado</span>
                          : <span style={{ color:'#d97706',fontWeight:700,fontSize:'12px' }}>⏳ Pendiente</span>
                        }
                      </td>
                      <td style={td}>
                        <span style={{ fontWeight:950,fontSize:'15px',color:'var(--color-success)' }}>{fmt(tx.total)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FisicasKpi({ icon, label, value, color }) {
  return (
    <div style={{ background:'#fff',borderRadius:'var(--radius-xl)',border:'1.5px solid var(--border-subtle)',padding:'20px',boxShadow:'var(--shadow-sm)' }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'10px' }}>
        <span style={{ fontSize:'10px',fontWeight:800,color:'var(--text-muted)',textTransform:'uppercase' }}>{label}</span>
        <span style={{ fontSize:'18px' }}>{icon}</span>
      </div>
      <div className="mono" style={{ fontSize:'22px',fontWeight:950,color }}>
        {value}
      </div>
    </div>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const lbl = { display:'block',fontSize:'11px',fontWeight:800,color:'var(--text-muted)',textTransform:'uppercase',marginBottom:'6px' };
const inp = { width:'100%',padding:'9px 12px',borderRadius:'var(--radius-md)',border:'1.5px solid var(--border-subtle)',fontSize:'14px',fontFamily:'inherit',background:'var(--bg-primary)',boxSizing:'border-box' };
const sel = { ...inp, cursor:'pointer' };
const td  = { padding:'11px 16px',fontSize:'13px',verticalAlign:'middle' };
