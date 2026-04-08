'use client';

import { ryders } from '@/lib/ryder-directory';
import Link from 'next/link';

export default function EquipoSection() {
  return (
    <section className="equipo-section" id="equipo">
      <style jsx>{`
        .equipo-section {
          position: relative;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* IMAGEN DE FONDO: Centrada y Pantalla Completa */
        .bg-container {
          position: absolute;
          inset: 0;
          z-index: 1;
        }
        .bg-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }

        /* Overlay para profundidad */
        .overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(2px);
          -webkit-backdrop-filter: blur(2px);
          z-index: 2;
        }

        /* CONTENIDO SUPERPUESTO */
        .content {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          items-center;
          width: 100%;
          max-width: 1400px;
          padding: 0 40px;
          text-align: center;
        }

        .title {
          color: #fff;
          font-size: clamp(60px, 12vw, 150px);
          font-weight: 950;
          letter-spacing: -0.08em;
          margin-bottom: 40px;
          line-height: 0.9;
          text-transform: uppercase;
        }

        /* Directorio de 14 Riders en Grid Artístico */
        .ryders-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          width: 100%;
          margin: 0 auto;
        }

        @media (min-width: 768px) {
          .ryders-grid {
            grid-template-columns: repeat(7, 1fr);
            gap: 20px;
          }
        }

        .ryder-item {
          text-decoration: none;
          display: block;
        }

        .card {
          background: rgba(255, 255, 255, 0.9);
          aspect-ratio: 1 / 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 10px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .card:hover {
          background: #ffffff;
          transform: scale(1.05);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }

        .prefix {
          font-size: 8px;
          font-weight: 800;
          color: #2563eb;
          margin-bottom: 4px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .name {
          font-size: 10px;
          font-weight: 950;
          color: #000;
          text-transform: uppercase;
          line-height: 1.1;
          margin: 0;
          letter-spacing: -0.02em;
        }

        @media (min-width: 1024px) {
          .prefix { font-size: 9px; }
          .name { font-size: 11px; }
        }
      `}</style>

      <div className="bg-container">
        <img 
          src="/FONDO-RAIDERS.jpg" 
          alt="Wave Surf Club Background"
          className="bg-img"
        />
        <div className="overlay"></div>
      </div>

      <div className="content">
        <h2 className="title">EQUIPO</h2>

        <div className="ryders-grid">
          {ryders.map((ryder) => {
            const isVacio = ryder.nombre === "VACÍO";
            return (
              <Link 
                key={ryder.id} 
                href={!isVacio ? `/ryders/${ryder.slug}` : "/ryders"} 
                className="ryder-item"
              >
                <div className="card">
                   <p className="prefix">RYDER |</p>
                   <p className="name">{ryder.nombre}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
