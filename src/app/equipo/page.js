'use client';

import Link from 'next/link';

export default function EquipoPage() {
  return (
    <main className="equipo-pure-container">
      <style jsx>{`
        .equipo-pure-container {
          width: 100%;
          height: 100vh;
          background: #000;
          position: relative;
          overflow: hidden;
        }

        .pure-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          /* Respetando el arte original: sin filtros */
          filter: none !important;
          opacity: 1 !important;
        }

        /* Botón discreto para volver */
        .back-btn {
          position: absolute;
          top: 20px;
          left: 20px;
          z-index: 100;
          background: rgba(255, 255, 255, 0.8);
          color: #000;
          padding: 8px 16px;
          border-radius: 4px;
          text-decoration: none;
          font-family: var(--font-archivo), sans-serif;
          font-weight: 900;
          font-size: 12px;
          text-transform: uppercase;
          transition: background 0.3s;
        }
        .back-btn:hover {
          background: #fff;
        }
      `}</style>

      <Link href="/" className="back-btn">
        Volver
      </Link>

      <div className="img-wrapper">
        <img 
          src="/FONDO-RAIDERS.jpg" 
          alt="Equipo Wave Surf Club"
          className="pure-img"
        />
      </div>
    </main>
  );
}
