'use client';

import './pago-exitoso.css';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CheckCircle, Calendar, Clock, ArrowLeft, Copy, FileText } from 'lucide-react';
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

    const timer = setTimeout(() => {
      router.push('/');
    }, 30000);

    return () => clearTimeout(timer);
  }, [ordenId, token, router]);

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
    <div className="pe-container">
      <div className="pe-card">
        <div className="pe-icon-success">
          <CheckCircle size={48} color="#ffffff" />
        </div>

        <h1>¡PAGO EXITOSO!</h1>
        <p className="pe-subtitle">
          Gracias por tu compra en <strong>WAVE SURF CLUB</strong>.<br />
          Guarda tu número de orden — lo necesitarás si tienes alguna consulta.
        </p>

        {loading ? (
          <p className="pe-muted">Cargando detalles de la orden...</p>
        ) : orden ? (
          <>
            <div className="pe-order-box">
              <p className="pe-order-label">
                <FileText size={14} /> TU NÚMERO DE ORDEN
              </p>
              <div className="pe-order-code">
                #{orden.id.split('-')[0].toUpperCase()}
              </div>
              <p className="pe-order-hint">
                Anota este código o tómale una foto.<br />
                Preséntalo ante cualquier consulta.
              </p>
              <button
                type="button"
                className="pe-btn-copy"
                onClick={() => {
                  navigator.clipboard?.writeText('#' + orden.id.split('-')[0].toUpperCase());
                }}
              >
                <Copy size={14} /> COPIAR NÚMERO
              </button>
            </div>

            <div className="pe-details">
              <div className="pe-row">
                <span>Total pagado</span>
                <strong>${Number(orden.total || 0).toLocaleString('es-CL')}</strong>
              </div>
              <div className="pe-row">
                <span>Cliente</span>
                <strong>{orden.nombre_cliente}</strong>
              </div>
              {orden.email_cliente && (
                <div className="pe-row">
                  <span>Email</span>
                  <strong>{orden.email_cliente}</strong>
                </div>
              )}
            </div>

            {reservas.length > 0 && (
              <div className="pe-reservas">
                <h3><Calendar size={16} /> Tus Reservas</h3>
                {reservas.map(r => (
                  <div key={r.id} className="pe-reserva-item">
                    <div className="pe-r-prod">{r.productos_tienda?.nombre}</div>
                    <div className="pe-r-time">
                      <Calendar size={13} /> {r.fecha.split('-').reverse().join('-')} ·
                      <Clock size={13} /> {r.hora_inicio.substring(0, 5)} - {r.hora_fin.substring(0, 5)}
                    </div>
                  </div>
                ))}
                <p className="pe-note">Por favor llega 15 minutos antes de tu hora reservada.</p>
              </div>
            )}
          </>
        ) : (
          <p className="pe-muted">No se encontró la orden. Guarda el número que aparece en tu email de confirmación.</p>
        )}

        <p className="pe-redirect">Serás redirigido al inicio en unos segundos...</p>

        <Link href="/" className="pe-btn-volver">
          <ArrowLeft size={15} /> VOLVER AL INICIO
        </Link>
      </div>
    </div>
  );
}

export default function PagoExitosoPage() {
  return (
    <div className="pe-page">
      <Navbar />
      <Suspense fallback={<div className="pe-container"><p>Cargando...</p></div>}>
        <PagoExitosoContent />
      </Suspense>
    </div>
  );
}
