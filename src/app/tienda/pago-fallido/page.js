'use client';

import './pago-fallido.css';

import { XCircle, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function PagoFallidoPage() {
  return (
    <div className="pf-page">
      <Navbar />
      <div className="pf-container">
        <div className="pf-card">
          <div className="pf-icon">
            <XCircle size={48} color="#ffffff" />
          </div>

          <h1>PAGO RECHAZADO</h1>
          <p className="pf-subtitle">Hubo un problema procesando tu pago o fue cancelado.</p>

          <p className="pf-message">
            Tus productos siguen esperando. Puedes intentar el pago nuevamente con otro medio de pago.
          </p>

          <Link href="/tienda" className="pf-btn-volver">
            <ArrowLeft size={15} /> VOLVER A LA TIENDA
          </Link>
        </div>
      </div>
    </div>
  );
}
