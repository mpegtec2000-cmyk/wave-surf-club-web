'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CheckCircle, Calendar, Clock, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

function PagoExitosoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ordenId = searchParams.get('orden');
  const token = searchParams.get('token');
  const [orden, setOrden] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ordenId || token) {
      fetchOrden();
    } else {
      setLoading(false);
    }

    // Redirect to home after 10 seconds
    const timer = setTimeout(() => {
      router.push('/');
    }, 30000);

    return () => clearTimeout(timer);
  }, [ordenId, token]);

  const fetchOrden = async () => {
    try {
      let query = supabase.from('ordenes_tienda').select('*');
      
      if (ordenId) {
        query = query.eq('id', ordenId);
      } else if (token) {
        query = query.eq('flow_token', token);
      } else {
        return;
      }

      const { data: ordenData } = await query.single();
      
      setOrden(ordenData);

      if (ordenData) {
        const { data: reservasData } = await supabase
          .from('reservas')
          .select('*, productos_tienda(nombre)')
          .eq('orden_id', ordenData.id);
        
        setReservas(reservasData || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pago-container">
      <div className="pago-card">
        <div className="icon-success">
          <CheckCircle size={64} color="#10b981" />
        </div>
        
        <h1>¡PAGO EXITOSO!</h1>
        <p className="subtitle">
          Gracias por tu compra en <strong>WAVE SURF CLUB</strong>.<br />
          Guarda tu número de orden — lo necesitarás si tienes alguna consulta.
        </p>

        {loading ? (
          <p style={{ color: '#888', fontSize: '14px' }}>Cargando detalles de la orden...</p>
        ) : orden ? (
          <>
            {/* === NÚMERO DE ORDEN DESTACADO === */}
            <div className="order-number-box">
              <p className="order-number-label">📋 TU NÚMERO DE ORDEN</p>
              <div className="order-number-code">
                #{orden.id.split('-')[0].toUpperCase()}
              </div>
              <p className="order-number-hint">
                Anota este código o tómale una foto.<br />
                Preséntalo ante cualquier consulta o problema.
              </p>
              <button
                className="btn-copy"
                onClick={() => {
                  navigator.clipboard.writeText('#' + orden.id.split('-')[0].toUpperCase());
                  alert('¡Número de orden copiado!');
                }}
              >
                📋 COPIAR NÚMERO
              </button>
            </div>

            {/* === DETALLES === */}
            <div className="order-details">
              <div className="order-row">
                <span>Total pagado</span>
                <strong>${orden.total.toLocaleString('es-CL')}</strong>
              </div>
              <div className="order-row">
                <span>Cliente</span>
                <strong>{orden.nombre_cliente}</strong>
              </div>
              {orden.email_cliente && (
                <div className="order-row">
                  <span>Email</span>
                  <strong style={{ fontSize: '12px' }}>{orden.email_cliente}</strong>
                </div>
              )}
            </div>

            {reservas.length > 0 && (
              <div className="reservas-list">
                <h3>📅 Tus Reservas</h3>
                {reservas.map(r => (
                  <div key={r.id} className="reserva-item">
                    <div className="r-prod">{r.productos_tienda?.nombre}</div>
                    <div className="r-time">
                      <Calendar size={14} /> {r.fecha.split('-').reverse().join('-')} &nbsp;
                      <Clock size={14} /> {r.hora_inicio.substring(0,5)} - {r.hora_fin.substring(0,5)}
                    </div>
                  </div>
                ))}
                <p className="reserva-note">
                  Por favor llega 15 minutos antes de tu hora reservada.
                </p>
              </div>
            )}
          </>
        ) : (
          <p style={{ color: '#888' }}>No se encontró la orden. Guarda el número que aparece en tu email de confirmación.</p>
        )}

        <p className="redirect-note">
          Serás redirigido al inicio en unos segundos...
        </p>

        <Link href="/" className="btn-volver">
          <ArrowLeft size={16} /> VOLVER AL INICIO
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
          max-width: 500px;
          text-align: center;
        }

        .icon-success {
          margin-bottom: 20px;
          display: flex;
          justify-content: center;
        }

        h1 {
          font-size: 24px;
          font-weight: 900;
          margin: 0 0 10px 0;
          color: #10b981;
        }

        .subtitle {
          color: #888;
          font-size: 14px;
          margin-bottom: 30px;
        }

        .order-details {
          background: #111;
          border: 1px solid #222;
          border-radius: 12px;
          padding: 20px;
          text-align: left;
          margin-bottom: 30px;
        }

        .order-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #222;
        }

        .order-row:last-of-type {
          border-bottom: none;
        }

        .order-row span {
          color: #888;
          font-size: 13px;
        }

        .order-row strong {
          color: #fff;
          font-size: 14px;
        }

        .reservas-list {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px dashed #333;
        }

        .reservas-list h3 {
          font-size: 12px;
          color: #38bdf8;
          text-transform: uppercase;
          margin: 0 0 10px 0;
        }

        .reserva-item {
          background: #000;
          padding: 12px;
          border-radius: 6px;
          border: 1px solid #222;
          margin-bottom: 10px;
        }

        .r-prod {
          font-weight: 700;
          font-size: 13px;
          margin-bottom: 4px;
        }

        .r-time {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #888;
          font-size: 11px;
        }

        .reserva-note {
          font-size: 11px;
          color: #a3e635;
          text-align: center;
          margin-top: 15px;
        }
        .order-number-box {
          background: linear-gradient(135deg, #0a1a2e, #0f2640);
          border: 2px solid #38bdf8;
          border-radius: 16px;
          padding: 28px 24px 20px;
          margin-bottom: 24px;
          text-align: center;
          box-shadow: 0 0 30px rgba(56, 189, 248, 0.15);
        }

        .order-number-label {
          font-size: 11px;
          color: #38bdf8;
          text-transform: uppercase;
          letter-spacing: 3px;
          font-weight: 800;
          margin: 0 0 16px 0;
        }

        .order-number-code {
          font-size: 36px;
          font-weight: 900;
          color: #fff;
          letter-spacing: 4px;
          font-family: 'Courier New', monospace;
          background: rgba(0,0,0,0.4);
          border: 1px solid #1e4060;
          border-radius: 10px;
          padding: 14px 20px;
          margin-bottom: 14px;
          word-break: break-all;
        }

        .order-number-hint {
          font-size: 12px;
          color: #94a3b8;
          line-height: 1.6;
          margin: 0 0 18px 0;
        }

        .btn-copy {
          background: #38bdf8;
          color: #000;
          border: none;
          padding: 10px 24px;
          border-radius: 8px;
          font-weight: 900;
          font-size: 12px;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-copy:hover {
          background: #fff;
          transform: scale(1.04);
        }

        .redirect-note {
          font-size: 11px;
          color: #444;
          margin: 16px 0 20px;
        }

        .btn-volver {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #38bdf8;
          color: #000;
          text-decoration: none;
          padding: 14px 24px;
          border-radius: 8px;
          font-weight: 900;
          font-size: 13px;
          transition: all 0.2s;
        }

        .btn-volver:hover {
          background: #fff;
        }
      `}</style>
    </div>
  );
}

export default function PagoExitosoPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div style={{minHeight: '100vh', background: '#000'}}></div>}>
        <PagoExitosoContent />
      </Suspense>
    </>
  );
}
