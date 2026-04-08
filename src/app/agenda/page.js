'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { addClient } from '@/lib/data';

export default function AgendaPage() {
  const [sede, setSede] = useState('');
  const [rut, setRut] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!sede) {
      setMsg({ type: 'error', text: 'Por favor selecciona una sede.' });
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      const { data, error } = await addClient({ 
        rut, 
        name, 
        email, 
        phone, 
        metadata: { sede, fecha_preferida: date } 
      });
      if (error) throw error;
      setMsg({ type: 'success', text: '¡Excelente decisión! Te contactaremos a la brevedad para confirmar tu sesión.' });
      setTimeout(() => {
        setSede(''); setRut(''); setName(''); setEmail(''); setPhone(''); setDate('');
        setMsg(null);
      }, 5000);
    } catch (err) {
      setMsg({ type: 'error', text: 'Hubo un problema al procesar tu solicitud. Inténtalo de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="agenda-portal">
      <style jsx>{`
        .agenda-portal {
          min-height: 100vh;
          background: #0b1120;
          color: #f8fafc;
          font-family: var(--font-inter), sans-serif;
          display: flex;
          flex-direction: column;
        }

        /* --- NAVBAR --- */
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          padding: 0 40px;
          height: 80px;
          background: rgba(11, 17, 32, 0.8);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .back-link {
          color: #fff;
          text-decoration: none;
          font-family: var(--font-archivo), sans-serif;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 2px;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s;
        }
        .back-link:hover {
          color: #38bdf8;
          transform: translateX(-5px);
        }

        /* --- MAIN CONTENT --- */
        .main-content {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 120px 20px 80px;
          position: relative;
        }
        .bg-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          opacity: 0.4;
        }

        .booking-card {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 900px;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(56, 189, 248, 0.2);
          border-radius: 24px;
          overflow: hidden;
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          box-shadow: 0 30px 60px rgba(0,0,0,0.5);
        }

        @media (max-width: 768px) {
          .booking-card { grid-template-columns: 1fr; }
          .card-visual { display: none; }
        }

        .card-visual {
          position: relative;
          background: #38bdf8;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 40px;
          color: #0b1120;
        }
        .card-visual h2 {
          font-family: var(--font-archivo), sans-serif;
          font-size: 48px;
          font-weight: 900;
          line-height: 0.9;
          margin-bottom: 20px;
          text-transform: uppercase;
        }
        .card-visual p {
          font-family: var(--font-playfair), serif;
          font-style: italic;
          font-size: 18px;
        }

        .card-form {
          padding: 60px;
        }
        .form-title {
          font-family: var(--font-archivo), sans-serif;
          font-size: 14px;
          font-weight: 900;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-bottom: 40px;
          color: #38bdf8;
        }

        .sede-selector {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 30px;
        }
        .sede-btn {
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.3s;
        }
        .sede-btn.active {
          background: #38bdf8;
          color: #0b1120;
          border-color: #38bdf8;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }
        @media (max-width: 640px) {
          .form-grid { grid-template-columns: 1fr; }
        }

        .field-group { display: flex; flex-direction: column; gap: 8px; }
        .label {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #94a3b8;
        }
        .input {
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 14px;
          border-radius: 8px;
          color: #fff;
          outline: none;
          transition: border-color 0.3s;
        }
        .input:focus { border-color: #38bdf8; }

        .btn-submit {
          width: 100%;
          background: #38bdf8;
          color: #0b1120;
          font-family: var(--font-archivo), sans-serif;
          font-size: 13px;
          font-weight: 900;
          padding: 18px;
          border: none;
          border-radius: 8px;
          text-transform: uppercase;
          letter-spacing: 2px;
          cursor: pointer;
          transition: all 0.3s;
        }
        .btn-submit:hover {
          background: #fff;
          transform: translateY(-2px);
        }
        .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        .msg {
          padding: 15px;
          border-radius: 8px;
          font-size: 13px;
          margin-bottom: 25px;
          text-align: center;
        }
        .msg.error { background: rgba(239, 68, 68, 0.1); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.2); }
        .msg.success { background: rgba(34, 197, 94, 0.1); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.2); }
      `}</style>

      {/* CABECERA */}
      <header className="header">
        <Link href="/" className="back-link">
          ← Cancelar y Volver
        </Link>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="main-content">
        <div className="bg-overlay">
          <Image src="/tomy-escuela.png" alt="Wave School" fill style={{ objectFit: 'cover' }} />
        </div>

        <div className="booking-card">
          <div className="card-visual">
            <div style={{ position: 'absolute', inset: 0, opacity: 0.3, zIndex: 0 }}>
              <Image src="/fondo-escuela.png" alt="Visual" fill style={{ objectFit: 'cover' }} />
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2>TOMA<br/>EL MANDO.</h2>
              <p>Agenda tu primera sesión y conviértete en parte de la familia Wave Surf Club.</p>
            </div>
          </div>

          <div className="card-form">
            <h2 className="form-title">Portal de Reservas</h2>

            {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}

            <form onSubmit={handleRegister}>
              <span className="label" style={{ display: 'block', marginBottom: '10px' }}>Selecciona tu Sede</span>
              <div className="sede-selector">
                {['Concón', 'Pichilemu', 'Punta Piedra'].map(s => (
                  <button 
                    key={s} 
                    type="button" 
                    className={`sede-btn ${sede === s ? 'active' : ''}`}
                    onClick={() => setSede(s)}
                  >
                    {s}
                  </button>
                )
                )}
              </div>

              <div className="form-grid">
                <div className="field-group">
                  <label className="label">Nombre Completo</label>
                  <input required type="text" className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Juan Pérez" />
                </div>
                <div className="field-group">
                  <label className="label">RUT</label>
                  <input required type="text" className="input" value={rut} onChange={e => setRut(e.target.value)} placeholder="12.345.678-9" />
                </div>
                <div className="field-group">
                  <label className="label">Email</label>
                  <input required type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" />
                </div>
                <div className="field-group">
                  <label className="label">Teléfono</label>
                  <input required type="text" className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+56 9..." />
                </div>
              </div>

              <div className="field-group" style={{ marginBottom: '30px' }}>
                <label className="label">Fecha Preferida (Opcional)</label>
                <input type="text" className="input" value={date} onChange={e => setDate(e.target.value)} placeholder="Ej: Próximo Sábado 10:00 AM" />
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Procesando...' : 'Confirmar Reserva'}
              </button>
            </form>
          </div>
        </div>
      </main>

      <footer style={{ textAlign: 'center', paddingBottom: '40px', opacity: 0.3, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '3px' }}>
        Wave Surf Club © 2026 — Reserva de Clases y Coaching
      </footer>
    </div>
  );
}
