'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser, getStaff, findClientByRut, addStaffMember, removeStaffMember } from '@/lib/data';
import { BRANCHES, ROLES, ROLE_LABELS } from '@/lib/constants';
import { Search, Briefcase, Plus, Shield, UserMinus } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
    
    showToast(`Personal asignado correctamente: ${foundClient.name} (${ROLE_LABELS[selectedRole]})`, 'success');
    
    setRut('');
    setFoundClient(null);
    setSelectedRole('caja');
    setSelectedBranches([]);
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
        <div className="pos-panel">
          <div className="pos-panel-header">
            <span style={{ fontSize: 20 }}>➕</span>
            <h2>Agregar Personal</h2>
          </div>
          <div className="pos-panel-body">
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              Para asignar permisos, la persona debe existir primero como Cliente.
            </p>
            
            <div className="rut-search-wrap">
              <input
                type="text"
                className="form-input"
                placeholder="RUT (Ej: 12.345.678-5)"
                value={rut}
                onChange={(e) => setRut(formatRut(e.target.value))}
              />
              <button className="rut-search-btn" onClick={handleSearchRUT}>
                <Search size={18} />
              </button>
            </div>

            {searchError && (
              <div style={{
                marginTop: 12, padding: '12px',
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 'var(--radius-md)', color: '#fca5a5', fontSize: 13
              }}>
                {searchError}
              </div>
            )}

            {foundClient && (
              <div className="fade-in" style={{ marginTop: 24 }}>
                <div className="client-card" style={{ marginBottom: 20 }}>
                  <div className="client-info">
                    <h4>{foundClient.name}</h4>
                    <p>{foundClient.rut}</p>
                  </div>
                </div>

                <div className="form-group">
                  <label>Asignar Rol (Cargo)</label>
                  <select 
                    className="form-select"
                    value={selectedRole}
                    onChange={e => setSelectedRole(e.target.value)}
                  >
                    <option value="superadmin">Administrador (Acceso Total)</option>
                    <option value="caja">Base (Caja)</option>
                    <option value="asistente">Asistente</option>
                  </select>
                </div>

                {selectedRole !== 'superadmin' ? (
                  <div className="form-group">
                    <label>Sucursales Permitidas (Centros de Costo)</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                      {BRANCHES.map(b => (
                        <label key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                          <input 
                            type="checkbox" 
                            checked={selectedBranches.includes(b.id)}
                            onChange={() => handleToggleBranch(b.id)}
                            style={{ width: 18, height: 18, accentColor: 'var(--accent-primary)' }}
                          />
                          {b.emoji} {b.name}
                        </label>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    padding: '12px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)',
                    borderRadius: 'var(--radius-md)', color: '#93c5fd', fontSize: 13, marginBottom: 16
                  }}>
                    🛡️ Los administradores tienen acceso global a todas las sucursales por defecto.
                  </div>
                )}

                <button className="btn btn-primary btn-full" onClick={handleAddStaff}>
                  <Plus size={16} /> Contratar y Asignar Permisos
                </button>
              </div>
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
