'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Package, Truck, CheckCircle, Clock, Search, 
  ChevronRight, Filter, ShoppingBag, User, 
  MapPin, Phone, Mail, Calendar, Info, X
} from 'lucide-react';

export default function PedidosLogisticaPage() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('TODOS'); // TODOS, PENDIENTES, ENTREGADOS
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchPedidos();
    
    const channel = supabase
      .channel('pedidos-logs-erp')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ordenes_tienda' }, () => {
        fetchPedidos();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchPedidos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ordenes_tienda')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter only orders that contain physical products (not classes or rentals)
      const filtered = (data || []).filter(order => {
        const prods = order.productos || [];
        return prods.some(p => {
          const name = p.nombre?.toLowerCase() || '';
          return !name.includes('clase') && !name.includes('arriendo') && !name.includes('curso') && !name.includes('rent');
        });
      });

      setPedidos(filtered);
    } catch (e) {
      console.error('Error fetching pedidos:', e);
    } finally {
      setLoading(false);
    }
  };

  const markAsDelivered = async (id) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('ordenes_tienda')
        .update({ estado_entrega: 'entregado' })
        .eq('id', id);

      if (error) throw error;
      fetchPedidos();
      setSelectedOrder(null);
    } catch (e) {
      alert('Error al actualizar: ' + e.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredData = pedidos.filter(p => {
    const matchesSearch = 
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nombre_cliente?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'PENDIENTES') return matchesSearch && (p.estado_entrega === 'pendiente' || !p.estado_entrega);
    if (filter === 'ENTREGADOS') return matchesSearch && p.estado_entrega === 'entregado';
    return matchesSearch;
  });

  const kpis = {
    pendientes: pedidos.filter(p => p.estado_entrega === 'pendiente' || !p.estado_entrega).length,
    entregados: pedidos.filter(p => p.estado_entrega === 'entregado').length,
    total: pedidos.length
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
            Logística &amp; Retiro en Sede · E-Commerce
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight mt-0.5">
            Despacho y Retiro de Pedidos
          </h1>
        </div>
      </div>

      {/* ── KPI Grid (Bento Style) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs hover:border-neutral-300 transition-all flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
              Pendientes de Retiro
            </div>
            <div className="text-2xl font-black text-neutral-900 tracking-tight mt-1">
              {kpis.pendientes}
            </div>
            <div className="text-[10px] font-mono text-amber-600 mt-0.5 font-bold">Por entregar en sede</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-600 flex items-center justify-center shrink-0">
            <Clock size={18} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs hover:border-neutral-300 transition-all flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
              Entregas Completadas
            </div>
            <div className="text-2xl font-black text-neutral-900 tracking-tight mt-1">
              {kpis.entregados}
            </div>
            <div className="text-[10px] font-mono text-emerald-600 mt-0.5 font-bold">Retirados con éxito</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle size={18} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs hover:border-neutral-300 transition-all flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
              Total Pedidos Físicos
            </div>
            <div className="text-2xl font-black text-neutral-900 tracking-tight mt-1">
              {kpis.total}
            </div>
            <div className="text-[10px] font-mono text-neutral-400 mt-0.5">Historial acumulado</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200/60 text-neutral-700 flex items-center justify-center shrink-0">
            <ShoppingBag size={18} />
          </div>
        </div>
      </div>

      {/* ── Toolbar & Filters ── */}
      <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Buscar por ID o Nombre de cliente..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs text-neutral-800 placeholder-neutral-400 focus:bg-white focus:border-neutral-900 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilter('TODOS')}
            className={`h-8 px-3 rounded-lg text-xs font-bold transition-all ${
              filter === 'TODOS'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            Todos ({kpis.total})
          </button>
          <button
            onClick={() => setFilter('PENDIENTES')}
            className={`h-8 px-3 rounded-lg text-xs font-bold transition-all ${
              filter === 'PENDIENTES'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            Pendientes ({kpis.pendientes})
          </button>
          <button
            onClick={() => setFilter('ENTREGADOS')}
            className={`h-8 px-3 rounded-lg text-xs font-bold transition-all ${
              filter === 'ENTREGADOS'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            Entregados ({kpis.entregados})
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="rounded-2xl bg-white border border-neutral-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs font-mono text-neutral-400">
            Cargando pedidos de equipo y ropa...
          </div>
        ) : filteredData.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200/80 flex items-center justify-center text-neutral-400 mb-3">
              <Package size={22} />
            </div>
            <div className="text-sm font-bold text-neutral-800">No se encontraron pedidos</div>
            <p className="text-xs text-neutral-400 mt-1">No hay órdenes pendientes con productos físicos de entrega.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50/80 border-b border-neutral-200/70 text-neutral-500 uppercase font-mono text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4">ID Pedido</th>
                  <th className="py-3 px-4">Fecha Compra</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Artículos Físicos</th>
                  <th className="py-3 px-4">Sede de Retiro</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-800">
                {filteredData.map(order => (
                  <tr key={order.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-neutral-900">
                      #{order.id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-500 text-[11px]">
                      {new Date(order.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-neutral-900">{order.nombre_cliente || 'Cliente Web'}</div>
                      <div className="text-[11px] text-neutral-400 font-mono">{order.email_cliente || '—'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {(order.productos || []).filter(p => {
                          const n = p.nombre?.toLowerCase() || '';
                          return !n.includes('clase') && !n.includes('arriendo') && !n.includes('curso') && !n.includes('rent');
                        }).map((p, i) => (
                          <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-neutral-100 text-neutral-700 border border-neutral-200/60">
                            {p.cantidad || 1}x {p.nombre}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-700">
                        <MapPin size={12} className="text-neutral-400" />
                        {order.sucursal_retiro || 'Concón (Sede Principal)'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold ${
                        order.estado_entrega === 'entregado'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${order.estado_entrega === 'entregado' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        {order.estado_entrega === 'entregado' ? 'Entregado' : 'Pendiente Retiro'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-700 font-bold text-xs transition-colors"
                      >
                        Ver Ficha <ChevronRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal Detalle de Pedido ── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-neutral-100 text-neutral-700 flex items-center justify-center">
                  <Package size={18} />
                </div>
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">Orden de Despacho</div>
                  <h2 className="text-sm font-black text-neutral-900">
                    Pedido #{selectedOrder.id.substring(0, 8).toUpperCase()}
                  </h2>
                </div>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/70">
                  <div className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider mb-1">Cliente</div>
                  <div className="text-xs font-bold text-neutral-900">{selectedOrder.nombre_cliente}</div>
                  <div className="text-[11px] text-neutral-500 font-mono mt-0.5">{selectedOrder.email_cliente}</div>
                  <div className="text-[11px] text-neutral-500 font-mono">{selectedOrder.telefono_cliente || 'Sin teléfono'}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/70">
                  <div className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider mb-1">Punto de Entrega</div>
                  <div className="text-xs font-bold text-neutral-900 flex items-center gap-1">
                    <MapPin size={12} className="text-neutral-500" />
                    {selectedOrder.sucursal_retiro || 'Sede Concón'}
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-1">Horario: Lun - Dom 08:00 a 20:00</div>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-neutral-700 mb-2">Artículos para entrega en mesón:</div>
                <div className="rounded-xl border border-neutral-200/80 overflow-hidden divide-y divide-neutral-100">
                  {(selectedOrder.productos || []).map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-neutral-900 text-white font-mono font-bold text-[10px] flex items-center justify-center">
                          {item.cantidad || 1}
                        </span>
                        <span className="font-semibold text-neutral-800">{item.nombre}</span>
                      </div>
                      <span className="font-mono text-neutral-500 font-semibold">
                        ${Number(item.precio || 0).toLocaleString('es-CL')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center gap-2 text-xs text-amber-800">
                <Info size={16} className="shrink-0 text-amber-600" />
                <span>Verificar Cédula de Identidad del alumno al momento de entregar el equipo físico.</span>
              </div>
            </div>

            <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex justify-end gap-2">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="h-9 px-4 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-xs font-bold text-neutral-700 transition-colors"
              >
                Cerrar
              </button>
              {selectedOrder.estado_entrega !== 'entregado' && (
                <button 
                  onClick={() => markAsDelivered(selectedOrder.id)}
                  disabled={isUpdating}
                  className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle size={14} /> {isUpdating ? 'Actualizando...' : 'Confirmar Entrega en Mesón'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
