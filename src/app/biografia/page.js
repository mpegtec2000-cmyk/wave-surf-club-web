'use client';

import Image from 'next/image';
import Navbar from '@/components/Navbar';

export default function BiografiaPage() {
  return (
    <main style={{ 
      width: '100%', 
      height: '100vh', 
      backgroundColor: '#000', 
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Navbar />

      <div style={{
        position: 'relative',
        width: '100%',
        flex: 1,
        marginTop: 'var(--nav-height)',
        zIndex: 1
      }}>
        <Image 
          src="/BIOGRAFIA.jpg" 
          alt="Biografía Wave Surf Club" 
          fill 
          priority
          style={{ 
            objectFit: 'cover',
            objectPosition: 'center',
            display: 'block'
          }}
        />
      </div>

      <style jsx global>{`
        body { margin: 0; padding: 0; overflow: hidden; background: #000; }
        /* Hacemos que la barra sea un poco más sutil en esta página si es necesario */
        .nav-luxury-container {
          background-color: rgba(255, 255, 255, 0.8) !important;
          backdrop-filter: blur(10px);
        }
      `}</style>
    </main>
  );
}
