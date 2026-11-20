'use client';

import './escuelas.css';

import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { ArrowUpRight } from 'lucide-react';

export default function EscuelasPage() {
  const sedes = [
    {
      id: 'concon',
      num: '01',
      title: 'WAVE SURF CLUB CONCÓN',
      subtitle: 'SEDE MATRIZ · PLAYA LA BOCA',
      desc: 'Mega Ramp más grande de Chile y Staff de Élite. Única con experiencia Full Day: tu equipo te espera para una segunda sesión sin costo adicional.',
      img: '/TIENDA/4.PNG',
      features: ['Mega Ramp Pro', 'Duchas Calientes', 'Taller Neoprene', 'Cafetería & Mirador'],
      cta: 'VER SEDE CONCÓN',
      highlight: 'FULL DAY'
    },
    {
      id: 'pichilemu',
      num: '02',
      title: 'PICHILEMU',
      subtitle: 'CAPITAL DEL SURF · TALLER AGAVE',
      desc: 'Ubicada en la meca del surf chileno. Inmersión total en olas de clase mundial junto al taller de shaping sustentable de Matías Espinoza.',
      img: '/PICHILEMU.jpg',
      features: ['Olas World Class', 'Shaping Agave', 'Reparación Pro', 'Acceso Directo'],
      cta: 'EXPLORAR PICHILEMU',
      highlight: 'TALLER PRO'
    },
    {
      id: 'punta-piedra',
      num: '03',
      title: 'PUNTA DE PIEDRA',
      subtitle: 'HIGH PERFORMANCE · 2026',
      desc: 'Nuestra sede más moderna y vanguardista. Arquitectura 360° frente al mar, entrenamiento de alto rendimiento y rampas de skate.',
      img: '/punta-piedra.png',
      features: ['Arquitectura 360°', 'Bowl & Street Skate', 'Coaching Técnico', 'Inclusión Total'],
      cta: 'VER PUNTA PIEDRA',
      highlight: 'NEW SPOT'
    }
  ];

  return (
    <main className="esc-root">
      <Navbar />

      <div className="esc-bg-wrap" aria-hidden="true">
        <Image
          src="/Club%20Wave%20Project%20bajo%20luces%20nocturnas.png"
          alt=""
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: 'center' }}
        />
        <div className="esc-bg-overlay" />
      </div>

      <section className="esc-content">
        <div className="esc-header">
          <span className="esc-kicker">01 / SPOTS &amp; ACADEMIAS · CHILE</span>
          <h1 className="esc-title">NUESTRAS ESCUELAS®</h1>
          <p className="esc-sub">Tres sedes diseñadas para progresar en el mar y en el concreto, todo el año.</p>
        </div>

        <div className="esc-grid">
          {sedes.map((sede) => {
            const cardHref = sede.id === 'pichilemu' ? '/taller' : `/spots/${sede.id}`;
            return (
              <Link key={sede.id} href={cardHref} className="esc-card-link">
                <article className="esc-card">
                  <div className="esc-card-media">
                    <Image src={sede.img} alt={sede.title} fill priority sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
                    <span className="esc-num-badge">{sede.num}</span>
                    {sede.highlight && <span className="esc-tag-badge">{sede.highlight}</span>}
                  </div>

                  <div className="esc-card-body">
                    <span className="esc-card-sub">{sede.subtitle}</span>
                    <h2 className="esc-card-title">{sede.title}</h2>
                    <p className="esc-card-desc">{sede.desc}</p>

                    <div className="esc-features">
                      {sede.features.map((f) => (
                        <span key={f} className="esc-chip">{f}</span>
                      ))}
                    </div>

                    <div className="esc-cta-pill">
                      <span>{sede.cta}</span>
                      <ArrowUpRight size={15} />
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
