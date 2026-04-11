'use client';

import Image from 'next/image';
import Navbar from '@/components/Navbar';

export default function EquipoPage() {
  return (
    <main className="equipo-pure-container">
      <Navbar />

      <div className="img-wrapper">
        <Image 
          src="/FONDO EQUIPO.jpg" 
          alt="Equipo Wave Surf Club"
          fill
          priority
          className="pure-img"
        />
      </div>

      <style jsx>{`
        .equipo-pure-container {
          width: 100%;
          height: 100vh;
          background: #000;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .img-wrapper {
          flex: 1;
          position: relative;
          width: 100%;
          margin-top: var(--nav-height);
        }

        :global(.pure-img) {
          object-fit: cover !important;
          object-position: center top !important;
        }

        @media (max-width: 1023px) {
          .equipo-pure-container {
            height: auto;
            min-height: 100vh;
            overflow: visible;
          }
          .img-wrapper {
            height: 70vh;
            flex: none;
            margin-top: var(--nav-height);
          }
          :global(.pure-img) {
            object-fit: cover !important;
            object-position: center !important;
          }
        }
      `}</style>
    </main>
  );
}
