'use client';

import { XCircle, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function PagoFallidoPage() {
  return (
    <>
      <Navbar />
      <div className="pago-container">
        <div className="pago-card">
          <div className="icon-error">
            <XCircle size={64} color="#ff4444" />
          </div>
          
          <h1>PAGO RECHAZADO</h1>
          <p className="subtitle">Hubo un problema procesando tu pago o fue cancelado.</p>

          <p className="message">
            Tus productos siguen esperando. Puedes intentar el pago nuevamente con otro medio de pago.
          </p>

          <Link href="/tienda" className="btn-volver">
            <ArrowLeft size={16} /> VOLVER A LA TIENDA
          </Link>
        </div>

        <style jsx>{`
          .pago-container {
            min-height: 100vh;
            background: #000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            color: #fff;
            font-family: var(--font-sans);
            padding-top: 100px;
          }

          .pago-card {
            background: #0a0a0a;
            border: 1px solid #222;
            border-radius: 16px;
            padding: 40px;
            width: 100%;
            max-width: 400px;
            text-align: center;
          }

          .icon-error {
            margin-bottom: 20px;
            display: flex;
            justify-content: center;
          }

          h1 {
            font-size: 24px;
            font-weight: 900;
            margin: 0 0 10px 0;
            color: #ff4444;
          }

          .subtitle {
            color: #888;
            font-size: 14px;
            margin-bottom: 20px;
          }

          .message {
            background: #111;
            padding: 20px;
            border-radius: 8px;
            font-size: 13px;
            color: #aaa;
            margin-bottom: 30px;
            border: 1px dashed #333;
          }

          .btn-volver {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            background: #fff;
            color: #000;
            text-decoration: none;
            padding: 14px 24px;
            border-radius: 8px;
            font-weight: 900;
            font-size: 13px;
            transition: all 0.2s;
          }

          .btn-volver:hover {
            background: #ccc;
          }
        `}</style>
      </div>
    </>
  );
}
