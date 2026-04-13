'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getCurrentUser, getMovimientos, getVentasOnline, getBranches } from '@/lib/data';
import {
  FileText, Calendar, Building2, Send, Download,
  TrendingUp, TrendingDown, DollarSign, AlertCircle, ShoppingBag
} from 'lucide-react';

const fmt = (n) => '$ ' + (n || 0).toLocaleString('es-CL');

export default function ClosingPage() {
  const today = new Date().toISOString().slice(0, 10);

  const [user, setUser] = useState(null);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedDate, setSelectedDate] = useState(today);
  const [txType, setTxType] = useState('fisico'); // fisico | online

  const [txs, setTxs] = useState([]);

  // UI state
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const u = getCurrentUser();
    setUser(u);
    if (u && u.allowed_branches && u.allowed_branches.length > 0) {
      // Default to first allowed branch if not superadmin
      if (u.role !== 'superadmin') {
        setSelectedBranch(String(u.allowed_branches[0]));
      }
    }
    getBranches().then(setBranches);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSent(false);

    try {
      const filters = {
        branchId: selectedBranch ? Number(selectedBranch) : null,
        dateFrom: selectedDate,
        dateTo: selectedDate,
      };

      const { data, error: err } = txType === 'online'
        ? await getVentasOnline(filters)
        : await getMovimientos(filters);

      if (err) throw new Error(err.message);
      setTxs(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [selectedBranch, selectedDate, txType]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [loadData, user]);

  const report = useMemo(() => {
    const branchName = selectedBranch 
      ? branches.find(b => b.id === Number(selectedBranch))?.name || `Sede ${selectedBranch}`
      : 'CONSOLIDADO DE TODAS LAS SEDES';

    const typeName = txType === 'online' ? 'VENTAS ONLINE (PORTAL WEB)' : 'MOVIMIENTOS FÍSICOS (PRESENCIAL)';

    // Stats
    const incomeTxs = txs.filter(t => t.type === 'ingreso');
    const expenseTxs = txs.filter(t => t.type === 'salida');

    const totalIncome = incomeTxs.reduce((s, t) => s + t.total, 0);
    const totalExpense = expenseTxs.reduce((s, t) => s + t.total, 0);
    const netBalance = totalIncome - totalExpense;

    const byMethod = txs.reduce((acc, t) => {
      const val = t.type === 'ingreso' ? t.total : -t.total;
      acc[t.method] = (acc[t.method] || 0) + val;
      return acc;
    }, {});

    const methodLabels = {
      efectivo: 'Efectivo',
      transferencia: 'Transferencia',
      tarjeta: 'Tarjeta',
      por_pagar: 'Por Pagar (Fiado / Pendiente)'
    };

    const details = txs.map(t => {
      const sign = t.type === 'ingreso' ? '+' : '-';
      const time = t.created_at ? new Date(t.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : '';
      return `[${time}] ${t.category.toUpperCase()} (${methodLabels[t.method] || t.method}): ${sign}${fmt(t.total)}`;
    }).join('\n');

    const text = `==================================================
        C I E R R E   D E   C A J A
==================================================
WAVE SURF CLUB
SUCURSAL: ${branchName}
FECHA:    ${new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}
TURNO:    ${user?.name?.toUpperCase()}
TIPO:     ${typeName}
--------------------------------------------------

1. BALANCES:
- TOTAL INGRESOS:  ${fmt(totalIncome)}
- TOTAL SALIDAS:   ${fmt(totalExpense)}
--------------------------------------------------
=> NETO DEL DÍA: ${fmt(netBalance)}
--------------------------------------------------

2. MÉTODOS DE PAGO:
- Efectivo:        ${fmt(byMethod.efectivo || 0)}
- Transferencias:  ${fmt(byMethod.transferencia || 0)}
- Tarjetas:        ${fmt(byMethod.tarjeta || 0)}
- Fiaje / Pdt:     ${fmt(byMethod.por_pagar || 0)}

3. RESUMEN DE TRANSACCIONES (${txs.length} movimientos):
${txs.length > 0 ? details : 'No se registraron movimientos en este período.'}

==================================================
           FIN DEL REPORTE - SINCE 2015
==================================================`;

    return { totalIncome, totalExpense, netBalance, text };
  }, [txs, selectedBranch, branches, txType, selectedDate, user]);

  const handleSend = async () => {
    setSending(true);
    // Simula envío de email
    await new Promise(r => setTimeout(r, 1500));
    setSending(false);
    setSent(true);
  };

  const downloadReport = () => {
    const blob = new Blob(['\uFEFF' + report.text], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `cierre_${txType}_${selectedDate}.txt`;
    a.click(); URL.revokeObjectURL(url);
  };

  if (!user) return null;

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>

      {/* ── Header ── */}
      <header style={{ marginBottom: '32px', borderBottom: '2px solid var(--border-subtle)', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--accent-action)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={22} color="#fff" />
              </div>
              <h1 style={{ fontSize: '30px', fontWeight: 950, color: 'var(--accent-primary)', margin: 0 }}>
                CIERRE DE CAJA
              </h1>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '8px', marginLeft: '54px' }}>
              Generador de reportes diarios físicos y online.
            </p>
          </div>
        </div>
      </header>

      {/* ── Filters ── */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', border: '1.5px solid var(--border-subtle)', padding: '24px', marginBottom: '28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
          
          <div>
            <label style={lbl}>🏖️ Sede / Sucursal</label>
            <select
              style={inp}
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              disabled={user.role !== 'superadmin' && user.allowed_branches?.length <= 1}
            >
              {(user.role === 'superadmin') && <option value="">🌐 TODAS LAS SUCURSALES</option>}
              {branches.filter(b => user.role === 'superadmin' || user.allowed_branches?.includes(b.id)).map(b => (
                <option key={b.id} value={b.id}>{b.emoji} {b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={lbl}>📅 Día de Cierre (Año / Mes / Día)</label>
            <input
              type="date"
              style={inp}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div>
            <label style={lbl}>💻 Tipo de Movimiento</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setTxType('fisico')}
                style={{ 
                  flex: 1, padding: '10px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', border: '1.5px solid var(--border-subtle)',
                  background: txType === 'fisico' ? 'var(--accent-action)' : 'var(--bg-primary)',
                  color: txType === 'fisico' ? '#fff' : 'var(--accent-primary)',
                  transition: 'all .15s'
                }}
              >
                🏪 FÍSICO
              </button>
              <button
                onClick={() => setTxType('online')}
                style={{ 
                  flex: 1, padding: '10px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', border: '1.5px solid var(--border-subtle)',
                  background: txType === 'online' ? '#6366f1' : 'var(--bg-primary)',
                  color: txType === 'online' ? '#fff' : 'var(--accent-primary)',
                  transition: 'all .15s'
                }}
              >
                🌐 ONLINE
              </button>
            </div>
          </div>

        </div>
      </div>

      {loading && <div style={{ textAlign:'center',padding:'40px',fontWeight:700,color:'var(--text-muted)' }}>Mapeando registros para el cierre...</div>}
      {error && <div style={{ background:'#fee2e2',color:'#991b1b',padding:'16px',borderRadius:'8px',marginBottom:'20px',fontWeight:600 }}>Error: {error}</div>}

      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', alignItems: 'start' }}>
          
          {/* Vista Previa del TXT */}
          <div style={{ background: '#1e293b', borderRadius: 'var(--radius-xl)', padding: '32px', color: '#f8fafc', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#f8fafc' }}>Vista Previa del Reporte (.txt)</h3>
              <button
                onClick={downloadReport}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Download size={14} /> Descargar TXT
              </button>
            </div>
            
            <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.6', whiteSpace: 'pre-wrap', color: '#cbd5e1' }}>
              {report.text}
            </pre>
          </div>

          {/* Panel Lateral KPIs */}
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--border-subtle)', padding: '24px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                <span style={{ fontSize:'12px', fontWeight:800, color:'var(--text-muted)' }}>TOTAL INGRESOS</span>
                <TrendingUp size={16} color="var(--color-success)" />
              </div>
              <div className="mono" style={{ fontSize:'24px', fontWeight:950, color:'var(--color-success)' }}>{fmt(report.totalIncome)}</div>
            </div>

            <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--border-subtle)', padding: '24px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                <span style={{ fontSize:'12px', fontWeight:800, color:'var(--text-muted)' }}>TOTAL SALIDAS</span>
                <TrendingDown size={16} color="var(--color-danger)" />
              </div>
              <div className="mono" style={{ fontSize:'24px', fontWeight:950, color:'var(--color-danger)' }}>{fmt(report.totalExpense)}</div>
            </div>

            <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--border-subtle)', padding: '24px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                <span style={{ fontSize:'12px', fontWeight:800, color:'var(--accent-primary)' }}>BALANCE NETO</span>
                <DollarSign size={16} color="var(--accent-primary)" />
              </div>
              <div className="mono" style={{ fontSize:'32px', fontWeight:950, color:'var(--accent-primary)' }}>{fmt(report.netBalance)}</div>
            </div>

            {/* Acciones */}
            <div style={{ marginTop: '16px' }}>
              {sent ? (
                <div style={{ background: '#d1fae5', color: '#065f46', padding: '16px', borderRadius: '8px', textAlign: 'center', fontWeight: 800, fontSize: '13px' }}>
                  ✅ Enviado a directiva@wavesurf.cl
                </div>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={sending || txs.length === 0}
                  style={{ 
                    width: '100%', padding: '16px', borderRadius: '8px', fontWeight: 800, fontSize: '14px', border: 'none', cursor: 'pointer',
                    background: txs.length === 0 ? '#e2e8f0' : (txType === 'online' ? '#6366f1' : 'var(--accent-action)'),
                    color: txs.length === 0 ? '#94a3b8' : '#fff',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                  }}
                >
                  {sending ? '⏳ Enviando...' : <><Send size={18} /> ENVIAR REPORTE</>}
                </button>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

const lbl = { display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' };
const inp = { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid var(--border-subtle)', fontSize: '14px', fontFamily: 'inherit', background: 'var(--bg-primary)', boxSizing: 'border-box' };
