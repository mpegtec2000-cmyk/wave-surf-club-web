'use client';

import { riders } from '@/lib/rider-directory';
import Link from 'next/link';

export default function EquipoSection() {
  return (
    <section className="equipo-section" id="equipo">

      <div className="equipo-bg-container">
        <img 
          src="/FONDO-RAIDERS.PNG" 
          alt="Riders Background"
          className="equipo-bg-img"
        />
      </div>

      <div className="equipo-content">
        <h2 className="equipo-title">THE RIDERS</h2>

        <div className="equipo-riders-grid">
          {riders.map((rider) => (
            <Link 
              key={rider.id} 
              href={`/riders/${rider.id}`} 
              className="equipo-rider-item"
            >
              <div className="equipo-card">
                 <span className="equipo-prefix">WSC TEAM</span>
                 <span className="equipo-name">{rider.name}</span>
                 <span className="equipo-id">RDR-{String(rider.id).padStart(3, '0')}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
