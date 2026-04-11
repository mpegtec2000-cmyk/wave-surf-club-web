'use client';

import { useState } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { useTranslation } from '@/lib/i18n-context';

export default function LandingPage() {
  const { t } = useTranslation();
  const [showBooking, setShowBooking] = useState(true);

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
            {/* Filter removed as requested */}
          </div>

          {/* REAL TEXT TITLES - Never get cut off */}
          <div className="hero-content">
            <div className="hero-actions">
              <a href="/riders" className="btn-pill-premium">
                <span className="booking-dot"></span>
                Conoce a tu profesor
              </a>
            </div>
          </div>
        </div>

        {/* FLOATING BOOKING CTA */}
        {showBooking && (
          <div className="floating-booking-banner">
            <a href="/agenda" className="booking-link">
              <span className="booking-dot"></span>
              RESERVAR CLASE
            </a>
            <button onClick={() => setShowBooking(false)} className="close-booking">×</button>
          </div>
        )}

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
          position: relative;
        }

        .hero-section {
          position: relative;
          width: 100%;
          height: calc(100vh - var(--nav-height));
          display: flex;
          align-items: flex-end;
          padding-bottom: 60px;
          justify-content: center;
          background: #000;
        }

        .tienda-section {
          position: relative;
          width: 100%;
          height: 100vh;
          background: #000;
        }

        .tienda-bg-wrapper {
          position: absolute;
          inset: 0;
        }

        .hero-bg-wrapper {
          position: absolute;
          inset: 0;
          z-index: 1;
        }

        .hero-overlay {
          display: none;
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

        .btn-pill-premium {
          background: #fff;
          color: #000;
          padding: 12px 30px;
          text-decoration: none;
          font-weight: 900;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 2px;
          border-radius: 100px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          transition: all 0.3s ease;
        }

        .btn-pill-premium:hover {
          transform: translateY(-5px);
          background: #38bdf8;
          color: #fff;
        }

        .btn-pill-premium:hover .booking-dot {
          background: #fff;
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

        /* FLOATING BOOKING BANNER */
        .floating-booking-banner {
          position: fixed;
          top: calc(var(--nav-height) + 15px);
          right: 30px;
          z-index: 9999;
          background: #fff;
          display: flex;
          align-items: center;
          padding: 6px 6px 6px 15px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          border-radius: 100px;
          animation: slideInRight 0.6s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .booking-link {
          text-decoration: none;
          color: #000;
          font-size: 10.5px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-right: 15px;
        }

        .booking-dot {
          width: 6px;
          height: 6px;
          background: #38bdf8;
          border-radius: 50%;
          display: inline-block;
          animation: pulse-dot 2s infinite;
        }

        .close-booking {
          background: #f1f5f9;
          border: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #64748b;
          font-size: 18px;
          font-weight: 300;
          transition: all 0.2s;
        }

        .close-booking:hover {
          background: #000;
          color: #fff;
        }

        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes pulse-dot {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }

        @media (max-width: 1024px) {
          .floating-booking-banner {
            top: calc(var(--nav-height) + 10px);
            right: 15px;
            padding: 5px 5px 5px 12px;
          }
          .booking-link {
            font-size: 9px;
            letter-spacing: 1px;
            margin-right: 10px;
          }
        }
      `}</style>
    </>
  );
}
