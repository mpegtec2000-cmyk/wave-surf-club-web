'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit2, Trash2, Tag, CheckCircle2, XCircle, X, Save, Layers, ArrowUpDown } from 'lucide-react';

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
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchCategorias();
  }, []);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

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
      setFormData({ 
        nombre: '', 
        slug: '', 
        orden: (categorias.length + 1) * 10, 
        activa: true 
      });
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
      slug: editingId ? formData.slug : generateSlug(name)
    });
  };

  const handleSave = async () => {
    if (!formData.nombre) {
      showToast('Ingresa el nombre de la categoría', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const { error } = await supabase.from('categorias_tienda').update(formData).eq('id', editingId);
        if (error) throw error;
        showToast('Categoría actualizada', 'success');
      } else {
        const { error } = await supabase.from('categorias_tienda').insert([formData]);
        if (error) throw error;
        showToast('Categoría creada con éxito', 'success');
      }
      setIsModalOpen(false);
      fetchCategorias();
    } catch (e) {
      showToast('Error guardando: ' + e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de eliminar esta categoría? Solo se puede eliminar si no tiene productos asociados.')) {
      try {
        const { error } = await supabase.from('categorias_tienda').delete().eq('id', id);
        if (error) throw error;
        showToast('Categoría eliminada', 'success');
        fetchCategorias();
      } catch (e) {
        showToast('Error: No se pudo eliminar. Asegúrate de que no tenga productos asociados.', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
            Catálogo &amp; Taxonomía E-Commerce
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight mt-0.5">
            Categorías de la Tienda
          </h1>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="h-9 px-4 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={14} /> Nueva Categoría
        </button>
      </div>

      {/* ── Table Card ── */}
      <div className="rounded-2xl bg-white border border-neutral-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-neutral-200/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-700">
              <Layers size={15} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Estructura de Categorías</h3>
              <p className="text-[11px] text-neutral-400">Organización y orden en el portal web público</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-lg">
            {categorias.length} categorías
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50/80 border-b border-neutral-200/70 text-neutral-500 uppercase font-mono text-[11px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4 w-20">Orden</th>
                <th className="py-3 px-4">Nombre</th>
                <th className="py-3 px-4">Slug (URL)</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-400 font-mono">
                    Cargando categorías...
                  </td>
                </tr>
              ) : categorias.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-400">
                    <Tag size={28} className="mx-auto mb-2 text-neutral-300" />
                    <div className="font-bold text-sm text-neutral-600">No hay categorías configuradas</div>
                    <div className="text-xs text-neutral-400 mt-0.5">Crea tu primera categoría para organizar la tienda</div>
                  </td>
                </tr>
              ) : (
                categorias.map(c => (
                  <tr key={c.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-neutral-600">
                      #{c.orden}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-neutral-900">
                      {c.nombre}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-neutral-500">
                      /{c.slug}
                    </td>
                    <td className="py-3.5 px-4">
                      {c.activa ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Activa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-neutral-100 text-neutral-600 border border-neutral-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400"></span>
                          Inactiva
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenModal(c)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal Categoría ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-neutral-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">Catálogo E-Commerce</div>
                <h3 className="text-base font-black text-neutral-900 mt-0.5">
                  {editingId ? 'Editar Categoría' : 'Nueva Categoría'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Nombre de la Categoría *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={handleNameChange}
                  placeholder="Ej: Clases de Surf, Arriendos..."
                  className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-900 focus:border-neutral-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Slug (URL amigable)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={e => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="ej: clases-de-surf"
                  className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 text-xs font-mono text-neutral-600 focus:border-neutral-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Orden de Visualización
                </label>
                <input
                  type="number"
                  value={formData.orden}
                  onChange={e => setFormData({ ...formData, orden: parseInt(e.target.value) || 0 })}
                  className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 text-xs font-mono text-neutral-900 focus:border-neutral-900 outline-none"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-neutral-50 border border-neutral-200 hover:bg-neutral-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.activa}
                    onChange={e => setFormData({ ...formData, activa: e.target.checked })}
                    className="w-4 h-4 rounded text-neutral-900 focus:ring-0"
                  />
                  <span className="text-xs font-semibold text-neutral-800">
                    Categoría Activa (Visible para los clientes)
                  </span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="h-10 px-4 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-xs font-bold text-neutral-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="h-10 px-5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={14} /> {saving ? 'Guardando...' : (editingId ? 'Actualizar' : 'Guardar')}
              </button>
            </div>
          </div>
        </div>
      )}

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
