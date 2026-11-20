'use client';

import './cart.css';

import { useCart } from '@/lib/cart-context';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import {
  ShoppingCart,
  Trash2,
  ChevronLeft,
  ShieldCheck,
  Building2,
  Clock,
  MapPin,
  Users,
  AlertCircle,
  CreditCard
} from 'lucide-react';
import { useState } from 'react';

export default function CartPage() {
  const { cartItems, total, removeFromCart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('webpay');

  const safeItems = Array.isArray(cartItems) ? cartItems : [];

  const handleProcessWebPayment = async () => {
    if (safeItems.length === 0) return;
    setLoading(true);
    setError(null);

    if (selectedMethod === 'transfer') {
      window.location.href = '/checkout?method=transfer';
      return;
    }

    try {
      const response = await fetch('/api/checkout/flow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          email: safeItems[0]?.metadata?.email || 'pago@web.cl',
          subject: 'Compra en Wave Surf Club',
          items: safeItems.map((i) => ({ name: i.name || i.nombre, price: i.price || i.precio_final || 0 })),
          metadata: safeItems[0]?.metadata
        })
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Error al conectar con Flow');
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="cp-root">
      <Navbar />

      <main className="cp-container">
        <div className="cp-header">
          <Link href="/tienda" className="cp-back">
            <ChevronLeft size={15} /> VOLVER A LA TIENDA
          </Link>
          <h1>MI BOLSA DE COMPRAS®</h1>
          <p>Revisa tu selección y elige tu medio de pago para confirmar.</p>
        </div>

        <div className="cp-layout">
          <div className="cp-items-col">
            {safeItems.length === 0 ? (
              <div className="cp-empty">
                <ShoppingCart size={44} />
                <h2>TU BOLSA ESTÁ VACÍA</h2>
                <p>Añade clases o productos de la tienda para comenzar.</p>
                <div className="cp-empty-btns">
                  <Link href="/agenda" className="cp-btn-black">AGENDAR CLASE</Link>
                  <Link href="/tienda" className="cp-btn-outline">VER TIENDA</Link>
                </div>
              </div>
            ) : (
              <>
                <div className="cp-list">
                  {safeItems.map((item, idx) => (
                    <div key={item.cartItemId || idx} className="cp-item-card">
                      <div className="cp-item-info">
                        <span className="cp-cat">{item.category || item.categoria || 'Wave Surf Club'}</span>
                        <h3>{item.name || item.nombre}</h3>
                        {item.metadata && (
                          <div className="cp-meta">
                            {item.metadata.date && <span><Clock size={12} /> {item.metadata.date} · {item.metadata.time}</span>}
                            {item.metadata.sede && <span><MapPin size={12} /> {item.metadata.sede}</span>}
                            {item.metadata.alumnos && <span><Users size={12} /> {item.metadata.alumnos} Alumno(s)</span>}
                          </div>
                        )}
                      </div>
                      <div className="cp-item-right">
                        <span className="cp-price">${Number(item.price ?? item.precio_final ?? 0).toLocaleString('es-CL')}</span>
                        <button type="button" onClick={() => removeFromCart(item.cartItemId)} className="cp-del" title="Eliminar ítem">
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button type="button" onClick={clearCart} className="cp-clear">
                  <Trash2 size={14} /> VACIAR BOLSA
                </button>
              </>
            )}
          </div>

          <aside className="cp-summary">
            <div className="cp-sum-card">
              <div className="cp-total-row">
                <span>TOTAL A PAGAR</span>
                <strong>${Number(total || 0).toLocaleString('es-CL')} CLP</strong>
              </div>

              <h4>MEDIO DE PAGO</h4>
              <div className="cp-methods">
                <button
                  type="button"
                  className={`cp-method ${selectedMethod === 'webpay' ? 'active' : ''}`}
                  onClick={() => setSelectedMethod('webpay')}
                >
                  <CreditCard size={18} />
                  <div>
                    <strong>Webpay Plus / Flow</strong>
                    <span>Crédito, Débito, Prepago</span>
                  </div>
                </button>
                <button
                  type="button"
                  className={`cp-method ${selectedMethod === 'transfer' ? 'active' : ''}`}
                  onClick={() => setSelectedMethod('transfer')}
                >
                  <Building2 size={18} />
                  <div>
                    <strong>Transferencia Bancaria</strong>
                    <span>Confirmación directa</span>
                  </div>
                </button>
              </div>

              {error && <div className="cp-err"><AlertCircle size={14} /> {error}</div>}

              <button
                type="button"
                onClick={handleProcessWebPayment}
                disabled={safeItems.length === 0 || loading}
                className="cp-pay-btn"
              >
                {loading ? 'CONECTANDO...' : 'PAGAR AHORA'}
              </button>

              <div className="cp-sec">
                <ShieldCheck size={14} /> Pago Seguro Encriptado
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
