'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

const RIDERS_DATA = {
  'tomas-bock': {
    name: 'Tomas Bock',
    role: 'PRO RIDER',
    cover: '/tomy-escuela.png',
    bio: '<p>Tomas Bock es uno de los riders más destacados de la escena nacional. Con una trayectoria impecable en el circuito Pro, Tomas representa la esencia pura de Wave Surf Club: disciplina, pasión y una conexión profunda con el océano.</p>',
    stats: { board: 'Wave Tech 6\'0"', stance: 'Regular', local: 'Pichilemu' },
    gallery: [
      '/tomy-escuela.png',
      'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1533031021462-8e7ac46b1d4c?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  'paulo-munoz': {
    name: 'Paulo Muñoz',
    role: 'LEGEND / SURF COACH',
    title: 'BIOGRAFÍA: PAULO MUÑOZ',
    cover: '/paulo-1.png',
    bio: `
      <p>Para Paulo, Playa La Boca representa su entorno de formación principal y su base técnica. Motivado desde temprana edad por la cultura de tabla, ha desarrollado un respeto profundo por las disciplinas del surf y el skate, recorriendo diversos escenarios internacionales con el objetivo de integrar las mejores prácticas del deporte global.</p>
      <p>Como <strong>Rider bilingüe certificado por la International Surfing Association (ISA)</strong>, Paulo fusiona una vasta experiencia en terreno con la metodología técnica necesaria para liderar procesos de enseñanza, desde niveles iniciales hasta el perfeccionamiento de maniobras avanzadas.</p>
      <p>Su enfoque integral en el entrenamiento de <strong>Surf y Skate</strong> lo posiciona como un instructor clave para quienes buscan optimizar su performance. Actualmente, Paulo desempeña su labor profesional exclusivamente en <strong>Wave Surf Club</strong>, aportando un estándar de instrucción de clase mundial a la comunidad local.</p>
    `,
    stats: { board: 'Wave Classic 7\'4"', stance: 'Goofy', local: 'Concón' },
    gallery: [
      '/riders/paulo/R1.jpg',
      '/riders/paulo/R2.jpg',
      '/riders/paulo/R3.jpg',
      '/riders/paulo/R4.jpg',
      '/riders/paulo/R5.jpg',
      '/riders/paulo/R6.jpg',
      '/riders/paulo/R7.jpg',
      '/riders/paulo/R8.jpg'
    ],
    magazine: 'https://drive.google.com/drive/folders/1ZXnRizAjEvrCkdoV0tfGwF7esY4g81oK?usp=sharing'
  },
  'felipe-edge': {
    name: 'Felipe Edge',
    role: 'TECH COACH',
    cover: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=80',
    bio: '<p>Maestro de la técnica. Felipe analiza cada movimiento para optimizar el performance de los riders pro, utilizando tecnología y experiencia para alcanzar la perfección.</p>',
    stats: { board: 'Wave Tech 6\'2"', stance: 'Regular', local: 'Concón' },
    gallery: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=80']
  },
  'angelo-avello': {
    name: 'Angelo Avello',
    role: 'RIDER',
    cover: 'https://images.unsplash.com/photo-1520156584202-0e94b9f01391?auto=format&fit=crop&w=1200&q=80',
    bio: '<p>Angelo Avello se une al equipo para demostrar que el surf es más que un deporte, es una forma de vida. Su estilo fluido y compromiso con la excelencia lo posicionan como un talento a seguir.</p>',
    stats: { board: 'Wave Tech 6\'2"', stance: 'Regular', local: 'Concón' },
    gallery: ['https://images.unsplash.com/photo-1520156584202-0e94b9f01391?auto=format&fit=crop&w=1200&q=80']
  },
  'cristobal-lazcano': {
    name: 'Cristobal Lazcano',
    role: 'RIDER',
    cover: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=80',
    bio: '<p>Cristobal Lazcano aporta frescura y potencia al equipo. Con una visión técnica impecable, Cristobal representa la nueva ola de deportistas que están redefiniendo el surf nacional.</p>',
    stats: { board: 'Wave Performance 6\'0"', stance: 'Goofy', local: 'Pichilemu' },
    gallery: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=80']
  },
  'vicente-pipe': {
    name: 'Vicente Pipe',
    role: 'RIDER',
    cover: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80',
    bio: '<p>El ojo narrativo. Vicente captura la gloria y el esfuerzo del club, inmortalizando los momentos que definen nuestra historia y la belleza del deporte de tabla.</p>',
    stats: { board: 'Wave Media Hub', stance: 'N/A', local: 'Chile' },
    gallery: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80']
  },
  default: {
    name: 'Wave Rider',
    role: 'TEAM RIDER',
    cover: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1920&q=80',
    bio: '<p>Nacido entre las olas de la zona central, este rider ha dedicado su vida a perfeccionar la técnica y el estilo que definen a la nueva generación del surf chileno.</p>',
    stats: { board: 'Wave Custom', stance: 'Natural', local: 'Chile' },
    gallery: [
      'https://images.unsplash.com/photo-1533031021462-8e7ac46b1d4c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512413912197-e81882bdc63c?auto=format&fit=crop&w=1200&q=80'
    ]
  }
};

export default function RiderMagazine() {
  const { slug } = useParams();
  const rider = RIDERS_DATA[slug] || RIDERS_DATA.default;
  const [scrolled, setScrolled] = useState(false);
  const [index, setIndex] = useState(0);

  const formatSpaced = (text) => text.toUpperCase().split('').join(' ');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (rider.gallery && rider.gallery.length > 1) {
      const interval = setInterval(() => {
        setIndex((prev) => (prev + 1) % rider.gallery.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [rider.gallery]);

  return (
    <div className="mag-container">
      <style jsx>{`
        .mag-container {
          background: #ffffff;
          color: #000;
          min-height: 100vh;
          font-family: var(--font-sans);
        }

        /* --- HERO COVER --- */
        .mag-hero {
          height: 100vh;
          position: relative;
          display: flex;
          align-items: flex-end;
          padding: 100px 8%;
          overflow: hidden;
        }
        .hero-bg {
          position: absolute;
          inset: 0;
          background: #000 url(${rider.cover}) center/contain no-repeat;
          z-index: 1;
        }
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, #0b1120, transparent 60%);
          z-index: 2;
        }
        .hero-title-box {
          position: relative;
          z-index: 3;
          max-width: 900px;
          background: rgba(255, 255, 255, 0.95);
          padding: 40px 60px;
          border: 1px solid #000;
          box-shadow: 20px 20px 0px rgba(0,0,0,0.1);
        }
        .mag-name {
          font-size: clamp(24px, 4vw, 48px);
          font-weight: 900;
          line-height: 1.2;
          display: flex;
          align-items: center;
          gap: 15px;
          text-transform: uppercase;
          margin: 0;
          color: #000;
        }
        .mag-prefix {
          color: #38bdf8;
          letter-spacing: 4px;
        }

        /* --- EDITORIAL SECTIONS --- */
        .mag-content {
          padding: 100px 8%;
        }
        .editorial-row {
          display: flex;
          gap: 60px;
          margin-bottom: 120px;
          align-items: center;
        }
        .text-col { flex: 1; }
        .img-col { flex: 1.5; }
        
        .editorial-title {
          font-family: var(--font-montserrat);
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 30px;
          color: #000;
          text-transform: uppercase;
        }
        .editorial-p {
          font-family: var(--font-inter);
          font-size: 16px;
          line-height: 1.8;
          color: #334155;
          font-weight: 400;
          text-align: justify;
        }
        .editorial-p p { margin-bottom: 20px; }
        .editorial-p strong { color: #000; font-weight: 700; }
        
        .carousel-container {
          position: relative;
          width: 100%;
          height: 600px;
          overflow: hidden;
          border-radius: 4px;
          box-shadow: 0 30px 60px rgba(0,0,0,0.5);
        }
        .carousel-image-wrapper {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 1.5s ease-in-out, transform 8s ease-out;
          transform: scale(1.1);
        }
        .carousel-image-wrapper.active {
          opacity: 1;
          transform: scale(1);
        }

        /* --- DOWNLOAD BUTTON --- */
        .download-btn-container {
          margin-top: 40px;
          display: flex;
          justify-content: flex-start;
        }
        .mag-download-btn {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
          color: white;
          padding: 16px 32px;
          border-radius: 50px;
          font-weight: 800;
          text-decoration: none;
          font-size: 14px;
          letter-spacing: 1px;
          text-transform: uppercase;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 10px 20px rgba(14, 165, 233, 0.3);
        }
        .mag-download-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 30px rgba(14, 165, 233, 0.4);
        }

        @media (max-width: 900px) {
          .editorial-row { flex-direction: column; text-align: center; }
          .editorial-title { font-size: 24px; }
        }
      `}</style>
      
      <Navbar />

      <header className="mag-hero">
        <div className="hero-bg" />
        <div className="hero-overlay" />
        <div className="hero-title-box">
          <h1 className="mag-name">
            <span className="mag-prefix">R I D E R</span> 
            <span>/</span>
            <span>{formatSpaced(rider.name)}</span>
          </h1>
        </div>
      </header>

      <main className="mag-content">
        <div className="editorial-row">
          <div className="text-col">
            <h2 className="editorial-title">
              {rider.title || 'LA ESENCIA DEL RIDER'}
            </h2>
            <div 
              className="editorial-p" 
              dangerouslySetInnerHTML={{ __html: rider.bio }} 
            />

            {rider.magazine && (
              <div className="download-btn-container">
                <a 
                  href={rider.magazine} 
                  download 
                  className="mag-download-btn"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  descargar REVISTA PAULO
                </a>
              </div>
            )}
          </div>
          <div className="img-col">
            <div className="carousel-container">
              {rider.gallery.map((img, i) => (
                <div key={i} className={`carousel-image-wrapper ${i === index ? 'active' : ''}`}>
                  <Image 
                    src={img} 
                    fill
                    sizes="(max-width: 900px) 100vw, 50vw"
                    priority={i === 0}
                    style={{ objectFit: 'cover' }}
                    alt={`Rider ${i}`} 
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer style={{ padding: '100px 40px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <p style={{ color: '#475569', fontSize: '12px', letterSpacing: '4px' }}>WAVE SURF CLUB © 2015-2026</p>
      </footer>
    </div>
  );
}
