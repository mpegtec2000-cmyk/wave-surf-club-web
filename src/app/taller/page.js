'use client';

import './taller.css';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { Instagram, ArrowUpRight, MessageCircle } from 'lucide-react';

const workshopImages = [
  '/Taller/2.jpg',
  '/Taller/3.jpg',
  '/Taller/4.jpg',
  '/Taller/5.jpg',
  '/Taller/6.jpg',
  '/Taller/7.jpg',
  '/Taller/8.jpg'
];

export default function TallerPage() {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % workshopImages.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="taller-page">
      <Navbar />

      <section className="hero">
        <Image
          src="/Taller%20de%20tablas%20de%20surf.png"
          alt="Taller de tablas de surf Wave Surf Club"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: 'center 35%' }}
        />
        <div className="hero-overlay" />
        <div className="hero-caption">
          <span className="hero-kicker">PICHILEMU WORKSHOP · SHAPER MATÍAS ESPINOZA</span>
          <h1>TALLER &amp; SHAPING®</h1>
        </div>
      </section>

      <section className="info-section">
        <div className="taller-container">
          <div className="header-block">
            <span className="mono-tag">01 / SOSTENIBILIDAD REAL EN MADERA DE AGAVE</span>
            <p className="section-intro">
              El corazón técnico de Wave Surf Club Pichilemu. Reparación profesional de tablas y fabricación artesanal con madera de Agave de impacto ambiental cero.
            </p>
          </div>

          <div className="content-grid">
            <div className="text-block">
              <p>
                Nuestra visión es la <strong>sostenibilidad real</strong>. Fabricamos tablas con madera de Agave, una planta introducida en Chile que nos permite crear equipos de alto rendimiento con huella ecológica mínima.
              </p>
              <blockquote className="quote">
                &ldquo;Mi meta es que cuando se acabe la vida útil de la tabla, pueda ser compostada y en un año vuelva a la tierra.&rdquo;
                <span className="author">— Matías Espinoza · Master Shaper</span>
              </blockquote>
            </div>

            <div className="social-card">
              <div className="icon-box">
                <Instagram size={28} />
              </div>
              <h3 className="card-title">SIGUE EL PROCESO</h3>
              <p className="card-text">
                Mira la recolección de Agave y el shaping paso a paso en nuestra cuenta especializada de taller.
              </p>
              <a
                href="https://www.instagram.com/wavesurfclub_pichilemu"
                target="_blank"
                rel="noopener noreferrer"
                className="insta-btn"
              >
                <span>@wavesurfclub_pichilemu</span>
                <ArrowUpRight size={15} />
              </a>
            </div>
          </div>

          <div className="quote-bar">
            <div className="quote-content">
              <div className="quote-text">
                <h3>¿NECESITAS REPARAR TU TABLA?</h3>
                <p>Cotiza directamente con Matías Espinoza en nuestro taller técnico de Pichilemu.</p>
              </div>
              <a
                href="https://wa.me/56940674889?text=Hola%20Matías%2C%20necesito%20cotizar%20una%20reparación%20para%20mi%20tabla."
                target="_blank"
                rel="noopener noreferrer"
                className="quote-whatsapp"
              >
                <MessageCircle size={18} />
                <span>COTIZAR REPARACIÓN</span>
              </a>
            </div>
          </div>

          <div className="work-display-grid">
            <div className="carousel-column">
              <h3 className="section-title">02 / PROCESO Y TRABAJO</h3>
              <div className="carousel-frame">
                {workshopImages.map((img, idx) => (
                  <div key={idx} className={`carousel-slide ${idx === currentIdx ? 'active' : ''}`}>
                    <Image src={img} alt={`Trabajo Taller ${idx + 1}`} fill loading="eager" sizes="(max-width: 1024px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
              <div className="carousel-dots">
                {workshopImages.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`dot ${idx === currentIdx ? 'active' : ''}`}
                    onClick={() => setCurrentIdx(idx)}
                    aria-label={`Foto ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="video-column">
              <h3 className="section-title">03 / FILOSOFÍA DEL PROYECTO</h3>
              <div className="video-frame">
                <iframe
                  src="https://www.instagram.com/p/DHGdS7BMufO/embed"
                  width="100%"
                  height="640"
                  frameBorder="0"
                  scrolling="no"
                  style={{ display: 'block' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="taller-footer">
        WAVE SURF CLUB® © 2026 — PICHILEMU WORKSHOP
      </footer>
    </div>
  );
}
