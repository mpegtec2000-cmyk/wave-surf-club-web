'use client';

import { useState, useEffect } from 'react';
import { getEventQuotes, updateQuoteStatus, deleteEventQuote, getBranches } from '@/lib/data';
import { 
  ClipboardList, User, MapPin, Search, Calendar, Users, 
  Mail, Phone, CheckCircle2, Clock, Trash2, Building2, Sparkles, Filter
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function CotizacionesPage() {
  const [quotes, setQuotes] = useState([]);
  const [filteredQuotes, setFilteredQuotes] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('todos'); // 'todos', 'pending', 'lista'
  const [filterBranch, setFilterBranch] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterData();
  }, [quotes, filterStatus, filterBranch, searchTerm]);

  async function loadData() {
    setLoading(true);
    try {
      const [quotesData, branchesData] = await Promise.all([
        getEventQuotes(),
        getBranches()
      ]);
      setQuotes(quotesData);
      setBranches(branchesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function filterData() {
    let result = [...quotes];

    if (filterStatus !== 'todos') {
      result = result.filter(q => {
        const status = (q.status || 'pending').toLowerCase();
        return status === filterStatus;
      });
    }

    if (filterBranch !== 'todas') {
      result = result.filter(q => q.content?.datos?.sede === filterBranch);
    }

    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      result = result.filter(q => 
        q.content?.datos?.nombre?.toLowerCase().includes(query) || 
        q.content?.datos?.rut?.toLowerCase().includes(query) ||
        q.content?.datos?.email?.toLowerCase().includes(query)
      );
    }

    setFilteredQuotes(result);
  }

  const handleToggleStatus = async (quote) => {
    const currentStatus = (quote.status || 'pending').toLowerCase();
    const nextStatus = currentStatus === 'pending' ? 'lista' : 'pending';
    
    const result = await Swal.fire({
      title: '¿Confirmar como FINALIZADA?',
      text: `La cotización pasará a estado LISTA (Verde)`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, finalizar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#171717'
    });

    if (result.isConfirmed) {
      const { error } = await updateQuoteStatus(quote.id, nextStatus);
      if (error) {
        Swal.fire('Error', 'No se pudo actualizar el estado. Prueba refrescando.', 'error');
      } else {
        setQuotes(quotes.map(q => q.id === quote.id ? { ...q, status: nextStatus } : q));
        Swal.fire({
          title: '¡Tarea Finalizada!',
          text: 'La cotización quedó marcada como lista.',
          icon: 'success',
          timer: 1800,
          showConfirmButton: false
        });
      }
    }
  };

  const handleDelete = async (quote) => {
    const result = await Swal.fire({
      title: '¿Eliminar cotización?',
      text: `Se borrará la solicitud de "${quote.content?.datos?.nombre || 'Cliente'}"`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444'
    });

    if (result.isConfirmed) {
      const { error } = await deleteEventQuote(quote.id);
      if (error) {
        Swal.fire('Error', 'No se pudo eliminar la cotización.', 'error');
      } else {
        setQuotes(quotes.filter(q => q.id !== quote.id));
        Swal.fire({
          title: 'Eliminada',
          text: 'Registro eliminado con éxito.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    }
  };

  // KPI calculations
  const totalPendientes = quotes.filter(q => (q.status || 'pending').toLowerCase() === 'pending').length;
  const totalListas = quotes.filter(q => q.status?.toLowerCase() === 'lista').length;
  const totalEmpresa = quotes.filter(q => q.content?.datos?.tipo_evento === 'PASEO DE EMPRESA').length;

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
            Comercial &amp; Eventos Corporativos
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight mt-0.5">
            Gestión de Cotizaciones y Solicitudes
          </h1>
        </div>
      </div>

      {/* ── KPIs Bento Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs hover:border-neutral-300 transition-all flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
              Pendientes de Revisión
            </div>
            <div className="text-2xl font-black text-amber-600 tracking-tight mt-1">
              {totalPendientes}
            </div>
            <div className="text-[10px] font-mono text-neutral-400 mt-0.5 font-bold">Por responder al cliente</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-600 flex items-center justify-center shrink-0">
            <Clock size={18} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs hover:border-neutral-300 transition-all flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
              Cotizaciones Listas
            </div>
            <div className="text-2xl font-black text-emerald-600 tracking-tight mt-1">
              {totalListas}
            </div>
            <div className="text-[10px] font-mono text-neutral-400 mt-0.5 font-bold">Respondidas / Cerradas</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={18} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs hover:border-neutral-300 transition-all flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
              Paseos de Empresa
            </div>
            <div className="text-2xl font-black text-neutral-900 tracking-tight mt-1">
              {totalEmpresa}
            </div>
            <div className="text-[10px] font-mono text-neutral-400 mt-0.5 font-bold">Eventos corporativos</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200/60 text-neutral-700 flex items-center justify-center shrink-0">
            <Users size={18} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs hover:border-neutral-300 transition-all flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
              Total Solicitudes
            </div>
            <div className="text-2xl font-black text-neutral-900 tracking-tight mt-1">
              {quotes.length}
            </div>
            <div className="text-[10px] font-mono text-neutral-400 mt-0.5 font-bold">Historial acumulado</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200/60 text-neutral-700 flex items-center justify-center shrink-0">
            <ClipboardList size={18} />
          </div>
        </div>
      </div>

      {/* ── Toolbar & Filters ── */}
      <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Buscar por RUT, Nombre o Email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs text-neutral-800 placeholder-neutral-400 focus:bg-white focus:border-neutral-900 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <select 
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            className="h-8 px-3 rounded-lg border border-neutral-200 bg-neutral-50 text-xs font-semibold text-neutral-700 outline-none"
          >
            <option value="todas">Todas las Sedes</option>
            <option value="Concón">Concón</option>
            <option value="Punta de Piedra">Punta de Piedra</option>
            <option value="Pichilemu">Pichilemu</option>
          </select>

          <div className="flex items-center gap-1">
            <button 
              onClick={() => setFilterStatus('todos')}
              className={`h-8 px-3 rounded-lg text-xs font-bold transition-all ${
                filterStatus === 'todos'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Todos ({quotes.length})
            </button>
            <button 
              onClick={() => setFilterStatus('pending')}
              className={`h-8 px-3 rounded-lg text-xs font-bold transition-all ${
                filterStatus === 'pending'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Pendiente ({totalPendientes})
            </button>
            <button 
              onClick={() => setFilterStatus('lista')}
              className={`h-8 px-3 rounded-lg text-xs font-bold transition-all ${
                filterStatus === 'lista'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Lista ({totalListas})
            </button>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="rounded-2xl bg-white border border-neutral-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs font-mono text-neutral-400">
            Cargando solicitudes de eventos desde Supabase...
          </div>
        ) : filteredQuotes.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200/80 flex items-center justify-center text-neutral-400 mb-3">
              <ClipboardList size={22} />
            </div>
            <div className="text-sm font-bold text-neutral-800">No hay solicitudes de cotización</div>
            <p className="text-xs text-neutral-400 mt-1">Las solicitudes enviadas desde la web pública aparecerán aquí automáticamente.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50/80 border-b border-neutral-200/70 text-neutral-500 uppercase font-mono text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Cliente / Contacto</th>
                  <th className="py-3 px-4">Sede / Evento</th>
                  <th className="py-3 px-4">Participantes</th>
                  <th className="py-3 px-4">Fecha Evento</th>
                  <th className="py-3 px-4">Fecha Solicitud</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-800">
                {filteredQuotes.map(quote => {
                  const d = quote.content?.datos || {};
                  const isLista = quote.status?.toLowerCase() === 'lista';

                  return (
                    <tr key={quote.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-neutral-900">{d.nombre || 'Sin nombre'}</div>
                        <div className="text-[11px] font-mono text-neutral-500 mt-0.5">{d.email || '—'}</div>
                        <div className="text-[10px] font-mono text-neutral-400">{d.telefono || d.rut || ''}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-neutral-800">{d.sede || 'No especificada'}</div>
                        <div className="text-[10px] font-mono text-neutral-400 uppercase">{d.tipo_evento || 'Paseo de Curso'}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-neutral-700">
                        {d.personas || '1'} personas
                      </td>
                      <td className="py-3.5 px-4 font-mono text-neutral-700">
                        {d.fecha_estimada || 'A coordinar'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-neutral-400 text-[11px]">
                        {new Date(quote.created_at).toLocaleDateString('es-CL')}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStatus(quote)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold cursor-pointer transition-transform hover:scale-105 ${
                            isLista
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isLista ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          {isLista ? 'Lista' : 'Pendiente'}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDelete(quote)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-rose-50 text-neutral-400 hover:text-rose-600 transition-colors ml-auto"
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
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
