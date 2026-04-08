'use client';

import { useState, useEffect, useMemo } from 'react';
import { getCurrentUser, getClients, addClient, getTransactions } from '@/lib/data';
import { Search, UserPlus, X, Save, User } from 'lucide-react';
import { formatRut } from '@/lib/rut-validator';

export default function ClientsPage() {
  const [user, setUser] = useState(null);
  
  // Lista global de clientes (usará LocalStorage)
  const [clientsData, setClientsData] = useState([]);
  
  // Vistas
  const [view, setView] = useState('list'); // 'list', 'add', 'profile'
  
  // Búsqueda
  const [searchRut, setSearchRut] = useState('');
  
  // Perfil seleccionado
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientHistory, setClientHistory] = useState([]);
  
  // Formulario nuevo cliente
  const [formData, setFormData] = useState({
    rut: '',
    nombre: '',
    apellidos: '',
    telefono: '',
    correo: ''
  });
  
  // Filtro de deudas
  const [debtFilter, setDebtFilter] = useState('ALL'); // 'ALL', 'DEBT', 'CLEAR'
  
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setUser(getCurrentUser());
    async function load() {
      const c = await getClients();
      setClientsData(c);
    }
    load();
  }, []);

  // Ordenar A-Z por defecto
  const sortedClients = useMemo(() => {
    return [...clientsData].sort((a, b) => a.name.localeCompare(b.name));
  }, [clientsData]);

  // Filtrado por buscador y estado de deuda
  const filteredClients = useMemo(() => {
    let result = sortedClients;

    // 1. Filtro de deuda
    if (debtFilter === 'DEBT') {
      result = result.filter(c => c.debt_balance > 0);
    } else if (debtFilter === 'CLEAR') {
      result = result.filter(c => c.debt_balance === 0);
    }

    // 2. Filtro de texto
    const q = searchRut.toLowerCase().trim();
    if (q) {
      result = result.filter(c => 
        c.rut.toLowerCase().includes(q) || 
        c.name.toLowerCase().includes(q)
      );
    }

    return result;
  }, [sortedClients, searchRut, debtFilter]);

  const handleSearchClick = () => {
    const clean = searchRut.trim();
    if (!clean) return;
    const client = clientsData.find(c => c.rut === clean || c.rut.replace(/[.-]/g, '') === clean.replace(/[.-]/g, ''));
    if (client) {
      handleViewProfile(client);
    } else {
      showToast('Cliente no encontrado. Puedes registrarlo ahora.', 'error');
      setView('add');
      setFormData(prev => ({ ...prev, rut: clean }));
    }
  };

  const handleViewProfile = async (client) => {
    setSelectedClient(client);
    const txs = await getTransactions();
    const history = txs.filter(t => t.client_rut === client.rut);
    setClientHistory(history);
    setView('profile');
  };

  const handleSaveClient = async (e) => {
    e.preventDefault();
    if (!formData.rut || !formData.nombre || !formData.apellidos) {
      showToast('Por favor completa RUT, Nombre y Apellidos', 'error');
      return;
    }
    
    // Verificar si ya existe
    const exists = clientsData.find(c => c.rut === formData.rut);
    if (exists) {
      showToast('Este RUT ya se encuentra registrado', 'error');
      return;
    }

    const newClient = {
      rut: formData.rut,
      name: `${formData.nombre} ${formData.apellidos}`.trim(),
      email: formData.correo,
      phone: formData.telefono,
      role: formData.role || 'cliente',
      is_staff: formData.role !== 'cliente',
      branch_id: null,
      debt_balance: 0
    };

    const result = await addClient(newClient);
    if (result.error) {
      showToast('Error al guardar: ' + result.error.message, 'error');
      return;
    }
    const updatedClients = await getClients();
    setClientsData(updatedClients);
    
    showToast(`Cliente ${newClient.name} agregado con éxito`, 'success');
    
    // Reset y volver a la vista
    setFormData({ rut: '', nombre: '', apellidos: '', telefono: '', correo: '', role: 'cliente' });
    setView('list');
    setSearchRut('');
  };

  const formatMoney = (n) => '$' + n.toLocaleString('es-CL');

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  if (!user) return null;

  return (
    <div>
      {/* HEADER CONTROLS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div className="rut-search-wrap" style={{ width: 400, margin: 0 }}>
          <input
            type="text"
            className="form-input"
            placeholder="Buscar por RUT o Nombre..."
            value={searchRut}
            onChange={(e) => {
              setSearchRut(e.target.value);
              if (view !== 'list') setView('list');
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
          />
          <button className="rut-search-btn" onClick={handleSearchClick}>
            <Search size={18} />
          </button>
        </div>

        {view === 'list' && (
          <button className="btn btn-primary" onClick={() => setView('add')}>
            <UserPlus size={18} /> Nuevo Cliente
          </button>
        )}
        {view !== 'list' && (
          <button className="btn btn-secondary" onClick={() => { setView('list'); setSearchRut(''); }}>
            Volver a la Lista
          </button>
        )}
      </div>

      {/* VIEW: ADD CLIENT */}
      {view === 'add' && (
        <div className="pos-panel fade-in" style={{ maxWidth: 800, margin: '0 auto' }}>
          <div className="pos-panel-header">
            <span style={{ fontSize: 20 }}>📝</span>
            <h2>Agregar Nuevo Cliente</h2>
          </div>
          <div className="pos-panel-body">
            <form onSubmit={handleSaveClient} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>RUT</label>
                <input 
                  type="text" className="form-input" placeholder="Ej: 12.345.678-5"
                  value={formData.rut}
                  onChange={(e) => setFormData({...formData, rut: formatRut(e.target.value)})}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Nombre (1 Nombre)</label>
                <input 
                  type="text" className="form-input" placeholder="Ej: Pedro"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Apellidos (2 Apellidos)</label>
                <input 
                  type="text" className="form-input" placeholder="Ej: Vargas Silva"
                  value={formData.apellidos}
                  onChange={(e) => setFormData({...formData, apellidos: e.target.value})}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Teléfono</label>
                <input 
                  type="text" className="form-input" placeholder="Ej: +56 9 1111 2222"
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Correo Electrónico</label>
                <input 
                  type="email" className="form-input" placeholder="Ej: pedro@correo.com"
                  value={formData.correo}
                  onChange={(e) => setFormData({...formData, correo: e.target.value})}
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Asignar Rol (Permisos del Sistema)</label>
                <select 
                  className="form-input"
                  value={formData.role || 'cliente'}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="cliente">Cliente (Sin Acceso al Panel ERP)</option>
                  <option value="asistente">Asistente de Sucursal</option>
                  <option value="caja">Cajero / Vendedor</option>
                  <option value="profesor">Profesor (Instructor)</option>
                  <option value="superadmin">Super Administrador (Acceso Total)</option>
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1', marginTop: 12 }}>
                <button type="submit" className="btn btn-primary btn-full btn-lg">
                  <Save size={18} /> Guardar Cliente
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* VIEW: CLIENT PROFILE */}
      {view === 'profile' && selectedClient && (
        <div className="fade-in">
          {selectedClient.debt_balance > 0 && (
            <div className="debt-alert">
              <div className="debt-alert-icon">⚠️</div>
              <div className="debt-alert-content">
                <h3>CLIENTE CON DEUDA ACTIVA</h3>
                <p>{selectedClient.name} — {selectedClient.rut}</p>
              </div>
              <div className="debt-alert-amount">{formatMoney(selectedClient.debt_balance)}</div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
            <div className="data-section">
              <div style={{ padding: 24, textAlign: 'center' }}>
                <div className="client-avatar" style={{ width: 72, height: 72, fontSize: 28, margin: '0 auto 16px' }}>
                  {selectedClient.name?.charAt(0)?.toUpperCase()}
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 4 }}>
                  {selectedClient.name}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
                  {selectedClient.rut}
                </p>

                <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Email</span>
                    <span>{selectedClient.email || '--'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Teléfono</span>
                    <span>{selectedClient.phone || '--'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '12px 0', borderTop: '1px solid var(--border-subtle)', marginTop: 4 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Saldo Deuda</span>
                    <span style={{ fontWeight: 700, fontSize: 16, color: selectedClient.debt_balance > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                      {formatMoney(selectedClient.debt_balance)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="data-section">
              <div className="data-section-header">
                <h3 className="data-section-title">📝 Historial de Transacciones</h3>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{clientHistory.length} registros</span>
              </div>
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th>Categoría</th>
                      <th>Método</th>
                      <th>Total</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientHistory.length === 0 ? (
                      <tr><td colSpan={5}><div className="empty-state"><h3>Sin historial</h3></div></td></tr>
                    ) : (
                      clientHistory.map(tx => (
                        <tr key={tx.id}>
                          <td><span className={`type-badge ${tx.type}`}>{tx.type === 'ingreso' ? '↗' : '↘'} {tx.type}</span></td>
                          <td style={{ textTransform: 'capitalize' }}>{tx.category.replace('_', ' ')}</td>
                          <td style={{ textTransform: 'capitalize' }}>{tx.method.replace('_', ' ')}</td>
                          <td><span className={`transaction-amount ${tx.type === 'ingreso' ? 'positive' : 'negative'}`}>{formatMoney(tx.total)}</span></td>
                          <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(tx.created_at).toLocaleString('es-CL', { hour: '2-digit', minute: '2-digit' })}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: ALPHABETICAL LIST */}
      {view === 'list' && (
        <div className="data-section fade-in">
          <div className="data-section-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
            <div>
              <h3 className="data-section-title">👥 Directorio de Clientes (A-Z)</h3>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{filteredClients.length} registrados</span>
            </div>
          </div>
          
          {/* Debt Filters */}
          <div className="data-filters" style={{ padding: '0 24px 16px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', marginRight: 8 }}>Filtrar por:</span>
            <button className={`filter-chip ${debtFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setDebtFilter('ALL')}>Todos</button>
            <button className={`filter-chip ${debtFilter === 'DEBT' ? 'active' : ''}`}
              onClick={() => setDebtFilter('DEBT')}>⚠️ Con Deuda</button>
            <button className={`filter-chip ${debtFilter === 'CLEAR' ? 'active' : ''}`}
              onClick={() => setDebtFilter('CLEAR')}>✓ Al Día</button>
          </div>
          
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre Completo</th>
                  <th>RUT</th>
                  <th>Teléfono</th>
                  <th>Email</th>
                  <th>Estado Deuda</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="empty-state">
                        <div className="empty-state-icon">📭</div>
                        <h3>No se encontraron clientes</h3>
                        <p>Asegúrate de haber ingresado bien el nombre o RUT.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredClients.map(c => (
                    <tr key={c.rut}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div className="client-avatar" style={{ width: 32, height: 32, fontSize: 14 }}>
                            {c.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <strong style={{ color: 'var(--text-primary)' }}>{c.name}</strong>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-sans)', fontSize: 13 }}>{c.rut}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{c.phone || '--'}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{c.email || '--'}</td>
                      <td>
                        {c.debt_balance > 0 ? (
                          <span style={{ 
                            background: 'rgba(239,68,68,0.1)', color: '#fca5a5', 
                            border: '1px solid rgba(239,68,68,0.3)', padding: '2px 6px', 
                            borderRadius: 4, fontSize: 11, fontWeight: 600 
                          }}>
                            ⚠️ Debe {formatMoney(c.debt_balance)}
                          </span>
                        ) : (
                          <span style={{ 
                            background: 'rgba(34,197,94,0.1)', color: '#86efac', 
                            border: '1px solid rgba(34,197,94,0.3)', padding: '2px 6px', 
                            borderRadius: 4, fontSize: 11, fontWeight: 600 
                          }}>
                            ✓ Al Día
                          </span>
                        )}
                      </td>
                      <td>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleViewProfile(c)}>
                          <User size={14} /> Ver Perfil
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast ${toast.type}`}>
          <span className="toast-message">{toast.msg}</span>
        </div>
      )}
    </div>
  );
}

