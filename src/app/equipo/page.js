'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';

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
          filter: none !important;
          opacity: 1 !important;
        }

      `}</style>

      <Navbar />

      <div className="img-wrapper">
        <img 
          src="/FONDO EQUIPO.jpg" 
          alt="Equipo Wave Surf Club"
          className="pure-img"
        />
      </div>
    </main>
  );
}
