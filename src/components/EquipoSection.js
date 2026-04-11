'use client';

import Image from 'next/image';
import { riders } from '@/lib/rider-directory';
import Link from 'next/link';

export default function EquipoSection() {
  return (
    <section className="equipo-section" id="equipo">

      <div className="equipo-bg-container" style={{ position: 'relative', width: '100%', height: '100%' }}>
        <Image 
          src="/FONDO-RAIDERS.PNG" 
          alt="Riders Background"
          fill
          priority
          style={{ objectFit: 'cover' }}
          className="equipo-bg-img"
        />
      </div>

      <div className="equipo-content">
        <h2 className="equipo-title">THE RIDERS</h2>

        <div className="equipo-riders-grid">
          {riders.map((rider) => (
            <Link 
              key={rider.id} 
              href={`/riders/${rider.slug || rider.id}`} 
              className="equipo-rider-item"
            >
              <div className="equipo-card">
                 <span className="equipo-prefix">WSC TEAM</span>
                 <span className="equipo-name">{rider.nombre}</span>
                 <span className="equipo-id">RDR-{String(rider.id).padStart(3, '0')}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
