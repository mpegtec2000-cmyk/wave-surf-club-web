'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, Clock, Plus, CheckCircle, Search } from 'lucide-react';

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
          productos_tienda(nombre),
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
    // Load products that require reservation
    const { data } = await supabase
      .from('productos_tienda')
      .select('id, nombre, duracion_bloque')
      .eq('requiere_reserva', true)
      .eq('activo', true);
    setProductos(data || []);
    setIsModalOpen(true);
  };

  const handleSaveFastReg = async () => {
    if (!formData.producto_id || !formData.hora_inicio) return alert('Completa los campos requeridos');
    
    setSaving(true);
    try {
      const [h, m] = formData.hora_inicio.split(':');
      const endDate = new Date(2000, 0, 1, parseInt(h), parseInt(m));
      endDate.setMinutes(endDate.getMinutes() + formData.duracion_minutos);
      const hora_fin = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

      // Insert dummy order to attach client info, or we can just use notes
      const { data: orden } = await supabase.from('ordenes_tienda').insert({
        estado: 'pagado', // Pago presencial
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

      setIsModalOpen(false);
      fetchReservas();
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const markCompleted = async (id) => {
    await supabase.from('reservas').update({ estado: 'completada' }).eq('id', id);
    fetchReservas();
  };

  // Group reservations by date
  const groupedReservas = (reservas || []).reduce((acc, r) => {
    if (!acc[r.fecha]) acc[r.fecha] = [];
    acc[r.fecha].push(r);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedReservas).sort();

  return (
    <div className="tienda-admin">
      <div className="header-actions">
        <h1>Agenda de Reservas (Tienda)</h1>
        <button className="btn-primary" onClick={handleOpenFastReg}>
          <Plus size={16} /> REGISTRO RÁPIDO LOCAL
        </button>
      </div>

      <div className="toolbar">
        <div className="view-tabs">
          <button className={viewMode === 'day' ? 'active' : ''} onClick={() => setViewMode('day')}>DÍA</button>
          <button className={viewMode === 'week' ? 'active' : ''} onClick={() => setViewMode('week')}>SEMANA</button>
          <button className={viewMode === 'month' ? 'active' : ''} onClick={() => setViewMode('month')}>MES</button>
        </div>

        <div className="date-filter">
          <label>{viewMode === 'day' ? 'Fecha:' : viewMode === 'week' ? 'Inicia en:' : 'Mes de:'}</label>
          <input 
            type={viewMode === 'month' ? 'month' : 'date'} 
            value={viewMode === 'month' ? dateFilter.substring(0,7) : dateFilter}
            onChange={e => {
              const val = e.target.value;
              setDateFilter(viewMode === 'month' ? `${val}-01` : val);
            }}
          />
        </div>
      </div>

      <div className="agenda-view">
        {loading ? (
          <div className="loading">Cargando agenda...</div>
        ) : sortedDates.length === 0 ? (
          <div className="empty-state">No hay reservas agendadas para este periodo.</div>
        ) : (
          sortedDates.map(date => (
            <div key={date} className="date-group">
              <h2 className="date-header">
                <Calendar size={16} /> 
                {new Date(date + 'T12:00:00').toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </h2>
              <div className="grid-cards">
                {groupedReservas[date].map(r => (
                  <div key={r.id} className={`reserva-card ${r.estado}`}>
                    <div className="rc-header">
                      <span className="rc-time">
                        <Clock size={14} /> {r.hora_inicio.substring(0,5)} - {r.hora_fin.substring(0,5)}
                      </span>
                      <span className={`rc-status ${r.estado}`}>{r.estado}</span>
                    </div>
                    <div className="rc-body">
                      <h3>{r.productos_tienda?.nombre}</h3>
                      <div className="client-info">
                        <p><strong>Cliente:</strong> {r.ordenes_tienda?.nombre_cliente || 'N/A'}</p>
                        <p><strong>RUT:</strong> {r.ordenes_tienda?.rut_cliente || 'N/A'}</p>
                        <p><strong>Tel:</strong> {r.ordenes_tienda?.telefono_cliente || 'N/A'}</p>
                        {r.notas && <p className="notes"><strong>Notas:</strong> {r.notas}</p>}
                      </div>
                    </div>
                    <div className="rc-footer">
                      {r.estado === 'confirmada' && (
                        <button className="btn-complete" onClick={() => markCompleted(r.id)}>
                          <CheckCircle size={14} /> Marcar Completada
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* FAST REGISTRATION MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Registro Rápido (Arriendo/Clase Presencial)</h2>
            
            <div className="form-grid">
              <div className="form-group col-span-2">
                <label>Producto a reservar</label>
                <select 
                  value={formData.producto_id} 
                  onChange={e => {
                    const prod = productos.find(p => p.id === e.target.value);
                    setFormData({...formData, producto_id: e.target.value, duracion_minutos: prod?.duracion_bloque || 60});
                  }}
                >
                  <option value="">Seleccionar...</option>
                  {productos.map(p => <option key={p.id} value={p.id}>{p.nombre} ({p.duracion_bloque} min)</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Nombre Cliente</label>
                <input type="text" value={formData.nombre_cliente} onChange={e => setFormData({...formData, nombre_cliente: e.target.value})} />
              </div>

              <div className="form-group">
                <label>RUT Cliente</label>
                <input type="text" value={formData.rut_cliente} onChange={e => setFormData({...formData, rut_cliente: e.target.value})} />
              </div>

              <div className="form-group">
                <label>Teléfono</label>
                <input type="text" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
              </div>

              <div className="form-group">
                <label>Fecha</label>
                <input type="date" value={formData.fecha} onChange={e => setFormData({...formData, fecha: e.target.value})} />
              </div>

              <div className="form-group">
                <label>Hora Inicio</label>
                <input type="time" value={formData.hora_inicio} onChange={e => setFormData({...formData, hora_inicio: e.target.value})} />
              </div>

              <div className="form-group">
                <label>Duración (minutos)</label>
                <input type="number" value={formData.duracion_minutos} onChange={e => setFormData({...formData, duracion_minutos: parseInt(e.target.value) || 60})} />
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancelar</button>
              <button className="btn-save" onClick={handleSaveFastReg} disabled={saving}>
                {saving ? 'Guardando...' : 'Registrar Reserva'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .header-actions h1 { font-size: 20px; margin: 0; color: #fff; font-weight: 900; }
        .btn-primary { background: #38bdf8; color: #000; border: none; padding: 10px 16px; border-radius: 8px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 8px; }
        
        .toolbar { margin-bottom: 20px; background: #1a2236; padding: 15px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; gap: 15px; border: 1px solid #2a3441; }
        
        .view-tabs { display: flex; background: #0f1623; padding: 4px; border-radius: 8px; border: 1px solid #2a3441; }
        .view-tabs button { background: transparent; border: none; color: #64748b; padding: 6px 16px; border-radius: 6px; font-size: 11px; font-weight: 800; cursor: pointer; transition: all 0.2s; }
        .view-tabs button.active { background: #38bdf8; color: #000; }
        
        .date-filter { display: flex; align-items: center; gap: 10px; }
        .date-filter label { font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; }
        .date-filter input { background: #0f1623; border: 1px solid #2a3441; color: #fff; padding: 8px 12px; border-radius: 6px; outline: none; font-size: 13px; }

        .agenda-view { display: flex; flex-direction: column; gap: 30px; }
        .date-group { display: flex; flex-direction: column; gap: 15px; }
        .date-header { font-size: 14px; font-weight: 800; color: #38bdf8; text-transform: uppercase; display: flex; align-items: center; gap: 8px; padding-bottom: 10px; border-bottom: 1px solid #2a3441; margin: 0; }

        .grid-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px; }
        
        .reserva-card { background: #1a2236; border: 1px solid #2a3441; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; transition: transform 0.2s; }
        .reserva-card:hover { transform: translateY(-2px); border-color: #38bdf8; }
        .reserva-card.completada { opacity: 0.7; filter: grayscale(0.5); }

        .rc-header { background: #0f1623; padding: 10px 15px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #2a3441; }
        .rc-time { display: flex; align-items: center; gap: 6px; font-weight: 800; color: #38bdf8; font-size: 13px; }
        
        .rc-status { font-size: 9px; font-weight: 900; text-transform: uppercase; padding: 3px 8px; border-radius: 20px; }
        .rc-status.pendiente { background: rgba(245,158,11,0.2); color: #f59e0b; }
        .rc-status.confirmada { background: rgba(16,185,129,0.2); color: #10b981; }
        .rc-status.completada { background: rgba(100,116,139,0.2); color: #94a3b8; }

        .rc-body { padding: 15px; flex: 1; }
        .rc-body h3 { margin: 0 0 12px 0; font-size: 15px; color: #fff; font-weight: 800; }
        
        .client-info { font-size: 12px; color: #94a3b8; }
        .client-info p { margin: 0 0 4px 0; }
        .client-info strong { color: #64748b; font-weight: 800; margin-right: 4px; }
        .notes { margin-top: 8px !important; color: #f59e0b !important; background: rgba(245,158,11,0.1); padding: 4px 8px; border-radius: 4px; border: 1px solid rgba(245,158,11,0.2); }

        .rc-footer { padding: 10px 15px; border-top: 1px solid #2a3441; background: #0f1623; display: flex; justify-content: flex-end; }
        .btn-complete { background: #10b981; color: #fff; border: none; padding: 8px 12px; border-radius: 6px; font-weight: 800; font-size: 11px; display: flex; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s; }
        .btn-complete:hover { background: #059669; }

        .empty-state, .loading { text-align: center; padding: 60px; color: #64748b; font-weight: 800; font-size: 14px; background: #1a2236; border-radius: 12px; border: 1px dashed #2a3441; grid-column: 1 / -1; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 1000; display: flex; align-items: center; justify-content: center; }
        .modal-content { background: #1a2236; width: 90%; max-width: 600px; border-radius: 12px; padding: 30px; }
        .modal-content h2 { margin: 0 0 20px 0; font-size: 18px; color: #fff; font-weight: 900; }

        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .col-span-2 { grid-column: span 2; }
        
        .form-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: 15px; }
        .form-group label { font-size: 11px; color: #64748b; font-weight: 800; text-transform: uppercase; }
        .form-group input, .form-group select { background: #0f1623; border: 1px solid #2a3441; color: #fff; padding: 10px; border-radius: 8px; outline: none; font-size: 13px; }
        .form-group input:focus, .form-group select:focus { border-color: #38bdf8; }

        .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
        .btn-cancel { background: transparent; color: #64748b; border: 1px solid #2a3441; padding: 10px 16px; border-radius: 8px; cursor: pointer; font-weight: 800; font-size: 12px; }
        .btn-save { background: #38bdf8; color: #000; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 800; cursor: pointer; font-size: 12px; }
        .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
