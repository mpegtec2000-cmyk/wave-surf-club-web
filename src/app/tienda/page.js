'use client';

import './tienda.css';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/lib/cart-context';
import { resolveProductImage } from '@/lib/product-images';
import { Search, ShoppingBag, X, Calendar, Clock, CreditCard, ChevronRight, User, Phone, Mail } from 'lucide-react';

const FALLBACK_PRODUCTOS = [
  {
    id: 101,
    nombre: 'Clase de Surf Personalizada (1.5 hrs)',
    descripcion: 'Clase personalizada con instructor certificado ISA, tabla y traje incluidos.',
    precio: 35000,
    precio_final: 30000,
    imagen_url: '/TIENDA/actualizacion/Clase%20personalizada%20de%20surf.png',
    stock: 20,
    activo: true,
    requiere_reserva: true,
    categorias_tienda: { slug: 'clases', nombre: 'Clases & Coaching' }
  },
  {
    id: 102,
    nombre: 'Pack 3 Clases: Surf, Bodyboard o Skate',
    descripcion: 'Pack de 3 sesiones con instructor dedicado, equipo completo e instalaciones.',
    precio: 55000,
    precio_final: 50000,
    imagen_url: '/TIENDA/actualizacion/Pack%20de%203%20clases_%20Surf%2C%20Bodyboard%20y%20Skate.png',
    stock: 15,
    activo: true,
    requiere_reserva: false,
    categorias_tienda: { slug: 'clases', nombre: 'Clases & Coaching' }
  },
  {
    id: 103,
    nombre: 'Equipo Completo Surf: Tabla + Traje',
    descripcion: 'Todo lo que necesitas para surfear en Concón o Pichilemu. Incluye instalaciones.',
    precio: 20000,
    precio_final: 18000,
    imagen_url: '/TIENDA/actualizacion/Equipo%20completo%20de%20surf%20y%20olas.png',
    stock: 50,
    activo: true,
    requiere_reserva: false,
    categorias_tienda: { slug: 'arriendos', nombre: 'Arriendos' }
  },
  {
    id: 104,
    nombre: 'Arriendo Tabla / Bodyboard / Skate',
    descripcion: 'Arriendo de tabla de surf, bodyboard o skate por sesión en nuestras sedes.',
    precio: 15000,
    precio_final: 12000,
    imagen_url: '/TIENDA/actualizacion/Arriendo%20de%20Tablas%20Wave%20Surf%20Club.png',
    stock: 30,
    activo: true,
    requiere_reserva: true,
    categorias_tienda: { slug: 'skate', nombre: 'Skate & Arriendos' }
  },
  {
    id: 105,
    nombre: 'Pack 5 Clases: Surf, Bodyboard o Skate',
    descripcion: 'La mejor relación precio-valor. Incluye todo el equipamiento y uso de instalaciones en cada sesión.',
    precio: 88000,
    precio_final: 80000,
    imagen_url: '/TIENDA/actualizacion/Pack%205%20Clases%20Surf%20Skate.png',
    stock: 20,
    activo: true,
    requiere_reserva: false,
    categorias_tienda: { slug: 'clases', nombre: 'Clases & Coaching' }
  }
];

export default function TiendaPage() {
  const { cartItems, addToCart, removeFromCart, getCartTotal, clearCart } = useCart();

  // Instant load with fallback catalog (zero broken loading screen when remote DB is offline)
  const [productos, setProductos] = useState(FALLBACK_PRODUCTOS);
  const [activeTab, setActiveTab] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [reservationModal, setReservationModal] = useState({ open: false, product: null });

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [occupiedSlots, setOccupiedSlots] = useState([]);
  const [checkingSlots, setCheckingSlots] = useState(false);

  const [cliente, setCliente] = useState({ nombre: '', apellido: '', rut: '', email: '', telefono: '' });
  const [isProcessingPago, setIsProcessingPago] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  const TIME_SLOTS = Array.from({ length: 13 }, (_, i) => {
    const hour = i + 8;
    return `${hour < 10 ? '0' : ''}${hour}:00`;
  });

  useEffect(() => {
    fetchData();
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: clienteData } = await supabase
          .from('clientes')
          .select('id, nombre, apellido, rut, email, telefono')
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
    } catch {}
  };

  const fetchData = async () => {
    try {
      const { data: prods } = await supabase
        .from('productos_tienda')
        .select('id, nombre, descripcion, precio, precio_final, imagen_url, stock, activo, categorias_tienda(slug, nombre)')
        .eq('activo', true);
      if (prods && prods.length > 0) {
        const normalizedProds = prods
          .filter((p) => {
            const n = String(p.nombre || '').toLowerCase();
            return !n.includes('hoodie oficial wave surf club') && !n.includes('polera oversize wave surf club');
          })
          .map((p) => ({
            ...p,
            imagen_url: resolveProductImage(p),
          }));
        setProductos(normalizedProds);
      }
    } catch {}
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
      setOccupiedSlots(data ? data.map((r) => r.hora_inicio?.substring(0, 5) || '') : []);
    } catch {
      setOccupiedSlots([]);
    } finally {
      setCheckingSlots(false);
    }
  };

  const handleAddToCart = (product) => {
    if (!product) return;
    if (product.requiere_reserva) {
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
    const parts = String(selectedTime).split(':');
    const hour = parseInt(parts[0], 10) || 8;
    const min = parseInt(parts[1], 10) || 0;
    const endDate = new Date(2000, 0, 1, hour, min);
    endDate.setMinutes(endDate.getMinutes() + (parseInt(reservationModal.product.duracion_bloque, 10) || 60));
    const hora_fin = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

    addToCart({
      ...reservationModal.product,
      cartItemId: Date.now(),
      reserva: { fecha: selectedDate, hora_inicio: selectedTime, hora_fin }
    });
    setReservationModal({ open: false, product: null });
    setCartOpen(true);
  };

  const handleCheckout = async () => {
    if (!cliente.nombre || !cliente.rut || !cliente.email || !cliente.telefono) {
      setCheckoutError('Por favor completa todos tus datos personales');
      return;
    }
    setIsProcessingPago(true);
    setCheckoutError('');
    try {
      const subtotal = cartItems.reduce((acc, item) => acc + (item.precio || item.price || 0), 0);
      const total = cartItems.reduce((acc, item) => acc + (item.precio_final || item.price || 0), 0);
      const reservas = cartItems
        .filter((item) => item.requiere_reserva && item.reserva)
        .map((item) => ({
          producto_id: item.id,
          fecha: item.reserva.fecha,
          hora_inicio: item.reserva.hora_inicio,
          hora_fin: item.reserva.hora_fin
        }));

      const res = await fetch('/api/flow/crear-orden', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productos: cartItems, cliente, subtotal, total, reservas })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al iniciar pago');
      clearCart();
      window.location.href = data.url;
    } catch (e) {
      setCheckoutError(e.message);
      setIsProcessingPago(false);
    }
  };

  const filteredProducts = productos.filter((p) => {
    if (!p) return false;
    if (activeTab !== 'todos') {
      const slug = String(p.categorias_tienda?.slug || '').toLowerCase().trim();
      const catName = String(p.categorias_tienda?.nombre || '').toLowerCase().trim();
      if (activeTab === 'ropa') {
        const ropaSubcats = ['ropa', 'poleras', 'polerones', 'pantalones', 'shorts', 'gorros', 'trajes', 'merch', 'vestuario'];
        const isRopa = ropaSubcats.some((k) => slug.includes(k) || catName.includes(k));
        if (!isRopa) return false;
      } else if (activeTab === 'arriendo') {
        if (!slug.includes('arriendo') && !catName.includes('arriendo')) return false;
      } else if (slug !== activeTab && !catName.includes(activeTab)) {
        return false;
      }
    }
    if (searchTerm && !(p.nombre || '').toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const TABS = [
    { id: 'todos', label: 'TODOS' },
    { id: 'clases', label: 'CLASES' },
    { id: 'arriendo', label: 'ARRIENDO' },
    { id: 'skate', label: 'SKATE' },
    { id: 'taller', label: 'TALLER' },
    { id: 'ropa', label: 'ROPA' }
  ];

  return (
    <div className="td-root">
      <Navbar />

      <div className="td-bg-wrap" aria-hidden="true">
        <Image
          src="/fondo%20andy.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: 'center 25%' }}
        />
        <div className="td-bg-overlay" />
      </div>

      <main className="td-main">
        <div className="td-header">
          <div className="td-header-inner">
            <span className="td-kicker">WAVE SURF CLUB® · DROP &amp; SESIONES</span>
            <h1>CATÁLOGO OFICIAL</h1>
            <p className="td-subtitle">
              Ropa streetwear, clases con instructores ISA, arriendo de equipos y reparaciones técnicas.
            </p>
            <div className="td-hours-bar">
              <div className="td-h-item"><Clock size={14} /><span>OPEN <strong>08:00 AM</strong></span></div>
              <div className="td-h-item"><Calendar size={14} /><span>CLASES <strong>08:00 - 20:00</strong></span></div>
              <div className="td-h-item"><User size={14} /><span>CLOSE <strong>22:00 PM</strong></span></div>
            </div>
          </div>
        </div>

        <div className="td-toolbar">
          <div className="td-toolbar-inner">
            <div className="td-tabs">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`td-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="td-search">
              <Search size={15} />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="td-container">
          {filteredProducts.length > 0 ? (
            <div className="td-grid">
              {filteredProducts.map((prod) => (
                <article key={prod.id} className="td-card">
                  <div className="td-card-img">
                    {prod.imagen_url ? (
                      <img src={prod.imagen_url} alt={prod.nombre} />
                    ) : (
                      <div className="td-img-ph">WAVE®</div>
                    )}
                  </div>
                  <div className="td-card-body">
                    <span className="td-cat-badge">{prod.categorias_tienda?.nombre || 'Wave'}</span>
                    <h3>{prod.nombre}</h3>
                    <p>{prod.descripcion}</p>
                    <div className="td-price-row">
                      <strong>${(prod.precio_final || 0).toLocaleString('es-CL')}</strong>
                      {prod.precio && prod.precio > prod.precio_final && (
                        <span>${prod.precio.toLocaleString('es-CL')}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      className="td-add-btn"
                      onClick={() => handleAddToCart(prod)}
                      disabled={prod.stock === 0 && !prod.stock_ilimitado}
                    >
                      {prod.requiere_reserva ? 'RESERVAR HORARIO' : 'AGREGAR AL CARRO'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="td-empty">No se encontraron productos para esta selección.</div>
          )}
        </div>
      </main>

      <button type="button" className="td-float-cart" onClick={() => setCartOpen(true)} aria-label="Abrir carrito">
        <ShoppingBag size={22} />
        {cartItems.length > 0 && <span className="td-float-badge">{cartItems.length}</span>}
      </button>

      {cartOpen && (
        <div className="td-drawer-overlay" onClick={() => setCartOpen(false)}>
          <div className="td-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="td-drawer-head">
              <h2>TU BOLSA</h2>
              <button type="button" onClick={() => setCartOpen(false)}><X size={20} /></button>
            </div>

            <div className="td-drawer-items">
              {cartItems.length === 0 ? (
                <div className="td-drawer-empty">Tu bolsa está vacía.</div>
              ) : (
                cartItems.map((item, idx) => (
                  <div key={item.cartItemId || idx} className="td-drawer-item">
                    <div>
                      <h4>{item.nombre || item.name}</h4>
                      {item.reserva && <small>{item.reserva.fecha} · {item.reserva.hora_inicio}</small>}
                      <strong>${(item.precio_final || item.price || 0).toLocaleString('es-CL')}</strong>
                    </div>
                    <button type="button" onClick={() => removeFromCart(item.cartItemId)}><X size={16} /></button>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="td-drawer-foot">
                <div className="td-drawer-total">
                  <span>TOTAL</span>
                  <strong>${(getCartTotal() || 0).toLocaleString('es-CL')}</strong>
                </div>

                <div className="td-checkout-fields">
                  <div className="td-inp-row"><User size={14} /><input type="text" placeholder="Nombre completo" value={cliente.nombre} onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })} /></div>
                  <div className="td-inp-row"><CreditCard size={14} /><input type="text" placeholder="RUT (ej: 12.345.678-9)" value={cliente.rut} onChange={(e) => setCliente({ ...cliente, rut: e.target.value })} /></div>
                  <div className="td-inp-row"><Mail size={14} /><input type="email" placeholder="Correo electrónico" value={cliente.email} onChange={(e) => setCliente({ ...cliente, email: e.target.value })} /></div>
                  <div className="td-inp-row"><Phone size={14} /><input type="tel" placeholder="Teléfono" value={cliente.telefono} onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })} /></div>
                </div>

                {checkoutError && <div className="td-err">{checkoutError}</div>}

                <button type="button" className="td-flow-btn" onClick={handleCheckout} disabled={isProcessingPago}>
                  <span>{isProcessingPago ? 'PROCESANDO...' : 'PAGAR CON FLOW'}</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {reservationModal.open && reservationModal.product && (
        <div className="td-modal-overlay" onClick={() => setReservationModal({ open: false, product: null })}>
          <div className="td-modal" onClick={(e) => e.stopPropagation()}>
            <div className="td-modal-head">
              <h3>RESERVAR: {reservationModal.product.nombre}</h3>
              <button type="button" onClick={() => setReservationModal({ open: false, product: null })}><X size={18} /></button>
            </div>
            <div className="td-modal-body">
              <label>1. SELECCIONA EL DÍA</label>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(''); }}
              />
              <label style={{ marginTop: 20 }}>2. SELECCIONA LA HORA</label>
              {checkingSlots ? (
                <p className="td-muted">Verificando disponibilidad...</p>
              ) : (
                <div className="td-slots">
                  {TIME_SLOTS.map((time) => {
                    const isOccupied = occupiedSlots.includes(time);
                    const isSelected = selectedTime === time;
                    return (
                      <button
                        key={time}
                        type="button"
                        disabled={isOccupied}
                        onClick={() => !isOccupied && setSelectedTime(time)}
                        className={`td-slot ${isSelected ? 'selected' : ''} ${isOccupied ? 'occupied' : ''}`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              )}
              <button
                type="button"
                className="td-confirm-btn"
                disabled={!selectedDate || !selectedTime}
                onClick={handleConfirmReservation}
              >
                CONFIRMAR HORARIO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
