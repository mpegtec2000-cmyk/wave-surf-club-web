'use client';

import './agenda.css';

import { useState } from 'react';
import { useCart } from '@/lib/cart-context';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AgendaPage() {
  const { addToCart } = useCart();
  const [step, setStep] = useState('form');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    rut: '',
    email: '',
    phone: '',
    sede: 'Concón'
  });

  const [numAlumnos, setNumAlumnos] = useState(1);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');

  const timeSlots = ['09:00', '10:30', '12:00', '15:00', '16:30', '18:00'];

  const base = 25000;
  const discount = numAlumnos > 1 ? 0.9 : 1;
  const totalPrice = base * numAlumnos * discount;

  const handleRegister = (e) => {
    e.preventDefault();
    setStep('selection');
  };

  const handleGoToConfirm = () => {
    if (!bookingDate || !bookingTime) return;
    setStep('confirmar');
  };

  const handleFinalConfirm = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 450));
    addToCart({
      name: `CLASE DE SURF - ${formData.sede}`,
      category: 'Clase / Coaching',
      price: totalPrice,
      metadata: {
        ...formData,
        date: bookingDate,
        time: bookingTime,
        alumnos: numAlumnos
      }
    });
    setLoading(false);
    setStep('success');
  };

  return (
    <div className="ag-root">
      <Navbar />

      <main className="ag-main">
        <div className="ag-card">
          <div className="ag-visual">
            <Image src="/TIENDA/4.PNG" alt="Wave Surf Club" fill priority sizes="(max-width: 900px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
            <div className="ag-visual-overlay" />
            <div className="ag-visual-text">
              <span className="ag-kicker">BOOKING ONLINE · 20% OFF ESTUDIANTES</span>
              <h2>AGENDA TU CLASE CON PROFESIONALES®</h2>
              <p>Equipo completo incluido: tabla, traje 4/3mm e instructor certificado ISA.</p>
            </div>
          </div>

          <div className="ag-form-col">
            <span className="ag-portal-tag">PORTAL DE RESERVAS · PASO {step === 'form' ? '01' : step === 'selection' ? '02' : step === 'confirmar' ? '03' : 'OK'}</span>

            {step === 'form' && (
              <form onSubmit={handleRegister}>
                <span className="ag-label">SELECCIONA TU SEDE</span>
                <div className="ag-sedes">
                  {['Concón', 'Punta Piedra', 'Pichilemu'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`ag-pill ${formData.sede === s ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, sede: s })}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <div className="ag-grid-2">
                  <input required className="ag-input" placeholder="Nombre Completo" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  <input required className="ag-input" placeholder="RUT" value={formData.rut} onChange={(e) => setFormData({ ...formData, rut: e.target.value })} />
                  <input required type="email" className="ag-input" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  <input required className="ag-input" placeholder="Teléfono (+56 9...)" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>

                <button type="submit" className="ag-btn-black">
                  <span>SIGUIENTE PASO</span>
                  <ChevronRight size={18} />
                </button>
              </form>
            )}

            {step === 'selection' && (
              <div>
                <span className="ag-label">¿CUÁNTOS ALUMNOS? (10% OFF GRUPAL)</span>
                <div className="ag-alumnos">
                  {[1, 2, 3, 4].map((n) => (
                    <button key={n} type="button" className={`ag-pill ${numAlumnos === n ? 'active' : ''}`} onClick={() => setNumAlumnos(n)}>
                      {n}
                    </button>
                  ))}
                </div>

                <div className="ag-grid-2">
                  <div>
                    <label className="ag-label">FECHA</label>
                    <input type="date" className="ag-input" min={new Date().toISOString().split('T')[0]} value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="ag-label">HORA</label>
                    <select className="ag-input" value={bookingTime} onChange={(e) => setBookingTime(e.target.value)}>
                      <option value="">Seleccionar horario...</option>
                      {timeSlots.map((t) => <option key={t} value={t}>{t} hrs</option>)}
                    </select>
                  </div>
                </div>

                <button type="button" onClick={handleGoToConfirm} disabled={!bookingDate || !bookingTime} className="ag-btn-black">
                  <span>REVISAR RESUMEN</span>
                  <ChevronRight size={18} />
                </button>
                <button type="button" onClick={() => setStep('form')} className="ag-btn-ghost">Volver</button>
              </div>
            )}

            {step === 'confirmar' && (
              <div>
                <h3 className="ag-sub-h3">RESUMEN DE RESERVA</h3>
                <div className="ag-summary">
                  <div className="ag-sum-row">
                    <div>
                      <strong>Sede {formData.sede}</strong>
                      <span>{numAlumnos} Alumno(s)</span>
                    </div>
                    <span className="ag-mono-val">{bookingDate} · {bookingTime}</span>
                  </div>
                  <div className="ag-sum-total">
                    <span>MONTO TOTAL</span>
                    <strong>${totalPrice.toLocaleString('es-CL')} CLP</strong>
                  </div>
                </div>

                <div className="ag-note">
                  <AlertCircle size={16} />
                  <span>Tu clase se añadirá a la bolsa de compras para confirmar el pago final.</span>
                </div>

                <button type="button" onClick={handleFinalConfirm} disabled={loading} className="ag-btn-black">
                  {loading ? 'AGREGANDO...' : 'CONFIRMAR Y AÑADIR A LA BOLSA'}
                </button>
                <button type="button" onClick={() => setStep('selection')} className="ag-btn-ghost">Editar selección</button>
              </div>
            )}

            {step === 'success' && (
              <div className="ag-success">
                <div className="ag-ok-circle">
                  <CheckCircle2 size={38} />
                </div>
                <h2>¡RESERVA AGREGADA!</h2>
                <div className="ag-mini">
                  <div><span>Sede</span><strong>{formData.sede}</strong></div>
                  <div><span>Total</span><strong>${totalPrice.toLocaleString('es-CL')} CLP</strong></div>
                </div>
                <Link href="/cart" className="ag-btn-black">IR A LA BOLSA Y PAGAR</Link>
                <Link href="/servicios" className="ag-btn-ghost">Ver más servicios</Link>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="ag-footer">WAVE SURF CLUB® © 2026</footer>
    </div>
  );
}
