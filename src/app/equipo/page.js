'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { Instagram } from 'lucide-react';

// Imágenes de respaldo si no hay fotos en CARUSEL EQUIPO
const fallbackImages = [
  '/paulo-munoz.png',
  '/paulo-1.png',
  '/biografia.jpg',
  '/PORTADA.jpg',
];

export default function EquipoPage() {
  const [currentIdx, setCurrentIdx] = useState(0);

  const [teamImages, setTeamImages] = useState(fallbackImages);

  // Cargar imágenes dinámicamente desde /public/CARUSEL EQUIPO
  useEffect(() => {
    fetch('/api/team-images')
      .then(res => res.json())
      .then(data => {
        if (data.images && data.images.length > 0) {
          setTeamImages(data.images);
        }
      })
      .catch(() => {}); // Silently fall back to default images
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % teamImages.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [teamImages.length]);


  return (
    <div className="equipo-page">
      <Navbar />

      {/* HERO — Imagen de fondo FONDO EQUIPO.jpg, sin overlay, sin texto */}
      <section className="hero">
        <Image
          src="/rider fondo.jpg"
          alt="Equipo Wave Surf Club"
          fill
          priority
          className="hero-img"
        />
      </section>

      {/* CONTENIDO */}
      <section className="info-section">
        <div className="max-w-7xl mx-auto">

          {/* Intro */}
          <div className="header-block">
            <p className="section-intro">
              Conoce a las personas que hacen posible Wave Surf Club cada día — instructores, shapers y apasionados del mar.
            </p>
          </div>

          {/* Bio + Instagram Card */}
          <div className="content-grid">
            <div className="text-block">
              <p>
                Nuestro equipo está formado por <strong className="text-white">surfistas de vocación</strong> con años de experiencia en el agua y en la enseñanza.
                Cada instructor aporta su propio estilo y visión, creando una comunidad diversa y auténtica.
              </p>
              <p className="quote">
                "El surf no es solo un deporte, es una forma de vida que compartimos con cada alumno que llega a la escuela."
                <br /><span className="author">— Equipo Wave Surf Club</span>
              </p>
              <p style={{ marginTop: 30 }}>
                Desde Punta Piedra hasta Pichilemu, nuestros profes trabajan en cada sede con dedicación y pasión, adaptando las clases al nivel y ritmo de cada persona.
              </p>
            </div>

            {/* Instagram Card */}
            <div className="social-card">
              <Instagram size={48} className="icon-accent" />
              <h3 className="card-title">Síguenos en Instagram</h3>
              <p className="card-text">
                Videos de clases, sesiones en el mar y el día a día de nuestro equipo.
              </p>
              <a
                href="https://www.instagram.com/wave_surf_club/"
                target="_blank"
                rel="noopener noreferrer"
                className="insta-btn"
              >
                @wave_surf_club
              </a>
            </div>
          </div>

          {/* Barra de contacto WhatsApp */}
          <div className="quote-bar">
            <div className="quote-content">
              <div className="quote-text">
                <h3>¿QUIERES UNIRTE AL EQUIPO?</h3>
                <p>Contáctanos si eres instructor o tienes experiencia en el surf.</p>
              </div>
              <a
                href="https://wa.me/56975803044?text=Hola%2C%20me%20interesa%20unirme%20al%20equipo%20de%20Wave%20Surf%20Club."
                target="_blank"
                className="quote-whatsapp"
              >
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                ESCRIBIR AL EQUIPO
              </a>
            </div>
          </div>

          {/* Galería + Video Instagram */}
          <div className="work-display-grid">

            {/* Carrusel de fotos del equipo */}
            <div className="carousel-column">
              <h3 className="section-title">GALERÍA DEL EQUIPO</h3>
              <div className="carousel-frame vertical">
                {teamImages.map((img, idx) => (
                  <div
                    key={idx}
                    className={`carousel-slide ${idx === currentIdx ? 'active' : ''}`}
                  >
                    <Image
                      src={img}
                      alt="Equipo Wave Surf Club"
                      fill
                      style={{ objectFit: 'cover', objectPosition: 'top' }}
                    />
                  </div>
                ))}
              </div>
              <div className="carousel-dots">
                {teamImages.map((_, idx) => (
                  <div
                    key={idx}
                    className={`dot ${idx === currentIdx ? 'active' : ''}`}
                    onClick={() => setCurrentIdx(idx)}
                  />
                ))}
              </div>
            </div>

            {/* Video YouTube Morrison Tapia */}
            <div className="video-column">
              <h3 className="section-title">VIAJANDO CON TODO EL FLOW AL ESTILO DE MORRISAKIO</h3>
              <div className="video-frame youtube-frame">
                <iframe
                  src="https://www.youtube.com/embed/bmMiC1XvH88?rel=0&modestbranding=1&autoplay=0"
                  title="Morrison Tapia — Wave Surf Club"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  style={{ display: 'block', position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                ></iframe>
              </div>
              <div className="video-details" style={{ marginTop: '20px', textAlign: 'center' }}>
                <p className="video-caption">
                  <strong style={{ color: '#fff', fontSize: '16px' }}>Rider-Morrison Tapia</strong>
                </p>
                <a
                  href="https://www.instagram.com/morrisakio/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rider-insta-btn"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ flexShrink: 0 }}>
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  @morrisakio
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      <footer>
        WAVE SURF CLUB © 2026 — NUESTRO EQUIPO
      </footer>

      <style jsx>{`
        .equipo-page {
          background: #000;
          color: #fff;
          min-height: 100vh;
          font-family: var(--font-archivo), sans-serif;
        }

        /* --- HERO --- */
        .hero {
          position: relative;
          width: 100vw;
          height: auto;
          aspect-ratio: 1366 / 768; /* Respetar proporciones exactas de la imagen */
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000;
        }
        .hero-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain; /* Asegurar que se vea completa si el ratio varía mínimamente */
          object-position: center center;
        }

        /* --- INFO SECTION --- */
        .info-section {
          padding: 100px 20px;
          background: #000;
        }
        .header-block { margin-bottom: 80px; }
        .section-intro {
          font-size: 20px;
          color: #94a3b8;
          max-width: 700px;
          margin: 0 auto;
          text-align: center;
          line-height: 1.7;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
        }
        @media (max-width: 900px) {
          .content-grid { grid-template-columns: 1fr; }
        }

        .text-block {
          font-size: 18px;
          line-height: 1.8;
          color: #cbd5e1;
          font-weight: 300;
        }
        .text-white { color: #fff; font-weight: 800; }
        .quote {
          margin-top: 40px;
          border-left: 3px solid #38bdf8;
          padding-left: 20px;
          font-style: italic;
          color: #fff;
        }
        .author {
          display: block;
          margin-top: 10px;
          font-size: 14px;
          font-style: normal;
          color: #38bdf8;
          font-weight: 800;
          text-transform: uppercase;
        }

        .social-card {
          background: #0a0a0a;
          border: 1px solid #1a1a1a;
          padding: 60px 40px;
          border-radius: 24px;
          text-align: center;
          transition: all 0.4s;
        }
        .social-card:hover {
          border-color: #38bdf8;
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(56, 189, 248, 0.1);
        }
        .icon-accent { color: #38bdf8; margin-bottom: 24px; }
        .card-title { font-size: 24px; font-weight: 800; margin-bottom: 12px; }
        .card-text { color: #94a3b8; font-size: 14px; margin-bottom: 32px; }

        .insta-btn {
          display: inline-block;
          background: #fff;
          color: #000;
          padding: 16px 32px;
          border-radius: 50px;
          font-weight: 900;
          text-decoration: none;
          text-transform: uppercase;
          font-size: 13px;
          letter-spacing: 1px;
          transition: all 0.3s;
        }
        .insta-btn:hover {
          background: #38bdf8;
          transform: scale(1.05);
        }

        /* --- QUOTE BAR --- */
        .quote-bar {
          margin-top: 80px;
          background: linear-gradient(90deg, #0a0a0a, #111);
          border: 1px solid rgba(56, 189, 248, 0.2);
          border-radius: 20px;
          padding: 30px 50px;
          box-shadow: 0 15px 30px rgba(0,0,0,0.4);
        }
        .quote-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 30px;
        }
        .quote-text h3 {
          font-size: 20px;
          font-weight: 950;
          letter-spacing: 1px;
          margin-bottom: 5px;
        }
        .quote-text p {
          color: #94a3b8;
          font-size: 14px;
          margin: 0;
        }
        .quote-whatsapp {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #25d366;
          color: #fff;
          padding: 16px 30px;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 900;
          font-size: 14px;
          letter-spacing: 1px;
          transition: transform 0.3s;
          white-space: nowrap;
        }
        .quote-whatsapp:hover {
          transform: scale(1.05) translateY(-2px);
          box-shadow: 0 10px 20px rgba(37, 211, 102, 0.3);
        }

        /* --- WORK DISPLAY GRID --- */
        .work-display-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          margin-top: 100px;
          align-items: start;
        }
        .section-title {
          font-size: 14px;
          letter-spacing: 4px;
          color: #38bdf8;
          margin-bottom: 25px;
          font-weight: 900;
          text-transform: uppercase;
          text-align: left;
          border-left: 2px solid #38bdf8;
          padding-left: 15px;
        }
        .carousel-frame.vertical {
          position: relative;
          height: 720px;
          border-radius: 24px;
          overflow: hidden;
          background: #050505;
          box-shadow: 0 40px 80px rgba(0,0,0,0.6);
          border: 1px solid rgba(255,255,255,0.05);
        }
        .video-frame {
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 40px 80px rgba(0,0,0,0.6);
          border: 1px solid rgba(255,255,255,0.05);
          background: #000;
          height: auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        /* YouTube 16:9 responsive container */
        .video-frame.youtube-frame {
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
          display: block;
        }
        .video-caption {
          margin-top: 20px;
          font-size: 15px;
          color: #94a3b8;
          text-align: center;
        }
        .rider-insta-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 14px;
          background: linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045);
          color: #fff;
          padding: 10px 24px;
          border-radius: 50px;
          font-weight: 800;
          font-size: 13px;
          letter-spacing: 0.5px;
          text-decoration: none;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .rider-insta-btn:hover {
          transform: scale(1.06) translateY(-2px);
          box-shadow: 0 10px 30px rgba(253, 29, 29, 0.4);
        }
        .link-accent {
          color: #38bdf8;
          text-decoration: none;
          font-weight: 700;
        }
        .link-accent:hover { text-decoration: underline; }

        /* --- CAROUSEL --- */
        .carousel-slide {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 1s ease-in-out, transform 1s ease-in-out;
          transform: scale(1.05);
        }
        .carousel-slide.active {
          opacity: 1;
          transform: scale(1);
        }
        .carousel-dots {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-top: 30px;
        }
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          cursor: pointer;
          transition: all 0.3s;
        }
        .dot.active {
          background: #38bdf8;
          width: 24px;
          border-radius: 10px;
        }

        footer {
          text-align: center;
          padding: 60px 0;
          font-size: 10px;
          letter-spacing: 4px;
          color: #334155;
          border-top: 1px solid #111;
        }

        /* ============================================ */
        /* RESPONSIVE — TABLET (≤ 1024px)               */
        /* ============================================ */
        @media (max-width: 1024px) {
          .work-display-grid {
            grid-template-columns: 1fr;
            gap: 60px;
          }
          .hero {
            aspect-ratio: 16 / 9;
            min-height: 220px;
          }
          .hero-img {
            object-fit: cover;
            object-position: center top;
          }
          .info-section {
            padding: 60px 20px;
          }
          .carousel-frame.vertical {
            height: 500px;
          }
          .header-block {
            margin-bottom: 50px;
          }
        }

        /* ============================================ */
        /* RESPONSIVE — MOBILE (≤ 768px)                */
        /* ============================================ */
        @media (max-width: 768px) {
          /* Hero */
          .hero {
            aspect-ratio: unset;
            height: 55vw;
            min-height: 200px;
            max-height: 320px;
          }
          .hero-img {
            object-fit: cover;
            object-position: center top;
          }

          /* Info section */
          .info-section {
            padding: 40px 16px;
          }
          .header-block {
            margin-bottom: 36px;
          }
          .section-intro {
            font-size: 15px;
            line-height: 1.6;
          }

          /* Bio grid → columna única */
          .content-grid {
            grid-template-columns: 1fr;
            gap: 36px;
          }
          .text-block {
            font-size: 15px;
          }
          .social-card {
            padding: 36px 24px;
          }

          /* Quote bar */
          .quote-content {
            flex-direction: column;
            text-align: center;
            gap: 20px;
          }
          .quote-bar {
            padding: 24px 16px;
            margin-top: 40px;
          }
          .quote-text h3 {
            font-size: 16px;
          }
          .quote-whatsapp {
            width: 100%;
            justify-content: center;
            padding: 14px 20px;
          }

          /* Galería + Video → columna única */
          .work-display-grid {
            grid-template-columns: 1fr;
            gap: 48px;
            margin-top: 48px;
          }
          .carousel-frame.vertical {
            height: 72vw;
            max-height: 420px;
            border-radius: 16px;
          }
          .section-title {
            font-size: 11px;
            letter-spacing: 2.5px;
          }

          /* Video YouTube */
          .video-frame.youtube-frame {
            border-radius: 16px;
          }
          .video-details {
            margin-top: 14px !important;
          }
          .rider-insta-btn {
            width: 100%;
            justify-content: center;
            padding: 12px 20px;
          }

          /* Footer */
          footer {
            padding: 40px 16px;
          }
        }

        /* ============================================ */
        /* RESPONSIVE — SMALL MOBILE (≤ 430px)          */
        /* iPhone 12 Pro Max, 14 Plus, etc.             */
        /* ============================================ */
        @media (max-width: 430px) {
          /* Hero: imagen ocupa bien el ancho */
          .hero {
            height: 60vw;
            min-height: 180px;
            max-height: 260px;
          }
          .hero-img {
            object-fit: cover;
            object-position: center 30%;
          }

          /* Spacing */
          .info-section {
            padding: 32px 14px;
          }
          .header-block {
            margin-bottom: 28px;
          }
          .section-intro {
            font-size: 14px;
          }

          /* Texto bio */
          .text-block {
            font-size: 14px;
            line-height: 1.7;
          }
          .quote {
            margin-top: 24px;
            padding-left: 14px;
          }
          .social-card {
            padding: 28px 16px;
          }
          .card-title {
            font-size: 18px;
          }
          .insta-btn {
            padding: 14px 24px;
            font-size: 12px;
          }

          /* Quote bar */
          .quote-bar {
            padding: 20px 14px;
            border-radius: 14px;
          }
          .quote-text h3 {
            font-size: 14px;
          }
          .quote-text p {
            font-size: 12px;
          }

          /* Carrusel */
          .carousel-frame.vertical {
            height: 80vw;
            max-height: 340px;
            border-radius: 14px;
          }
          .carousel-dots {
            margin-top: 16px;
            gap: 8px;
          }

          /* Video */
          .video-frame.youtube-frame {
            border-radius: 14px;
          }
          .video-caption {
            font-size: 13px;
            margin-top: 12px !important;
          }
          .rider-insta-btn {
            font-size: 12px;
            padding: 10px 16px;
          }

          /* Section title */
          .section-title {
            font-size: 10px;
            letter-spacing: 2px;
            margin-bottom: 16px;
          }

          /* Work grid spacing */
          .work-display-grid {
            margin-top: 36px;
            gap: 40px;
          }

          /* Footer */
          footer {
            padding: 32px 14px;
            font-size: 9px;
            letter-spacing: 2px;
          }
        }
      `}</style>
    </div>
  );
}
