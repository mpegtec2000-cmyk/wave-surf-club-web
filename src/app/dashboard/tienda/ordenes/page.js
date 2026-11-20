'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Search, Eye, CheckCircle, XCircle, Clock, Calendar, 
  ShoppingBag, Check, X, DollarSign, User, Phone, Mail, FileText
} from 'lucide-react';

const fmt = (n) => '$ ' + (n || 0).toLocaleString('es-CL');

export default function TiendaOrdenesPage() {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  
  // Modal states
  const [viewingOrden, setViewingOrden] = useState(null);

  useEffect(() => {
    fetchOrdenes();
  }, []);

  const fetchOrdenes = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('ordenes_tienda')
        .select('*')
        .order('created_at', { ascending: false });
      
      setOrdenes(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const markAsReviewed = async (id) => {
    try {
      await supabase
        .from('ordenes_tienda')
        .update({ estado: 'revisado' })
        .eq('id', id);
      fetchOrdenes();
      if (viewingOrden && viewingOrden.id === id) {
        setViewingOrden(prev => ({ ...prev, estado: 'revisado' }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredOrdenes = ordenes.filter(o => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = (o.id || '').toLowerCase().includes(q) || 
      (o.nombre_cliente && o.nombre_cliente.toLowerCase().includes(q)) ||
      (o.rut_cliente && o.rut_cliente.toLowerCase().includes(q)) ||
      (o.email_cliente && o.email_cliente.toLowerCase().includes(q));
    
    const matchesStatus = statusFilter === 'todos' || o.estado === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // KPIs
  const totalRecaudado = ordenes.filter(o => o.estado === 'pagado' || o.estado === 'revisado').reduce((s, o) => s + (o.total || 0), 0);
  const totalPagadas = ordenes.filter(o => o.estado === 'pagado').length;
  const totalRevisadas = ordenes.filter(o => o.estado === 'revisado').length;
  const totalPendientes = ordenes.filter(o => o.estado !== 'pagado' && o.estado !== 'revisado').length;

  return (
    <div className="space-y-6">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
            E-Commerce &amp; Pasarela Flow
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight mt-0.5">
            Órdenes de Tienda Online
          </h1>
        </div>

        <button
          onClick={fetchOrdenes}
          className="h-9 px-4 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-xs font-bold text-neutral-700 transition-colors self-start sm:self-auto"
        >
          Actualizar Registros
        </button>
      </div>

      {/* ── Bento Metrics KPI Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              Total Recaudado
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
              <DollarSign size={15} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight font-mono">
            {fmt(totalRecaudado)}
          </div>
          <div className="text-[10px] font-mono text-neutral-400 mt-1 font-bold">Órdenes confirmadas</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              Pagadas (Nuevas)
            </span>
            <div className="w-8 h-8 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800">
              <ShoppingBag size={15} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-neutral-800 tracking-tight font-mono">
            {totalPagadas}
          </div>
          <div className="text-[10px] font-mono text-neutral-700 mt-1 font-bold">Por verificar en caja</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              Revisadas
            </span>
            <div className="w-8 h-8 rounded-xl bg-neutral-100 border border-neutral-200/60 flex items-center justify-center text-neutral-700">
              <CheckCircle size={15} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight font-mono">
            {totalRevisadas}
          </div>
          <div className="text-[10px] font-mono text-neutral-400 mt-1 font-bold">Verificadas y procesadas</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              Pendientes / Otras
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600">
              <Clock size={15} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight font-mono">
            {totalPendientes}
          </div>
          <div className="text-[10px] font-mono text-amber-700 mt-1 font-bold">Sin comprobante definitivo</div>
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="rounded-2xl bg-white border border-neutral-200/80 shadow-2xs overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 sm:p-5 border-b border-neutral-200/70 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar por orden, cliente, RUT o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-xl border border-neutral-200 bg-neutral-50/60 text-xs text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-900 outline-none transition-all"
            />
          </div>

          <div className="inline-flex p-1 rounded-xl bg-neutral-100 border border-neutral-200/60 gap-0.5">
            {[
              { id: 'todos', label: 'Todas' },
              { id: 'pagado', label: 'Pagadas' },
              { id: 'revisado', label: 'Revisadas' },
              { id: 'pendiente', label: 'Pendientes' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === tab.id ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50/80 border-b border-neutral-200/70 text-neutral-500 uppercase font-mono text-[11px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Orden ID</th>
                <th className="py-3 px-4">Cliente / Contacto</th>
                <th className="py-3 px-4">Fecha y Hora</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400 font-mono">
                    Cargando órdenes de la base de datos...
                  </td>
                </tr>
              ) : filteredOrdenes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400">
                    <ShoppingBag size={32} className="mx-auto mb-2 text-neutral-300" />
                    <div className="font-bold text-sm text-neutral-600">No se encontraron órdenes</div>
                    <div className="text-xs text-neutral-400 mt-0.5">No hay ventas que coincidan con los criterios de búsqueda</div>
                  </td>
                </tr>
              ) : (
                filteredOrdenes.map(o => (
                  <tr key={o.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-neutral-900">
                      #{o.id.slice(0, 8)}...
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-neutral-900">{o.nombre_cliente || 'Cliente Web'}</div>
                      <div className="text-[11px] font-mono text-neutral-400">{o.email_cliente || o.rut_cliente || '—'}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-neutral-600">
                      {new Date(o.created_at).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-neutral-900 text-sm">
                      {fmt(o.total)}
                    </td>
                    <td className="py-3.5 px-4">
                      {o.estado === 'pagado' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Pagado
                        </span>
                      ) : o.estado === 'revisado' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-neutral-100 text-neutral-700 border border-neutral-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-1000"></span>
                          Revisado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          {o.estado || 'Pendiente'}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingOrden(o)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                          title="Ver detalle"
                        >
                          <Eye size={14} />
                        </button>
                        {o.estado === 'pagado' && (
                          <button
                            onClick={() => markAsReviewed(o.id)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="Marcar como revisado"
                          >
                            <Check size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-neutral-200/70 bg-neutral-50/50 flex items-center justify-between text-xs font-mono text-neutral-500">
          <div>
            Mostrando <strong>{filteredOrdenes.length}</strong> de <strong>{ordenes.length}</strong> órdenes totales
          </div>
        </div>

      </div>

      {/* ── Modal Detalle Orden ── */}
      {viewingOrden && (
        <div className="fixed inset-0 z-50 bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl border border-neutral-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">Detalle de Venta</div>
                <h3 className="text-base font-black text-neutral-900 mt-0.5">
                  Orden #{viewingOrden.id}
                </h3>
              </div>
              <button
                onClick={() => setViewingOrden(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/70 space-y-2">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                  Datos del Cliente
                </div>
                <div className="text-xs font-bold text-neutral-900">{viewingOrden.nombre_cliente}</div>
                <div className="text-xs font-mono text-neutral-600">RUT: {viewingOrden.rut_cliente || 'Sin RUT'}</div>
                <div className="text-xs font-mono text-neutral-600">Email: {viewingOrden.email_cliente || 'Sin Email'}</div>
                <div className="text-xs font-mono text-neutral-600">Tel: {viewingOrden.telefono_cliente || 'Sin Teléfono'}</div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/70 space-y-2">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                  Estado &amp; Cobro
                </div>
                <div className="text-xl font-black text-neutral-900 font-mono">{fmt(viewingOrden.total)}</div>
                <div className="text-xs text-neutral-500">
                  Estado: <strong className="uppercase text-neutral-800">{viewingOrden.estado}</strong>
                </div>
                <div className="text-xs font-mono text-neutral-500">
                  Fecha: {new Date(viewingOrden.created_at).toLocaleString('es-CL')}
                </div>
              </div>
            </div>

            {viewingOrden.items && viewingOrden.items.length > 0 && (
              <div>
                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  Ítems Incluidos
                </div>
                <div className="rounded-xl border border-neutral-200 divide-y divide-neutral-100 overflow-hidden">
                  {viewingOrden.items.map((it, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-neutral-900">{it.nombre}</div>
                        <div className="text-[11px] text-neutral-500">Cantidad: {it.cantidad}</div>
                      </div>
                      <div className="font-mono font-bold text-neutral-900">{fmt(it.precio * it.cantidad)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
              {viewingOrden.estado === 'pagado' ? (
                <button
                  onClick={() => markAsReviewed(viewingOrden.id)}
                  className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5"
                >
                  <Check size={14} /> Marcar como Revisado
                </button>
              ) : <div />}

              <button
                onClick={() => setViewingOrden(null)}
                className="h-10 px-4 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-xs font-bold text-neutral-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
