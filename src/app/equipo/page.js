'use client';

import Image from 'next/image';
import Navbar from '@/components/Navbar';

export default function EquipoPage() {
  return (
    <main className="equipo-pure-container">
      <style jsx>{`
        .equipo-pure-container {
          width: 100%;
          height: 100vh;
          padding-top: 95px;
          background: #000;
          position: relative;
          overflow: hidden;
          box-sizing: border-box;
        }

        @media (max-width: 1023px) {
          .equipo-pure-container {
            padding-top: 70px;
          }
        }

        .img-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .pure-img {
          object-fit: cover;
          object-position: center;
        }

      `}</style>

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
    </main>
  );
}
