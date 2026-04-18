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
      .channel('pedidos-logs-root')
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
    
    if (filter === 'PENDIENTES') return matchesSearch && p.estado_entrega === 'pendiente';
    if (filter === 'ENTREGADOS') return matchesSearch && p.estado_entrega === 'entregado';
    return matchesSearch;
  });

  const kpis = {
    pendientes: pedidos.filter(p => p.estado_entrega === 'pendiente').length,
    entregados: pedidos.filter(p => p.estado_entrega === 'entregado').length,
    total: pedidos.length
  };

  return (
    <div className="pedidos-container">
      <div className="page-header">
        <div className="header-title">
          <Truck className="title-icon" />
          <div>
            <h1>Despacho y Retiro de Pedidos</h1>
            <p>Gestión de entrega de equipos y ropa (Venta Online)</p>
          </div>
        </div>
        
        <div className="kpi-grid">
          <div className="kpi-card pending">
            <Clock size={16} />
            <div className="kpi-info">
              <span>Pendientes de Retiro</span>
              <strong>{kpis.pendientes}</strong>
            </div>
          </div>
          <div className="kpi-card success">
            <CheckCircle size={16} />
            <div className="kpi-info">
              <span>Entregas Completadas</span>
              <strong>{kpis.entregados}</strong>
            </div>
          </div>
          <div className="kpi-card total">
            <ShoppingBag size={16} />
            <div className="kpi-info">
              <span>Total Pedidos</span>
              <strong>{kpis.total}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Buscar por ID o Cliente..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-tabs">
          <button className={filter === 'TODOS' ? 'active' : ''} onClick={() => setFilter('TODOS')}>TODOS</button>
          <button className={filter === 'PENDIENTES' ? 'active' : ''} onClick={() => setFilter('PENDIENTES')}>PENDIENTES</button>
          <button className={filter === 'ENTREGADOS' ? 'active' : ''} onClick={() => setFilter('ENTREGADOS')}>ENTREGADOS</button>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-state">Cargando pedidos...</div>
        ) : filteredData.length === 0 ? (
          <div className="empty-state">
            <Package size={48} />
            <p>No se encontraron pedidos de equipo o ropa.</p>
          </div>
        ) : (
          <table className="sap-table">
            <thead>
              <tr>
                <th>ID PEDIDO</th>
                <th>FECHA</th>
                <th>CLIENTE</th>
                <th>ARTÍCULOS</th>
                <th>RETIRO EN</th>
                <th>ESTADO</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(order => (
                <tr key={order.id} className={order.estado_entrega}>
                  <td className="id-cell">#{order.id.substring(0, 8).toUpperCase()}</td>
                  <td>{new Date(order.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                  <td>
                    <div className="client-cell">
                      <strong>{order.nombre_cliente}</strong>
                      <span>{order.email_cliente}</span>
                    </div>
                  </td>
                  <td>
                    <div className="items-preview">
                      {(order.productos || []).filter(p => {
                        const n = p.nombre?.toLowerCase() || '';
                        return !n.includes('clase') && !n.includes('arriendo') && !n.includes('curso') && !n.includes('rent');
                      }).map((p, i) => (
                        <span key={i} className="item-tag">{p.cantidad}x {p.nombre}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="branch-tag">
                      <MapPin size={10} /> {order.sucursal_retiro || 'Concón'}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${order.estado_entrega}`}>
                      {order.estado_entrega === 'entregado' ? 'ENTREGADO' : 'PENDIENTE'}
                    </span>
                  </td>
                  <td>
                    <button className="btn-detail" onClick={() => setSelectedOrder(order)}>
                      GESTIONAR <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="mh-title">
                <Package className="modal-icon" />
                <div>
                  <h2>Detalle del Pedido #{selectedOrder.id.substring(0, 8).toUpperCase()}</h2>
                  <span className={`status-badge ${selectedOrder.estado_entrega}`}>
                    {selectedOrder.estado_entrega === 'entregado' ? 'Entregado' : 'Esperando Retiro'}
                  </span>
                </div>
              </div>
              <button className="close-btn" onClick={() => setSelectedOrder(null)}><X size={20} /></button>
            </div>

            <div className="modal-body">
              <div className="detail-grid">
                <section>
                  <h3><User size={16} /> Datos del Cliente</h3>
                  <div className="info-card">
                    <p><strong>Nombre:</strong> {selectedOrder.nombre_cliente}</p>
                    <p><strong>RUT:</strong> {selectedOrder.rut_cliente}</p>
                    <p><strong>Email:</strong> {selectedOrder.email_cliente}</p>
                    <p><strong>Teléfono:</strong> {selectedOrder.telefono_cliente}</p>
                  </div>
                </section>

                <section>
                  <h3><ShoppingBag size={16} /> Artículos a Entregar</h3>
                  <div className="items-list">
                    {(selectedOrder.productos || []).filter(p => {
                      const n = p.nombre?.toLowerCase() || '';
                      return !n.includes('clase') && !n.includes('arriendo') && !n.includes('curso') && !n.includes('rent');
                    }).map((p, i) => (
                      <div key={i} className="item-row">
                        <div className="item-qty">{p.cantidad}</div>
                        <div className="item-name">{p.nombre}</div>
                        <div className="item-price">${p.precio?.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="pickup-notice">
                <MapPin size={16} />
                <p>Retiro programado en Sucursal: <strong>{selectedOrder.sucursal_retiro || 'Concón'}</strong></p>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedOrder(null)}>Cerrar</button>
              {selectedOrder.estado_entrega === 'pendiente' && (
                <button 
                  className="btn-success" 
                  onClick={() => markAsDelivered(selectedOrder.id)}
                  disabled={isUpdating}
                >
                  <CheckCircle size={16} /> {isUpdating ? 'Actualizando...' : 'Confirmar Entrega'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .pedidos-container { padding: 25px; display: flex; flex-direction: column; gap: 25px; color: #fff; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .header-title { display: flex; gap: 15px; align-items: center; }
        .title-icon { width: 40px; height: 40px; color: #0ea5e9; background: rgba(14,165,233,0.1); padding: 8px; border-radius: 12px; }
        .header-title h1 { font-size: 22px; font-weight: 900; margin: 0; }
        .header-title p { color: #64748b; margin: 4px 0 0; font-size: 14px; }
        .kpi-grid { display: flex; gap: 15px; }
        .kpi-card { background: #1a2236; border: 1px solid #2a3441; padding: 12px 20px; border-radius: 12px; display: flex; align-items: center; gap: 15px; min-width: 180px; }
        .kpi-info { display: flex; flex-direction: column; }
        .kpi-info span { font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; }
        .kpi-info strong { font-size: 20px; font-weight: 900; color: #fff; }
        .kpi-card.pending { border-left: 4px solid #f59e0b; }
        .kpi-card.pending svg { color: #f59e0b; }
        .kpi-card.success { border-left: 4px solid #10b981; }
        .kpi-card.success svg { color: #10b981; }
        .toolbar { display: flex; justify-content: space-between; align-items: center; background: #1a2236; padding: 12px 20px; border-radius: 12px; border: 1px solid #2a3441; }
        .search-box { display: flex; align-items: center; gap: 12px; background: #0f172a; border: 1px solid #334155; padding: 8px 15px; border-radius: 8px; width: 400px; }
        .search-box input { background: transparent; border: none; color: #fff; width: 100%; outline: none; font-size: 14px; }
        .filter-tabs { display: flex; background: #0f172a; padding: 4px; border-radius: 8px; border: 1px solid #334155; }
        .filter-tabs button { background: transparent; border: none; color: #64748b; padding: 6px 15px; border-radius: 6px; font-size: 11px; font-weight: 800; cursor: pointer; transition: 0.2s; }
        .filter-tabs button.active { background: #0ea5e9; color: #000; }
        .table-container { background: #1a2236; border-radius: 12px; border: 1px solid #2a3441; overflow: hidden; }
        .sap-table { width: 100%; border-collapse: collapse; text-align: left; }
        .sap-table th { background: #0f172a; padding: 15px 20px; font-size: 11px; font-weight: 800; color: #64748b; border-bottom: 1px solid #2a3441; text-transform: uppercase; letter-spacing: 0.5px; }
        .sap-table td { padding: 15px 20px; border-bottom: 1px solid #2a3441; font-size: 13px; }
        .id-cell { font-family: 'Courier New', monospace; font-weight: 800; color: #0ea5e9; }
        .client-cell { display: flex; flex-direction: column; }
        .client-cell span { font-size: 11px; color: #64748b; }
        .items-preview { display: flex; flex-wrap: wrap; gap: 5px; }
        .item-tag { background: rgba(14,165,233,0.1); color: #0ea5e9; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(14,165,233,0.2); }
        .branch-tag { display: flex; align-items: center; gap: 4px; font-size: 11px; color: #94a3b8; font-weight: 700; }
        .status-badge { font-size: 9px; font-weight: 900; padding: 4px 10px; border-radius: 20px; letter-spacing: 0.5px; }
        .status-badge.pendiente { background: rgba(245,158,11,0.15); color: #f59e0b; border: 1px solid rgba(245,158,11,0.3); }
        .status-badge.entregado { background: rgba(16,185,129,0.15); color: #10b981; border: 1px solid rgba(16,185,129,0.3); }
        .btn-detail { background: #0f172a; border: 1px solid #334155; color: #94a3b8; font-size: 10px; font-weight: 800; padding: 6px 12px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: 0.2s; }
        .btn-detail:hover { border-color: #0ea5e9; color: #0ea5e9; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
        .modal-content { background: #0f172a; width: 90%; max-width: 700px; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden; }
        .modal-header { padding: 20px 25px; border-bottom: 1px solid #1e293b; display: flex; justify-content: space-between; align-items: center; background: #1a2236; }
        .mh-title { display: flex; gap: 15px; align-items: center; }
        .modal-icon { color: #0ea5e9; }
        .modal-header h2 { font-size: 18px; margin: 0; font-weight: 900; }
        .close-btn { background: none; border: none; color: #64748b; cursor: pointer; }
        .modal-body { padding: 25px; display: flex; flex-direction: column; gap: 20px; }
        .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .detail-grid h3 { font-size: 13px; font-weight: 800; color: #64748b; display: flex; align-items: center; gap: 8px; margin-bottom: 12px; text-transform: uppercase; }
        .info-card { background: #1a2236; padding: 15px; border-radius: 12px; border: 1px solid #2a3441; font-size: 13px; }
        .info-card p { margin: 8px 0; display: flex; justify-content: space-between; }
        .info-card strong { color: #94a3b8; font-weight: 600; }
        .items-list { background: #1a2236; border-radius: 12px; border: 1px solid #2a3441; overflow: hidden; }
        .item-row { display: flex; align-items: center; padding: 10px 15px; border-bottom: 1px solid #2a3441; gap: 12px; font-size: 13px; }
        .item-qty { background: #0ea5e9; color: #000; font-weight: 900; width: 22px; height: 22px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 11px; }
        .item-name { flex: 1; font-weight: 600; }
        .item-price { color: #64748b; font-family: monospace; }
        .pickup-notice { background: rgba(245,158,11,0.05); border: 1px solid rgba(245,158,11,0.2); padding: 12px 20px; border-radius: 10px; display: flex; align-items: center; gap: 12px; font-size: 13px; color: #f59e0b; }
        .modal-footer { padding: 20px 25px; background: #1a2236; border-top: 1px solid #1e293b; display: flex; justify-content: flex-end; gap: 12px; }
        .btn-secondary { background: transparent; border: 1px solid #334155; color: #64748b; padding: 10px 20px; border-radius: 8px; font-weight: 800; cursor: pointer; font-size: 13px; }
        .btn-success { background: #10b981; color: #fff; border: none; padding: 10px 25px; border-radius: 8px; font-weight: 800; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 8px; }
        .loading-state, .empty-state { text-align: center; padding: 100px; color: #475569; }
      `}</style>
    </div>
  );
}
