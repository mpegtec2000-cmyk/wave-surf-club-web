'use client';

import { useState, useEffect, useMemo } from 'react';
import { getCurrentUser } from '@/lib/data';
import { getInventory as fetchInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } from '@/lib/data';
import { BRANCHES } from '@/lib/constants';
import { calculateAV, filterInventoryByRole } from '@/lib/av-system';
import { useRouter } from 'next/navigation';
import { useBranch } from '@/lib/branch-context';
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react';

const EMPTY_FORM = {
  item_code: '',
  branch_id: 1,
  color: '',
  size: '',
  entry_date: new Date().toISOString().split('T')[0],
  is_rented: false,
  notes: '',
};

export default function InventoryPage() {
  const router = useRouter();
  const { activeBranchId } = useBranch();
  const [user, setUser] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [avFilter, setAvFilter] = useState('ALL');
  const [rentFilter, setRentFilter] = useState('ALL');
  const [toast, setToast] = useState(null);

  // Modal state
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingCode, setEditingCode] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // item_code to delete

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
      if (rentFilter === 'rented' && !item.is_rented) return false;
      if (rentFilter === 'available' && item.is_rented) return false;
      return true;
    });
  }, [inventoryWithAV, activeBranchId, avFilter, rentFilter]);

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ── CRUD ─────────────────────────────────────────────────────
  const openAdd = () => {
    setFormData({ ...EMPTY_FORM, branch_id: activeBranchId || 1 });
    setEditingCode(null);
    setModal('add');
  };

  const openEdit = (item) => {
    setFormData({
      item_code: item.item_code,
      branch_id: item.branch_id,
      color: item.color,
      size: item.size,
      entry_date: item.entry_date,
      is_rented: item.is_rented,
      notes: item.notes,
    });
    setEditingCode(item.item_code);
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
      showToast(`✅ Ítem ${formData.item_code} agregado`, 'success');
    } else {
      const { error } = await updateInventoryItem(editingCode, {
        color: formData.color,
        size: formData.size,
        entry_date: formData.entry_date,
        is_rented: formData.is_rented,
        notes: formData.notes,
        branch_id: Number(formData.branch_id),
      });
      if (error) { showToast('Error: ' + error.message, 'error'); return; }
      showToast(`✏️ Ítem ${editingCode} actualizado`, 'success');
    }

    const updated = await fetchInventory();
    setInventory(updated);
    setModal(null);
  };

  const handleDelete = (itemCode) => {
    setConfirmDelete(itemCode);
  };

  const confirmDeleteAction = async () => {
    await deleteInventoryItem(confirmDelete);
    const updated = await fetchInventory();
    setInventory(updated);
    showToast(`🗑️ Ítem ${confirmDelete} eliminado`, 'success');
    setConfirmDelete(null);
  };

  const handleResetAV = async (item) => {
    const today = new Date().toISOString().split('T')[0];
    await updateInventoryItem(item.item_code, { entry_date: today });
    const updated = await fetchInventory();
    setInventory(updated);
    showToast(`✅ AV de ${item.item_code} reseteado a hoy`, 'success');
  };

  if (!user) return null;

  const isSuperAdmin = user.role === 'superadmin';
  const canEdit = user.role === 'superadmin' || user.role === 'caja';

  return (
    <div>
      {/* AV Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <span className="av-badge av-optimal">✅ AV1 — Óptimo (&lt;3 meses)</span>
        <span className="av-badge av-review">🕒 AV2 — Revisión (3-6 meses)</span>
        <span className="av-badge av-repair">🔧 AV3 — Reparación (6-9 meses)</span>
        <span className="av-badge av-urgent">⚠️ URGENTE — Vencido (+9 meses)</span>
      </div>

      <div className="data-section">
        <div className="data-section-header">
          <h3 className="data-section-title">📦 Inventario Logístico (T / TR)</h3>
          <div className="data-section-actions">
            <button className="btn btn-primary btn-sm" onClick={openAdd}>
              <Plus size={14} /> Nuevo Ítem
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="data-filters">
          <button className={`filter-chip ${avFilter === 'ALL' ? 'active' : ''}`} onClick={() => setAvFilter('ALL')}>Todos</button>
          <button className={`filter-chip ${avFilter === 'AV1' ? 'active' : ''}`} onClick={() => setAvFilter('AV1')}>✅ AV1</button>
          <button className={`filter-chip ${avFilter === 'AV2' ? 'active' : ''}`} onClick={() => setAvFilter('AV2')}>🕒 AV2</button>
          <button className={`filter-chip ${avFilter === 'AV3' ? 'active' : ''}`} onClick={() => setAvFilter('AV3')}>🔧 AV3</button>
          <button className={`filter-chip ${avFilter === 'URGENTE' ? 'active' : ''}`} onClick={() => setAvFilter('URGENTE')}>⚠️ URGENTE</button>
          <div style={{ width: 1, background: 'var(--border-subtle)', margin: '0 4px' }} />
          <button className={`filter-chip ${rentFilter === 'ALL' ? 'active' : ''}`} onClick={() => setRentFilter('ALL')}>Todos</button>
          <button className={`filter-chip ${rentFilter === 'available' ? 'active' : ''}`} onClick={() => setRentFilter('available')}>Disponibles</button>
          <button className={`filter-chip ${rentFilter === 'rented' ? 'active' : ''}`} onClick={() => setRentFilter('rented')}>Arrendados</button>
        </div>

        {/* Table */}
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Sucursal</th>
                <th>Color</th>
                <th>Talla</th>
                <th>Ingreso</th>
                <th>Estado AV</th>
                <th>Arriendo</th>
                <th>Notas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="empty-state">
                      <div className="empty-state-icon">📦</div>
                      <h3>Sin resultados</h3>
                      <p>No hay ítems que coincidan con los filtros seleccionados</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInventory.map(item => {
                  const branch = BRANCHES.find(b => b.id === item.branch_id);
                  return (
                    <tr key={item.item_code}>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                        {item.item_code}
                      </td>
                      <td>{branch?.emoji} {branch?.shortName}</td>
                      <td>{item.color}</td>
                      <td>{item.size}</td>
                      <td style={{ fontSize: 13 }}>
                        {new Date(item.entry_date).toLocaleDateString('es-CL')}
                        <br />
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.av.months} meses</span>
                      </td>
                      <td>
                        <span className={`av-badge ${item.av.cssClass}`}>
                          {item.av.icon} {item.av.level}
                        </span>
                      </td>
                      <td>
                        {item.is_rented ? (
                          <span className="rent-badge rented">🔄 Arrendado</span>
                        ) : item.av.level === 'URGENTE' ? (
                          <span className="rent-badge" style={{ background: 'rgba(239,68,68,0.08)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' }}>🚫 Bloqueado</span>
                        ) : (
                          <span className="rent-badge available">✓ Disponible</span>
                        )}
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.notes}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {(item.av.level === 'AV3' || item.av.level === 'URGENTE') && (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleResetAV(item)}
                              title="Reset AV a hoy"
                            >
                              🔄
                            </button>
                          )}
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => openEdit(item)}
                            title="Editar"
                            style={{ padding: '4px 8px' }}
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            className="btn btn-sm"
                            onClick={() => handleDelete(item.item_code)}
                            title="Eliminar"
                            style={{ padding: '4px 8px', color: '#fca5a5', borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)' }}
                          >
                            <Trash2 size={12} />
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

        {/* Summary footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 24, fontSize: 13, color: 'var(--text-muted)' }}>
          <span>Total: <strong style={{ color: 'var(--text-primary)' }}>{filteredInventory.length}</strong> ítems</span>
          <span>Disponibles: <strong style={{ color: 'var(--color-success)' }}>{filteredInventory.filter(i => !i.is_rented && i.av.level !== 'URGENTE').length}</strong></span>
          <span>Arrendados: <strong style={{ color: '#c4b5fd' }}>{filteredInventory.filter(i => i.is_rented).length}</strong></span>
          <span>Alertas: <strong style={{ color: 'var(--color-danger)' }}>{filteredInventory.filter(i => i.av.level === 'AV3' || i.av.level === 'URGENTE').length}</strong></span>
        </div>
      </div>

      {/* ── MODAL ADD / EDIT ─────────────────────────────────── */}
      {modal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="pos-panel" style={{ width: 560, maxHeight: '90vh', overflowY: 'auto', margin: 0 }}>
            <div className="pos-panel-header" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>{modal === 'add' ? '➕' : '✏️'}</span>
                <h2>{modal === 'add' ? 'Nuevo Ítem de Inventario' : `Editar: ${editingCode}`}</h2>
              </div>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className="pos-panel-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Código del Ítem *</label>
                  <input
                    type="text" className="form-input"
                    placeholder="Ej: T-025, TR-011"
                    value={formData.item_code}
                    onChange={e => setFormData({ ...formData, item_code: e.target.value.toUpperCase() })}
                    disabled={modal === 'edit'}
                  />
                </div>

                <div className="form-group">
                  <label>Sucursal *</label>
                  <select className="form-select" value={formData.branch_id} onChange={e => setFormData({ ...formData, branch_id: Number(e.target.value) })}>
                    {BRANCHES.map(b => (
                      <option key={b.id} value={b.id}>{b.emoji} {b.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Color *</label>
                  <input
                    type="text" className="form-input" placeholder="Ej: Azul"
                    value={formData.color}
                    onChange={e => setFormData({ ...formData, color: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Talla *</label>
                  <input
                    type="text" className="form-input" placeholder="Ej: 7'2&quot;, M, L"
                    value={formData.size}
                    onChange={e => setFormData({ ...formData, size: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Fecha de Ingreso *</label>
                  <input
                    type="date" className="form-input"
                    value={formData.entry_date}
                    onChange={e => setFormData({ ...formData, entry_date: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Notas</label>
                  <input
                    type="text" className="form-input" placeholder="Observaciones del equipo..."
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.is_rented}
                      onChange={e => setFormData({ ...formData, is_rented: e.target.checked })}
                    />
                    🔄 Marcar como Arrendado actualmente
                  </label>
                </div>

              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setModal(null)}>
                  Cancelar
                </button>
                <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleSave}>
                  <Save size={16} /> {modal === 'add' ? 'Agregar al Inventario (+)' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CONFIRM DELETE MODAL ─────────────────────────────── */}
      {confirmDelete && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1100,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="pos-panel" style={{ width: 400, margin: 0 }}>
            <div className="pos-panel-header">
              <span style={{ fontSize: 24 }}>🗑️</span>
              <h2>Eliminar Ítem</h2>
            </div>
            <div className="pos-panel-body" style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 15, marginBottom: 8 }}>
                ¿Confirmas la eliminación del ítem
              </p>
              <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'var(--font-display)', marginBottom: 20 }}>
                {confirmDelete}
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
                Esta acción no se puede deshacer.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setConfirmDelete(null)}>
                  Cancelar
                </button>
                <button
                  className="btn btn-sm"
                  style={{ flex: 1, background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.4)', fontSize: 14, fontWeight: 700 }}
                  onClick={confirmDeleteAction}
                >
                  <Trash2 size={14} /> Sí, Eliminar (-)
                </button>
              </div>
            </div>
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
