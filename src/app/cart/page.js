'use client';

import { useCart } from '@/lib/cart-context';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ShoppingCart, 
  Trash2, 
  ArrowRight, 
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

  const handleProcessWebPayment = async () => {
    if (cartItems.length === 0) return;
    setLoading(true);
    setError(null);

    if (selectedMethod === 'transfer') {
      // Redirigir al flujo de transferencia en checkout
      window.location.href = '/checkout?method=transfer';
      return;
    }

    try {
      // INICIO DE PAGO REAL CON FLOW
      const response = await fetch('/api/checkout/flow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          email: cartItems[0]?.metadata?.email || 'pago@web.cl',
          subject: 'Compra en Wave Surf Club MB',
          items: cartItems.map(i => ({ name: i.name, price: i.price })),
          metadata: cartItems[0]?.metadata
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
    <div className="cart-page-master">
      <Navbar cartCount={cartItems.length} />
      
      <main className="cart-container">
        <div className="cart-header">
          <Link href="/agenda" className="btn-back">
            <ChevronLeft size={16} /> Volver a la Agenda
          </Link>
          <h1>MI BOLSA DE COMPRAS</h1>
          <p>Revisa tu selección y elige tu medio de pago para confirmar.</p>
        </div>

        <div className="cart-layout">
          {/* LADO IZQUIERDO: LISTA DE ITEMS */}
          <div className="cart-items-section">
            <div className="items-list">
              {cartItems.length === 0 ? (
                <div className="empty-cart-state">
                  <ShoppingCart size={48} />
                  <h2>Tu bolsa está vacía</h2>
                  <p>Añade clases o productos para comenzar.</p>
                  <Link href="/agenda" className="btn-browse">VER AGENDA</Link>
                </div>
              ) : (
                cartItems.map((item, id) => (
                  <div key={id} className="cart-card">
                    <div className="item-main-info">
                      <span className="category-tag">{item.category}</span>
                      <h3>{item.name}</h3>
                      {item.metadata && (
                        <div className="item-meta-info">
                          {item.metadata.date && <span><Clock size={12} /> {item.metadata.date} | {item.metadata.time}</span>}
                          {item.metadata.sede && <span><MapPin size={12} /> {item.metadata.sede}</span>}
                          {item.metadata.alumnos && <span><Users size={12} /> {item.metadata.alumnos} Alumnos</span>}
                        </div>
                      )}
                    </div>
                    <div className="item-actions">
                      <span className="item-price">${item.price.toLocaleString()}</span>
                      <button onClick={() => removeFromCart(id)} className="btn-remove">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}

              {cartItems.length > 0 && (
                <button onClick={clearCart} className="btn-cancel-all">
                  <Trash2 size={14} /> Vaciarl Bolsa / Cancelar Todo
                </button>
              )}
            </div>
          </div>

          {/* LADO DERECHO: PAGO EN EL CARRO */}
          <div className="cart-summary-section">
            <div className="summary-card">
              <div className="total-header">
                <span>TOTAL A PAGAR</span>
                <span className="amount">${total.toLocaleString()} CLP</span>
              </div>

              <div className="method-selector">
                <h4>Selecciona Medio de Pago</h4>
                <div className="methods-vertical">
                  <button 
                    className={`m-btn ${selectedMethod === 'webpay' ? 'active' : ''}`}
                    onClick={() => setSelectedMethod('webpay')}
                  >
                    <div className="m-icon"><CreditCard size={20} /></div>
                    <div className="m-text">
                      <strong>Webpay Plus / Flow</strong>
                      <span>Crédito, Débito, Prepago</span>
                    </div>
                  </button>
                  <button 
                    className={`m-btn ${selectedMethod === 'transfer' ? 'active' : ''}`}
                    onClick={() => setSelectedMethod('transfer')}
                  >
                    <div className="m-icon"><Building2 size={20} /></div>
                    <div className="m-text">
                      <strong>Transferencia Bancaria</strong>
                      <span>Confirmación manual vía email</span>
                    </div>
                  </button>
                </div>
              </div>

              {error && <div className="error-box"><AlertCircle size={14} /> {error}</div>}

              <button 
                onClick={handleProcessWebPayment}
                disabled={cartItems.length === 0 || loading}
                className="btn-pay-master"
              >
                {loading ? 'CONECTANDO...' : 'PAGAR AHORA'}
              </button>

              <div className="security-footer">
                <ShieldCheck size={14} /> Pago Seguro Protegido
              </div>
            </div>
          </div>
        </div>
      </main>

      {styles}
    </div>
  );
}

const styles = (
  <style jsx>{`
    .cart-page-master { min-height: 100vh; background: #0b1120; color: #fff; padding-top: var(--nav-height); font-family: var(--font-inter), sans-serif; }
    .cart-container { max-width: 1200px; margin: 0 auto; padding: 60px 20px; }
    .btn-back { display: flex; align-items: center; gap: 8px; color: #38bdf8; font-size: 11px; font-weight: 900; text-decoration: none; margin-bottom: 25px; text-transform: uppercase; letter-spacing: 1px; }
    .cart-header h1 { font-family: var(--font-archivo), sans-serif; font-size: 32px; font-weight: 900; margin-bottom: 5px; }
    .cart-header p { color: #64748b; font-size: 14px; margin-bottom: 40px; }
    .cart-layout { display: grid; grid-template-columns: 1fr 380px; gap: 40px; }
    .items-list { display: flex; flex-direction: column; gap: 15px; }
    .cart-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 25px; display: flex; justify-content: space-between; align-items: center; }
    .category-tag { font-size: 9px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; display: block; }
    .item-main-info h3 { font-size: 16px; margin: 0 0 10px 0; }
    .item-meta-info { display: flex; gap: 15px; color: #64748b; font-size: 11px; }
    .item-meta-info span { display: flex; align-items: center; gap: 5px; }
    .item-price { font-size: 18px; font-weight: 900; }
    .btn-remove { background: none; border: none; color: #ef4444; cursor: pointer; opacity: 0.5; }
    .btn-remove:hover { opacity: 1; }
    .btn-cancel-all { background: none; border: 1px solid rgba(255,255,255,0.1); color: #64748b; padding: 10px 20px; border-radius: 10px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; margin-top: 10px; width: fit-content; }
    .btn-cancel-all:hover { border-color: #ef4444; color: #ef4444; }
    .summary-card { background: #fff; border-radius: 20px; padding: 30px; color: #000; box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
    .total-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px; }
    .total-header span:first-child { font-size: 11px; font-weight: 900; color: #64748b; }
    .total-header .amount { font-size: 24px; font-weight: 900; color: #0f172a; }
    .method-selector h4 { font-size: 12px; margin-bottom: 15px; color: #0f172a; }
    .methods-vertical { display: flex; flex-direction: column; gap: 10px; margin-bottom: 30px; }
    .m-btn { display: flex; align-items: center; gap: 15px; padding: 15px; border: 1px solid #e2e8f0; border-radius: 12px; background: none; cursor: pointer; text-align: left; transition: 0.2s; }
    .m-btn.active { border-color: #38bdf8; background: #f0f9ff; }
    .m-btn strong { display: block; font-size: 13px; }
    .m-btn span { font-size: 10px; color: #64748b; }
    .btn-pay-master { width: 100%; height: 55px; background: #ec4899; color: #fff; border: none; border-radius: 12px; font-weight: 900; cursor: pointer; box-shadow: 0 10px 20px rgba(236, 72, 153, 0.3); }
    .security-footer { text-align: center; font-size: 10px; color: #94a3b8; margin-top: 20px; display: flex; align-items: center; justify-content: center; gap: 6px; }
    .error-box { background: #fef2f2; color: #dc2626; padding: 10px; border-radius: 8px; font-size: 11px; margin-bottom: 15px; }
    .empty-cart-state { padding: 40px; text-align: center; color: #64748b; }
    @media (max-width: 968px) { .cart-layout { grid-template-columns: 1fr; } }
  `}</style>
);
