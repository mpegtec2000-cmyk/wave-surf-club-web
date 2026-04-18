'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function TiendaCategoriasPage() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    slug: '',
    orden: 0,
    activa: true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('categorias_tienda')
        .select('*')
        .order('orden', { ascending: true });
      
      setCategorias(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (cat = null) => {
    if (cat) {
      setEditingId(cat.id);
      setFormData({
        nombre: cat.nombre,
        slug: cat.slug,
        orden: cat.orden || 0,
        activa: cat.activa
      });
    } else {
      setEditingId(null);
      setFormData({ nombre: '', slug: '', orden: 0, activa: true });
    }
    setIsModalOpen(true);
  };

  const generateSlug = (name) => {
    return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      nombre: name,
      slug: editingId ? formData.slug : generateSlug(name) // Auto generate slug only on create
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingId) {
        await supabase.from('categorias_tienda').update(formData).eq('id', editingId);
      } else {
        await supabase.from('categorias_tienda').insert([formData]);
      }
      setIsModalOpen(false);
      fetchCategorias();
    } catch (e) {
      alert('Error guardando categoría: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de eliminar esta categoría? Solo se puede eliminar si no tiene productos.')) {
      try {
        const { error } = await supabase.from('categorias_tienda').delete().eq('id', id);
        if (error) throw error;
        fetchCategorias();
      } catch (e) {
        alert('Error: No se pudo eliminar la categoría. Asegúrate de que no tenga productos asociados.');
      }
    }
  };

  return (
    <div className="tienda-admin">
      <div className="header-actions">
        <h1>Categorías de Tienda</h1>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={16} /> NUEVA CATEGORÍA
        </button>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading">Cargando categorías...</div>
        ) : (
          <table className="erp-table">
            <thead>
              <tr>
                <th>Orden</th>
                <th>Nombre</th>
                <th>Slug</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map(c => (
                <tr key={c.id}>
                  <td>{c.orden}</td>
                  <td><strong>{c.nombre}</strong></td>
                  <td className="text-gray">{c.slug}</td>
                  <td>
                    <span className={`badge ${c.activa ? 'bg-green' : 'bg-red'}`}>
                      {c.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button onClick={() => handleOpenModal(c)} className="action-btn edit"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(c.id)} className="action-btn delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingId ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
            
            <div className="form-group">
              <label>Nombre de Categoría</label>
              <input type="text" value={formData.nombre} onChange={handleNameChange} />
            </div>

            <div className="form-group">
              <label>Slug (URL)</label>
              <input type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
            </div>

            <div className="form-group">
              <label>Orden de visualización</label>
              <input type="number" value={formData.orden} onChange={e => setFormData({...formData, orden: parseInt(e.target.value) || 0})} />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input type="checkbox" checked={formData.activa} onChange={e => setFormData({...formData, activa: e.target.checked})} />
                Categoría Activa
              </label>
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancelar</button>
              <button className="btn-save" onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar Categoría'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .header-actions h1 { font-size: 20px; margin: 0; }
        .btn-primary { background: #38bdf8; color: #000; border: none; padding: 10px 16px; border-radius: 8px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 8px; }
        
        .table-container { background: #1a2236; border-radius: 12px; overflow: hidden; margin-top: 20px; }
        .erp-table { width: 100%; border-collapse: collapse; text-align: left; }
        .erp-table th { background: #0f1623; padding: 15px; font-size: 12px; text-transform: uppercase; color: #888; }
        .erp-table td { padding: 15px; border-bottom: 1px solid #2a3441; font-size: 14px; vertical-align: middle; }
        
        .text-gray { color: #888; }
        .badge { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .bg-green { background: rgba(16,185,129,0.2); color: #10b981; }
        .bg-red { background: rgba(239,68,68,0.2); color: #ef4444; }

        .actions { display: flex; gap: 10px; }
        .action-btn { background: none; border: none; cursor: pointer; padding: 5px; border-radius: 4px; }
        .action-btn.edit { color: #38bdf8; }
        .action-btn.edit:hover { background: rgba(56,189,248,0.1); }
        .action-btn.delete { color: #ef4444; }
        .action-btn.delete:hover { background: rgba(239,68,68,0.1); }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 1000; display: flex; align-items: center; justify-content: center; }
        .modal-content { background: #1a2236; width: 90%; max-width: 400px; border-radius: 12px; padding: 30px; }
        .modal-content h2 { margin: 0 0 20px 0; font-size: 18px; }

        .form-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: 15px; }
        .form-group label { font-size: 12px; color: #888; font-weight: 600; text-transform: uppercase; }
        .form-group input[type="text"], .form-group input[type="number"] { background: #0f1623; border: 1px solid #2a3441; color: #fff; padding: 10px; border-radius: 6px; outline: none; }
        .form-group input:focus { border-color: #38bdf8; }
        
        .checkbox-group { flex-direction: row; align-items: center; margin-top: 10px; }
        .checkbox-group label { display: flex; align-items: center; gap: 8px; cursor: pointer; color: #fff; text-transform: none; }

        .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 30px; }
        .btn-cancel { background: transparent; color: #888; border: 1px solid #888; padding: 10px 16px; border-radius: 6px; cursor: pointer; }
        .btn-save { background: #38bdf8; color: #000; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; }
        .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
