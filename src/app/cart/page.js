'use client';

import { useCart } from '@/lib/cart-context';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Trash2, ArrowRight, CreditCard, Landmark, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function CartPage() {
  const { cart, removeFromCart, clearCart, getSubtotal } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('webpay'); // webpay, transfer
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = getSubtotal();

  const handlePayment = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);

    if (paymentMethod === 'webpay') {
      try {
        const res = await fetch('/api/checkout/flow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: subtotal,
            items: cart
          })
        });
        const data = await res.json();
        if (data.url) window.location.href = data.url;
      } catch (err) {
        console.error("Payment error", err);
      }
    } else {
      // Transferencia flow... logic for manual contact or showing bank info
      alert("Enviando instrucciones de transferencia a tu correo...");
    }
    setIsProcessing(false);
  };

  return (
    <div className="cart-page">
      <Navbar />
      
      <main className="cart-container">
        <header className="cart-header">
          <div className="title-area">
             <h1>TU BOLSA DE COMPRAS</h1>
             <p>Gestiona tus reservas y productos antes del pago final.</p>
          </div>
          {cart.length > 0 && (
            <button onClick={clearCart} className="btn-cancel-all">
              <Trash2 size={14} /> Vaciár Bolsa
            </button>
          )}
        </header>

        {cart.length === 0 ? (
          <div className="empty-cart anim-fade">
            <div className="empty-icon"><ShoppingBag size={64} /></div>
            <h2>TU BOLSA ESTÁ VACÍA</h2>
            <p>Aún no has añadido ninguna clase o producto.</p>
            <Link href="/agenda" className="btn-browse">IR AL PORTAL DE RESERVAS</Link>
          </div>
        ) : (
          <div className="cart-grid">
            <div className="cart-items anim-fade">
              {cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="item-meta">
                    <span className="item-category">{item.category || 'Servicio'}</span>
                    <h3 className="item-name">{item.name}</h3>
                    {item.metadata && (
                      <div className="item-details">
                        <span>{item.metadata.sede}</span> | <span>{item.metadata.date}</span> | <span>{item.metadata.time}</span> | <span>{item.metadata.alumnos} Alumno(s)</span>
                      </div>
                    )}
                  </div>
                  <div className="item-actions">
                    <span className="item-price">${item.price.toLocaleString()}</span>
                    <button onClick={() => removeFromCart(item.id)} className="btn-remove">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <aside className="cart-summary anim-fade">
              <div className="summary-card">
                <div className="total-header">
                  <span>SUBTOTAL</span>
                  <h2>${subtotal.toLocaleString()}</h2>
                </div>

                <div className="payment-options">
                  <span className="label">MÉTODO DE PAGO</span>
                  <div className={`pay-pill ${paymentMethod === 'webpay' ? 'active' : ''}`} onClick={() => setPaymentMethod('webpay')}>
                    <CreditCard size={20} />
                    <div className="pay-text">
                      <strong>Webpay (Flujo Seguro)</strong>
                      <span>Tarjetas de Crédito / Débito / Prepago</span>
                    </div>
                  </div>
                  <div className={`pay-pill ${paymentMethod === 'transfer' ? 'active' : ''}`} onClick={() => setPaymentMethod('transfer')}>
                    <Landmark size={20} />
                    <div className="pay-text">
                      <strong>Transferencia Bancaria</strong>
                      <span>Envío de comprobante manual</span>
                    </div>
                  </div>
                </div>

                <div className="safety-badge">
                  <CheckCircle2 size={14} /> Transacción Protegida por SSL
                </div>

                <button 
                  onClick={handlePayment} 
                  disabled={isProcessing} 
                  className="btn-checkout"
                >
                  {isProcessing ? 'PROCESANDO...' : 'PROCEDER AL PAGO'}
                  <ArrowRight size={20} />
                </button>
              </div>
            </aside>
          </div>
        )}
      </main>

      <style jsx>{`
        .cart-page { min-height: 100vh; background: #f8fafc; color: #0b1120; padding-top: 100px; font-family: sans-serif; }
        .cart-container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
        .cart-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; }
        .title-area h1 { font-size: 32px; font-weight: 900; letter-spacing: -1px; margin: 0; }
        .title-area p { color: #64748b; margin: 5px 0 0; }
        
        .empty-cart { text-align: center; padding: 100px 20px; background: #fff; border-radius: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .empty-icon { color: #e2e8f0; margin-bottom: 20px; }
        .btn-browse { display: inline-block; margin-top: 30px; background: #0b1120; color: #fff; padding: 20px 40px; border-radius: 16px; font-weight: 800; text-decoration: none; }
        
        .cart-grid { display: grid; grid-template-columns: 1fr 400px; gap: 40px; }
        @media (max-width: 1024px) { .cart-grid { grid-template-columns: 1fr; } }
        
        .cart-item { background: #fff; border-radius: 20px; padding: 30px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .item-category { font-size: 10px; font-weight: 900; color: #38bdf8; text-transform: uppercase; }
        .item-name { font-size: 18px; font-weight: 800; margin: 4px 0; }
        .item-details { font-size: 13px; color: #64748b; }
        .item-actions { display: flex; align-items: center; gap: 30px; }
        .item-price { font-size: 18px; font-weight: 900; }
        .btn-remove { background: none; border: none; color: #ef4444; cursor: pointer; opacity: 0.5; }
        .btn-remove:hover { opacity: 1; }
        .btn-cancel-all { background: none; border: 1px solid #e2e8f0; color: #64748b; padding: 10px 20px; border-radius: 10px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; }
        
        .summary-card { background: #0b1120; border-radius: 32px; padding: 40px; color: #fff; position: sticky; top: 120px; }
        .total-header { margin-bottom: 40px; }
        .total-header span { font-size: 11px; color: #94a3b8; font-weight: 900; }
        .total-header h2 { font-size: 42px; font-weight: 900; margin: 0; color: #fff; }
        
        .payment-options { margin-bottom: 40px; }
        .label { font-size: 11px; font-weight: 900; color: #94a3b8; margin-bottom: 15px; display: block; }
        .pay-pill { display: flex; gap: 15px; padding: 15px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; margin-bottom: 10px; cursor: pointer; }
        .pay-pill.active { border-color: #38bdf8; background: rgba(56, 189, 248, 0.1); }
        .pay-text strong { display: block; font-size: 14px; }
        .pay-text span { font-size: 11px; color: #64748b; }
        
        .btn-checkout { width: 100%; height: 70px; background: #ec4899; border: none; border-radius: 20px; color: #fff; font-weight: 900; font-size: 15px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 12px; }
        .safety-badge { font-size: 11px; color: #4ade80; display: flex; align-items: center; gap: 6px; justify-content: center; margin-bottom: 15px; }
        
        .anim-fade { animation: fadeIn 0.5s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
