'use client';

import './biografia.css';

import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Compass, Heart, ArrowUpRight } from 'lucide-react';

export default function BiografiaPage() {
  return (
    <div className="bio-root">
      <Navbar />

      <main className="bio-main">
        <section className="bio-hero">
          <Image
            src="/BIOGRAFIA.jpg"
            alt="Wave Surf Club Historia"
            fill
            priority
            style={{ objectFit: 'cover', objectPosition: 'center', filter: 'grayscale(30%) brightness(0.45)' }}
          />
          <div className="bio-hero-inner">
            <span className="bio-kicker">LEGADO &amp; IDENTIDAD · DESDE 2015</span>
            <h1>NUESTRA HISTORIA®</h1>
            <p>De un sueño en las rompientes de Concón a una comunidad consolidada a lo largo de la costa chilena.</p>
          </div>
        </section>

        <section className="bio-editorial">
          <div className="bio-container">
            <div className="bio-grid">
              <div className="bio-text">
                <span className="bio-mono">01 / EL COMIENZO</span>
                <h2>FORJADOS POR EL PACÍFICO</h2>
                <p className="bio-lead">
                  Wave Surf Club nació en 2015 con una premisa simple: enseñar el surf y el skate como una cultura de vida donde el respeto al mar, la progresión técnica y la comunidad son la base.
                </p>
                <p>
                  Comenzamos en Playa La Boca de Concón, formando a más de 5.000 alumnos entre niños, jóvenes, adultos y competidores.
                </p>

                <blockquote className="bio-quote">
                  &ldquo;El mar no premia la soberbia; premia la paciencia, la lectura y la humildad frente a la energía del agua.&rdquo;
                  <span>— Equipo Directivo Wave Surf Club®</span>
                </blockquote>

                <h3>02 / NUESTRA EVOLUCIÓN</h3>
                <p>
                  Hoy operamos en <strong>Concón</strong> con nuestra Mega Ramp Pro, en <strong>Pichilemu</strong> con el taller de shaping sostenible en madera de Agave de Matías Espinoza, y en <strong>Punta de Piedra</strong> con enfoque técnico de alto rendimiento.
                </p>
              </div>

              <div>
                <div className="bio-photo-card">
                  <div className="bio-photo-wrap">
                    <Image src="/Sunny%20Wave%20Surf%20Club%20Beach%20Shop.png" alt="Wave Surf Club Beach Shop" fill sizes="(max-width: 768px) 100vw, 500px" style={{ objectFit: 'cover' }} />
                  </div>
                  <div className="bio-stats">
                    <div><strong>+10</strong><span>AÑOS</span></div>
                    <div><strong>03</strong><span>SEDES</span></div>
                    <div><strong>+5K</strong><span>ALUMNOS</span></div>
                  </div>
                </div>

                <div className="bio-values">
                  <div className="bio-val-card">
                    <Compass size={22} />
                    <h4>EXCELENCIA TÉCNICA</h4>
                    <p>Instructores certificados ISA con protocolos internacionales de seguridad y rescate.</p>
                  </div>
                  <div className="bio-val-card">
                    <Heart size={22} />
                    <h4>PASIÓN &amp; COMUNIDAD</h4>
                    <p>Espacio abierto para todas las edades y niveles de surf &amp; skate.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bio-cta">
              <div>
                <h3>SÉ PARTE DE NUESTRA PRÓXIMA SESIÓN</h3>
                <p>Reserva tu clase en Concón, Pichilemu o Punta de Piedra.</p>
              </div>
              <div className="bio-cta-btns">
                <Link href="/agenda" className="bio-btn-white">
                  <span>AGENDAR CLASE</span>
                  <ArrowUpRight size={15} />
                </Link>
                <Link href="/escuelas" className="bio-btn-outline">VER SEDES</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
