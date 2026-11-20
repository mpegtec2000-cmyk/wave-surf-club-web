'use client';

import './equipo.css';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { Instagram, ArrowUpRight, MessageCircle } from 'lucide-react';

const TEAM_GALLERY_IMAGES = [
  '/TIENDA/3.PNG',
  '/TIENDA/7.PNG',
  '/TIENDA/Captura.PNG',
  '/TIENDA/4.PNG',
  '/TIENDA/5.PNG',
  '/TIENDA/IMG_5779.jpeg',
];

export default function EquipoPage() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const teamImages = TEAM_GALLERY_IMAGES;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % teamImages.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [teamImages.length]);

  return (
    <div className="eq-root">
      <Navbar />

      <section className="eq-hero">
        <div className="eq-hero-video-wrap">
          <Image
            src="/Club%20Wave%20Project%20bajo%20luces%20nocturnas.png"
            alt="Wave Surf Club bajo luces nocturnas"
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover', objectPosition: 'center' }}
          />
          <div className="eq-hero-overlay" />
        </div>
        <div className="eq-hero-caption">
          <span className="eq-hero-kicker">INSTRUCTORES ISA · SHAPERS · CREW</span>
          <h1>NUESTRO EQUIPO®</h1>
        </div>
      </section>

      <section className="eq-content">
        <div className="eq-container">
          <div className="eq-header">
            <span className="eq-mono">01 / CULTURA &amp; VOCACIÓN</span>
            <p className="eq-intro">
              Conoce a las personas que hacen posible Wave Surf Club cada día — instructores certificados, shapers y apasionados del océano.
            </p>
          </div>

          <div className="eq-grid">
            <div className="eq-text-col">
              <p>
                Nuestro equipo está formado por <strong>surfistas de vocación</strong> con años de experiencia en el agua y en la enseñanza. Cada instructor aporta su propio estilo y visión, creando una comunidad auténtica.
              </p>
              <blockquote className="eq-quote">
                &ldquo;El surf no es solo un deporte, es una forma de vida que compartimos con cada alumno que llega a la escuela.&rdquo;
                <span>— Equipo Wave Surf Club®</span>
              </blockquote>
              <p>
                Desde Punta de Piedra hasta Pichilemu, nuestros profes trabajan en cada sede adaptando las sesiones al nivel y ritmo de cada persona.
              </p>
            </div>

            <div className="eq-social-card">
              <div className="eq-icon-box"><Instagram size={28} /></div>
              <h3>SÍGUENOS EN INSTAGRAM</h3>
              <p>Videos de clases, sesiones en el mar y el día a día de nuestra crew en la costa.</p>
              <a
                href="https://www.instagram.com/wave_surf_club/"
                target="_blank"
                rel="noopener noreferrer"
                className="eq-btn-black"
              >
                <span>@wave_surf_club</span>
                <ArrowUpRight size={15} />
              </a>
            </div>
          </div>

          <div className="eq-cta-bar">
            <div>
              <h3>¿QUIERES UNIRTE AL EQUIPO?</h3>
              <p>Contáctanos si eres instructor certificado o tienes experiencia enseñando surf o skate.</p>
            </div>
            <a
              href="https://wa.me/56975803044?text=Hola%2C%20me%20interesa%20unirme%20al%20equipo%20de%20Wave%20Surf%20Club."
              target="_blank"
              rel="noopener noreferrer"
              className="eq-btn-white"
            >
              <MessageCircle size={18} />
              <span>ESCRIBIR AL EQUIPO</span>
            </a>
          </div>

          <div className="eq-media-grid">
            <div>
              <h3 className="eq-sec-label">02 / GALERÍA DEL EQUIPO</h3>
              <div className="eq-carousel">
                {teamImages.map((img, idx) => (
                  <div key={idx} className={`eq-slide ${idx === currentIdx ? 'active' : ''}`}>
                    <Image src={img} alt="Equipo Wave Surf Club" fill loading="eager" sizes="(max-width: 1024px) 100vw, 50vw" style={{ objectFit: 'cover', objectPosition: 'center' }} />
                  </div>
                ))}
              </div>
              <div className="eq-dots">
                {teamImages.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`eq-dot ${idx === currentIdx ? 'active' : ''}`}
                    onClick={() => setCurrentIdx(idx)}
                    aria-label={`Foto ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="eq-sec-label">03 / FLOW AL ESTILO MORRISAKIO</h3>
              <div className="eq-yt-frame">
                <iframe
                  src="https://www.youtube.com/embed/bmMiC1XvH88?rel=0&modestbranding=1&autoplay=0"
                  title="Morrison Tapia — Wave Surf Club"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              <div className="eq-yt-footer">
                <strong>RIDER — MORRISON TAPIA</strong>
                <a
                  href="https://www.instagram.com/morrisakio/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="eq-btn-outline"
                >
                  <Instagram size={15} />
                  <span>@morrisakio</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="eq-footer">
        WAVE SURF CLUB® © 2026 — NUESTRO EQUIPO
      </footer>
    </div>
  );
}
