'use client';

import { useState, useEffect, useMemo } from 'react';
import { getCurrentUser } from '@/lib/data';
import { getInventory as fetchInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } from '@/lib/data';
import { BRANCHES } from '@/lib/constants';
import { calculateAV, filterInventoryByRole } from '@/lib/av-system';
import { useRouter } from 'next/navigation';
import { useBranch } from '@/lib/branch-context';
import { 
  Plus, Pencil, Trash2, X, Save, CheckCircle2, Clock, Wrench, AlertTriangle, 
  Package, Waves, Shirt, RefreshCw, Ban, Check, RotateCcw, Search,
  Building2, Layers, ShieldCheck, Sparkles, Filter
} from 'lucide-react';

const EMPTY_FORM = {
  item_code: '',
  branch_id: 1,
  category: 'tabla',
  color: '',
  size: '',
  entry_date: new Date().toISOString().split('T')[0],
  av_override: '',
  is_rented: false,
  notes: '',
};

export default function InventoryPage() {
  const router = useRouter();
  const { activeBranchId } = useBranch();
  const [user, setUser] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [avFilter, setAvFilter] = useState('ALL');
  const [rentFilter, setRentFilter] = useState('ALL');
  const [catFilter, setCatFilter] = useState('ALL');
  const [toast, setToast] = useState(null);

  // Modal state
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingCode, setEditingCode] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) return;
    if (u.role === 'asistente') {
      router.replace('/dashboard/pos');
      return;
    }
    setUser(u);
    async function loadInv() {
      const inv = await fetchInventory();
      setInventory(inv);
    }
    loadInv();
  }, [router]);

  const inventoryWithAV = useMemo(() => {
    if (!user) return [];
    return filterInventoryByRole(inventory, user.role);
  }, [user, inventory]);

  const filteredInventory = useMemo(() => {
    return inventoryWithAV.filter(item => {
      if (activeBranchId && item.branch_id !== activeBranchId) return false;
      if (avFilter !== 'ALL' && item.av.level !== avFilter) return false;
      if (catFilter !== 'ALL' && item.category !== catFilter) return false;
      if (rentFilter === 'rented' && !item.is_rented) return false;
      if (rentFilter === 'available' && item.is_rented) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const code = (item.item_code || '').toLowerCase();
        const color = (item.color || '').toLowerCase();
        const notes = (item.notes || '').toLowerCase();
        const size = (item.size || '').toLowerCase();
        if (!code.includes(q) && !color.includes(q) && !notes.includes(q) && !size.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [inventoryWithAV, activeBranchId, avFilter, catFilter, rentFilter, searchQuery]);

  // KPIs
  const totalItems = inventoryWithAV.length;
  const availableItems = inventoryWithAV.filter(i => !i.is_rented).length;
  const rentedItems = inventoryWithAV.filter(i => i.is_rented).length;
  const alertItems = inventoryWithAV.filter(i => i.av.level === 'AV3' || i.av.level === 'URGENTE').length;

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openAdd = () => {
    setFormData({ ...EMPTY_FORM, branch_id: activeBranchId || 1 });
    setEditingCode(null);
    setModal('add');
  };

  const openEdit = (item) => {
    setEditingCode(item.item_code);
    setFormData({
      item_code: item.item_code,
      branch_id: item.branch_id,
      category: item.category,
      color: item.color,
      size: item.size,
      entry_date: item.entry_date,
      av_override: item.av_override || '',
      is_rented: item.is_rented,
      notes: item.notes || '',
    });
    setModal('edit');
  };

  const handleSave = async () => {
    if (!formData.item_code || !formData.color || !formData.size || !formData.entry_date) {
      showToast('Completa los campos obligatorios', 'error');
      return;
    }

    if (modal === 'add') {
      const duplicate = inventory.find(i => i.item_code === formData.item_code);
      if (duplicate) {
        showToast(`El código ${formData.item_code} ya existe`, 'error');
        return;
      }
      const { error } = await addInventoryItem(formData);
      if (error) { showToast('Error: ' + error.message, 'error'); return; }
      showToast(`Ítem ${formData.item_code} agregado exitosamente`, 'success');
    } else {
      const { error } = await updateInventoryItem(editingCode, {
        category: formData.category,
        color: formData.color,
        size: formData.size,
        entry_date: formData.entry_date,
        av_override: formData.av_override || null,
        is_rented: formData.is_rented,
        notes: formData.notes,
        branch_id: Number(formData.branch_id),
      });
      if (error) { showToast('Error: ' + error.message, 'error'); return; }
      showToast(`Ítem ${editingCode} actualizado exitosamente`, 'success');
    }

    const updated = await fetchInventory();
    setInventory(updated);
    setModal(null);
  };

  const confirmDeleteAction = async () => {
    await deleteInventoryItem(confirmDelete);
    const updated = await fetchInventory();
    setInventory(updated);
    showToast(`Ítem ${confirmDelete} eliminado permanentemente`, 'success');
    setConfirmDelete(null);
  };

  const handleResetAV = async (item) => {
    const today = new Date().toISOString().split('T')[0];
    await updateInventoryItem(item.item_code, { entry_date: today });
    const updated = await fetchInventory();
    setInventory(updated);
    showToast(`Ciclo AV de ${item.item_code} renovado a fecha de hoy`, 'success');
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
            Logística &amp; Equipamiento Operacional
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight mt-0.5">
            Inventario &amp; Control de Ciclo de Vida (AV)
          </h1>
        </div>

        <button
          onClick={openAdd}
          className="h-9 px-4 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={14} /> Registrar Ítem
        </button>
      </div>

      {/* ── Bento Metrics KPI Grid (SaaS Architecture) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              Total Equipamiento
            </span>
            <div className="w-8 h-8 rounded-xl bg-neutral-100 border border-neutral-200/60 flex items-center justify-center text-neutral-700">
              <Package size={15} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight font-mono">
              {totalItems}
            </div>
            <div className="text-[10px] font-mono text-neutral-400 mt-1 font-bold">
              Tablas y trajes registrados
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              Disponibles
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={15} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight font-mono">
              {availableItems}
            </div>
            <div className="text-[10px] font-mono text-emerald-700 mt-1 font-bold flex items-center gap-1">
              <span>●</span> Listos para arriendo o clases
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              Arrendados
            </span>
            <div className="w-8 h-8 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800">
              <RefreshCw size={15} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-neutral-800 tracking-tight font-mono">
              {rentedItems}
            </div>
            <div className="text-[10px] font-mono text-neutral-700 mt-1 font-bold">
              En sesión en el agua
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              Alertas Mantenimiento
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200/60 flex items-center justify-center text-rose-600">
              <AlertTriangle size={15} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight font-mono">
              {alertItems}
            </div>
            <div className="text-[10px] font-mono text-rose-700 mt-1 font-bold">
              AV3 o Urgente (requiere taller)
            </div>
          </div>
        </div>

      </div>

      {/* ── AV Reference Bar (Guía de Vida Útil) ── */}
      <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-wrap items-center gap-3">
        <span className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider mr-2">
          Ciclo AV:
        </span>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <CheckCircle2 size={13} className="text-emerald-600" />
          <span>AV1 — Óptimo (&lt;3 meses)</span>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-900 text-xs font-semibold">
          <Clock size={13} className="text-neutral-800" />
          <span>AV2 — Revisión (3-6 meses)</span>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-800 text-xs font-semibold">
          <Wrench size={13} className="text-amber-600" />
          <span>AV3 — Reparación (6-9 meses)</span>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-rose-50/80 border border-rose-200 text-rose-800 text-xs font-semibold">
          <AlertTriangle size={13} className="text-rose-600" />
          <span>URGENTE — Vencido (+9 meses)</span>
        </div>
      </div>

      {/* ── Main Data Table Card ── */}
      <div className="rounded-2xl bg-white border border-neutral-200/80 shadow-2xs overflow-hidden">
        
        {/* Toolbar & Filters */}
        <div className="p-4 sm:p-5 border-b border-neutral-200/70 space-y-3 bg-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Buscar por código (ej: T-001), color o notas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-4 rounded-xl border border-neutral-200 bg-neutral-50/60 text-xs text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-900 outline-none transition-all"
              />
            </div>

            {/* Segmented Controls Wrapper */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Category Segment */}
              <div className="inline-flex p-1 rounded-xl bg-neutral-100 border border-neutral-200/60 gap-0.5">
                <button
                  onClick={() => setCatFilter('ALL')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    catFilter === 'ALL' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setCatFilter('tabla')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    catFilter === 'tabla' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <Waves size={12} /> Tablas
                </button>
                <button
                  onClick={() => setCatFilter('traje')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    catFilter === 'traje' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <Shirt size={12} /> Trajes
                </button>
              </div>

              {/* Availability Segment */}
              <div className="inline-flex p-1 rounded-xl bg-neutral-100 border border-neutral-200/60 gap-0.5">
                <button
                  onClick={() => setRentFilter('ALL')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    rentFilter === 'ALL' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setRentFilter('available')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    rentFilter === 'available' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Disponibles
                </button>
                <button
                  onClick={() => setRentFilter('rented')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    rentFilter === 'rented' ? 'bg-white text-neutral-700 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Arrendados
                </button>
              </div>

            </div>
          </div>

          {/* AV Pill Filter Row */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-neutral-100">
            <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider mr-1">
              Filtro AV:
            </span>
            {['ALL', 'AV1', 'AV2', 'AV3', 'URGENTE'].map((level) => {
              const active = avFilter === level;
              return (
                <button
                  key={level}
                  onClick={() => setAvFilter(level)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                    active
                      ? 'bg-neutral-900 text-white shadow-2xs'
                      : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-600 border border-neutral-200/60'
                  }`}
                >
                  {level === 'ALL' ? 'Todos los Estados' : level}
                </button>
              );
            })}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50/80 border-b border-neutral-200/70 text-neutral-500 uppercase font-mono text-[11px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Código</th>
                <th className="py-3 px-4">Sucursal</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Color</th>
                <th className="py-3 px-4">Talla</th>
                <th className="py-3 px-4">Ingreso / Antigüedad</th>
                <th className="py-3 px-4">Estado AV</th>
                <th className="py-3 px-4">Estado Arriendo</th>
                <th className="py-3 px-4">Notas</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-800">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-neutral-400">
                    <Package size={32} className="mx-auto mb-2 text-neutral-300" />
                    <div className="font-bold text-sm text-neutral-600">Sin ítems de inventario</div>
                    <div className="text-xs text-neutral-400 mt-0.5">No se encontraron registros que coincidan con los filtros</div>
                  </td>
                </tr>
              ) : (
                filteredInventory.map(item => {
                  const branch = BRANCHES.find(b => b.id === item.branch_id);
                  const av = item.av;

                  const badgeStyles = {
                    AV1: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    AV2: 'bg-neutral-100 text-neutral-700 border-neutral-200',
                    AV3: 'bg-amber-50 text-amber-700 border-amber-200',
                    URGENTE: 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse',
                  }[av.level] || 'bg-neutral-50 text-neutral-600 border-neutral-200';

                  return (
                    <tr key={item.item_code} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-neutral-900">
                        {item.item_code}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-neutral-700">
                        {branch?.name || `Sede ${item.branch_id}`}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 font-medium">
                          {item.category === 'tabla' ? <Waves size={12} className="text-neutral-800" /> : <Shirt size={12} className="text-purple-600" />}
                          <span className="capitalize">{item.category}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-neutral-600">{item.color}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-neutral-800">{item.size}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-neutral-700">{item.entry_date}</div>
                        <div className="text-[10px] text-neutral-400 font-mono">{av.months} m transcurridos</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold border ${badgeStyles}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {av.level}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {item.is_rented ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-neutral-100 text-neutral-700 border border-neutral-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-1000"></span>
                            Arrendado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Disponible
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-500 max-w-[180px] truncate">
                        {item.notes || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {av.level !== 'AV1' && (
                            <button
                              onClick={() => handleResetAV(item)}
                              title="Resetear ciclo AV (Renovar fecha a hoy)"
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            >
                              <RotateCcw size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => openEdit(item)}
                            title="Editar ítem"
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(item.item_code)}
                            title="Eliminar ítem"
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="p-4 border-t border-neutral-200/70 bg-neutral-50/50 flex flex-wrap items-center justify-between text-xs font-mono text-neutral-500">
          <div>
            Mostrando <strong>{filteredInventory.length}</strong> de <strong>{inventoryWithAV.length}</strong> equipos registrados
          </div>
          <div className="flex items-center gap-4">
            <span>Disponibles: <strong className="text-emerald-600">{availableItems}</strong></span>
            <span>Arrendados: <strong className="text-neutral-800">{rentedItems}</strong></span>
            <span>Mantenimiento: <strong className="text-rose-600">{alertItems}</strong></span>
          </div>
        </div>

      </div>

      {/* ── Modal Registrar / Editar Ítem ── */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-neutral-200 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-neutral-100 text-neutral-900 flex items-center justify-center">
                  {modal === 'add' ? <Plus size={16} /> : <Pencil size={15} />}
                </div>
                <div>
                  <h3 className="text-sm font-black text-neutral-900">
                    {modal === 'add' ? 'Registrar Nuevo Equipo' : `Editar Equipo: ${editingCode}`}
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    Control de inventario logístico y seguimiento AV
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModal(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Código del Ítem *
                </label>
                <input
                  type="text"
                  placeholder="Ej: T-015, TR-008"
                  value={formData.item_code}
                  onChange={e => setFormData({ ...formData, item_code: e.target.value.toUpperCase() })}
                  disabled={modal === 'edit'}
                  className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs font-mono font-bold text-neutral-900 focus:bg-white focus:border-neutral-900 outline-none disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Sucursal *
                </label>
                <select
                  value={formData.branch_id}
                  onChange={e => setFormData({ ...formData, branch_id: Number(e.target.value) })}
                  className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs font-semibold text-neutral-800 focus:bg-white focus:border-neutral-900 outline-none"
                >
                  {BRANCHES.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Categoría *
                </label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs font-semibold text-neutral-800 focus:bg-white focus:border-neutral-900 outline-none"
                >
                  <option value="tabla">Tabla</option>
                  <option value="traje">Traje</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Color *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Azul, Rojo, Negro"
                  value={formData.color}
                  onChange={e => setFormData({ ...formData, color: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs text-neutral-800 focus:bg-white focus:border-neutral-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Talla *
                </label>
                <input
                  type="text"
                  placeholder="Ej: 7'2, 8'0, M, L"
                  value={formData.size}
                  onChange={e => setFormData({ ...formData, size: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs text-neutral-800 focus:bg-white focus:border-neutral-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Fecha Ingreso *
                </label>
                <input
                  type="date"
                  value={formData.entry_date}
                  onChange={e => setFormData({ ...formData, entry_date: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs text-neutral-800 focus:bg-white focus:border-neutral-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Forzar Estado AV
                </label>
                <select
                  value={formData.av_override}
                  onChange={e => setFormData({ ...formData, av_override: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs text-neutral-800 focus:bg-white focus:border-neutral-900 outline-none"
                >
                  <option value="">Automático (por Fecha)</option>
                  <option value="AV1">AV1 - Óptimo</option>
                  <option value="AV2">AV2 - Revisión</option>
                  <option value="AV3">AV3 - Reparación</option>
                  <option value="URGENTE">URGENTE - Bloqueado</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Notas / Observaciones
                </label>
                <input
                  type="text"
                  placeholder="Detalles sobre el estado del equipo..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs text-neutral-800 focus:bg-white focus:border-neutral-900 outline-none"
                />
              </div>

              <div className="col-span-2">
                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-neutral-50 border border-neutral-200 hover:bg-neutral-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.is_rented}
                    onChange={e => setFormData({ ...formData, is_rented: e.target.checked })}
                    className="w-4 h-4 rounded text-neutral-900 focus:ring-0"
                  />
                  <span className="text-xs font-semibold text-neutral-800">
                    Marcar como Arrendado actualmente
                  </span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="h-10 px-4 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-xs font-bold text-neutral-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="h-10 px-5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-2"
              >
                <Save size={14} /> {modal === 'add' ? 'Registrar Equipo' : 'Guardar Cambios'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── Modal Confirm Delete ── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-neutral-200 shadow-2xl p-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="text-base font-black text-neutral-900">¿Eliminar Equipo?</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Se eliminará permanentemente del inventario el código:
              </p>
              <div className="mt-2 py-1.5 px-3 rounded-lg bg-neutral-100 font-mono font-bold text-sm text-neutral-900 inline-block">
                {confirmDelete}
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 h-10 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-xs font-bold text-neutral-700"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteAction}
                className="flex-1 h-10 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Feedback */}
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
