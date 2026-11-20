'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getCurrentUser, getMovimientos, getVentasOnline, getBranches } from '@/lib/data';
import {
  FileText, Calendar, Building2, Send, Download,
  TrendingUp, TrendingDown, DollarSign, AlertCircle, ShoppingBag,
  Store, Globe, CheckCircle2, Copy, Check
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
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const u = getCurrentUser();
    setUser(u);
    if (u && u.allowed_branches && u.allowed_branches.length > 0) {
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

    const lines = [
      '==================================================',
      '        CIERRE DE CAJA - WAVE SURF CLUB',
      '==================================================',
      `SUCURSAL: ${branchName}`,
      `FECHA:    ${new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}`,
      `TURNO:    ${user?.name?.toUpperCase() || 'SISTEMA'}`,
      `TIPO:     ${typeName}`,
      '--------------------------------------------------',
      '',
      '1. BALANCES:',
      ` - TOTAL INGRESOS: ${fmt(totalIncome)}`,
      ` - TOTAL SALIDAS:  ${fmt(totalExpense)}`,
      '',
      `=> NETO DEL DÍA: ${fmt(netBalance)}`,
      '--------------------------------------------------',
      '',
      '2. MÉTODOS DE PAGO:',
      ...Object.entries(methodLabels).map(([k, label]) => {
        return ` - ${label.padEnd(16, ' ')}: ${fmt(byMethod[k] || 0)}`;
      }),
      '--------------------------------------------------',
      '',
      '3. REGISTRO DE MOVIMIENTOS DETALLADOS:',
      ...txs.map((t, idx) => {
        const sign = t.type === 'ingreso' ? '(+)' : '(-)';
        const time = new Date(t.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
        return ` [${time}] #${idx + 1} | ${sign} ${fmt(t.total)} | ${t.category?.toUpperCase()} | ${t.method?.toUpperCase()} | RUT: ${t.client_rut || 'ANÓNIMO'} | ${t.incident_note || 'Sin incidencias'}`;
      }),
      '',
      '==================================================',
      '           FIN DEL REPORTE - SINCE 2015',
      '=================================================='
    ];

    return {
      text: lines.join('\n'),
      totalIncome,
      totalExpense,
      netBalance,
      branchName,
    };
  }, [txs, selectedBranch, branches, selectedDate, txType, user]);

  const downloadReport = () => {
    const blob = new Blob([report.text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cierre_caja_${selectedDate}_${txType}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(report.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = async () => {
    setSending(true);
    // Simular envío de email a la directiva
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 1200);
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
            Operaciones de Caja &amp; Finanzas Diarias
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight mt-0.5">
            Cierre de Caja y Arqueo Diario
          </h1>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
              <Building2 size={12} className="inline mr-1 text-neutral-500" /> Sede / Sucursal
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              disabled={user.role !== 'superadmin' && user.allowed_branches?.length <= 1}
              className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs font-semibold text-neutral-800 focus:bg-white focus:border-neutral-900 outline-none transition-all"
            >
              {user.role === 'superadmin' && <option value="">Todas las Sucursales (Consolidado)</option>}
              {branches
                .filter(b => user.role === 'superadmin' || user.allowed_branches?.includes(b.id))
                .map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
              <Calendar size={12} className="inline mr-1 text-neutral-500" /> Día de Cierre
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs font-semibold text-neutral-800 focus:bg-white focus:border-neutral-900 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
              Tipo de Movimiento
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setTxType('fisico')}
                className={`flex-1 h-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  txType === 'fisico'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                }`}
              >
                <Store size={14} /> FÍSICO
              </button>
              <button
                onClick={() => setTxType('online')}
                className={`flex-1 h-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  txType === 'online'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                }`}
              >
                <Globe size={14} /> ONLINE
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="p-16 text-center text-xs font-mono text-neutral-400 bg-white rounded-2xl border border-neutral-200/80">
          Calculando arqueo de caja con registros en vivo de Supabase...
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
          Error: {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* ── Vista Previa del Reporte (Modern Receipt Card) ── */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-4">
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                  Documento Oficial de Cierre
                </div>
                <h3 className="text-sm font-black text-neutral-900 mt-0.5">
                  Vista Previa del Reporte Diario (.txt)
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyToClipboard}
                  className="h-8 px-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                >
                  {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  {copied ? 'Copiado' : 'Copiar'}
                </button>
                <button
                  onClick={downloadReport}
                  className="h-8 px-3 rounded-lg bg-neutral-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5"
                >
                  <Download size={13} /> Descargar TXT
                </button>
              </div>
            </div>

            <div className="rounded-xl bg-neutral-50 border border-neutral-200/70 p-4 sm:p-5 overflow-x-auto">
              <pre className="font-mono text-[12px] sm:text-[12.5px] leading-relaxed text-neutral-800 whitespace-pre">
                {report.text}
              </pre>
            </div>
          </div>

          {/* ── KPIs Bento Cards ── */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <div className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
                  Total Ingresos
                </div>
                <div className="text-2xl font-black text-emerald-600 tracking-tight mt-1">
                  {fmt(report.totalIncome)}
                </div>
                <div className="text-[10px] font-mono text-neutral-400 mt-0.5 font-bold">Ventas &amp; cobros turno</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-600 flex items-center justify-center shrink-0">
                <TrendingUp size={18} />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <div className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
                  Total Salidas
                </div>
                <div className="text-2xl font-black text-rose-600 tracking-tight mt-1">
                  {fmt(report.totalExpense)}
                </div>
                <div className="text-[10px] font-mono text-neutral-400 mt-0.5 font-bold">Gastos menores de caja</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200/60 text-rose-600 flex items-center justify-center shrink-0">
                <TrendingDown size={18} />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border-2 border-neutral-900 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-wider">
                  Balance Neto del Día
                </div>
                <div className="text-3xl font-black text-neutral-900 tracking-tight mt-1">
                  {fmt(report.netBalance)}
                </div>
                <div className="text-[10px] font-mono text-neutral-500 mt-0.5 font-bold">Saldo disponible en caja</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0">
                <DollarSign size={20} />
              </div>
            </div>

            {/* Acción de Envío */}
            <div className="pt-2">
              {sent ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center flex items-center justify-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  Reporte enviado a directiva@wavesurf.cl
                </div>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={sending || txs.length === 0}
                  className="w-full h-12 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-40 disabled:hover:bg-neutral-900"
                >
                  {sending ? 'Procesando Envío...' : (
                    <>
                      <Send size={15} /> ENVIAR REPORTE A DIRECTIVA
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
