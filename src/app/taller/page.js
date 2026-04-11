'use client';

import Image from 'next/image';
import Navbar from '@/components/Navbar';

export default function TallerPage() {
  return (
    <div className="taller-page">
      <Navbar />
      
      {/* HERO SECTION - Full Height */}
      <section className="hero">
        <Image 
          src="/FONDO TALLER MATI.jpg" 
          alt="Taller Wave Surf Club"
          fill
          priority
          className="hero-img"
        />
      </section>

      <style jsx>{`
        .taller-page {
          background: #000;
          color: #fff;
          min-height: 100vh;
          font-family: var(--font-archivo), sans-serif;
        }

        /* --- HERO --- */
        .hero {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hero-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }
      `}</style>
    </div>
  );
}
