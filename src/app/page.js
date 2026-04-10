'use client';

import { useState } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { useTranslation } from '@/lib/i18n-context';

export default function LandingPage() {
  const { t } = useTranslation();

  return (
    <main style={{ 
      width: '100%', 
      height: '100vh', 
      backgroundColor: '#000', 
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Navbar principal */}
      <Navbar />

      {/* Hero Principal (Solo PORTADA) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 1
      }}>
        <Image 
          src="/FONDO INICIO.png" 
          alt="Wave Surf Club - Portada" 
          fill 
          priority
          style={{ 
            objectFit: 'cover',
            objectPosition: 'center'
          }}
        />
      </div>

      {/* Pequeña animación de entrada o micro-overlay si fuera necesario */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.4))',
        zIndex: 2,
        pointerEvents: 'none'
      }} />

      <style jsx global>{`
        body { 
          margin: 0; 
          padding: 0; 
          overflow: hidden; 
          background: #000;
          font-family: var(--font-archivo), sans-serif;
        }
      `}</style>
    </main>
  );
}
