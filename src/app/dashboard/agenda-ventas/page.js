'use client';

import { useState, useEffect, useCallback } from 'react';
import { getVentasOnline, getBranches } from '@/lib/data';
import {
  CalendarDays, Users, Phone, Mail, Clock, Calendar,
  Download, RefreshCw, Filter, AlertCircle, ShoppingBag
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

// ── Component ─────────────────────────────────────────────────────────────────

export default function AgendaVentas() {
  const today = new Date().toISOString().slice(0, 10);

  const [branches, setBranches] = useState([]);
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [branchId, setBranchId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('pagado'); // Default to showing confirmed sales

  useEffect(() => { getBranches().then(setBranches); }, []);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    // Note: getVentasOnline filters by created_at. 
    // For agenda, we might want to filter by web_metadata.date eventually, 
    // but for now we follow the same pattern as Ventas Online.
    const { data, error: err } = await getVentasOnline({
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
    if (statusFilter !== 'todos' && tx.payment_status !== statusFilter) return false;
    // We only want class/rental agendas (usually those with web_metadata)
    return !!tx.web_metadata;
  });

  const totalAlumnos = filtered.reduce((acc, tx) => acc + (parseInt(tx.web_metadata?.alumnos) || 0), 0);
  const countVentas = filtered.length;
  const hoyAgenda = filtered.filter(tx => tx.web_metadata?.date === today).length;

  const branchName = (id) => {
    const b = branches.find(b => b.id === Number(id));
    return b ? `${b.emoji} ${b.short_name}` : `Sede ${id}`;
  };

  const downloadCSV = () => {
    const rows = [
      ['Fecha Compra', 'Fecha Agenda', 'Hora Agenda', 'Cliente', 'Alumnos', 'Teléfono', 'Email', 'Sede', 'Total'],
      ...filtered.map(tx => {
        const { full: compraFull } = toChileTime(tx.created_at);
        const m = tx.web_metadata || {};
        return [compraFull, m.date || '—', m.time || '—', m.name || '—', m.alumnos || '0', m.phone || '—', m.email || '—', branchName(tx.branch_id), tx.total];
      }),
    ];
    const csv = rows.map(r => r.join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `agenda_ventas_${today}.csv`; a.click();
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>

      {/* ── Header ── */}
      <header style={{ marginBottom: '32px', borderBottom: '2px solid var(--border-subtle)', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg,#0ea5e9, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CalendarDays size={22} color="#fff" />
              </div>
              <h1 style={{ fontSize: '30px', fontWeight: 950, color: 'var(--accent-primary)', margin: 0 }}>
                AGENDA DE CLASES Y ARRIENDOS
              </h1>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '8px', marginLeft: '54px' }}>
              Listado detallado de reservas confirmadas vía web — Quién viene, cuándo y cuántos son.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={load} style={{ display:'flex',alignItems:'center',gap:'6px',padding:'9px 18px',background:'var(--bg-primary)',border:'1.5px solid var(--border-subtle)',borderRadius:'var(--radius-md)',fontWeight:700,cursor:'pointer',fontSize:'13px' }}>
              <RefreshCw size={14} /> Actualizar
            </button>
            <button onClick={downloadCSV} disabled={filtered.length===0} style={{ display:'flex',alignItems:'center',gap:'6px',padding:'9px 18px',background:'linear-gradient(135deg,#0ea5e9, #3b82f6)',color:'#fff',border:'none',borderRadius:'var(--radius-md)',fontWeight:700,cursor:'pointer',fontSize:'13px',opacity:filtered.length===0?.5:1 }}>
              <Download size={14} /> Exportar CSV
            </button>
          </div>
        </div>
      </header>

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        <KpiCard icon="🎟️" label="Total Reservas" value={countVentas} color="#3b82f6" unit="ventas" />
        <KpiCard icon="👥" label="Total Alumnos" value={totalAlumnos} color="#8b5cf6" unit="personas" />
        <KpiCard icon="📅" label="Reservas para Hoy" value={hoyAgenda} color="#06b6d4" unit="hoy" />
        <KpiCard icon="💰" label="Monto Confirmado" value={fmt(filtered.reduce((s,t)=>s+t.total,0))} color="#10b981" />
      </div>

      {/* ── Filters ── */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', border: '1.5px solid var(--border-subtle)', padding: '24px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <Filter size={16} color="#3b82f6" />
          <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--accent-primary)' }}>FILTRAR VENTAS</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
          <div>
            <label style={lbl}>🏖️ Sede</label>
            <select value={branchId} onChange={e => setBranchId(e.target.value)} style={sel}>
              <option value="">Todas</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.emoji} {b.short_name}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>📅 Compra Desde</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={inp} />
          </div>
          <div>
            <label style={lbl}>📅 Compra Hasta</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={inp} />
          </div>
          <div>
            <label style={lbl}>💳 Estado Pago</label>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={sel}>
              <option value="todos">Todos</option>
              <option value="pagado">✅ Pagado</option>
              <option value="pendiente">⏳ Pendiente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && <div style={{ textAlign:'center',padding:'60px',color:'var(--text-muted)',fontWeight:700 }}>Buscando en la agenda...</div>}
      {error && <div style={{ display:'flex',gap:'10px',alignItems:'center',background:'#fee2e2',color:'#991b1b',padding:'12px 18px',borderRadius:'var(--radius-md)',marginBottom:'20px' }}><AlertCircle size={16}/>{error}</div>}

      {/* Empty */}
      {!loading && filtered.length === 0 && !error && (
        <div style={{ textAlign:'center',padding:'80px',color:'var(--text-muted)' }}>
          <p style={{ fontSize:'48px',margin:'0 0 16px' }}>📅</p>
          <p style={{ fontWeight:700,fontSize:'16px' }}>No hay agendamientos para este filtro.</p>
          <p style={{ fontSize:'13px',marginTop:'8px' }}>Asegúrate de que el estado de pago sea el correcto o amplía el rango de fechas.</p>
        </div>
      )}

      {/* ── Table ── */}
      {!loading && filtered.length > 0 && (
        <div style={{ background:'#fff',borderRadius:'var(--radius-xl)',border:'1.5px solid var(--border-subtle)',overflow:'hidden',boxShadow:'var(--shadow-sm)' }}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%',borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'rgba(15,23,42,0.03)' }}>
                  {['Fecha Agenda','Cliente','Alumnos','Teléfono','Email','Sede','Compra / Pago'].map(h => (
                    <th key={h} style={{ padding:'12px 16px',fontSize:'11px',fontWeight:800,color:'var(--text-muted)',textAlign:'left',textTransform:'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(tx => {
                  const { full: compraFull } = toChileTime(tx.created_at);
                  const meta = tx.web_metadata || {};
                  return (
                    <tr key={tx.id} style={{ borderTop:'1px solid var(--border-subtle)' }}>
                      <td style={td}>
                        <div style={{ display:'flex',flexDirection:'column' }}>
                          <span style={{ fontWeight:900,fontSize:'14px',display:'flex',alignItems:'center',gap:'6px' }}>
                            <Calendar size={14} color="#3b82f6" /> {meta.date || '—'}
                          </span>
                          <span style={{ fontSize:'12px',fontWeight:700,color:'var(--text-muted)',marginLeft:'20px' }}>
                            <Clock size={12} style={{ display:'inline',marginRight:'4px' }}/> {meta.time || '—'}
                          </span>
                        </div>
                      </td>
                      <td style={td}>
                        <span style={{ fontWeight:800,color:'var(--accent-primary)' }}>{meta.name || '—'}</span>
                        <div style={{ fontSize:'11px',color:'var(--text-muted)' }}>RUT: {tx.client_rut || '—'}</div>
                      </td>
                      <td style={td}>
                         <span style={{ background:'#eff6ff',color:'#2563eb',padding:'3px 10px',borderRadius:'2026px',fontSize:'12px',fontWeight:900 }}>
                            {meta.alumnos || '1'} pers.
                         </span>
                      </td>
                      <td style={td}>
                        <div style={{ display:'flex',alignItems:'center',gap:'6px',fontSize:'13px' }}>
                          <Phone size={12} color="var(--text-muted)" /> {meta.phone || '—'}
                        </div>
                      </td>
                      <td style={td}>
                        <div style={{ display:'flex',alignItems:'center',gap:'6px',fontSize:'13px' }}>
                          <Mail size={12} color="var(--text-muted)" /> {meta.email || '—'}
                        </div>
                      </td>
                      <td style={td}><span style={{ fontSize:'13px',fontWeight:600 }}>{branchName(tx.branch_id)}</span></td>
                      <td style={td}>
                         <div style={{ display:'flex',flexDirection:'column' }}>
                           <span style={{ fontWeight:800,color:'#10b981' }}>{fmt(tx.total)}</span>
                           <span style={{ fontSize:'10px',color:'var(--text-muted)' }}>Vendido: {compraFull}</span>
                         </div>
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

function KpiCard({ icon, label, value, color, unit }) {
  return (
    <div style={{ background:'#fff',borderRadius:'var(--radius-xl)',border:'1.5px solid var(--border-subtle)',padding:'20px',boxShadow:'var(--shadow-sm)' }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'10px' }}>
        <span style={{ fontSize:'11px',fontWeight:800,color:'var(--text-muted)',textTransform:'uppercase' }}>{label}</span>
        <span style={{ fontSize:'20px' }}>{icon}</span>
      </div>
      <div style={{ fontSize:'24px',fontWeight:950,color }}>
        {value}
        {unit && <span style={{ fontSize:'12px',fontWeight:700,color:'var(--text-muted)',marginLeft:'6px' }}>{unit}</span>}
      </div>
    </div>
  );
}

const lbl = { display:'block',fontSize:'11px',fontWeight:800,color:'var(--text-muted)',textTransform:'uppercase',marginBottom:'6px' };
const inp = { width:'100%',padding:'9px 12px',borderRadius:'var(--radius-md)',border:'1.5px solid var(--border-subtle)',fontSize:'14px',fontFamily:'inherit',background:'var(--bg-primary)',boxSizing:'border-box' };
const sel = { ...inp, cursor:'pointer' };
const td  = { padding:'14px 16px',verticalAlign:'middle' };
