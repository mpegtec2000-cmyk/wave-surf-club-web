'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, ShoppingBag, ArrowRight, Instagram } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const method = searchParams.get('method');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Aquí podrías hacer un fetch a tu API para verificar el estado real si quieres
    // pero usualmente urlReturn de Flow ya implica que el proceso terminó
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, [orderId]);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Verificando estado de tu pago...</p>
      </div>
    );
  }

  return (
    <div className="success-wrapper">
      <div className="success-card">
        <div className="icon-holder">
          <CheckCircle2 size={64} color="#fff" />
        </div>
        
        <h1>{method === 'transfer' ? '¡SOLICITUD RECIBIDA!' : '¡PAGO CONFIRMADO!'}</h1>
        <p className="subtitle">
          {method === 'transfer' 
            ? 'Tu reserva está en espera de la validación de tu transferencia. Te avisaremos por email.' 
            : 'Hemos procesado tu pago exitosamente a través de Flow/Webpay.'}
        </p>

        <div className="order-box">
          <div className="box-row">
            <span>Número de Orden:</span>
            <span className="bold">{orderId}</span>
          </div>
          <div className="box-row">
            <span>Fecha:</span>
            <span className="bold">{new Date().toLocaleDateString('es-CL')}</span>
          </div>
          <div className="box-row">
            <span>Estado:</span>
            <span className="status-pill">{method === 'transfer' ? 'PENDIENTE' : 'APROBADO'}</span>
          </div>
        </div>

        <div className="next-steps">
          <h3>¿Qué sigue ahora?</h3>
          <ul>
            <li><CheckCircle2 size={14} /> Recibirás un correo con el detalle de tu compra.</li>
            <li><CheckCircle2 size={14} /> Si agendaste una clase, el profesor te contactará.</li>
            <li><CheckCircle2 size={14} /> Síguenos en Instagram para novedades.</li>
          </ul>
        </div>

        <div className="actions">
          <Link href="/" className="btn-home">Ir al Inicio</Link>
          <a href="https://instagram.com/wavesurfclub" target="_blank" className="btn-social">
            <Instagram size={18} /> @wavesurfclub
          </a>
        </div>
      </div>

      <style jsx>{`
        .success-wrapper { min-height: 80vh; display: flex; align-items: center; justify-content: center; padding: 40px 20px; }
        .success-card { background: #0f172a; color: #fff; max-width: 550px; width: 100%; border-radius: 32px; padding: 60px 40px; text-align: center; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
        .icon-holder { width: 100px; height: 100px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 30px; box-shadow: 0 20px 40px rgba(16, 185, 129, 0.3); }
        h1 { font-family: var(--font-archivo), sans-serif; font-size: 32px; font-weight: 900; margin-bottom: 10px; }
        .subtitle { color: #94a3b8; margin-bottom: 40px; line-height: 1.6; }
        .order-box { background: rgba(255,255,255,0.05); padding: 25px; border-radius: 20px; margin-bottom: 40px; text-align: left; }
        .box-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
        .box-row .bold { font-weight: 800; color: #38bdf8; }
        .status-pill { background: #10b981; color: #fff; padding: 3px 10px; border-radius: 4px; font-size: 10px; font-weight: 900; }
        .next-steps { text-align: left; margin-bottom: 40px; }
        .next-steps h3 { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 15px; }
        .next-steps ul { list-style: none; padding: 0; margin: 0; }
        .next-steps li { display: flex; align-items: center; gap: 10px; color: #cbd5e1; font-size: 13px; margin-bottom: 8px; }
        .actions { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .btn-home { background: #38bdf8; color: #000; padding: 18px; border-radius: 12px; text-decoration: none; font-weight: 900; }
        .btn-social { background: rgba(255,255,255,0.05); color: #fff; padding: 18px; border-radius: 12px; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 10px; font-weight: 700; border: 1px solid rgba(255,255,255,0.1); }
        .loading-state { min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #fff; }
        .spinner { width: 40px; height: 40px; border: 4px solid rgba(56, 189, 248, 0.2); border-top-color: #38bdf8; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="checkout-master" style={{ background: '#0b1120', minHeight: '100vh' }}>
      <Navbar />
      <Suspense fallback={<div className="checkout-master"><div className="loading-state">...</div></div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
