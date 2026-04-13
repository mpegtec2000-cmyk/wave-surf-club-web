'use client';

import { useState, useEffect, useCallback } from 'react';
import { getVentasOnline, getBranches } from '@/lib/data';
import {
  Globe, TrendingUp, ShoppingBag, BookOpen, Clock,
  Download, RefreshCw, Filter, CheckCircle2, XCircle, AlertCircle
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

const paymentStatusBadge = {
  pendiente:  { label: '⏳ Pendiente',  bg: '#fef9c3', color: '#854d0e' },
  pagado:     { label: '✅ Pagado',      bg: '#d1fae5', color: '#065f46' },
  rechazado:  { label: '❌ Rechazado',  bg: '#fee2e2', color: '#991b1b' },
  reembolsado:{ label: '↩ Reembolsado',bg: '#dbeafe', color: '#1e3a8a' },
};

const categoryInfo = {
  clase:    { icon: '📚', label: 'Clase' },
  arriendo: { icon: '🏄', label: 'Arriendo' },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function VentasOnline() {
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
  const [statusFilter, setStatusFilter] = useState('todos');

  useEffect(() => { getBranches().then(setBranches); }, []);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    const { data, error: err } = await getVentasOnline({
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
    if (statusFilter !== 'todos' && tx.payment_status !== statusFilter) return false;
    return true;
  });

  const totalPagado = filtered
    .filter(t => t.payment_status === 'pagado')
    .reduce((s, t) => s + t.total, 0);

  const totalPendiente = filtered
    .filter(t => t.payment_status === 'pendiente')
    .reduce((s, t) => s + t.total, 0);

  const countClases    = filtered.filter(t => t.category === 'clase').length;
  const countArriendos = filtered.filter(t => t.category === 'arriendo').length;

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
      ['Fecha', 'Hora', 'Sede', 'Categoría', 'Método', 'Estado Pago', 'Total', 'RUT', 'Gateway ID'],
      ...filtered.map(tx => {
        const { date, time } = toChileTime(tx.created_at);
        return [date, time, branchName(tx.branch_id), tx.category, tx.method,
                tx.payment_status, tx.total, tx.client_rut || '', tx.gateway_tx_id || ''];
      }),
    ];
    const csv = rows.map(r => r.join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `ventas_online_${today}.csv`; a.click();
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>

      {/* ── Header ── */}
      <header style={{ marginBottom: '32px', borderBottom: '2px solid var(--border-subtle)', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Globe size={22} color="#fff" />
              </div>
              <h1 style={{ fontSize: '30px', fontWeight: 950, color: 'var(--accent-primary)', margin: 0 }}>
                VENTAS ONLINE
              </h1>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '8px', marginLeft: '54px' }}>
              Clases y Arriendos agendados vía portal web — Solo tú controlas este departamento.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={load} style={{ display:'flex',alignItems:'center',gap:'6px',padding:'9px 18px',background:'var(--bg-primary)',border:'1.5px solid var(--border-subtle)',borderRadius:'var(--radius-md)',fontWeight:700,cursor:'pointer',fontSize:'13px' }}>
              <RefreshCw size={14} /> Actualizar
            </button>
            <button onClick={downloadCSV} disabled={filtered.length===0} style={{ display:'flex',alignItems:'center',gap:'6px',padding:'9px 18px',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff',border:'none',borderRadius:'var(--radius-md)',fontWeight:700,cursor:'pointer',fontSize:'13px',opacity:filtered.length===0?.5:1 }}>
              <Download size={14} /> Exportar CSV
            </button>
          </div>
        </div>
      </header>

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        <OnlineKpi icon="💰" label="Total Cobrado" value={fmt(totalPagado)} color="#6366f1" />
        <OnlineKpi icon="⏳" label="Pendiente de Cobro" value={fmt(totalPendiente)} color="#d97706" />
        <OnlineKpi icon="📚" label="Clases Agendadas" value={countClases} color="#0891b2" unit="clases" />
        <OnlineKpi icon="🏄" label="Arriendos Agendados" value={countArriendos} color="#059669" unit="arriendos" />
      </div>

      {/* ── Filters ── */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', border: '1.5px solid var(--border-subtle)', padding: '24px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <Filter size={16} color="#6366f1" />
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
            <label style={lbl}>🏷️ Tipo</label>
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={sel}>
              <option value="todos">Todos</option>
              <option value="clase">📚 Clase</option>
              <option value="arriendo">🏄 Arriendo</option>
            </select>
          </div>
          <div>
            <label style={lbl}>💳 Estado Pago</label>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={sel}>
              <option value="todos">Todos</option>
              <option value="pendiente">⏳ Pendiente</option>
              <option value="pagado">✅ Pagado</option>
              <option value="rechazado">❌ Rechazado</option>
              <option value="reembolsado">↩ Reembolsado</option>
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
      {loading && <div style={{ textAlign:'center',padding:'60px',color:'var(--text-muted)',fontWeight:700 }}>Cargando ventas online...</div>}

      {/* Empty */}
      {!loading && filtered.length === 0 && !error && (
        <div style={{ textAlign:'center',padding:'80px',color:'var(--text-muted)' }}>
          <p style={{ fontSize:'48px',margin:'0 0 16px' }}>🌐</p>
          <p style={{ fontWeight:700,fontSize:'16px' }}>No hay ventas online registradas aún.</p>
          <p style={{ fontSize:'13px',marginTop:'8px' }}>Las ventas aparecerán aquí cuando un cliente agende una clase o arriendo desde el portal web.</p>
        </div>
      )}

      {/* ── Table ── */}
      {!loading && filtered.length > 0 && (
        <div style={{ background:'#fff',borderRadius:'var(--radius-xl)',border:'1.5px solid var(--border-subtle)',overflow:'hidden',boxShadow:'var(--shadow-sm)' }}>
          <div style={{ padding:'16px 24px',borderBottom:'1.5px solid var(--border-subtle)',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
            <span style={{ fontWeight:900,fontSize:'15px',color:'var(--accent-primary)' }}>Detalle de Ventas Online</span>
            <span style={{ background:'#ede9fe',color:'#6d28d9',padding:'4px 12px',borderRadius:'20px',fontSize:'12px',fontWeight:800 }}>{filtered.length} ventas</span>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%',borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'rgba(15,23,42,0.03)' }}>
                  {['Fecha y Hora','Sede','Tipo','Método','Estado Pago','RUT Cliente','Total','Gateway ID'].map(h => (
                    <th key={h} style={{ padding:'10px 16px',fontSize:'11px',fontWeight:800,color:'var(--text-muted)',textAlign:'left',textTransform:'uppercase',whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(tx => {
                  const { full } = toChileTime(tx.created_at);
                  const statusB = paymentStatusBadge[tx.payment_status] || { label: tx.payment_status, bg:'#f3f4f6',color:'#374151' };
                  const catI = categoryInfo[tx.category] || { icon:'📦', label: tx.category };
                  return (
                    <tr key={tx.id}
                        style={{ borderTop:'1px solid var(--border-subtle)' }}
                        onMouseEnter={e => e.currentTarget.style.background='rgba(99,102,241,.04)'}
                        onMouseLeave={e => e.currentTarget.style.background=''}>
                      <td style={td}>
                        <span style={{ display:'flex',alignItems:'center',gap:'5px',fontSize:'13px',fontWeight:600 }}>
                          <Clock size={12} color="#6366f1" /> {full}
                        </span>
                      </td>
                      <td style={td}><span style={{ fontSize:'13px' }}>{branchName(tx.branch_id)}</span></td>
                      <td style={td}>
                        <span style={{ background:'#ede9fe',color:'#6d28d9',padding:'3px 10px',borderRadius:'20px',fontSize:'12px',fontWeight:700 }}>
                          {catI.icon} {catI.label}
                        </span>
                      </td>
                      <td style={td}><span style={{ fontSize:'13px',color:'var(--text-muted)',fontWeight:600 }}>{tx.method || '—'}</span></td>
                      <td style={td}>
                        <span style={{ background:statusB.bg,color:statusB.color,padding:'3px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:800 }}>
                          {statusB.label}
                        </span>
                      </td>
                      <td style={{ ...td,fontFamily:'monospace',fontSize:'12px',color:'var(--text-muted)' }}>
                        {tx.client_rut || '—'}
                      </td>
                      <td style={td}>
                        <span style={{ fontWeight:950,fontSize:'15px',color:'#6366f1' }}>{fmt(tx.total)}</span>
                      </td>
                      <td style={{ ...td,fontFamily:'monospace',fontSize:'11px',color:'var(--text-muted)' }}>
                        {tx.gateway_tx_id ? tx.gateway_tx_id.slice(0,16)+'…' : '—'}
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

function OnlineKpi({ icon, label, value, color, unit }) {
  return (
    <div style={{ background:'#fff',borderRadius:'var(--radius-xl)',border:'1.5px solid var(--border-subtle)',padding:'20px',boxShadow:'var(--shadow-sm)' }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'10px' }}>
        <span style={{ fontSize:'11px',fontWeight:800,color:'var(--text-muted)',textTransform:'uppercase' }}>{label}</span>
        <span style={{ fontSize:'20px' }}>{icon}</span>
      </div>
      <div className="mono" style={{ fontSize:'24px',fontWeight:950,color }}>
        {typeof value === 'number' && !unit ? value : value}
        {unit && <span style={{ fontSize:'12px',fontWeight:700,color:'var(--text-muted)',marginLeft:'6px' }}>{unit}</span>}
      </div>
    </div>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const lbl = { display:'block',fontSize:'11px',fontWeight:800,color:'var(--text-muted)',textTransform:'uppercase',marginBottom:'6px' };
const inp = { width:'100%',padding:'9px 12px',borderRadius:'var(--radius-md)',border:'1.5px solid var(--border-subtle)',fontSize:'14px',fontFamily:'inherit',background:'var(--bg-primary)',boxSizing:'border-box' };
const sel = { ...inp, cursor:'pointer' };
const td  = { padding:'11px 16px',fontSize:'13px',verticalAlign:'middle' };
