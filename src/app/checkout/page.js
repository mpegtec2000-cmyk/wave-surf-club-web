'use client';

import './checkout.css';

import { useState } from 'react';
import { useCart } from '@/lib/cart-context';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck,
  ChevronLeft,
  AlertCircle,
  Building2,
  Copy
} from 'lucide-react';

export default function CheckoutPage() {
  const { cartItems, total } = useCart();
  const safeItems = Array.isArray(cartItems) ? cartItems : [];

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('summary');
  const [selectedMethod, setSelectedMethod] = useState('webpay');
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const paymentMethods = [
    { id: 'webpay', name: 'Webpay / Flow', icon: '/webpay-banner.png', description: 'Crédito, Débito, Prepago' },
    { id: 'transfer', name: 'Transferencia Bancaria', icon: null, description: 'Pago directo a cuenta' }
  ];

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRealPayment = async () => {
    if (safeItems.length === 0) return;
    setLoading(true);
    setError(null);

    if (selectedMethod === 'transfer') {
      setStep('bank_details');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/checkout/flow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          email: safeItems[0]?.metadata?.email || 'pago@web.cl',
          subject: `Compra Wave Surf: ${safeItems.length} items`,
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
      setError('Error al iniciar el pago: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmTransfer = () => {
    setLoading(true);
    const orderId = `WS-TR-${Date.now().toString().slice(-6)}`;
    window.location.href = `/checkout/success?orderId=${orderId}&method=transfer`;
  };

  return (
    <div className="chk-root">
      <Navbar />

      <main className="chk-container">
        {step === 'bank_details' ? (
          <div className="chk-bank-card">
            <button type="button" onClick={() => setStep('summary')} className="chk-back">
              <ChevronLeft size={15} /> VOLVER A MÉTODOS DE PAGO
            </button>
            <h1>DATOS PARA TRANSFERENCIA</h1>
            <p className="chk-intro">Tu compra quedará confirmada una vez que recibamos el comprobante.</p>

            <div className="chk-bank-rows">
              <div><span>BANCO</span><strong>Banco Santander</strong></div>
              <div><span>TITULAR</span><strong>Wave Surf Club SpA</strong></div>
              <div>
                <span>RUT</span>
                <div className="chk-copy-val">
                  <strong>77.345.890-k</strong>
                  <button type="button" onClick={() => handleCopy('77345890-k')}><Copy size={14} /></button>
                </div>
              </div>
              <div>
                <span>CUENTA</span>
                <div className="chk-copy-val">
                  <strong>8901234455</strong>
                  <button type="button" onClick={() => handleCopy('8901234455')}><Copy size={14} /></button>
                </div>
              </div>
              <div><span>MONTO</span><strong>${Number(total || 0).toLocaleString('es-CL')} CLP</strong></div>
            </div>

            <div className="chk-note">
              <AlertCircle size={18} />
              <span>Envía tu comprobante a <strong>mpeg.logistica@gmail.com</strong></span>
            </div>

            <button type="button" onClick={handleConfirmTransfer} disabled={loading} className="chk-pay-btn">
              YA TRANSFERÍ, CONFIRMAR RESERVA
            </button>
            {copied && <div className="chk-toast">Copiado al portapapeles</div>}
          </div>
        ) : (
          <div>
            <div className="chk-header">
              <Link href="/cart" className="chk-back">
                <ChevronLeft size={14} /> VOLVER A LA BOLSA
              </Link>
              <h1>RESUMEN DE TU COMPRA®</h1>
            </div>

            <div className="chk-grid">
              <div>
                <div className="chk-total-card">
                  <span>TOTAL A PAGAR</span>
                  <strong>${Number(total || 0).toLocaleString('es-CL')} CLP</strong>
                </div>

                <div className="chk-items">
                  {safeItems.map((item, idx) => (
                    <div key={item.cartItemId || idx} className="chk-item">
                      <div>
                        <span>{item.category || item.categoria || 'Wave'}</span>
                        <h3>{item.name || item.nombre}</h3>
                      </div>
                      <strong>${Number(item.price ?? item.precio_final ?? 0).toLocaleString('es-CL')}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="chk-gateway">
                <h3>ELIGE TU MEDIO DE PAGO</h3>
                <div className="chk-methods">
                  {paymentMethods.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className={`chk-method ${selectedMethod === m.id ? 'active' : ''}`}
                      onClick={() => setSelectedMethod(m.id)}
                    >
                      <div className="chk-m-icon">
                        {m.icon ? (
                          <Image src={m.icon} alt={m.name} width={56} height={20} style={{ objectFit: 'contain' }} />
                        ) : (
                          <Building2 size={20} />
                        )}
                      </div>
                      <div>
                        <strong>{m.name}</strong>
                        <span>{m.description}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {error && <div className="chk-err"><AlertCircle size={15} /> {error}</div>}

                <button
                  type="button"
                  onClick={handleRealPayment}
                  disabled={loading || safeItems.length === 0}
                  className="chk-pay-btn"
                >
                  {loading ? 'CONECTANDO...' : 'PAGAR AHORA'}
                </button>

                <div className="chk-sec">
                  <ShieldCheck size={14} /> Pago Seguro Encriptado
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
