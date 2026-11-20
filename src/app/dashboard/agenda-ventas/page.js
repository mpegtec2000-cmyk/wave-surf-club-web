'use client';

import { useState, useEffect, useCallback } from 'react';
import { getVentasOnline, getBranches } from '@/lib/data';
import {
  CalendarDays, Users, Phone, Mail, Clock, Calendar,
  Download, RefreshCw, Filter, AlertCircle, ShoppingBag,
  Ticket, Building2, CreditCard, CheckCircle2, DollarSign
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
  const [statusFilter, setStatusFilter] = useState('todos');

  useEffect(() => { getBranches().then(setBranches); }, []);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data, error: err } = await getVentasOnline({
        branchId: branchId ? Number(branchId) : null,
        dateFrom: dateFrom || null,
        dateTo:   dateTo   || null,
      });
      if (err) setError(err.message);
      setTxs(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [branchId, dateFrom, dateTo]);

  useEffect(() => { load(); }, [load]);

  const filtered = txs.filter(tx => {
    if (statusFilter !== 'todos' && tx.payment_status !== statusFilter) return false;
    return true;
  });

  const totalAlumnos = filtered.reduce((acc, tx) => acc + (parseInt(tx.web_metadata?.alumnos) || 1), 0);
  const countVentas = filtered.length;
  const hoyAgenda = filtered.filter(tx => tx.web_metadata?.date === today).length;
  const montoConfirmado = filtered.reduce((s, t) => s + (t.total || 0), 0);

  const branchName = (id) => {
    const b = branches.find(b => b.id === Number(id));
    return b ? `${b.emoji || '🏖️'} ${b.short_name || b.name}` : `Sede ${id}`;
  };

  const downloadCSV = () => {
    const rows = [
      ['Fecha Compra', 'Fecha Agenda', 'Hora Agenda', 'Cliente', 'Alumnos', 'Teléfono', 'Email', 'Sede', 'Total'],
      ...filtered.map(tx => {
        const { full: compraFull } = toChileTime(tx.created_at);
        const m = tx.web_metadata || {};
        return [compraFull, m.date || '—', m.time || '—', m.name || '—', m.alumnos || '1', m.phone || '—', m.email || '—', branchName(tx.branch_id), tx.total];
      }),
    ];
    const csv = rows.map(r => r.join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `agenda_clases_${today}.csv`; a.click();
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
            Logística &amp; Reservas Web · E-Commerce
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight mt-0.5">
            Agenda de Clases y Arriendos
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={load}
            className="h-9 px-3 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-neutral-700 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Actualizar
          </button>
          <button 
            onClick={downloadCSV}
            className="h-9 px-4 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5"
          >
            <Download size={13} /> Exportar CSV
          </button>
        </div>
      </div>

      {/* ── KPIs Bento Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs hover:border-neutral-300 transition-all flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
              Total Reservas Web
            </div>
            <div className="text-2xl font-black text-neutral-900 tracking-tight mt-1">
              {countVentas}
            </div>
            <div className="text-[10px] font-mono text-neutral-400 mt-0.5 font-bold">Ventas agendadas</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200/60 text-neutral-700 flex items-center justify-center shrink-0">
            <Ticket size={18} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs hover:border-neutral-300 transition-all flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
              Total Alumnos
            </div>
            <div className="text-2xl font-black text-neutral-900 tracking-tight mt-1">
              {totalAlumnos}
            </div>
            <div className="text-[10px] font-mono text-neutral-400 mt-0.5 font-bold">Participantes esperados</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200/60 text-neutral-700 flex items-center justify-center shrink-0">
            <Users size={18} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs hover:border-neutral-300 transition-all flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
              Reservas para Hoy
            </div>
            <div className="text-2xl font-black text-neutral-900 tracking-tight mt-1">
              {hoyAgenda}
            </div>
            <div className="text-[10px] font-mono text-neutral-400 mt-0.5 font-bold">Turnos del día</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200/60 text-neutral-700 flex items-center justify-center shrink-0">
            <CalendarDays size={18} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs hover:border-neutral-300 transition-all flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
              Monto Confirmado
            </div>
            <div className="text-2xl font-black text-emerald-600 tracking-tight mt-1">
              {fmt(montoConfirmado)}
            </div>
            <div className="text-[10px] font-mono text-neutral-400 mt-0.5 font-bold">Cobrado vía Flow / Web</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign size={18} />
          </div>
        </div>
      </div>

      {/* ── Toolbar & Filters ── */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider mb-1">
              Sede
            </label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs font-semibold text-neutral-800 outline-none"
            >
              <option value="">Todas las Sedes</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider mb-1">
              Compra Desde
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs font-semibold text-neutral-800 outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider mb-1">
              Compra Hasta
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs font-semibold text-neutral-800 outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider mb-1">
              Estado Pago
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs font-semibold text-neutral-800 outline-none"
            >
              <option value="todos">Todos los Estados</option>
              <option value="pagado">Confirmados / Pagados</option>
              <option value="pendiente">Pendientes</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
          {error}
        </div>
      )}

      {/* ── Table ── */}
      <div className="rounded-2xl bg-white border border-neutral-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs font-mono text-neutral-400">
            Cargando agenda de clases y arriendos...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200/80 flex items-center justify-center text-neutral-400 mb-3">
              <CalendarDays size={22} />
            </div>
            <div className="text-sm font-bold text-neutral-800">No hay reservas agendadas</div>
            <p className="text-xs text-neutral-400 mt-1">Las clases reservadas por clientes en la web se listarán aquí.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50/80 border-b border-neutral-200/70 text-neutral-500 uppercase font-mono text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Fecha Agenda</th>
                  <th className="py-3 px-4">Horario</th>
                  <th className="py-3 px-4">Cliente / Contacto</th>
                  <th className="py-3 px-4">Alumnos</th>
                  <th className="py-3 px-4">Sede</th>
                  <th className="py-3 px-4">Monto</th>
                  <th className="py-3 px-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-800">
                {filtered.map(tx => {
                  const m = tx.web_metadata || {};
                  return (
                    <tr key={tx.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-neutral-900">
                        {m.date || new Date(tx.created_at).toLocaleDateString('es-CL')}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-neutral-600">
                        {m.time ? `${m.time} hrs` : '10:00 am'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-neutral-900">{m.name || 'Alumno Registrado'}</div>
                        <div className="text-[11px] font-mono text-neutral-500">{m.email || '—'}</div>
                        <div className="text-[10px] font-mono text-neutral-400">{m.phone || ''}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-neutral-700">
                        {m.alumnos || 1} {m.alumnos === 1 ? 'persona' : 'personas'}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-neutral-800">
                        {branchName(tx.branch_id)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-black text-neutral-900 text-sm">
                        {fmt(tx.total)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Confirmado
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
    </div>
  );
}
