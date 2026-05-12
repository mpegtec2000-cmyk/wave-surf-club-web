'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/lib/cart-context';
import { Search, ShoppingBag, X, Calendar, Clock, CreditCard, ChevronRight, User, Phone, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TiendaPage() {
  const { cartItems, addToCart, removeFromCart, getCartTotal, clearCart } = useCart();
  const router = useRouter();

  // Hydration safety
  const [mounted, setMounted] = useState(false);

  // Data states
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [activeTab, setActiveTab] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  // UI states
  const [cartOpen, setCartOpen] = useState(false);
  const [reservationModal, setReservationModal] = useState({ open: false, product: null });
  
  // Reservation states
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [occupiedSlots, setOccupiedSlots] = useState([]);
  const [checkingSlots, setCheckingSlots] = useState(false);

  // Client checkout data
  const [cliente, setCliente] = useState({ nombre: '', apellido: '', rut: '', email: '', telefono: '' });
  const [isProcessingPago, setIsProcessingPago] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // Generate time slots 08:00 to 20:00
  const TIME_SLOTS = Array.from({ length: 13 }, (_, i) => {
    const hour = i + 8;
    return `${hour < 10 ? '0' : ''}${hour}:00`;
  });

  useEffect(() => {
    setMounted(true);
    fetchData();
    checkUser();

    // Global error listener for debugging
    const handleError = (e) => {
      console.error("CRASH DETECTADO:", e);
      // alert("Error en página: " + (e.message || "Error desconocido"));
    };
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: clienteData } = await supabase
          .from('clientes')
          .select('*')
          .eq('auth_user_id', user.id)
          .maybeSingle();
        
        if (clienteData) {
          setCliente({
            nombre: clienteData.nombre || '',
            apellido: clienteData.apellido || '',
            rut: clienteData.rut || '',
            email: clienteData.email || '',
            telefono: clienteData.telefono || ''
          });
        }
      }
    } catch (e) {
      console.warn("User session check failed", e);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [{ data: cats }, { data: prods }] = await Promise.all([
        supabase.from('categorias_tienda').select('*').eq('activa', true).order('orden'),
        supabase.from('productos_tienda').select('*, categorias_tienda(slug, nombre)').eq('activo', true)
      ]);
      setCategorias(cats || []);
      setProductos(prods || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate && reservationModal.product) {
      checkAvailability(selectedDate, reservationModal.product.id);
    }
  }, [selectedDate, reservationModal.product]);

  const checkAvailability = async (fecha, productoId) => {
    setCheckingSlots(true);
    try {
      const { data } = await supabase
        .from('reservas')
        .select('hora_inicio')
        .eq('producto_id', productoId)
        .eq('fecha', fecha)
        .in('estado', ['pendiente', 'confirmada']);
      
      if (data) {
        setOccupiedSlots(data.map(r => r.hora_inicio?.substring(0, 5) || ''));
      } else {
        setOccupiedSlots([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCheckingSlots(false);
    }
  };

  const handleAddToCart = (product) => {
    if (!product) return;
    if (product.requiere_reserva) {
      // Get tomorrow's date as default
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setSelectedDate(tomorrow.toISOString().split('T')[0]);
      setSelectedTime('');
      setReservationModal({ open: true, product });
    } else {
      addToCart({ ...product, cartItemId: Date.now() });
      setCartOpen(true);
    }
  };

  const handleConfirmReservation = () => {
    if (!selectedDate || !selectedTime || !reservationModal.product) return;
    
    try {
      // Calculate end time
      const timeStr = String(selectedTime || "08:00");
      const parts = timeStr.split(':');
      if (parts.length < 2) throw new Error("Invalid time format");
      
      const hour = parseInt(parts[0]) || 8;
      const min = parseInt(parts[1]) || 0;
      
      const endDate = new Date(2000, 0, 1, hour, min);
      const duration = parseInt(reservationModal.product.duracion_bloque) || 60;
      endDate.setMinutes(endDate.getMinutes() + duration);
      
      const hora_fin = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

      addToCart({ 
        ...reservationModal.product, 
        cartItemId: Date.now(),
        reserva: {
          fecha: selectedDate,
          hora_inicio: selectedTime,
          hora_fin: hora_fin
        }
      });
      
      setReservationModal({ open: false, product: null });
      setCartOpen(true);
    } catch (e) {
      console.error("Reservation confirm failed", e);
      // Fallback: add anyway without end time if calculation fails
      addToCart({ 
        ...reservationModal.product, 
        cartItemId: Date.now(),
        reserva: {
          fecha: selectedDate,
          hora_inicio: selectedTime,
          hora_fin: selectedTime // fallback
        }
      });
      setReservationModal({ open: false, product: null });
      setCartOpen(true);
    }
  };

  const handleCheckout = async () => {
    if (!cliente.nombre || !cliente.rut || !cliente.email || !cliente.telefono) {
      setCheckoutError('Por favor completa todos tus datos personales');
      return;
    }
    
    setIsProcessingPago(true);
    setCheckoutError('');

    try {
      // Calculate totals
      const subtotal = cartItems.reduce((acc, item) => acc + (item.precio || 0), 0);
      const total = cartItems.reduce((acc, item) => acc + (item.precio_final || 0), 0);

      const reservas = cartItems
        .filter(item => item.requiere_reserva && item.reserva)
        .map(item => ({
          producto_id: item.id,
          fecha: item.reserva.fecha,
          hora_inicio: item.reserva.hora_inicio,
          hora_fin: item.reserva.hora_fin
        }));

      const body = {
        productos: cartItems,
        cliente,
        subtotal,
        total,
        reservas
      };

      const res = await fetch('/api/flow/crear-orden', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Error al iniciar pago');
      
      // Clear cart before redirecting
      clearCart();
      window.location.href = data.url;

    } catch (e) {
      setCheckoutError(e.message);
      setIsProcessingPago(false);
    }
  };

  if (!mounted) return <div className="loading-full">Cargando Tienda Wave Surf...</div>;

  // Filter products
  const filteredProducts = productos.filter(p => {
    if (!p) return false;
    
    // Group logic
    if (activeTab !== 'todos') {
      const slug = p.categorias_tienda?.slug;
      if (activeTab === 'ropa') {
        const ropaSubcats = ['poleras', 'polerones', 'pantalones', 'shorts', 'gorros', 'trajes'];
        if (!ropaSubcats.includes(slug)) return false;
      } else if (activeTab === 'arriendo') {
        if (slug !== 'arriendos') return false;
      } else if (activeTab === 'clases') {
        if (slug !== 'clases') return false;
      } else if (activeTab === 'bodega') {
        if (slug !== 'bodega') return false;
      } else {
        // Fallback for other categories if they exist
        if (slug !== activeTab) return false;
      }
    }

    if (searchTerm && !(p.nombre || '').toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <Navbar />
      <main className="tienda-main">
        {/* HEADER SECTION */}
        <div className="tienda-header-premium">
          <div className="header-overlay"></div>
          <div className="tienda-header-content">
            <span className="pre-title">WAVE SURF CLUB</span>
            <h1>CATÁLOGO OFICIAL</h1>
            <p className="subtitle">Explora nuestra colección de ropa, agenda tus clases y asegura tu cupo en la bodega.</p>
            
            <div className="horarios-box-modern">
              <div className="horarios-grid">
                <div className="h-item">
                  <Clock size={16} />
                  <div className="h-info"><span>OPEN</span><strong>08:00 AM</strong></div>
                </div>
                <div className="h-item">
                  <Calendar size={16} />
                  <div className="h-info"><span>CLASES</span><strong>08:00 - 20:00</strong></div>
                </div>
                <div className="h-item">
                  <User size={16} />
                  <div className="h-info"><span>CLOSE</span><strong>22:00 PM</strong></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TOOLBAR (TABS & SEARCH) */}
        <div className="tienda-toolbar">
          <div className="toolbar-inner">
            {/* Category scroll */}
            <div className="tabs-scroll-wrapper">
              <div className="tabs-container">
                {[
                  { id: 'todos', label: 'TODOS' },
                  { id: 'ropa', label: 'ROPA' },
                  { id: 'clases', label: 'CLASES' },
                  { id: 'arriendo', label: 'ARRIENDO' },
                  { id: 'bodega', label: 'BODEGA' }
                ].map(tab => (
                  <button 
                    key={tab.id}
                    className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Search */}
            <div className="search-box">
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Buscar productos..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* PRODUCT GRID */}
        <div className="container product-grid-container">
          {loading ? (
            <div className="loading-state">Cargando catálogo...</div>
          ) : filteredProducts.length > 0 ? (
            <div className="product-grid">
              {filteredProducts.map(prod => (
                <div key={prod.id} className="product-card">
                  <div className="product-image">
                    {prod.imagen_url ? (
                      <img src={prod.imagen_url} alt={prod.nombre} />
                    ) : (
                      <div className="image-placeholder">{prod.categorias_tienda?.nombre || 'Producto'}</div>
                    )}
                  </div>
                  <div className="product-info">
                    <span className="product-cat">{prod.categorias_tienda?.nombre}</span>
                    <h3 className="product-name">{prod.nombre}</h3>
                    <p className="product-desc">{prod.descripcion}</p>
                    
                    <div className="product-price-box">
                      <div className="price-final">
                        ${(prod.precio_final || 0).toLocaleString('es-CL')}
                      </div>
                      {prod.aplica_comision_flow && (
                        <div className="price-comision">
                          Precio base ${(prod.precio || 0).toLocaleString('es-CL')} + {prod.porcentaje_comision}% comisión Flow
                        </div>
                      )}
                    </div>
                    
                    <button 
                      className="btn-add" 
                      onClick={() => handleAddToCart(prod)}
                      disabled={prod.stock === 0 && !prod.stock_ilimitado}
                    >
                      {prod.requiere_reserva ? 'RESERVAR' : 'AGREGAR AL CARRO'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              No se encontraron productos para tu búsqueda.
            </div>
          )}
        </div>
      </main>

      {/* FLOATING CART BUTTON */}
      <button className="floating-cart-btn" onClick={() => setCartOpen(true)}>
        <ShoppingBag size={24} />
        {cartItems.length > 0 && <span className="cart-badge">{cartItems.length}</span>}
      </button>

      {/* CART DRAWER */}
      <div className={`cart-drawer-overlay ${cartOpen ? 'open' : ''}`} onClick={() => setCartOpen(false)}>
        <div className="cart-drawer" onClick={e => e.stopPropagation()}>
          <div className="cart-header">
            <h2>Tu Carrito</h2>
            <button className="close-btn" onClick={() => setCartOpen(false)}><X size={20} /></button>
          </div>

          <div className="cart-items">
            {cartItems.length === 0 ? (
              <div className="cart-empty">Tu carrito está vacío.</div>
            ) : (
              cartItems.map((item, idx) => (
                <div key={item.cartItemId || idx} className="cart-item">
                  <div className="item-details">
                    <h4>{String(item?.nombre || 'Producto')}</h4>
                    {item?.reserva && (
                      <div className="item-reserva">
                        {String(item.reserva.fecha || '')} | {String(item.reserva.hora_inicio || '')}
                      </div>
                    )}
                    <div className="item-price">${String(item?.precio_final || 0)}</div>
                  </div>
                  <button className="item-remove" onClick={() => removeFromCart(item.cartItemId)}>
                    <X size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="cart-footer">
              <div className="cart-total">
                <span>Total a pagar</span>
                <strong>${(getCartTotal() || 0).toLocaleString('es-CL')}</strong>
              </div>

              <div className="checkout-form">
                <h3>Tus Datos</h3>
                <div className="c-form-group">
                  <User size={14} />
                  <input type="text" placeholder="Nombre completo" value={cliente.nombre} onChange={e => setCliente({...cliente, nombre: e.target.value})} />
                </div>
                <div className="c-form-group">
                  <CreditCard size={14} />
                  <input type="text" placeholder="RUT (ej: 12.345.678-9)" value={cliente.rut} onChange={e => setCliente({...cliente, rut: e.target.value})} />
                </div>
                <div className="c-form-group">
                  <Mail size={14} />
                  <input type="email" placeholder="Correo electrónico" value={cliente.email} onChange={e => setCliente({...cliente, email: e.target.value})} />
                </div>
                <div className="c-form-group">
                  <Phone size={14} />
                  <input type="tel" placeholder="Teléfono" value={cliente.telefono} onChange={e => setCliente({...cliente, telefono: e.target.value})} />
                </div>
              </div>

              {checkoutError && <div className="checkout-error">{checkoutError}</div>}

              <button className="btn-flow" onClick={handleCheckout} disabled={isProcessingPago}>
                {isProcessingPago ? 'PROCESANDO...' : 'PAGAR CON FLOW (DÉBITO)'}
                {!isProcessingPago && <ChevronRight size={18} />}
              </button>
              <div className="flow-disclaimer">Pago 100% seguro con débito. Procesado por Flow.</div>
            </div>
          )}
        </div>
      </div>

      {/* RESERVATION MODAL */}
      {reservationModal.open && reservationModal.product && (
        <div className="modal-overlay" onClick={() => setReservationModal({ open: false, product: null })}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reservar: {reservationModal.product.nombre}</h3>
              <button className="close-btn" onClick={() => setReservationModal({ open: false, product: null })}><X size={20} /></button>
            </div>
            
            <div className="modal-body">
              <div className="date-picker-section">
                <label>1. Selecciona el día</label>
                <input 
                  type="date" 
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => { setSelectedDate(e.target.value); setSelectedTime(''); }}
                  className="date-input"
                />
              </div>

              <div className="time-picker-section">
                <label>2. Selecciona la hora</label>
                {checkingSlots ? (
                  <div className="slots-loading">Verificando disponibilidad...</div>
                ) : (
                  <div className="time-slots">
                    {TIME_SLOTS.map(time => {
                      const isOccupied = occupiedSlots.includes(time);
                      const isSelected = selectedTime === time;
                      return (
                        <button
                          key={time}
                          className={`time-slot ${isOccupied ? 'occupied' : ''} ${isSelected ? 'selected' : ''}`}
                          disabled={isOccupied}
                          onClick={() => !isOccupied && setSelectedTime(time)}
                        >
                          {time}
                          {isOccupied && <span>Ocupado</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-confirm-reservation"
                onClick={handleConfirmReservation}
                disabled={!selectedDate || !selectedTime}
              >
                CONFIRMAR HORARIO
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .loading-full {
          min-height: 100vh;
          background: #000;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-sans);
          font-weight: 800;
          letter-spacing: 2px;
        }
        .tienda-main {
          min-height: 100vh;
          background: #000;
          color: #fff;
          background: #fff;
          color: #0f172a;
          min-height: 100vh;
          font-family: var(--font-sans);
          padding-bottom: 100px;
          margin-top: 95px; /* Navbar space */
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .tienda-header-premium {
          position: relative;
          background: #fff;
          padding: 120px 20px 80px;
          text-align: center;
          overflow: hidden;
          border-bottom: 1px solid #eee;
        }

        .header-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.05) 0%, transparent 70%);
          opacity: 0.5;
        }

        .tienda-header-content {
          position: relative;
          z-index: 2;
          max-width: 800px;
          margin: 0 auto;
        }

        .pre-title {
          display: block;
          font-size: 12px;
          letter-spacing: 6px;
          color: #0ea5e9;
          font-weight: 900;
          margin-bottom: 15px;
        }

        .tienda-header-content h1 {
          font-size: 64px;
          font-weight: 950;
          letter-spacing: -2px;
          margin-bottom: 20px;
          color: #0f172a;
        }

        .tienda-header-content .subtitle {
          font-size: 18px;
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 40px;
        }

        .horarios-box-modern {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 20px 40px;
          display: inline-block;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .horarios-grid {
          display: flex;
          gap: 40px;
        }

        .h-item {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #0f172a;
        }

        .h-info {
          text-align: left;
        }

        .h-info span {
          display: block;
          font-size: 9px;
          color: #94a3b8;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .h-info strong {
          font-size: 16px;
          font-weight: 900;
          color: #0f172a;
        }

        .tienda-toolbar {
          position: sticky;
          top: 95px;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid #eee;
          z-index: 50;
          padding: 12px 0;
        }

        .toolbar-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        /* Fade-edge scroll wrapper */
        .tabs-scroll-wrapper {
          flex: 1;
          position: relative;
          min-width: 0;
        }

        .tabs-container {
          display: flex;
          gap: 12px;
          padding: 5px;
          justify-content: center;
        }

        .tab-btn {
          background: #f8fafc;
          color: #64748b;
          border: none;
          padding: 10px 24px;
          border-radius: 50px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.3s;
          white-space: nowrap;
          border: 1px solid #e2e8f0;
        }

        .tab-btn:hover {
          color: #0f172a;
          background: #f1f5f9;
          border-color: #cbd5e1;
        }

        .tab-btn.active {
          background: #0ea5e9;
          color: #fff;
          box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3);
          border-color: #0ea5e9;
        }

        .search-box {
          display: flex;
          align-items: center;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 0 15px;
          width: 250px;
          flex-shrink: 0;
        }

        .search-box input {
          background: transparent;
          border: none;
          color: #0f172a;
          padding: 10px;
          width: 100%;
          outline: none;
          font-size: 13px;
        }

        .search-box input::placeholder { color: #666; }

        .product-grid-container {
          margin-top: 40px;
        }

        .loading-state, .empty-state {
          text-align: center;
          color: #888;
          padding: 60px 0;
          font-size: 14px;
        }

        .product-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .product-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .product-card:hover {
          border-color: #0ea5e9;
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.1), 0 0 20px rgba(14, 165, 233, 0.05);
        }

        .product-image {
          aspect-ratio: 1;
          background: #111;
          position: relative;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
        }

        .product-card:hover .product-image img {
          transform: scale(1.1);
        }

        .image-placeholder {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #333;
          font-weight: 800;
          font-size: 24px;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .product-info {
          padding: 20px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .product-cat {
          font-size: 10px;
          color: #38bdf8;
          text-transform: uppercase;
          font-weight: 800;
          letter-spacing: 1px;
          margin-bottom: 6px;
        }

        .product-name {
          font-size: 16px;
          font-weight: 800;
          margin: 0 0 8px 0;
          line-height: 1.2;
          color: #0f172a;
        }

        .product-desc {
          font-size: 12px;
          color: #64748b;
          line-height: 1.4;
          margin: 0 0 20px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-price-box {
          margin-top: auto;
          margin-bottom: 15px;
        }

        .price-final {
          font-size: 20px;
          font-weight: 900;
          color: #0f172a;
        }

        .price-comision {
          font-size: 10px;
          color: #666;
          margin-top: 4px;
        }

        .btn-add {
          width: 100%;
          padding: 12px;
          background: #0f172a;
          color: #fff;
          border: none;
          border-radius: 12px;
          font-weight: 800;
          font-size: 12px;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-add:hover:not(:disabled) {
          background: #0ea5e9;
          transform: scale(1.02);
        }

        .btn-add:disabled {
          background: #222;
          color: #555;
          cursor: not-allowed;
        }

        .floating-cart-btn {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 60px;
          height: 60px;
          background: #38bdf8;
          color: #000;
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 10px 30px rgba(56, 189, 248, 0.3);
          z-index: 100;
          transition: all 0.2s;
        }

        .floating-cart-btn:hover {
          transform: scale(1.05);
        }

        .cart-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #fff;
          color: #000;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 900;
          border: 2px solid #000;
        }

        /* DRAWER & MODAL */
        .cart-drawer-overlay, .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(5px);
          z-index: 1000;
          opacity: 0;
          pointer-events: none;
          transition: all 0.3s;
        }
        .cart-drawer-overlay.open, .modal-overlay {
          opacity: 1;
          pointer-events: auto;
        }

        .cart-drawer {
          position: absolute;
          top: 0;
          right: -400px;
          width: 100%;
          max-width: 400px;
          height: 100%;
          background: #0a0a0a;
          border-left: 1px solid #222;
          display: flex;
          flex-direction: column;
          transition: right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .cart-drawer-overlay.open .cart-drawer {
          right: 0;
        }

        .cart-header {
          padding: 20px;
          border-bottom: 1px solid #222;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .cart-header h2 { margin: 0; font-size: 18px; }
        .close-btn { background: none; border: none; color: #888; cursor: pointer; padding: 5px; }
        .close-btn:hover { color: #fff; }

        .cart-items {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }

        .cart-empty { color: #666; text-align: center; padding: 40px 0; }

        .cart-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 15px 0;
          border-bottom: 1px solid #1a1a1a;
        }

        .item-details h4 { margin: 0 0 5px 0; font-size: 14px; }
        .item-reserva { font-size: 11px; color: #38bdf8; display: flex; align-items: center; gap: 4px; margin-bottom: 5px; }
        .item-price { font-size: 14px; font-weight: 800; }
        .item-remove { background: none; border: none; color: #ff4444; cursor: pointer; }

        .cart-footer {
          padding: 20px;
          border-top: 1px solid #222;
          background: #111;
        }

        .cart-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          font-size: 18px;
        }

        .cart-total strong { font-size: 24px; color: #38bdf8; }

        .checkout-form {
          margin-bottom: 20px;
        }

        .checkout-form h3 { font-size: 12px; text-transform: uppercase; color: #888; margin: 0 0 10px 0; }

        .c-form-group {
          display: flex;
          align-items: center;
          background: #000;
          border: 1px solid #222;
          border-radius: 6px;
          padding: 0 12px;
          margin-bottom: 10px;
        }

        .c-form-group svg { color: #666; }

        .c-form-group input {
          background: transparent;
          border: none;
          color: #fff;
          padding: 12px;
          width: 100%;
          outline: none;
          font-size: 13px;
        }

        .btn-flow {
          width: 100%;
          background: #10b981;
          color: #fff;
          border: none;
          padding: 16px;
          border-radius: 8px;
          font-weight: 900;
          font-size: 14px;
          letter-spacing: 1px;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          transition: all 0.2s;
        }

        .btn-flow:hover:not(:disabled) { background: #059669; }
        .btn-flow:disabled { opacity: 0.7; cursor: not-allowed; }

        .flow-disclaimer {
          text-align: center;
          font-size: 10px;
          color: #666;
          margin-top: 10px;
        }

        .checkout-error {
          color: #ff4444;
          font-size: 12px;
          text-align: center;
          margin-bottom: 10px;
        }

        .modal-content {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: #0a0a0a;
          border: 1px solid #222;
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          overflow: hidden;
        }

        .modal-header {
          padding: 20px;
          border-bottom: 1px solid #222;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h3 { margin: 0; font-size: 16px; color: #fff; }
        
        .modal-body { padding: 20px; }

        .date-picker-section, .time-picker-section { margin-bottom: 25px; }

        .date-picker-section label, .time-picker-section label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: #888;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .date-input {
          width: 100%;
          background: #111;
          border: 1px solid #333;
          color: #fff;
          padding: 14px;
          border-radius: 8px;
          outline: none;
          font-family: inherit;
        }

        .time-slots {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }

        .slots-loading {
          color: #888;
          font-size: 12px;
        }

        .time-slot {
          background: #111;
          border: 1px solid #222;
          color: #fff;
          padding: 12px 5px;
          border-radius: 6px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .time-slot:hover:not(:disabled) {
          border-color: #38bdf8;
          background: #152530;
        }

        .time-slot.selected {
          background: #38bdf8;
          color: #000;
          border-color: #38bdf8;
        }

        .time-slot:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: #000;
          border-color: #111;
        }

        .time-slot span { font-size: 9px; text-transform: uppercase; color: #ff4444; }

        .modal-footer {
          padding: 20px;
          border-top: 1px solid #222;
          background: #111;
        }

        .btn-confirm-reservation {
          width: 100%;
          background: #38bdf8;
          color: #000;
          border: none;
          padding: 16px;
          border-radius: 8px;
          font-weight: 900;
          font-size: 13px;
          letter-spacing: 1px;
          cursor: pointer;
        }

        .btn-confirm-reservation:disabled {
          background: #222;
          color: #555;
        }

        /* ============================================ */
        /* RESPONSIVE — TABLET (≤ 1024px)               */
        /* ============================================ */
        @media (max-width: 1024px) {
          .product-grid { grid-template-columns: repeat(2, 1fr); }
          .toolbar-inner { flex-wrap: wrap; gap: 10px; }
          .tabs-scroll-wrapper { order: 1; width: 100%; }
          .search-box { order: 2; width: 100%; }
        }

        /* ============================================ */
        /* RESPONSIVE — MOBILE (≤ 768px)                */
        /* ============================================ */
        @media (max-width: 768px) {
          .tienda-main { margin-top: 70px; }
          .tienda-toolbar { top: 70px; padding: 10px 0; }
          .toolbar-inner {
            padding: 0 12px;
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }
          .tabs-scroll-wrapper { width: 100%; }
          .tabs-container { gap: 8px; padding: 2px 4px; }
          .tab-btn {
            padding: 8px 14px;
            font-size: 11px;
          }
          .search-box {
            width: 100%;
            padding: 0 12px;
          }
          .search-box input { font-size: 13px; padding: 9px; }
          .product-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .tienda-header { padding: 40px 16px; }
          .horarios-grid { grid-template-columns: repeat(3, 1fr); }
        }

        /* ============================================ */
        /* RESPONSIVE — SMALL MOBILE (≤ 430px)          */
        /* iPhone 12 Pro Max y similares                */
        /* ============================================ */
        @media (max-width: 430px) {
          .tienda-main { margin-top: 70px; }
          .tienda-toolbar { top: 70px; }
          .toolbar-inner { padding: 0 10px; gap: 8px; }
          .tab-btn {
            padding: 7px 12px;
            font-size: 10px;
            letter-spacing: 0.5px;
          }
          .search-box { border-radius: 12px; }
          .product-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
          .product-info { padding: 14px; }
          .product-name { font-size: 13px; }
          .product-desc { font-size: 11px; }
          .price-final { font-size: 16px; }
          .btn-add { font-size: 11px; padding: 10px; }
          .horarios-grid { grid-template-columns: repeat(3, 1fr); }
          .h-item { padding: 10px 6px; }
          .h-item strong { font-size: 13px; }
          .tienda-header { padding: 28px 12px; }
          .tienda-header h1 { font-size: clamp(20px, 5vw, 32px); }
          .time-slots { grid-template-columns: repeat(3, 1fr); gap: 8px; }
          .product-grid-container { margin-top: 20px; }
        }
      `}</style>
    </>
  );
}
