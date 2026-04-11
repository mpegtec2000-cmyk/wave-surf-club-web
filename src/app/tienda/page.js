'use client';

import Image from 'next/image';
import Navbar from '@/components/Navbar';

export default function TiendaPage() {
  return (
    <main style={{ 
      width: '100%', 
      height: '100vh', 
      backgroundColor: '#000', 
      position: 'relative',
      overflow: 'hidden'
    }}>
      <Navbar />
      
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1
      }}>
        <Image 
          src="/FONDO TIENDA.jpg" 
          alt="Wave Surf Club Shop" 
          fill 
          priority
          style={{ 
            objectFit: 'cover',
            objectPosition: 'center'
          }}
        />
        {/* Overlay subtle */}
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.5))',
          zIndex: 2 
        }} />
      </div>

      <div style={{
        position: 'relative',
        zIndex: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        textAlign: 'center',
        padding: '0 20px'
      }}>
        <h1 style={{ 
          fontSize: 'clamp(40px, 8vw, 100px)', 
          fontWeight: 950, 
          textTransform: 'uppercase',
          letterSpacing: '-0.04em',
          marginBottom: '10px'
        }}>
          TIENDA
        </h1>
        <p style={{ 
          fontSize: 'clamp(14px, 2vw, 20px)', 
          fontWeight: 500, 
          letterSpacing: '2px',
          opacity: 0.8,
          textTransform: 'uppercase'
        }}>
          Coming Soon / Próximamente
        </p>
      </div>

      <style jsx global>{`
        body { margin: 0; padding: 0; background: #000; }
      `}</style>
    </main>
  );
}
