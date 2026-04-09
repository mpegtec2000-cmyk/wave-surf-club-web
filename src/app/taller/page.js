'use client';

import Navbar from '@/components/Navbar';

export default function TallerPage() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Navbar />
      <img 
        src="/paulo-1.png" 
        alt="Taller Wave Surf Club"
        className="pure-img"
      />
      <style jsx>{`
        .pure-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          filter: none !important;
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}
