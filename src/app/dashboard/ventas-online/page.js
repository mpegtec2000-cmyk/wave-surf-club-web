'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Globe, Search, Eye, CheckCircle, XCircle, Clock,
  TrendingUp, ShoppingBag, CalendarDays, RefreshCw
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n) => '$ ' + (n || 0).toLocaleString('es-CL');

export default function VentasOnline() {
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
      case 'pagado': return <span className="badge-status bg-green"><CheckCircle size={11}/> Pagado</span>;
      case 'revisado': return <span className="badge-status bg-blue"><CheckCircle size={11}/> Revisado</span>;
      case 'fallido': return <span className="badge-status bg-red"><XCircle size={11}/> Fallido</span>;
      default: return <span className="badge-status bg-yellow"><Clock size={11}/> Pendiente</span>;
    }
  };

  const filteredOrdenes = ordenes.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (o.nombre_cliente && o.nombre_cliente.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'todos' || o.estado === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalRecaudado = filteredOrdenes
    .filter(o => o.estado === 'pagado' || o.estado === 'revisado')
    .reduce((sum, o) => sum + o.total, 0);

  const totalPendiente = filteredOrdenes
    .filter(o => o.estado === 'pendiente')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="ventas-online-container">
      {/* ── Header ── */}
      <header className="page-header">
        <div className="header-title">
          <div className="title-icon">
            <Globe size={20} color="#fff" />
          </div>
          <div>
            <h1>Órdenes de Tienda Online</h1>
            <p className="subtitle">Gestión integral de ventas realizadas vía portal web</p>
          </div>
        </div>
        <div className="header-actions">
          <button onClick={fetchOrdenes} className="refresh-btn">
            <RefreshCw size={14} /> Actualizar
          </button>
        </div>
      </header>

      {/* ── KPIs ── */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-info">
            <span className="kpi-label">TOTAL COBRADO</span>
            <span className="kpi-value">{fmt(totalRecaudado)}</span>
          </div>
          <div className="kpi-icon blue"><TrendingUp size={24} /></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-info">
            <span className="kpi-label">PENDIENTE DE REVISIÓN</span>
            <span className="kpi-value">{filteredOrdenes.filter(o => o.estado !== 'revisado' && o.estado !== 'fallido').length}</span>
          </div>
          <div className="kpi-icon yellow"><Clock size={24} /></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-info">
            <span className="kpi-label">ÓRDENES TOTALES</span>
            <span className="kpi-value">{filteredOrdenes.length}</span>
          </div>
          <div className="kpi-icon purple"><ShoppingBag size={24} /></div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="toolbar">
        <div className="search-wrap">
          <Search size={16} className="search-icon" />
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

      {/* ── Table ── */}
      <div className="table-wrapper">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <span>Procesando datos de ventas...</span>
          </div>
        ) : filteredOrdenes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🌐</div>
            <h3>No se encontraron órdenes</h3>
            <p>No hay registros que coincidan con los filtros seleccionados.</p>
          </div>
        ) : (
          <table className="sap-table">
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
                const firstReserva = o.productos?.find(p => p.reserva)?.reserva;
                return (
                  <tr key={o.id}>
                    <td><span className="order-id">#{o.id.split('-')[0].toUpperCase()}</span></td>
                    <td>
                      <div className="date-cell">
                        <CalendarDays size={12} />
                        {new Date(o.created_at).toLocaleString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td>
                      {firstReserva ? (
                        <div className="reserva-tag">
                          <span className="reserva-date">📅 {firstReserva.fecha.split('-').reverse().join('-')}</span>
                          <span className="reserva-time">⏰ {firstReserva.hora_inicio}</span>
                        </div>
                      ) : (
                        <span className="no-data">—</span>
                      )}
                    </td>
                    <td>
                      <div className="client-info">
                        <span className="client-name">{o.nombre_cliente}</span>
                        <span className="client-email">{o.email_cliente}</span>
                      </div>
                    </td>
                    <td><span className="total-amount">${o.total.toLocaleString('es-CL')}</span></td>
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

      {/* ── Modal ── */}
      {viewingOrden && (
        <div className="modal-overlay" onClick={() => setViewingOrden(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalles de la Orden {viewingOrden.id.split('-')[0].toUpperCase()}</h2>
              <button className="modal-close-btn" onClick={() => setViewingOrden(null)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="info-grid">
                <div className="info-section">
                  <div className="section-title">Información del Cliente</div>
                  <div className="section-content">
                    <p><strong>Nombre:</strong> {viewingOrden.nombre_cliente}</p>
                    <p><strong>RUT:</strong> {viewingOrden.rut_cliente}</p>
                    <p><strong>Email:</strong> {viewingOrden.email_cliente}</p>
                    <p><strong>Teléfono:</strong> {viewingOrden.telefono_cliente}</p>
                  </div>
                </div>
                <div className="info-section">
                  <div className="section-title">Detalles Financieros</div>
                  <div className="section-content">
                    <p><strong>Estado:</strong> {getStatusBadge(viewingOrden.estado)}</p>
                    <p><strong>Subtotal:</strong> ${viewingOrden.subtotal?.toLocaleString('es-CL')}</p>
                    <p><strong>Comisión Flow:</strong> ${viewingOrden.comision_flow?.toLocaleString('es-CL')}</p>
                    <p className="highlight"><strong>Total Pagado:</strong> ${viewingOrden.total?.toLocaleString('es-CL')}</p>
                    <p className="text-muted">ID Transacción: {viewingOrden.flow_order_id || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="items-section">
                <div className="section-title">Productos Adquiridos</div>
                <div className="items-list">
                  {viewingOrden.productos?.map((p, i) => (
                    <div key={i} className="item-row">
                      <div className="item-main">
                        <span className="item-name">{p.nombre}</span>
                        {p.reserva && <span className="item-extra">🗓️ {p.reserva.fecha} @ {p.reserva.hora_inicio}</span>}
                      </div>
                      <span className="item-price">${p.precio_final?.toLocaleString('es-CL')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .ventas-online-container { max-width: 1400px; margin: 0 auto; padding: 20px; }
        
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .header-title { display: flex; align-items: center; gap: 15px; }
        .title-icon { width: 42px; height: 42px; background: linear-gradient(135deg, #0ea5e9, #3b82f6); border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(14,165,233,0.3); }
        .header-title h1 { font-size: 24px; font-weight: 900; margin: 0; color: #fff; }
        .subtitle { font-size: 13px; color: #64748b; margin: 4px 0 0; }
        .refresh-btn { background: #1a2236; border: 1px solid #2a3441; color: #94a3b8; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
        .refresh-btn:hover { background: #2a3441; color: #fff; }

        .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
        .kpi-card { background: #0f1623; border: 1px solid #1e2a3a; padding: 20px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; transition: 0.3s; }
        .kpi-card:hover { border-color: #3b82f6; transform: translateY(-2px); }
        .kpi-info { display: flex; flex-direction: column; gap: 4px; }
        .kpi-label { font-size: 11px; font-weight: 800; color: #475569; letter-spacing: 0.5px; }
        .kpi-value { font-size: 24px; font-weight: 950; color: #fff; }
        .kpi-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .kpi-icon.blue { background: rgba(14,165,233,0.1); color: #0ea5e9; }
        .kpi-icon.yellow { background: rgba(245,158,11,0.1); color: #f59e0b; }
        .kpi-icon.purple { background: rgba(139,92,246,0.1); color: #8b5cf6; }

        .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 20px; }
        .search-wrap { position: relative; flex: 1; max-width: 350px; }
        .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #475569; }
        .search-wrap input { width: 100%; background: #0f1623; border: 1px solid #1e2a3a; padding: 12px 16px 12px 42px; border-radius: 10px; color: #fff; font-size: 14px; outline: none; transition: 0.2s; }
        .search-wrap input:focus { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.1); }

        .status-tabs { display: flex; background: #0f1623; padding: 4px; border-radius: 10px; border: 1px solid #1e2a3a; }
        .status-tabs button { background: transparent; border: none; color: #64748b; padding: 8px 16px; border-radius: 8px; font-size: 11px; font-weight: 800; cursor: pointer; transition: 0.2s; }
        .status-tabs button:hover { color: #fff; }
        .status-tabs button.active { background: #3b82f6; color: #fff; box-shadow: 0 4px 12px rgba(59,130,246,0.2); }

        .table-wrapper { background: #0f1623; border: 1px solid #1e2a3a; border-radius: 16px; overflow: hidden; }
        .sap-table { width: 100%; border-collapse: collapse; text-align: left; }
        .sap-table th { background: rgba(255,255,255,0.02); padding: 16px 20px; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #1e2a3a; }
        .sap-table td { padding: 16px 20px; border-bottom: 1px solid #1e2a3a; font-size: 14px; vertical-align: middle; color: #cbd5e1; }
        .sap-table tr:last-child td { border-bottom: none; }
        .sap-table tr:hover td { background: rgba(255,255,255,0.01); }

        .order-id { font-family: var(--font-mono); font-weight: 800; color: #3b82f6; background: rgba(59,130,246,0.1); padding: 4px 8px; border-radius: 6px; }
        .date-cell { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #94a3b8; }
        .reserva-tag { display: flex; flex-direction: column; gap: 2px; background: rgba(56,189,248,0.08); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(56,189,248,0.1); }
        .reserva-date { font-size: 11px; font-weight: 900; color: #0ea5e9; }
        .reserva-time { font-size: 11px; font-weight: 700; color: #fff; }
        .no-data { color: #334155; font-weight: 900; }
        
        .client-info { display: flex; flex-direction: column; }
        .client-name { font-weight: 700; color: #fff; }
        .client-email { font-size: 12px; color: #475569; }
        .total-amount { font-weight: 900; color: #fff; font-size: 15px; }

        .badge-status { padding: 6px 12px; border-radius: 8px; font-size: 10px; font-weight: 900; text-transform: uppercase; display: inline-flex; align-items: center; gap: 6px; letter-spacing: 0.5px; }
        .bg-green { background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2); }
        .bg-blue { background: rgba(14,165,233,0.1); color: #0ea5e9; border: 1px solid rgba(14,165,233,0.2); }
        .bg-red { background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.2); }
        .bg-yellow { background: rgba(245,158,11,0.1); color: #f59e0b; border: 1px solid rgba(245,158,11,0.2); }

        .actions-cell { display: flex; gap: 10px; }
        .action-btn { background: #1a2236; border: 1px solid #2a3441; color: #64748b; padding: 8px; border-radius: 10px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
        .action-btn.view:hover { background: #3b82f6; color: #fff; border-color: #3b82f6; box-shadow: 0 4px 12px rgba(59,130,246,0.3); }
        .action-btn.check:hover { background: #10b981; color: #fff; border-color: #10b981; box-shadow: 0 4px 12px rgba(16,185,129,0.3); }

        .loading-state { padding: 100px; display: flex; flex-direction: column; align-items: center; gap: 16px; color: #475569; }
        .spinner { width: 32px; height: 32px; border: 3px solid rgba(255,255,255,0.05); border-top-color: #3b82f6; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .empty-state { padding: 100px; text-align: center; }
        .empty-icon { font-size: 48px; margin-bottom: 20px; opacity: 0.5; }
        .empty-state h3 { margin: 0; color: #fff; font-size: 18px; }
        .empty-state p { color: #475569; font-size: 14px; margin-top: 8px; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .modal-content { background: #0f1623; width: 100%; max-width: 800px; border-radius: 24px; border: 1px solid #1e2a3a; box-shadow: 0 30px 60px rgba(0,0,0,0.5); overflow: hidden; animation: modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        @keyframes modalIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        
        .modal-header { padding: 24px 30px; border-bottom: 1px solid #1e2a3a; display: flex; justify-content: space-between; align-items: center; }
        .modal-header h2 { margin: 0; font-size: 20px; font-weight: 900; color: #fff; }
        .modal-close-btn { background: #1a2236; border: none; color: #64748b; font-size: 24px; width: 36px; height: 36px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .modal-close-btn:hover { color: #fff; background: #ef4444; }

        .modal-body { padding: 30px; max-height: 70vh; overflow-y: auto; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 30px; }
        .section-title { font-size: 11px; font-weight: 900; color: #3b82f6; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; }
        .section-content { background: #1a2236; padding: 20px; border-radius: 16px; border: 1px solid #2a3441; }
        .section-content p { margin: 0 0 10px 0; font-size: 14px; color: #94a3b8; }
        .section-content p:last-child { margin-bottom: 0; }
        .section-content strong { color: #fff; font-weight: 700; margin-right: 8px; }
        .highlight { font-size: 18px !important; color: #3b82f6 !important; margin-top: 15px !important; padding-top: 15px !important; border-top: 1px solid #2a3441; }
        
        .items-list { background: #1a2236; border: 1px solid #2a3441; border-radius: 16px; overflow: hidden; }
        .item-row { display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; border-bottom: 1px solid #2a3441; }
        .item-row:last-child { border-bottom: none; }
        .item-main { display: flex; flex-direction: column; gap: 4px; }
        .item-name { font-weight: 700; color: #fff; font-size: 14px; }
        .item-extra { font-size: 11px; color: #3b82f6; font-weight: 800; }
        .item-price { font-weight: 900; color: #fff; font-size: 15px; }
      `}</style>
    </div>
  );
}
