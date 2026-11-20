'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Calendar, Clock, Plus, CheckCircle, Search, ClipboardList,
  Printer, X, Save, User, Phone, Check, Tag
} from 'lucide-react';

export default function TiendaReservasPage() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('day'); // 'day', 'week', 'month'
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  
  // Fast Registration Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productos, setProductos] = useState([]);
  const [formData, setFormData] = useState({
    producto_id: '',
    nombre_cliente: '',
    rut_cliente: '',
    telefono: '',
    fecha: new Date().toISOString().split('T')[0],
    hora_inicio: '',
    duracion_minutos: 60
  });
  const [saving, setSaving] = useState(false);

  const [typeFilter, setTypeFilter] = useState('todos'); // 'todos', 'clase', 'arriendo'
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchReservas();
  }, [dateFilter, viewMode]);

  const fetchReservas = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('reservas')
        .select(`
          *,
          productos_tienda(nombre, categoria),
          ordenes_tienda(nombre_cliente, rut_cliente, telefono_cliente)
        `);
      
      if (viewMode === 'day') {
        query = query.eq('fecha', dateFilter);
      } else if (viewMode === 'week') {
        const start = new Date(dateFilter);
        const end = new Date(dateFilter);
        end.setDate(end.getDate() + 7);
        query = query.gte('fecha', start.toISOString().split('T')[0]).lte('fecha', end.toISOString().split('T')[0]);
      } else if (viewMode === 'month') {
        const start = new Date(dateFilter);
        start.setDate(1);
        const end = new Date(start);
        end.setMonth(end.getMonth() + 1);
        query = query.gte('fecha', start.toISOString().split('T')[0]).lt('fecha', end.toISOString().split('T')[0]);
      }

      const { data } = await query.order('fecha', { ascending: true }).order('hora_inicio', { ascending: true });
      setReservas(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFastReg = async () => {
    const { data } = await supabase
      .from('productos_tienda')
      .select('id, nombre, duracion_bloque')
      .eq('requiere_reserva', true)
      .eq('activo', true);
    setProductos(data || []);
    setIsModalOpen(true);
  };

  const handleSaveFastReg = async () => {
    if (!formData.producto_id || !formData.hora_inicio) {
      showToast('Completa los campos requeridos', 'error');
      return;
    }
    
    setSaving(true);
    try {
      const [h, m] = formData.hora_inicio.split(':');
      const endDate = new Date(2000, 0, 1, parseInt(h), parseInt(m));
      endDate.setMinutes(endDate.getMinutes() + formData.duracion_minutos);
      const hora_fin = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

      const { data: orden } = await supabase.from('ordenes_tienda').insert({
        estado: 'pagado',
        total: 0,
        subtotal: 0,
        comision_flow: 0,
        nombre_cliente: formData.nombre_cliente,
        rut_cliente: formData.rut_cliente,
        telefono_cliente: formData.telefono
      }).select().single();

      await supabase.from('reservas').insert({
        producto_id: formData.producto_id,
        orden_id: orden.id,
        fecha: formData.fecha,
        hora_inicio: formData.hora_inicio,
        hora_fin: hora_fin,
        estado: 'confirmada',
        notas: 'Registro en Local'
      });

      showToast('Reserva registrada con éxito', 'success');
      setIsModalOpen(false);
      fetchReservas();
    } catch (e) {
      showToast('Error: ' + e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const markCompleted = async (id) => {
    await supabase.from('reservas').update({ estado: 'completada' }).eq('id', id);
    showToast('Reserva marcada como completada', 'success');
    fetchReservas();
  };

  const getTipo = (prod) => {
    if (!prod) return 'Otro';
    const name = prod.nombre?.toLowerCase() || '';
    if (name.includes('clase') || name.includes('curso')) return 'Clase';
    if (name.includes('arriendo') || name.includes('rent')) return 'Arriendo';
    return 'Otro';
  };

  const filteredReservas = (reservas || []).filter(r => {
    if (typeFilter === 'todos') return true;
    const tipo = getTipo(r.productos_tienda).toLowerCase();
    return tipo === typeFilter;
  });

  const groupedReservas = filteredReservas.reduce((acc, r) => {
    if (!acc[r.fecha]) acc[r.fecha] = [];
    acc[r.fecha].push(r);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedReservas).sort();

  return (
    <div className="space-y-6">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
            Logística &amp; Calendario Operacional
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight mt-0.5">
            Agenda de Reservas de Clases &amp; Arriendos
          </h1>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsReportOpen(true)}
            className="h-9 px-3.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-xs font-bold text-neutral-700 transition-colors inline-flex items-center gap-1.5"
          >
            <ClipboardList size={14} /> Generar Tabla
          </button>
          <button
            onClick={handleOpenFastReg}
            className="h-9 px-4 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5"
          >
            <Plus size={14} /> Registro Rápido Local
          </button>
        </div>
      </div>

      {/* ── Toolbar & Filters Card ── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Segment */}
            <div className="inline-flex p-1 rounded-xl bg-neutral-100 border border-neutral-200/60 gap-0.5">
              {[
                { id: 'day', label: 'Día' },
                { id: 'week', label: 'Semana' },
                { id: 'month', label: 'Mes' }
              ].map(vm => (
                <button
                  key={vm.id}
                  onClick={() => setViewMode(vm.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    viewMode === vm.id ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  {vm.label}
                </button>
              ))}
            </div>

            {/* Type Filter Segment */}
            <div className="inline-flex p-1 rounded-xl bg-neutral-100 border border-neutral-200/60 gap-0.5">
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'clase', label: 'Clases' },
                { id: 'arriendo', label: 'Arriendos' }
              ].map(tf => (
                <button
                  key={tf.id}
                  onClick={() => setTypeFilter(tf.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    typeFilter === tf.id ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-neutral-400 uppercase">
              {viewMode === 'day' ? 'Fecha:' : viewMode === 'week' ? 'Inicia:' : 'Mes:'}
            </span>
            <input
              type={viewMode === 'month' ? 'month' : 'date'}
              value={viewMode === 'month' ? dateFilter.substring(0, 7) : dateFilter}
              onChange={e => {
                const val = e.target.value;
                setDateFilter(viewMode === 'month' ? `${val}-01` : val);
              }}
              className="h-9 px-3 rounded-xl border border-neutral-200 bg-neutral-50/60 text-xs font-semibold text-neutral-900 focus:bg-white focus:border-neutral-900 outline-none"
            />
          </div>

        </div>
      </div>

      {/* ── Reservations List / Agenda Grid ── */}
      <div className="space-y-6">
        {loading ? (
          <div className="p-16 text-center text-xs font-mono text-neutral-400 bg-white rounded-2xl border border-neutral-200/80">
            Cargando agenda de reservas en vivo...
          </div>
        ) : sortedDates.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-2xl border border-neutral-200/80 shadow-2xs">
            <Calendar size={36} className="mx-auto mb-2 text-neutral-300" />
            <div className="font-bold text-sm text-neutral-700">Sin reservas agendadas</div>
            <div className="text-xs text-neutral-400 mt-0.5">
              No hay {typeFilter !== 'todos' ? typeFilter + 's' : 'reservas'} para este periodo seleccionado
            </div>
          </div>
        ) : (
          sortedDates.map(date => (
            <div key={date} className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <Calendar size={15} className="text-neutral-400" />
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500">
                  {new Date(date + 'T12:00:00').toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                  {groupedReservas[date].length} {groupedReservas[date].length === 1 ? 'bloque' : 'bloques'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedReservas[date].map(r => {
                  const tipo = getTipo(r.productos_tienda);
                  const isCompleted = r.estado === 'completada';

                  return (
                    <div 
                      key={r.id} 
                      className={`p-5 rounded-2xl bg-white border transition-all flex flex-col justify-between shadow-2xs hover:shadow-xs ${
                        isCompleted ? 'border-neutral-200/60 opacity-80' : 'border-neutral-200/90'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3 border-b border-neutral-100 pb-2.5">
                          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-black text-neutral-900">
                            <Clock size={13} className="text-neutral-500" />
                            {r.hora_inicio?.substring(0, 5)} - {r.hora_fin?.substring(0, 5)}
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold ${
                            isCompleted ? 'bg-neutral-100 text-neutral-600' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-neutral-400' : 'bg-emerald-500'}`}></span>
                            {r.estado}
                          </span>
                        </div>

                        <div className="space-y-1 mb-4">
                          <div className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200 mb-1">
                            {tipo}
                          </div>
                          <h3 className="text-sm font-black text-neutral-900">
                            {r.productos_tienda?.nombre || 'Servicio'}
                          </h3>
                        </div>

                        <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/60 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-neutral-400 font-mono text-[11px]">CLIENTE:</span>
                            <span className="font-bold text-neutral-800">{r.ordenes_tienda?.nombre_cliente || 'N/A'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-neutral-400 font-mono text-[11px]">RUT:</span>
                            <span className="font-mono text-neutral-600">{r.ordenes_tienda?.rut_cliente || 'N/A'}</span>
                          </div>
                          {r.ordenes_tienda?.telefono_cliente && (
                            <div className="flex items-center justify-between">
                              <span className="text-neutral-400 font-mono text-[11px]">TELÉFONO:</span>
                              <span className="font-mono text-neutral-600">{r.ordenes_tienda?.telefono_cliente}</span>
                            </div>
                          )}
                          {r.notas && (
                            <div className="pt-1 border-t border-neutral-200/60 text-[11px] text-neutral-500 italic">
                              Notas: {r.notas}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 mt-2">
                        {r.estado === 'confirmada' ? (
                          <button
                            onClick={() => markCompleted(r.id)}
                            className="w-full h-9 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle size={14} /> Marcar Completada
                          </button>
                        ) : (
                          <div className="text-center text-[11px] font-mono text-neutral-400 py-1 font-bold">
                            Sesión Finalizada
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Modal Tabla Reporte ── */}
      {isReportOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white rounded-2xl border border-neutral-200 shadow-2xl p-6 space-y-4 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">Planilla Operativa</div>
                <h3 className="text-base font-black text-neutral-900 mt-0.5">
                  Tabla de Control de Reservas
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="h-8 px-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-xs font-bold text-neutral-700 inline-flex items-center gap-1"
                >
                  <Printer size={13} /> Imprimir / PDF
                </button>
                <button
                  onClick={() => setIsReportOpen(false)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase font-mono text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Fecha</th>
                    <th className="py-2.5 px-3">Hora</th>
                    <th className="py-2.5 px-3">Tipo</th>
                    <th className="py-2.5 px-3">Producto / Servicio</th>
                    <th className="py-2.5 px-3">Cliente</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredReservas.map(r => (
                    <tr key={r.id}>
                      <td className="py-2.5 px-3 font-mono">{r.fecha?.split('-').reverse().join('/')}</td>
                      <td className="py-2.5 px-3 font-mono font-bold">{r.hora_inicio?.substring(0, 5)}</td>
                      <td className="py-2.5 px-3"><strong>{getTipo(r.productos_tienda)}</strong></td>
                      <td className="py-2.5 px-3">{r.productos_tienda?.nombre}</td>
                      <td className="py-2.5 px-3 font-medium">{r.ordenes_tienda?.nombre_cliente || 'Presencial'}</td>
                    </tr>
                  ))}
                  {filteredReservas.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-neutral-400">Sin datos para el reporte</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="pt-3 border-t border-neutral-100 flex justify-end">
              <button
                onClick={() => setIsReportOpen(false)}
                className="h-9 px-4 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-xs font-bold text-neutral-700"
              >
                Cerrar Planilla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Fast Registration ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-neutral-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">Recepción &amp; POS</div>
                <h3 className="text-base font-black text-neutral-900 mt-0.5">
                  Registro Rápido Presencial
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Servicio a Reservar *
                </label>
                <select
                  value={formData.producto_id}
                  onChange={e => {
                    const prod = productos.find(p => p.id === e.target.value);
                    setFormData({ ...formData, producto_id: e.target.value, duracion_minutos: prod?.duracion_bloque || 60 });
                  }}
                  className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-900 focus:border-neutral-900 outline-none"
                >
                  <option value="">Seleccionar...</option>
                  {productos.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre} ({p.duracion_bloque} min)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Nombre Completo Cliente *
                </label>
                <input
                  type="text"
                  value={formData.nombre_cliente}
                  onChange={e => setFormData({ ...formData, nombre_cliente: e.target.value })}
                  placeholder="Ej: Sofía Valdés"
                  className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:border-neutral-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    RUT Cliente
                  </label>
                  <input
                    type="text"
                    value={formData.rut_cliente}
                    onChange={e => setFormData({ ...formData, rut_cliente: e.target.value })}
                    placeholder="12.345.678-9"
                    className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 text-xs font-mono text-neutral-900 focus:border-neutral-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                    placeholder="+56 9..."
                    className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 text-xs font-mono text-neutral-900 focus:border-neutral-900 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    value={formData.fecha}
                    onChange={e => setFormData({ ...formData, fecha: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:border-neutral-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Hora Inicio *
                  </label>
                  <input
                    type="time"
                    value={formData.hora_inicio}
                    onChange={e => setFormData({ ...formData, hora_inicio: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:border-neutral-900 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="h-10 px-4 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-xs font-bold text-neutral-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveFastReg}
                disabled={saving}
                className="h-10 px-5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={14} /> {saving ? 'Guardando...' : 'Registrar Reserva'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl border shadow-xl text-xs font-bold animate-in fade-in slide-in-from-bottom-3 duration-200 ${
          toast.type === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-700'
            : 'bg-neutral-900 border-neutral-800 text-white'
        }`}>
          {toast.msg}
        </div>
      )}

    </div>
  );
}
