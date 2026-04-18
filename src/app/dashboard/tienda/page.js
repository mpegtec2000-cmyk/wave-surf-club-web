'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit2, Trash2, Search, Image as ImageIcon } from 'lucide-react';

export default function TiendaDashboard() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
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
        nombre: '', descripcion: '', categoria_id: categorias[0]?.id || '',
        precio: 0, aplica_comision_flow: true, porcentaje_comision: 10,
        requiere_reserva: false, duracion_bloque: 60, stock: 0, stock_ilimitado: false, activo: true
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
    setSaving(true);
    try {
      let imageUrl = null;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError, data } = await supabase.storage
          .from('productos-tienda')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('productos-tienda')
          .getPublicUrl(fileName);
          
        imageUrl = publicUrl;
      }

      const payload = {
        ...formData,
        // Calc precio final si aplica comision
        precio_final: formData.aplica_comision_flow 
          ? Math.round(formData.precio * (1 + formData.porcentaje_comision / 100))
          : formData.precio
      };

      if (imageUrl) {
        payload.imagen_url = imageUrl;
      }

      if (editingId) {
        await supabase.from('productos_tienda').update(payload).eq('id', editingId);
      } else {
        await supabase.from('productos_tienda').insert([payload]);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (e) {
      alert('Error guardando producto: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      await supabase.from('productos_tienda').delete().eq('id', id);
      fetchData();
    }
  };

  const filteredProducts = productos.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="tienda-admin">
      <div className="header-actions">
        <h1>Gestión de Productos</h1>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={16} /> NUEVO PRODUCTO
        </button>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Buscar por nombre..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading">Cargando productos...</div>
        ) : (
          <table className="erp-table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio Base</th>
                <th>Precio Final</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(p => (
                <tr key={p.id}>
                  <td>
                    {p.imagen_url ? (
                      <img src={p.imagen_url} alt="Prod" className="td-img" />
                    ) : (
                      <div className="td-img-placeholder"><ImageIcon size={16} /></div>
                    )}
                  </td>
                  <td><strong>{p.nombre}</strong><br/><span className="text-sm text-gray">{p.requiere_reserva ? 'Requiere Reserva' : 'Venta Directa'}</span></td>
                  <td>{p.categorias_tienda?.nombre}</td>
                  <td>${p.precio.toLocaleString('es-CL')}</td>
                  <td className="text-blue font-bold">${p.precio_final.toLocaleString('es-CL')}</td>
                  <td>{p.stock_ilimitado ? '∞' : p.stock}</td>
                  <td>
                    <span className={`badge ${p.activo ? 'bg-green' : 'bg-red'}`}>
                      {p.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button onClick={() => handleOpenModal(p)} className="action-btn edit"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(p.id)} className="action-btn delete"><Trash2 size={16} /></button>
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
            <h2>{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h2>
            
            <div className="form-grid">
              <div className="form-group col-span-2">
                <label>Nombre del Producto</label>
                <input type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
              </div>
              
              <div className="form-group col-span-2">
                <label>Descripción</label>
                <textarea rows="2" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})}></textarea>
              </div>

              <div className="form-group">
                <label>Categoría</label>
                <select value={formData.categoria_id} onChange={e => setFormData({...formData, categoria_id: e.target.value})}>
                  <option value="">Seleccionar...</option>
                  {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Precio Base</label>
                <input type="number" value={formData.precio} onChange={e => setFormData({...formData, precio: parseInt(e.target.value) || 0})} />
              </div>

              <div className="form-group checkbox-group col-span-2">
                <label>
                  <input type="checkbox" checked={formData.aplica_comision_flow} onChange={e => setFormData({...formData, aplica_comision_flow: e.target.checked})} />
                  Aplicar Comisión Flow ({formData.porcentaje_comision}%)
                </label>
              </div>

              <div className="form-group checkbox-group col-span-2">
                <label>
                  <input type="checkbox" checked={formData.requiere_reserva} onChange={e => setFormData({...formData, requiere_reserva: e.target.checked})} />
                  Requiere Reserva (Arriendo/Clase)
                </label>
              </div>

              {formData.requiere_reserva && (
                <div className="form-group col-span-2">
                  <label>Duración del Bloque (minutos)</label>
                  <input type="number" value={formData.duracion_bloque} onChange={e => setFormData({...formData, duracion_bloque: parseInt(e.target.value) || 60})} />
                </div>
              )}

              <div className="form-group">
                <label>Stock</label>
                <input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})} disabled={formData.stock_ilimitado} />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input type="checkbox" checked={formData.stock_ilimitado} onChange={e => setFormData({...formData, stock_ilimitado: e.target.checked})} />
                  Stock Ilimitado
                </label>
              </div>

              <div className="form-group col-span-2">
                <label>Imagen (JPEG recomendado)</label>
                <input type="file" accept="image/jpeg, image/png" onChange={handleImageChange} />
              </div>

              <div className="form-group checkbox-group col-span-2">
                <label>
                  <input type="checkbox" checked={formData.activo} onChange={e => setFormData({...formData, activo: e.target.checked})} />
                  Producto Activo (Visible en tienda)
                </label>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancelar</button>
              <button className="btn-save" onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar Producto'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .header-actions h1 { font-size: 20px; margin: 0; }
        .btn-primary { background: #38bdf8; color: #000; border: none; padding: 10px 16px; border-radius: 8px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 8px; }
        
        .toolbar { margin-bottom: 20px; }
        .search-box { display: flex; align-items: center; gap: 10px; background: #1a2236; padding: 10px 15px; border-radius: 8px; max-width: 300px; }
        .search-box input { background: transparent; border: none; color: #fff; outline: none; width: 100%; }

        .table-container { background: #1a2236; border-radius: 12px; overflow: hidden; }
        .erp-table { width: 100%; border-collapse: collapse; text-align: left; }
        .erp-table th { background: #0f1623; padding: 15px; font-size: 12px; text-transform: uppercase; color: #888; }
        .erp-table td { padding: 15px; border-bottom: 1px solid #2a3441; font-size: 14px; vertical-align: middle; }
        
        .td-img { width: 40px; height: 40px; object-fit: cover; border-radius: 6px; }
        .td-img-placeholder { width: 40px; height: 40px; background: #2a3441; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #888; }

        .text-sm { font-size: 12px; }
        .text-gray { color: #888; }
        .text-blue { color: #38bdf8; }
        .font-bold { font-weight: bold; }

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
        .modal-content { background: #1a2236; width: 90%; max-width: 600px; border-radius: 12px; padding: 30px; max-height: 90vh; overflow-y: auto; }
        .modal-content h2 { margin: 0 0 20px 0; font-size: 18px; }

        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .col-span-2 { grid-column: span 2; }
        
        .form-group { display: flex; flex-direction: column; gap: 5px; }
        .form-group label { font-size: 12px; color: #888; font-weight: 600; text-transform: uppercase; }
        .form-group input[type="text"], .form-group input[type="number"], .form-group select, .form-group textarea { background: #0f1623; border: 1px solid #2a3441; color: #fff; padding: 10px; border-radius: 6px; outline: none; }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #38bdf8; }
        
        .checkbox-group { flex-direction: row; align-items: center; }
        .checkbox-group label { display: flex; align-items: center; gap: 8px; cursor: pointer; color: #fff; text-transform: none; }

        .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 30px; }
        .btn-cancel { background: transparent; color: #888; border: 1px solid #888; padding: 10px 16px; border-radius: 6px; cursor: pointer; }
        .btn-save { background: #38bdf8; color: #000; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; }
        .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
