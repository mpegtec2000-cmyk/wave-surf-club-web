'use client';

import './contacto.css';

import Navbar from '@/components/Navbar';
import { Mail, Phone, MapPin, User, MessageCircle, Clock, ArrowUpRight } from 'lucide-react';

export default function ContactoPage() {
  return (
    <div className="ct-root">
      <Navbar />

      <main className="ct-main">
        <div className="ct-container">
          <div className="ct-header">
            <span className="ct-kicker">CONTACTO DIRECTO · CHILE</span>
            <h1>ESTAMOS PARA AYUDARTE®</h1>
            <p>
              Comunícate directamente con nuestro equipo de gestión para resolver cualquier duda sobre clases, equipos, taller o eventos.
            </p>
          </div>

          <div className="ct-grid">
            <div className="ct-card ct-card-featured">
              <div className="ct-icon"><User size={22} /></div>
              <div className="ct-info">
                <span className="ct-label">FUNDADOR &amp; DIRECCIÓN</span>
                <h3>Luisiño Cornejo</h3>
                <p>Wave Surf Club Central</p>
              </div>
            </div>

            <div className="ct-card">
              <div className="ct-icon"><Mail size={22} /></div>
              <div className="ct-info">
                <span className="ct-label">CORREO OFICIAL</span>
                <a href="mailto:WAVE_SURF_CLUB@outlook.com" className="ct-link">WAVE_SURF_CLUB@outlook.com</a>
                <p>Consultas, Alianzas &amp; Logística</p>
              </div>
            </div>

            <div className="ct-card">
              <div className="ct-icon"><Phone size={22} /></div>
              <div className="ct-info">
                <span className="ct-label">TELÉFONO DIRECTO</span>
                <a href="tel:+56975803044" className="ct-link">+56 9 7580 3044</a>
                <p>WhatsApp 24/7 · Llamadas 08:00 - 22:00</p>
              </div>
            </div>

            <div className="ct-card">
              <div className="ct-icon"><MapPin size={22} /></div>
              <div className="ct-info">
                <span className="ct-label">SEDE CENTRAL</span>
                <h3>Playa La Boca, Concón</h3>
                <p>Wave Surf Club — Valparaíso, Chile</p>
              </div>
            </div>
          </div>

          <div className="ct-footer">
            <div className="ct-hours">
              <Clock size={15} />
              <span>HORARIO DE ATENCIÓN: LUNES A DOMINGO · 08:00 AM — 22:00 PM</span>
            </div>
            <a href="https://wa.me/56975803044" target="_blank" rel="noopener noreferrer" className="ct-wa-btn">
              <MessageCircle size={18} />
              <span>HABLAR POR WHATSAPP</span>
              <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
