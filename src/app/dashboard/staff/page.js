'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser, getStaff, findClientByRut, addStaffMember, removeStaffMember, registerStaffMember } from '@/lib/data';
import { BRANCHES, ROLES, ROLE_LABELS } from '@/lib/constants';
import { Search, Briefcase, Plus, Shield, UserMinus, UserPlus, FileText, MapPin, Calendar, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatRut } from '@/lib/rut-validator';

export default function StaffPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [rut, setRut] = useState('');
  const [foundClient, setFoundClient] = useState(null);
  const [searchError, setSearchError] = useState('');
  
  const [selectedRole, setSelectedRole] = useState('caja');
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [toast, setToast] = useState(null);

  // New Staff Registration State
  const [regMode, setRegMode] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '',
    rut: '',
    email: '',
    phone: '',
    birth_date: '',
    marital_status: 'soltero',
    address: '',
    service_start_date: new Date().toISOString().split('T')[0],
    role: 'caja'
  });

  useEffect(() => {
    const u = getCurrentUser();
    if (!u || u.role !== 'superadmin') {
      router.replace('/dashboard');
      return;
    }
    setUser(u);
    async function loadStaff() {
      const s = await getStaff();
      setStaffList(s);
    }
    loadStaff();
  }, [router]);

  useEffect(() => {
    if (rut.length >= 11) {
      handleSearchRUT();
    } else {
      setFoundClient(null);
      setSearchError('');
    }
  }, [rut]);

  const handleSearchRUT = async () => {
    setSearchError('');
    
    // Validar si ya es staff
    const alreadyStaff = staffList.find(s => s.rut === rut);
    if (alreadyStaff) {
      setSearchError('Esta persona ya es parte del personal.');
      setFoundClient(null);
      return;
    }

    const data = await findClientByRut(rut);
    if (data) {
      setFoundClient(data);
      setSelectedBranches([]);
      setSelectedRole('caja');
    } else if (rut.length >= 11) {
      setSearchError('Persona no encontrada en la base de clientes. Debe registrarlo primero en Clientes.');
    }
  };

  const handleToggleBranch = (branchId) => {
    setSelectedBranches(prev => 
      prev.includes(branchId) ? prev.filter(id => id !== branchId) : [...prev, branchId]
    );
  };

  const handleAddStaff = async () => {
    if (!foundClient) return;
    if (selectedRole !== 'superadmin' && selectedBranches.length === 0) {
      showToast('Seleccione al menos una sucursal para este empleado', 'error');
      return;
    }

    const branchIds = selectedRole === 'superadmin' ? [1,2,3] : selectedBranches;
    await addStaffMember(foundClient.id, selectedRole, branchIds);

    const updated = await getStaff();
    setStaffList(updated);
    
    showToast(`Personal asignado correctamente: ${foundClient.name}`, 'success');
    setRut('');
    setFoundClient(null);
  };

  const handleFullRegistration = async (e) => {
    e.preventDefault();
    if (selectedRole !== 'superadmin' && selectedBranches.length === 0) {
      showToast('Seleccione al menos una sucursal', 'error');
      return;
    }

    const result = await registerStaffMember({
      ...newStaff,
      role: selectedRole,
      branchIds: selectedRole === 'superadmin' ? [1,2,3] : selectedBranches
    });

    if (result.error) {
      showToast('Error: ' + result.error, 'error');
    } else {
      showToast('Personal registrado y contratado exitosamente', 'success');
      const updated = await getStaff();
      setStaffList(updated);
      setRegMode(false);
      setNewStaff({
        name: '', rut: '', email: '', phone: '', birth_date: '',
        marital_status: 'soltero', address: '', service_start_date: '', role: 'caja'
      });
    }
  };

  const handleRemoveStaff = async (staffId) => {
    if (!staffId) return;
    const staffMember = staffList.find(s => s.id === staffId);
    if (staffMember?.rut === user.rut) {
      showToast('No puedes auto-eliminarte del sistema', 'error');
      return;
    }
    const confirmDelete = window.confirm('¿Seguro que deseas desvincular a esta persona del personal?');
    if (!confirmDelete) return;

    await removeStaffMember(staffId);
    const updated = await getStaff();
    setStaffList(updated);
    showToast('Personal desvinculado correctamente', 'success');
  };

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  if (!user) return null;

  return (
    <div>
      <div className="pos-layout" style={{ gridTemplateColumns: '1fr 2fr' }}>
        
        {/* LEFT: Agregar Personal */}
        <div className="pos-panel industrial-card">
          <div className="pos-panel-header industrial-header">
            <UserPlus size={20} />
            <h2 className="industrial-title">Módulo de Contratación</h2>
          </div>
          
          <div className="pos-panel-body scrollable-panel">
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <button 
                className={`btn-sap-tab ${!regMode ? 'active' : ''}`}
                onClick={() => setRegMode(false)}
              >
                Asignar Existente
              </button>
              <button 
                className={`btn-sap-tab ${regMode ? 'active' : ''}`}
                onClick={() => setRegMode(true)}
              >
                Nuevo Ingreso
              </button>
            </div>

            {!regMode ? (
              <div className="fade-in">
                <label className="industrial-label">Búsqueda por RUT (Ficha Base)</label>
                <div className="rut-search-wrap industrial-search">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej: 12.345.678-5"
                    value={rut}
                    onChange={(e) => setRut(formatRut(e.target.value))}
                  />
                  <button className="rut-search-btn" onClick={handleSearchRUT}>
                    <Search size={18} />
                  </button>
                </div>

                {searchError && <div className="industrial-alert error">{searchError}</div>}

                {foundClient && (
                  <div className="found-box industrial-box">
                    <div className="sap-info-row">
                      <span className="label">NOMBRE:</span>
                      <span className="value">{foundClient.name?.toUpperCase()}</span>
                    </div>
                    <div className="sap-info-row">
                      <span className="label">ESTADO:</span>
                      <span className="value status-ok">DISPONIBLE PARA CONTRATO</span>
                    </div>
                    
                    <div style={{ marginTop: 20 }}>
                      <label className="industrial-label">ROL A DESEMPEÑAR</label>
                      <select className="form-select" value={selectedRole} onChange={e => setSelectedRole(e.target.value)}>
                        <option value="caja">Personal Base (Caja/Operativo)</option>
                        <option value="profesor">Profesor / Instructor</option>
                        <option value="asistente">Asistente Técnico</option>
                        <option value="superadmin">Administrador Global</option>
                      </select>
                    </div>

                    <BranchSelector 
                      selectedBranches={selectedBranches} 
                      onToggle={handleToggleBranch} 
                      isGlobal={selectedRole === 'superadmin'} 
                    />

                    <button className="btn-sap btn-finalize" onClick={handleAddStaff}>
                      CONFIRMAR CONTRATACIÓN
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <form className="fade-in" onSubmit={handleFullRegistration}>
                <div className="industrial-grid">
                  <div className="form-group">
                    <label className="industrial-label">Nombre Completo</label>
                    <input 
                      type="text" required className="form-input" 
                      value={newStaff.name} 
                      onChange={e => setNewStaff({...newStaff, name: e.target.value})} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="industrial-label">RUT</label>
                    <input 
                      type="text" required className="form-input" 
                      value={newStaff.rut} 
                      onChange={e => setNewStaff({...newStaff, rut: formatRut(e.target.value)})} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="industrial-label">Correo Electrónico</label>
                    <input 
                      type="email" required className="form-input" 
                      value={newStaff.email} 
                      onChange={e => setNewStaff({...newStaff, email: e.target.value})} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="industrial-label">Teléfono</label>
                    <input 
                      type="text" className="form-input" 
                      value={newStaff.phone} 
                      onChange={e => setNewStaff({...newStaff, phone: e.target.value})} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="industrial-label">Fecha de Nacimiento</label>
                    <input 
                      type="date" required className="form-input" 
                      value={newStaff.birth_date} 
                      onChange={e => setNewStaff({...newStaff, birth_date: e.target.value})} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="industrial-label">Estado Civil</label>
                    <select 
                      className="form-select"
                      value={newStaff.marital_status}
                      onChange={e => setNewStaff({...newStaff, marital_status: e.target.value})}
                    >
                      <option value="soltero">Soltero/a</option>
                      <option value="casado">Casado/a</option>
                      <option value="divorciado">Divorciado/a</option>
                      <option value="viudo">Viudo/a</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="industrial-label">Dirección Particular</label>
                    <textarea 
                      className="form-input" rows="2"
                      value={newStaff.address}
                      onChange={e => setNewStaff({...newStaff, address: e.target.value})}
                    ></textarea>
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="industrial-label">Fecha Inicio de Servicio (Ingreso)</label>
                    <input 
                      type="date" required className="form-input" 
                      value={newStaff.service_start_date} 
                      onChange={e => setNewStaff({...newStaff, service_start_date: e.target.value})} 
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="industrial-label">Tipo de Personal / Rol</label>
                    <select 
                      className="form-select" required
                      value={selectedRole}
                      onChange={e => setSelectedRole(e.target.value)}
                    >
                      <option value="caja">Base / Caja</option>
                      <option value="profesor">Profesor / Instructor</option>
                      <option value="asistente">Asistente</option>
                      <option value="superadmin">Administrador</option>
                    </select>
                  </div>
                </div>

                <BranchSelector 
                  selectedBranches={selectedBranches} 
                  onToggle={handleToggleBranch} 
                  isGlobal={selectedRole === 'superadmin'} 
                />

                <button type="submit" className="btn-sap btn-finalize" style={{ marginTop: 24 }}>
                  REGISTRAR E INGRESAR A PLANILLA
                </button>
              </form>
            )}
          </div>
        </div>

        {/* RIGHT: Lista de Personal */}
        <div className="data-section">
          <div className="data-section-header">
            <h3 className="data-section-title">🛡️ Lista de Personal Activo</h3>
          </div>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>RUT</th>
                  <th>Cargo</th>
                  <th>Sedes de Acceso</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map(staff => (
                  <tr key={staff.rut || staff.email}>
                    <td><strong>{staff.name}</strong></td>
                    <td style={{ color: 'var(--text-muted)' }}>{staff.rut || '--'}</td>
                    <td>
                      <span className="type-badge" style={{
                        background: staff.role === 'superadmin' ? 'rgba(168,85,247,0.15)' : 'rgba(14,165,233,0.15)',
                        color: staff.role === 'superadmin' ? '#c084fc' : '#38bdf8',
                        borderColor: staff.role === 'superadmin' ? 'rgba(168,85,247,0.3)' : 'rgba(14,165,233,0.3)'
                      }}>
                        {staff.role === 'superadmin' ? '👑 ' : ''}{ROLE_LABELS[staff.role] || staff.role}
                      </span>
                    </td>
                    <td>
                      {staff.allowed_branches?.length === 3 ? (
                        <span style={{ fontSize: 12, color: 'var(--color-success)' }}>🌍 Todas las Sedes</span>
                      ) : (
                        <div style={{ display: 'flex', gap: 6 }}>
                          {staff.allowed_branches?.map(bid => {
                            const b = BRANCHES.find(br => br.id === bid);
                            return b ? (
                              <span key={b.id} style={{
                                padding: '2px 6px', background: 'var(--bg-surface)', 
                                border: '1px solid var(--border-subtle)', borderRadius: 4, fontSize: 11
                              }}>
                                {b.emoji} {b.shortName}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}
                    </td>
                    <td>
                      <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => handleRemoveStaff(staff.id)}
                        style={{ color: '#fca5a5', borderColor: 'rgba(239,68,68,0.2)', padding: '4px 8px' }}
                        title="Quitar (-)"
                      >
                        <UserMinus size={14} /> Quitar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {toast && (
        <div className={`toast ${toast.type}`}>
          <span className="toast-message">{toast.msg}</span>
        </div>
      )}
    </div>
  );
}

// Subcomponente para selector de sucursales
function BranchSelector({ selectedBranches, onToggle, isGlobal }) {
  if (isGlobal) {
    return (
      <div className="industrial-alert info" style={{ marginTop: 16 }}>
        🛡️ ACCESO GLOBAL: Administradores acceden a todas las sucursales por defecto.
      </div>
    );
  }

  return (
    <div className="form-group" style={{ marginTop: 16 }}>
      <label className="industrial-label">Centros de Costo (Sedes Permitidas)</label>
      <div className="industrial-branch-grid">
        {BRANCHES.map(b => (
          <label key={b.id} className={`branch-check-chip ${selectedBranches.includes(b.id) ? 'active' : ''}`}>
            <input 
              type="checkbox" 
              checked={selectedBranches.includes(b.id)}
              onChange={() => onToggle(b.id)}
              hidden
            />
            {b.emoji} {b.shortName}
          </label>
        ))}
      </div>
    </div>
  );
}
