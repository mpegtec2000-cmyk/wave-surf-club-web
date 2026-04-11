'use client';

import { useState } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { useTranslation } from '@/lib/i18n-context';

export default function LandingPage() {
  const { t } = useTranslation();

  return (
    <>
      <Navbar />
      <main style={{ marginTop: '95px', width: '100%', height: 'calc(100vh - 95px)', position: 'relative', overflow: 'hidden' }}>
        <div id="hero" style={{ position: 'relative', width: '100%', height: '100%', zIndex: 1 }}>
          <Image 
            src="/FONDO OFICIAL.png" 
            alt="Wave Surf Club - Portada Oficial" 
            fill 
            priority
            quality={100}
            style={{ 
              objectFit: 'cover',
              objectPosition: 'center top'
            }}
          />
        </div>
      </main>

      <style jsx global>{`
        body { 
          margin: 0; 
          padding: 0; 
          overflow: hidden; 
          background: #000;
          font-family: var(--font-archivo), sans-serif;
        }
      `}</style>
    </>
  );
}
