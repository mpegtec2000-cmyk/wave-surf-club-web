'use client';

import Navbar from '@/components/Navbar';
import Image from 'next/image';
import { Mail, Phone, MapPin, User, MessageCircle, Clock } from 'lucide-react';

export default function ContactoPage() {
  return (
    <div className="contact-container">
      <Navbar />

      <main className="contact-main">
        {/* Background Background */}
        <div className="contact-bg">
          <Image 
            src="/contacto.jpg" 
            alt="Wave Surf Club Contacto" 
            fill 
            priority
            style={{ objectFit: 'cover', filter: 'brightness(0.25) blur(10px)' }}
          />
        </div>

        <div className="contact-content">
          <div className="contact-header">
            <span className="subtitle">CONTACTO DIRECTO</span>
            <h1>ESTAMOS PARA AYUDARTE</h1>
            <p>Comunícate directamente con nuestro equipo de gestión para resolver cualquier duda sobre clases, equipos o eventos.</p>
          </div>

          <div className="contact-grid">
            {/* Responsable Section */}
            <div className="contact-card responsible-card">
              <div className="card-icon"><User size={24} /></div>
              <div className="card-info">
                <span className="label">RESPONSABLE DE GESTIÓN</span>
                <h3>Paulo Muñoz</h3>
                <p>Fundador & Coordinador General</p>
              </div>
            </div>

            {/* Email Section */}
            <div className="contact-card">
              <div className="card-icon"><Mail size={24} /></div>
              <div className="card-info">
                <span className="label">CORREOS ELECTRÓNICOS</span>
                <a href="mailto:WAVE_SURF_CLUB@outlook.com" className="contact-link">WAVE_SURF_CLUB@outlook.com</a>
                <a href="mailto:mpeg.logistica@gmail.com" className="contact-link">mpeg.logistica@gmail.com</a>
              </div>
            </div>

            {/* Phone Section */}
            <div className="contact-card">
              <div className="card-icon"><Phone size={24} /></div>
              <div className="card-info">
                <span className="label">TELÉFONO / WHATSAPP</span>
                <a href="tel:+56912345678" className="contact-link">+56 9 1234 5678</a>
                <p className="helper-text">Atención inmediata (Lunes a Domingo)</p>
              </div>
            </div>

            {/* Locations Section */}
            <div className="contact-card">
              <div className="card-icon"><MapPin size={24} /></div>
              <div className="card-info">
                <span className="label">UBICACIÓN SEDES</span>
                <h3>Concón & Pichilemu</h3>
                <p>Chile — Escuelas Operativas</p>
              </div>
            </div>
          </div>

          <div className="contact-footer">
            <div className="hours-card">
              <Clock size={16} />
              <span>HORARIO DE ATENCIÓN: 09:00 - 20:00 HRS</span>
            </div>
            <a href="https://wa.me/56912345678" target="_blank" className="whatsapp-btn">
              <MessageCircle size={20} />
              HABLAR POR WHATSAPP
            </a>
          </div>
        </div>
      </main>

      <style jsx>{`
        .contact-container {
          min-height: 100vh;
          background: #000;
          color: #fff;
          font-family: var(--font-archivo), sans-serif;
        }

        .contact-main {
          padding: 140px 20px 80px;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .contact-bg {
          position: absolute;
          inset: 0;
          z-index: 1;
        }

        .contact-content {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 900px;
          animation: fadeIn 1s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .contact-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .subtitle {
          color: #38bdf8;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 4px;
          display: block;
          margin-bottom: 12px;
        }

        h1 {
          font-size: clamp(32px, 6vw, 64px);
          font-weight: 950;
          letter-spacing: -2px;
          margin: 0 0 20px 0;
          line-height: 1;
        }

        .contact-header p {
          color: rgba(255,255,255,0.7);
          font-size: 18px;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 40px;
        }

        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr; }
        }

        .contact-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 30px;
          border-radius: 20px;
          display: flex;
          gap: 20px;
          transition: all 0.3s;
        }

        .contact-card:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: #38bdf8;
          transform: translateY(-5px);
        }

        .responsible-card {
          background: rgba(56, 189, 248, 0.05);
          border-color: rgba(56, 189, 248, 0.2);
        }

        .card-icon {
          width: 50px;
          height: 50px;
          background: #38bdf8;
          color: #000;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .card-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .label {
          font-size: 10px;
          font-weight: 800;
          color: #38bdf8;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        h3 {
          font-size: 20px;
          font-weight: 800;
          margin: 0;
        }

        .contact-link {
          color: #fff;
          text-decoration: none;
          font-size: 16px;
          font-weight: 500;
          transition: color 0.2s;
        }

        .contact-link:hover {
          color: #38bdf8;
        }

        .helper-text {
          font-size: 12px;
          color: rgba(255,255,255,0.5);
          margin: 4px 0 0 0;
        }

        .contact-footer {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }

        .hours-card {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.05);
          padding: 10px 20px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          color: rgba(255,255,255,0.6);
          border: 1px solid rgba(255,255,255,0.05);
        }

        .whatsapp-btn {
          background: #fff;
          color: #000;
          padding: 18px 40px;
          border-radius: 100px;
          text-decoration: none;
          font-weight: 900;
          font-size: 14px;
          letter-spacing: 1px;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.3s;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        }

        .whatsapp-btn:hover {
          background: #38bdf8;
          color: #fff;
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 20px 50px rgba(56, 189, 248, 0.3);
        }
      `}</style>
    </div>
  );
}
