'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/lib/cart-context';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import Image from 'next/image';
import { 
  CreditCard, 
  ShieldCheck, 
  ChevronLeft, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  MapPin,
  Users,
  Building2,
  Copy,
  ArrowRight
} from 'lucide-react';

export default function CheckoutPage() {
  const { cartItems, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('summary'); // summary, bank_details
  const [selectedMethod, setSelectedMethod] = useState('webpay'); // Default to webpay (via flow)
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const paymentMethods = [
    { id: 'webpay', name: 'Webpay / Flow', icon: '/webpay-banner.png', description: 'Crédito, Débito, Mach, etc.' },
    { id: 'transfer', name: 'Transferencia', icon: null, lucide: Building2, description: 'Pago directo a cuenta' }
  ];

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRealPayment = async () => {
    if (cartItems.length === 0) return;
    
    setLoading(true);
    setError(null);

    if (selectedMethod === 'transfer') {
      setStep('bank_details');
      setLoading(false);
      return;
    }

    try {
      // LLAMADA REAL AL API DE FLOW
      const response = await fetch('/api/checkout/flow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          email: cartItems[0]?.metadata?.email || 'pago@web.cl',
          subject: `Compra Wave Surf: ${cartItems.length} items`,
          items: cartItems.map(i => ({ name: i.name, price: i.price })),
          metadata: cartItems[0]?.metadata // Usamos metadata del primer item (usualmente el mismo cliente)
        })
      });

      const data = await response.json();

      if (data.url) {
        // REDIRECCIÓN REAL A FLOW
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Error al conectar con Flow');
      }

    } catch (err) {
      console.error(err);
      setError('Error al iniciar el pago: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmTransfer = async () => {
    setLoading(true);
    try {
      // Registro simple de intención de transferencia
      const orderId = `WS-TR-${Date.now().toString().slice(-6)}`;
      // Aquí podrías insertar una transacción 'pendiente' en Supabase si quieres
      window.location.href = `/checkout/success?orderId=${orderId}&method=transfer`;
    } catch (e) {
      setError('Error al procesar transferencia.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'bank_details') {
    return (
      <div className="checkout-master">
        <Navbar cartCount={cartItems.length} />
        <main className="checkout-container">
          <div className="bank-card">
            <button onClick={() => setStep('summary')} className="btn-back">
              <ChevronLeft size={16} /> Volver a métodos de pago
            </button>
            <h2>DATOS PARA TRANSFERENCIA</h2>
            <p className="bank-intro">Tu compra quedará confirmada una vez que recibamos el comprobante.</p>

            <div className="bank-details-grid">
              <div className="detail-item">
                <span className="label">Banco</span>
                <span className="val">Banco Santander</span>
              </div>
              <div className="detail-item">
                <span className="label">Titular</span>
                <span className="val">Wave Surf Club SpA</span>
              </div>
              <div className="detail-item">
                <span className="label">RUT</span>
                <div className="value-group">
                  <span className="val">77.345.890-k</span>
                  <button onClick={() => handleCopy('77345890-k')} className="copy-btn"><Copy size={14} /></button>
                </div>
              </div>
              <div className="detail-item">
                <span className="label">Cuenta</span>
                <div className="value-group">
                  <span className="val">8901234455</span>
                  <button onClick={() => handleCopy('8901234455')} className="copy-btn"><Copy size={14} /></button>
                </div>
              </div>
              <div className="detail-item">
                <span className="label">Monto</span>
                <span className="val highlight">${total.toLocaleString()} CLP</span>
              </div>
            </div>

            <div className="bank-instructions">
              <AlertCircle size={20} />
              <p>Envía tu comprobante a <strong>mpeg.logistica@gmail.com</strong></p>
            </div>

            <button onClick={handleConfirmTransfer} disabled={loading} className="btn-submit-pink">
              YA TRANSFERÍ, CONFIRMAR RESERVA
            </button>
            
            {copied && <div className="copy-toast">Copiado al portapapeles</div>}
          </div>
        </main>
        {styles}
      </div>
    );
  }

  return (
    <div className="checkout-master">
      <Navbar cartCount={cartItems.length} />
      
      <main className="checkout-container">
        <div className="checkout-layout">
          <div className="checkout-header-section">
            <Link href="/agenda" className="breadcrumb-link">
              <ChevronLeft size={14} /> Volver
            </Link>
            <h1>RESUMEN DE TU COMPRA</h1>
          </div>

          <div className="checkout-main-grid">
            {/* IZQUIERDA: RESUMEN */}
            <div className="order-items-col">
              <div className="total-display-card">
                <span className="label">Total a pagar:</span>
                <span className="amount">${total.toLocaleString()}</span>
              </div>

              <div className="items-breakdown">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="order-item-card">
                    <div className="item-info">
                      <span className="item-cat">{item.category}</span>
                      <h3>{item.name}</h3>
                    </div>
                    <div className="item-price-val">
                      ${item.price.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DERECHA: PAGO REAL */}
            <div className="payment-gateway-col">
              <div className="gateway-card">
                <h3>Elige un medio de pago</h3>
                
                <div className="methods-grid">
                  {paymentMethods.map((method) => (
                    <button 
                      key={method.id}
                      className={`method-btn ${selectedMethod === method.id ? 'active' : ''}`}
                      onClick={() => setSelectedMethod(method.id)}
                    >
                      <div className="method-icon">
                        {method.icon ? (
                          <Image src={method.icon} alt={method.name} width={60} height={20} style={{ objectFit: 'contain' }} />
                        ) : (
                          <Building2 size={24} />
                        )}
                      </div>
                      <div className="method-info">
                        <span className="method-name">{method.name}</span>
                        <span className="method-desc">{method.description}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="gateway-footer">
                  {error && <div className="error-msg"><AlertCircle size={16} /> {error}</div>}

                  <button 
                    onClick={handleRealPayment} 
                    disabled={loading || cartItems.length === 0}
                    className={`btn-pay-action ${loading ? 'loading' : ''}`}
                  >
                    {loading ? 'CONECTANDO CON FLOW...' : 'Pagar Ahora'}
                  </button>

                  <div className="security-badges">
                    <div className="s-badge"><ShieldCheck size={14} /> Pago Seguro Encriptado</div>
                  </div>
                </div>
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
    .checkout-master { min-height: 100vh; background: #f8fafc; color: #1e293b; padding-top: var(--nav-height); font-family: var(--font-inter), sans-serif; }
    .checkout-container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
    .checkout-header-section { margin-bottom: 40px; border-bottom: 1px solid #e2e8f0; padding-bottom: 20px; }
    .breadcrumb-link { display: flex; align-items: center; gap: 5px; color: #64748b; font-size: 12px; text-decoration: none; font-weight: 700; text-transform: uppercase; margin-bottom: 15px; }
    .checkout-header-section h1 { font-family: var(--font-archivo), sans-serif; font-size: 20px; font-weight: 900; color: #0f172a; }
    .checkout-main-grid { display: grid; grid-template-columns: 1fr 400px; gap: 40px; align-items: start; }
    .total-display-card { background: #fff; padding: 30px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 30px; text-align: center; }
    .total-display-card .amount { font-size: 32px; font-weight: 900; color: #0f172a; }
    .order-item-card { background: #fff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .item-info h3 { font-size: 14px; margin: 0; font-weight: 800; }
    .gateway-card { background: #fff; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; padding: 30px; }
    .methods-grid { display: flex; flex-direction: column; gap: 12px; margin-bottom: 30px; }
    .method-btn { width: 100%; padding: 15px; border: 1px solid #e2e8f0; border-radius: 12px; display: flex; align-items: center; gap: 15px; cursor: pointer; transition: 0.2s; background: #fff; text-align: left; }
    .method-btn.active { border-color: #38bdf8; background: #f0f9ff; box-shadow: 0 0 0 2px #38bdf8; }
    .btn-pay-action { width: 100%; height: 60px; background: #ec4899; color: #fff; border: none; border-radius: 12px; font-size: 16px; font-weight: 800; cursor: pointer; box-shadow: 0 10px 15px -3px rgba(236, 72, 153, 0.3); }
    .bank-card { max-width: 600px; margin: 0 auto; background: #fff; padding: 40px; border-radius: 20px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
    .btn-submit-pink { width: 100%; height: 55px; background: #ec4899; color: #fff; border: none; border-radius: 12px; font-weight: 900; cursor: pointer; margin-top: 20px; }
    .error-msg { background: #fef2f2; color: #dc2626; padding: 12px; border-radius: 8px; font-size: 12px; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
    @media (max-width: 968px) { .checkout-main-grid { grid-template-columns: 1fr; } }
  `}</style>
);
