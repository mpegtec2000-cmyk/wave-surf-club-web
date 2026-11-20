'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit2, Trash2, Search, Image as ImageIcon, Tag, CheckCircle2, Clock, X, ShoppingBag } from 'lucide-react';

export default function TiendaDashboard() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('ALL');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria_id: '',
    precio: 0,
    aplica_comision_flow: true,
    porcentaje_comision: 10,
    requiere_reserva: false,
    duracion_bloque: 60,
    stock: 0,
    stock_ilimitado: false,
    activo: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [{ data: cats }, { data: prods }] = await Promise.all([
        supabase.from('categorias_tienda').select('*').order('orden'),
        supabase.from('productos_tienda').select('*, categorias_tienda(nombre)').order('created_at', { ascending: false })
      ]);
      setCategorias(cats || []);
      setProductos(prods || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (prod = null) => {
    if (prod) {
      setEditingId(prod.id);
      setFormData({
        nombre: prod.nombre,
        descripcion: prod.descripcion || '',
        categoria_id: prod.categoria_id,
        precio: prod.precio,
        aplica_comision_flow: prod.aplica_comision_flow,
        porcentaje_comision: prod.porcentaje_comision,
        requiere_reserva: prod.requiere_reserva,
        duracion_bloque: prod.duracion_bloque || 60,
        stock: prod.stock || 0,
        stock_ilimitado: prod.stock_ilimitado,
        activo: prod.activo
      });
    } else {
      setEditingId(null);
      setFormData({
        nombre: '',
        descripcion: '',
        categoria_id: categorias[0]?.id || '',
        precio: 0,
        aplica_comision_flow: true,
        porcentaje_comision: 10,
        requiere_reserva: false,
        duracion_bloque: 60,
        stock: 0,
        stock_ilimitado: true,
        activo: true
      });
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    if (!formData.nombre || !formData.categoria_id) {
      alert('Por favor completa el nombre y categoría');
      return;
    }

    setSaving(true);
    try {
      let imagenUrl = null;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `productos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('productos-tienda')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('productos-tienda')
          .getPublicUrl(filePath);

        imagenUrl = publicUrl;
      }

      const precio = parseInt(formData.precio) || 0;
      const precio_final = formData.aplica_comision_flow 
        ? Math.round(precio * (1 + formData.porcentaje_comision / 100))
        : precio;

      const payload = {
        ...formData,
        precio,
        precio_final,
        ...(imagenUrl ? { imagen_url: imagenUrl } : {})
      };

      if (editingId) {
        await supabase.from('productos_tienda').update(payload).eq('id', editingId);
      } else {
        await supabase.from('productos_tienda').insert([payload]);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (e) {
      console.error(e);
      alert('Error al guardar: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Seguro que deseas eliminar este producto?')) {
      await supabase.from('productos_tienda').delete().eq('id', id);
      fetchData();
    }
  };

  const filteredProducts = productos.filter(p => {
    const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCat === 'ALL' || p.categoria_id === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
            Catálogo Oficial · E-Commerce &amp; Logística
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight mt-0.5">
            Gestión de Productos y Servicios
          </h1>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs shrink-0"
        >
          <Plus size={15} /> NUEVO PRODUCTO
        </button>
      </div>

      {/* ── Toolbar & Filters ── */}
      <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Buscar por nombre..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs text-neutral-800 placeholder-neutral-400 focus:bg-white focus:border-neutral-900 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCat('ALL')}
            className={`h-8 px-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              selectedCat === 'ALL'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            Todos ({productos.length})
          </button>
          {categorias.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`h-8 px-3 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                selectedCat === cat.id
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="rounded-2xl bg-white border border-neutral-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs font-mono text-neutral-400">
            Cargando catálogo oficial desde Supabase...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200/80 flex items-center justify-center text-neutral-400 mb-3">
              <ShoppingBag size={22} />
            </div>
            <div className="text-sm font-bold text-neutral-800">No se encontraron productos</div>
            <p className="text-xs text-neutral-400 mt-1">Prueba cambiando el término de búsqueda o la categoría seleccionada.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50/80 border-b border-neutral-200/70 text-neutral-500 uppercase font-mono text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-14">Imagen</th>
                  <th className="py-3 px-4">Producto / Modalidad</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">Precio Base</th>
                  <th className="py-3 px-4">Precio Final</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-800">
                {filteredProducts.map(p => (
                  <tr key={p.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-3 px-4">
                      {p.imagen_url ? (
                        <img src={p.imagen_url} alt={p.nombre} className="w-10 h-10 rounded-xl object-cover border border-neutral-200/80" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200/80 flex items-center justify-center text-neutral-400">
                          <ImageIcon size={16} />
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-neutral-900">{p.nombre}</div>
                      <div className="text-[10px] font-mono text-neutral-400 mt-0.5">
                        {p.requiere_reserva ? `⏱️ Reserva obligatoria (${p.duracion_bloque || 60}m)` : '📦 Venta directa en línea'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200/60">
                        {p.categorias_tienda?.nombre || 'General'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-600">
                      ${Number(p.precio || 0).toLocaleString('es-CL')}
                    </td>
                    <td className="py-3 px-4 font-mono font-black text-neutral-900 text-sm">
                      ${Number(p.precio_final || 0).toLocaleString('es-CL')}
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-600">
                      {p.stock_ilimitado ? (
                        <span className="text-neutral-400 font-bold">Ilimitado (∞)</span>
                      ) : (
                        `${p.stock} un.`
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold ${
                        p.activo 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${p.activo ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
                        {p.activo ? 'Activo' : 'Pausado'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button 
                          onClick={() => handleOpenModal(p)} 
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id)} 
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-rose-50 text-neutral-400 hover:text-rose-600 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal Nuevo / Editar ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">Catálogo ERP</div>
                <h2 className="text-base font-black text-neutral-900 mt-0.5">
                  {editingId ? 'Editar Producto / Servicio' : 'Nuevo Producto / Servicio'}
                </h2>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Nombre</label>
                <input 
                  type="text" 
                  value={formData.nombre} 
                  onChange={e => setFormData({...formData, nombre: e.target.value})}
                  className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none" 
                  placeholder="Ej: Clase personalizada de Surf"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Descripción</label>
                <textarea 
                  rows="2" 
                  value={formData.descripcion} 
                  onChange={e => setFormData({...formData, descripcion: e.target.value})}
                  className="w-full p-3 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none resize-none" 
                  placeholder="Detalles del arriendo o clase..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Categoría</label>
                  <select 
                    value={formData.categoria_id} 
                    onChange={e => setFormData({...formData, categoria_id: e.target.value})}
                    className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:border-neutral-900 outline-none"
                  >
                    <option value="">Selecciona...</option>
                    {categorias.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Precio Base ($ CLP)</label>
                  <input 
                    type="number" 
                    value={formData.precio} 
                    onChange={e => setFormData({...formData, precio: parseInt(e.target.value) || 0})}
                    className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 font-mono focus:border-neutral-900 outline-none" 
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-800">
                  <input 
                    type="checkbox" 
                    checked={formData.aplica_comision_flow} 
                    onChange={e => setFormData({...formData, aplica_comision_flow: e.target.checked})}
                    className="rounded border-neutral-300 text-neutral-900 focus:ring-0"
                  />
                  Aplicar Comisión Flow (+{formData.porcentaje_comision}%)
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-800">
                  <input 
                    type="checkbox" 
                    checked={formData.requiere_reserva} 
                    onChange={e => setFormData({...formData, requiere_reserva: e.target.checked})}
                    className="rounded border-neutral-300 text-neutral-900 focus:ring-0"
                  />
                  Requiere Reserva de Horario (Arriendo / Clase)
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-800">
                  <input 
                    type="checkbox" 
                    checked={formData.stock_ilimitado} 
                    onChange={e => setFormData({...formData, stock_ilimitado: e.target.checked})}
                    className="rounded border-neutral-300 text-neutral-900 focus:ring-0"
                  />
                  Stock Ilimitado (Servicios y Clases)
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Foto del Producto (opcional)</label>
                <input 
                  type="file" 
                  accept="image/jpeg, image/png" 
                  onChange={handleImageChange}
                  className="w-full text-xs text-neutral-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-neutral-900 file:text-white hover:file:bg-black cursor-pointer"
                />
              </div>
            </div>

            <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex justify-end gap-2">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="h-9 px-4 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-xs font-bold text-neutral-700 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave} 
                disabled={saving}
                className="h-9 px-4 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
              >
                {saving ? 'Guardando...' : (editingId ? 'Actualizar Producto' : 'Guardar Producto')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
