'use client';

import './success.css';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { CheckCircle2, Instagram } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const method = searchParams.get('method');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(timer);
  }, [orderId]);

  if (loading) {
    return (
      <div className="cks-loading">
        <div className="cks-spinner"></div>
        <p>Verificando estado de tu pago...</p>
      </div>
    );
  }

  return (
    <div className="cks-wrapper">
      <div className="cks-card">
        <div className="cks-icon">
          <CheckCircle2 size={44} color="#ffffff" />
        </div>

        <h1>{method === 'transfer' ? '¡SOLICITUD RECIBIDA!' : '¡PAGO CONFIRMADO!'}</h1>
        <p className="cks-subtitle">
          {method === 'transfer'
            ? 'Tu reserva está en espera de la validación de tu transferencia. Te avisaremos por email.'
            : 'Hemos procesado tu pago exitosamente a través de Flow/Webpay.'}
        </p>

        <div className="cks-order-box">
          <div className="cks-row">
            <span>Número de Orden</span>
            <span className="cks-bold">{orderId || 'CONFIRMADA'}</span>
          </div>
          <div className="cks-row">
            <span>Fecha</span>
            <span className="cks-bold">{new Date().toLocaleDateString('es-CL')}</span>
          </div>
          <div className="cks-row">
            <span>Estado</span>
            <span className="cks-status">{method === 'transfer' ? 'PENDIENTE' : 'APROBADO'}</span>
          </div>
        </div>

        <div className="cks-steps">
          <h3>¿Qué sigue ahora?</h3>
          <ul>
            <li><CheckCircle2 size={14} /> Recibirás un correo con el detalle de tu compra.</li>
            <li><CheckCircle2 size={14} /> Si agendaste una clase, el profesor te contactará.</li>
            <li><CheckCircle2 size={14} /> Síguenos en Instagram para novedades.</li>
          </ul>
        </div>

        <div className="cks-actions">
          <Link href="/" className="cks-btn-home">IR AL INICIO</Link>
          <a href="https://instagram.com/wavesurfclub" target="_blank" rel="noopener noreferrer" className="cks-btn-social">
            <Instagram size={16} /> @wavesurfclub
          </a>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="cks-page">
      <Navbar />
      <Suspense fallback={<div className="cks-loading"><div className="cks-spinner"></div></div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
