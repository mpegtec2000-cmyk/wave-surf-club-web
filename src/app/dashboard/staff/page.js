'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser, getStaff, findClientByRut, addStaffMember, removeStaffMember, registerStaffMember } from '@/lib/data';
import { BRANCHES, ROLES, ROLE_LABELS } from '@/lib/constants';
import { 
  Search, Briefcase, Plus, Shield, UserMinus, UserPlus, FileText, 
  MapPin, Calendar, Heart, ShieldCheck, Crown, Globe, Users, Check
} from 'lucide-react';
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
    
    const alreadyStaff = staffList.find(s => s.rut === rut);
    if (alreadyStaff) {
      setSearchError('Esta persona ya es parte del personal activo.');
      setFoundClient(null);
      return;
    }

    const data = await findClientByRut(rut);
    if (data) {
      setFoundClient(data);
      setSelectedBranches([]);
      setSelectedRole('caja');
    } else if (rut.length >= 11) {
      setSearchError('Persona no encontrada en el sistema. Puedes usar "Registro Completo".');
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
      showToast('Seleccione al menos una sucursal para este colaborador', 'error');
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

  const handleRemoveStaff = async (staffId) => {
    if (confirm('¿Confirmas que deseas retirar el acceso y rol a este empleado?')) {
      await removeStaffMember(staffId);
      const updated = await getStaff();
      setStaffList(updated);
      showToast('Permisos de personal retirados', 'info');
    }
  };

  const handleFullRegistration = async (e) => {
    e.preventDefault();
    if (selectedRole !== 'superadmin' && selectedBranches.length === 0) {
      showToast('Seleccione al menos una sucursal de acceso', 'error');
      return;
    }

    const branchIds = selectedRole === 'superadmin' ? [1,2,3] : selectedBranches;
    const { data, error } = await registerStaffMember({
      ...newStaff,
      role: selectedRole
    }, branchIds);

    if (error) {
      showToast('Error al registrar personal: ' + error.message, 'error');
      return;
    }

    showToast('Empleado registrado exitosamente en nómina', 'success');
    setRegMode(false);
    setNewStaff({
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
    const updated = await getStaff();
    setStaffList(updated);
  };

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  if (!user) return null;

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
            Recursos Humanos &amp; Permisos Operativos
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight mt-0.5">
            Gestión de Personal &amp; Acceso a Sedes
          </h1>
        </div>

        <button
          onClick={() => setRegMode(!regMode)}
          className="h-9 px-4 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-2 self-start sm:self-auto"
        >
          {regMode ? '← Asignar desde Clientes' : '+ Nuevo Registro Completo'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Card: Form */}
        <div className="p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-4">
          <div className="border-b border-neutral-100 pb-3">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              {regMode ? 'Alta en Nómina' : 'Vinculación de Perfil'}
            </div>
            <h3 className="text-sm font-black text-neutral-900 mt-0.5">
              {regMode ? 'Formulario de Contratación' : 'Habilitar Funcionario Existente'}
            </h3>
          </div>

          {!regMode ? (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Buscar RUT Persona
                </label>
                <div className="relative">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="12.345.678-9"
                    value={rut}
                    onChange={e => setRut(formatRut(e.target.value))}
                    className="w-full h-10 pl-9 pr-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs font-mono font-bold text-neutral-900 focus:bg-white focus:border-neutral-900 outline-none"
                  />
                </div>
              </div>

              {searchError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                  {searchError}
                </div>
              )}

              {foundClient && (
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/70 space-y-3">
                  <div>
                    <div className="text-[10px] font-mono font-bold uppercase text-neutral-400">Persona Encontrada</div>
                    <div className="text-sm font-black text-neutral-900">{foundClient.name}</div>
                    <div className="text-xs font-mono text-neutral-500">{foundClient.rut}</div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
                      Rol Asignado
                    </label>
                    <select
                      value={selectedRole}
                      onChange={e => setSelectedRole(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-800 outline-none"
                    >
                      <option value="caja">Base / Cajero</option>
                      <option value="profesor">Profesor / Instructor</option>
                      <option value="asistente">Asistente Logístico</option>
                      <option value="superadmin">Administrador Global</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Sedes Permitidas
                    </label>
                    {selectedRole === 'superadmin' ? (
                      <div className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 p-2 rounded-lg">
                        Acceso automático a todas las sedes
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {BRANCHES.map(b => {
                          const active = selectedBranches.includes(b.id);
                          return (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => handleToggleBranch(b.id)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                active ? 'bg-neutral-900 text-white' : 'bg-white border border-neutral-200 text-neutral-700'
                              }`}
                            >
                              {b.short_name || b.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleAddStaff}
                    className="w-full h-10 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs"
                  >
                    Confirmar Contratación
                  </button>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleFullRegistration} className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-0.5">Nombre Completo *</label>
                <input
                  type="text" required
                  value={newStaff.name}
                  onChange={e => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-neutral-200 text-xs text-neutral-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-0.5">RUT *</label>
                <input
                  type="text" required
                  value={newStaff.rut}
                  onChange={e => setNewStaff({ ...newStaff, rut: formatRut(e.target.value) })}
                  className="w-full h-9 px-3 rounded-xl border border-neutral-200 text-xs font-mono font-bold text-neutral-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-0.5">Correo *</label>
                  <input
                    type="email" required
                    value={newStaff.email}
                    onChange={e => setNewStaff({ ...newStaff, email: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-neutral-200 text-xs text-neutral-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-0.5">Teléfono</label>
                  <input
                    type="text"
                    value={newStaff.phone}
                    onChange={e => setNewStaff({ ...newStaff, phone: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-neutral-200 text-xs text-neutral-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-0.5">Rol de Personal</label>
                <select
                  value={selectedRole}
                  onChange={e => setSelectedRole(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-800 outline-none"
                >
                  <option value="caja">Caja / Mostrador</option>
                  <option value="profesor">Profesor de Surf</option>
                  <option value="asistente">Asistente</option>
                  <option value="superadmin">Administrador</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Sedes Habilitadas</label>
                {selectedRole === 'superadmin' ? (
                  <div className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 p-2 rounded-lg">
                    Acceso total a todas las sedes
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {BRANCHES.map(b => {
                      const active = selectedBranches.includes(b.id);
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => handleToggleBranch(b.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            active ? 'bg-neutral-900 text-white' : 'bg-white border border-neutral-200 text-neutral-700'
                          }`}
                        >
                          {b.short_name || b.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full h-10 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs mt-2"
              >
                Registrar e Ingresar
              </button>
            </form>
          )}
        </div>

        {/* Right Card: Staff Table */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-neutral-200/70 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Nómina de Personal Activo</h3>
              <p className="text-[11px] text-neutral-400">{staffList.length} funcionarios con acceso al ERP</p>
            </div>
            <span className="text-xs font-mono font-bold text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-lg">
              {staffList.length} activos
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50/80 border-b border-neutral-200/70 text-neutral-500 uppercase font-mono text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Colaborador</th>
                  <th className="py-3 px-4">RUT</th>
                  <th className="py-3 px-4">Rol / Cargo</th>
                  <th className="py-3 px-4">Sedes Autorizadas</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-800">
                {staffList.map(staff => (
                  <tr key={staff.rut || staff.email} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-neutral-900">{staff.name}</div>
                      <div className="text-[11px] text-neutral-400 font-mono">{staff.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-neutral-600">
                      {staff.rut || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold ${
                        staff.role === 'superadmin' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-neutral-100 text-neutral-700'
                      }`}>
                        {staff.role === 'superadmin' && <Crown size={11} />}
                        {ROLE_LABELS[staff.role] || staff.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {staff.allowed_branches?.length === 3 ? (
                        <span className="text-emerald-700 font-bold font-mono text-[11px] inline-flex items-center gap-1">
                          <Globe size={12} /> Todas las Sedes
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {staff.allowed_branches?.map(bid => {
                            const b = BRANCHES.find(br => br.id === bid);
                            return b ? (
                              <span key={b.id} className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 text-[10px] font-mono font-bold">
                                {b.short_name || b.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleRemoveStaff(staff.id)}
                        className="h-7 px-2.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-bold transition-colors inline-flex items-center gap-1"
                        title="Quitar permisos"
                      >
                        <UserMinus size={12} /> Desvincular
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

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
