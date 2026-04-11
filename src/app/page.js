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
      <main className="landing-main">
        <div id="hero" className="hero-section">
          {/* Background Image with subtle gradient overlay */}
          <div className="hero-bg-wrapper">
            <Image 
              src="/FONDO OFICIAL.png" 
              alt="Wave Surf Club - Portada Oficial" 
              fill 
              priority
              quality={100}
              style={{ 
                objectFit: 'cover',
                objectPosition: 'center'
              }}
            />
            <div className="hero-overlay" />
          </div>

          {/* REAL TEXT TITLES - Never get cut off */}
          <div className="hero-content">
            <div className="title-box">
              <h1 className="main-brand-title">
                <span className="since">EST. 2015</span>
                WAVE SURF CLUB
              </h1>
              <p className="hero-description">
                Donde el estilo y la técnica se encuentran sobre el agua.
              </p>
              <div className="hero-actions">
                <a href="/agenda" className="btn-primary-luxury">RESERVAR CLASE</a>
                <a href="/riders" className="btn-outline-luxury">CONOCE AL EQUIPO</a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        :root {
          --nav-height: 95px;
        }
        @media (max-width: 1024px) {
          :root {
            --nav-height: 70px;
          }
        }

        body { 
          margin: 0; 
          padding: 0; 
          overflow-x: hidden;
          background: #000;
          font-family: var(--font-archivo), sans-serif;
        }

        .landing-main {
          margin-top: var(--nav-height);
          width: 100%;
          height: calc(100vh - var(--nav-height));
          position: relative;
        }

        .hero-section {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000;
        }

        .hero-bg-wrapper {
          position: absolute;
          inset: 0;
          z-index: 1;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7));
          z-index: 2;
        }

        .hero-content {
          position: relative;
          z-index: 5;
          text-align: center;
          color: #fff;
          padding: 0 20px;
          max-width: 900px;
        }

        .since {
          display: block;
          font-size: 14px;
          letter-spacing: 8px;
          color: #38bdf8;
          margin-bottom: 15px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .main-brand-title {
          font-size: clamp(40px, 10vw, 120px);
          font-weight: 950;
          line-height: 0.85;
          letter-spacing: -0.05em;
          margin: 0 0 30px 0;
          text-transform: uppercase;
        }

        .hero-description {
          font-size: clamp(16px, 2.5vw, 24px);
          font-weight: 400;
          color: rgba(255,255,255,0.8);
          margin-bottom: 40px;
          line-height: 1.4;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .hero-actions {
          display: flex;
          gap: 20px;
          justify-content: center;
        }

        .btn-primary-luxury {
          background: #fff;
          color: #000;
          padding: 18px 36px;
          text-decoration: none;
          font-weight: 900;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: all 0.3s ease;
          border: 2px solid #fff;
        }

        .btn-primary-luxury:hover {
          background: #38bdf8;
          border-color: #38bdf8;
          color: #fff;
        }

        .btn-outline-luxury {
          background: transparent;
          color: #fff;
          padding: 18px 36px;
          text-decoration: none;
          font-weight: 900;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
          border: 2px solid #fff;
          transition: all 0.3s ease;
        }

        .btn-outline-luxury:hover {
          background: #fff;
          color: #000;
        }

        @media (max-width: 768px) {
          .hero-actions {
            flex-direction: column;
            gap: 15px;
          }
          .btn-primary-luxury, .btn-outline-luxury {
            width: 100%;
            padding: 15px 20px;
            font-size: 12px;
          }
          .since {
            font-size: 10px;
            letter-spacing: 4px;
          }
          .main-brand-title {
            margin-bottom: 20px;
          }
        }
      `}</style>
    </>
  );
}
