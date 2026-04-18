'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';

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
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusBadge = (estado) => {
    switch(estado) {
      case 'pagado': return <span className="badge bg-green"><CheckCircle size={12}/> Pagado</span>;
      case 'revisado': return <span className="badge bg-blue"><CheckCircle size={12}/> Revisado</span>;
      case 'fallido': return <span className="badge bg-red"><XCircle size={12}/> Fallido</span>;
      default: return <span className="badge bg-yellow"><Clock size={12}/> Pendiente</span>;
    }
  };

  const filteredOrdenes = ordenes.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (o.nombre_cliente && o.nombre_cliente.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'todos' || o.estado === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="tienda-admin">
      <div className="header-actions">
        <h1>Órdenes de Tienda Online</h1>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Buscar por ID o cliente..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="status-tabs">
          <button className={statusFilter === 'todos' ? 'active' : ''} onClick={() => setStatusFilter('todos')}>TODOS</button>
          <button className={statusFilter === 'pendiente' ? 'active' : ''} onClick={() => setStatusFilter('pendiente')}>PENDIENTES</button>
          <button className={statusFilter === 'pagado' ? 'active' : ''} onClick={() => setStatusFilter('pagado')}>PAGADOS</button>
          <button className={statusFilter === 'revisado' ? 'active' : ''} onClick={() => setStatusFilter('revisado')}>REVISADOS</button>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading">Cargando órdenes...</div>
        ) : (
          <table className="erp-table">
            <thead>
              <tr>
                <th>ID Orden</th>
                <th>Fecha</th>
                <th>Reserva (Día/Hora)</th>
                <th>Cliente</th>
                <th>Monto Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrdenes.map(o => {
                // Find first item with reservation
                const firstReserva = o.productos?.find(p => p.reserva)?.reserva;
                
                return (
                  <tr key={o.id}>
                    <td><strong>{o.id.split('-')[0].toUpperCase()}</strong></td>
                    <td>{new Date(o.created_at).toLocaleString('es-CL')}</td>
                    <td>
                      {firstReserva ? (
                        <div className="reserva-tag">
                          <span className="reserva-date">📅 {firstReserva.fecha.split('-').reverse().join('-')}</span>
                          <span className="reserva-time">⏰ {firstReserva.hora_inicio}</span>
                        </div>
                      ) : (
                        <span className="text-gray">—</span>
                      )}
                    </td>
                    <td>
                      <div className="flex flex-col">
                        <span>{o.nombre_cliente}</span>
                        <span className="text-sm text-gray">{o.email_cliente}</span>
                      </div>
                    </td>
                    <td className="font-bold">${o.total.toLocaleString('es-CL')}</td>
                    <td>{getStatusBadge(o.estado)}</td>
                    <td className="actions-cell">
                      <button onClick={() => setViewingOrden(o)} className="action-btn view" title="Ver detalles"><Eye size={16} /></button>
                      {o.estado !== 'revisado' && (
                        <button onClick={() => markAsReviewed(o.id)} className="action-btn check" title="Marcar como revisado"><CheckCircle size={16} /></button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL VIEW */}
      {viewingOrden && (
        <div className="modal-overlay" onClick={() => setViewingOrden(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalles de la Orden {viewingOrden.id.split('-')[0].toUpperCase()}</h2>
            </div>
            
            <div className="modal-body">
              <div className="info-grid">
                <div className="info-card">
                  <h3>Cliente</h3>
                  <p><strong>Nombre:</strong> {viewingOrden.nombre_cliente}</p>
                  <p><strong>RUT:</strong> {viewingOrden.rut_cliente}</p>
                  <p><strong>Email:</strong> {viewingOrden.email_cliente}</p>
                  <p><strong>Teléfono:</strong> {viewingOrden.telefono_cliente}</p>
                </div>
                <div className="info-card">
                  <h3>Pago (Flow)</h3>
                  <p><strong>Estado:</strong> {getStatusBadge(viewingOrden.estado)}</p>
                  <p><strong>Subtotal:</strong> ${viewingOrden.subtotal.toLocaleString('es-CL')}</p>
                  <p><strong>Comisión:</strong> ${viewingOrden.comision_flow.toLocaleString('es-CL')}</p>
                  <p><strong>Total Pagado:</strong> <span className="text-blue font-bold">${viewingOrden.total.toLocaleString('es-CL')}</span></p>
                  <p><strong>Flow Order ID:</strong> {viewingOrden.flow_order_id || 'N/A'}</p>
                </div>
              </div>

              <h3>Productos ({viewingOrden.productos?.length || 0})</h3>
              <div className="productos-list">
                {viewingOrden.productos?.map((p, i) => (
                  <div key={i} className="prod-item">
                    <div className="prod-name">{p.nombre}</div>
                    <div className="prod-price">${p.precio_final.toLocaleString('es-CL')}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-close" onClick={() => setViewingOrden(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .header-actions h1 { font-size: 20px; margin: 0; }
        .toolbar { margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; gap: 20px; }
        .search-box { display: flex; align-items: center; gap: 10px; background: #1a2236; padding: 10px 15px; border-radius: 8px; max-width: 300px; flex: 1; }
        .search-box input { background: transparent; border: none; color: #fff; outline: none; width: 100%; }
        
        .status-tabs { display: flex; background: #0f1623; padding: 4px; border-radius: 8px; border: 1px solid #2a3441; }
        .status-tabs button { background: transparent; border: none; color: #64748b; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 800; cursor: pointer; transition: 0.2s; }
        .status-tabs button:hover { color: #fff; }
        .status-tabs button.active { background: #38bdf8; color: #000; }
        .status-tabs button.active:hover { color: #000; }

        .table-container { background: #1a2236; border-radius: 12px; overflow: hidden; }
        .reserva-tag { display: flex; flex-direction: column; gap: 2px; background: rgba(56,189,248,0.1); padding: 6px 10px; border-radius: 6px; border: 1px solid rgba(56,189,248,0.2); width: fit-content; }
        .reserva-date { font-size: 11px; font-weight: 800; color: #38bdf8; }
        .reserva-time { font-size: 11px; font-weight: 800; color: #fff; }
        .erp-table { width: 100%; border-collapse: collapse; text-align: left; }
        .erp-table th { background: #0f1623; padding: 15px; font-size: 12px; text-transform: uppercase; color: #888; }
        .erp-table td { padding: 15px; border-bottom: 1px solid #2a3441; font-size: 14px; vertical-align: middle; }
        
        .text-sm { font-size: 12px; }
        .text-gray { color: #888; }
        .text-blue { color: #38bdf8; }
        .font-bold { font-weight: bold; }
        .flex { display: flex; }
        .flex-col { flex-direction: column; }

        .badge { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; display: inline-flex; align-items: center; gap: 4px; }
        .bg-green { background: rgba(16,185,129,0.2); color: #10b981; }
        .bg-blue { background: rgba(56,189,248,0.2); color: #38bdf8; }
        .bg-red { background: rgba(239,68,68,0.2); color: #ef4444; }
        .bg-yellow { background: rgba(245,158,11,0.2); color: #f59e0b; }

        .actions-cell { display: flex; gap: 8px; }
        .action-btn { background: #0f1623; border: 1px solid #2a3441; cursor: pointer; padding: 6px; border-radius: 6px; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
        .action-btn.view { color: #38bdf8; }
        .action-btn.view:hover { background: #38bdf8; color: #000; border-color: #38bdf8; }
        .action-btn.check { color: #10b981; }
        .action-btn.check:hover { background: #10b981; color: #fff; border-color: #10b981; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 1000; display: flex; align-items: center; justify-content: center; }
        .modal-content { background: #1a2236; width: 90%; max-width: 600px; border-radius: 12px; padding: 30px; max-height: 90vh; overflow-y: auto; }
        
        .modal-header { border-bottom: 1px solid #2a3441; padding-bottom: 15px; margin-bottom: 15px; }
        .modal-header h2 { margin: 0; font-size: 18px; }

        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
        .info-card { background: #0f1623; padding: 15px; border-radius: 8px; border: 1px solid #2a3441; }
        .info-card h3 { margin: 0 0 10px 0; font-size: 13px; color: #888; text-transform: uppercase; }
        .info-card p { margin: 0 0 5px 0; font-size: 13px; }

        .productos-list { background: #0f1623; border: 1px solid #2a3441; border-radius: 8px; overflow: hidden; }
        .prod-item { display: flex; justify-content: space-between; padding: 12px 15px; border-bottom: 1px solid #2a3441; }
        .prod-item:last-child { border-bottom: none; }
        .prod-name { font-size: 14px; font-weight: 600; }
        .prod-price { font-size: 14px; font-weight: 800; color: #38bdf8; }

        .modal-actions { display: flex; justify-content: flex-end; margin-top: 20px; }
        .btn-close { background: #334155; color: #fff; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; }
        .btn-close:hover { background: #475569; }
      `}</style>
    </div>
  );
}
