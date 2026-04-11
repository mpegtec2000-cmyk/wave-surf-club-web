'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import Script from 'next/script';
import Navbar from '@/components/Navbar';
import { RIDERS_DATA } from '@/lib/riders-data';

export default function RiderMagazine() {
  const { slug } = useParams();
  const rider = RIDERS_DATA[slug] || RIDERS_DATA.default;
  const [scrolled, setScrolled] = useState(false);
  const [index, setIndex] = useState(0);

  const formatSpaced = (text) => text.toUpperCase();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (rider.gallery && rider.gallery.length > 1) {
      const interval = setInterval(() => {
        setIndex((prev) => (prev + 1) % rider.gallery.length);
      }, 5000);
      return () => interval && clearInterval(interval);
    }
  }, [rider.gallery]);

  return (
    <div className="mag-container">
      <style jsx>{`
        .mag-container {
          background: #ffffff;
          color: #000;
          min-height: 100vh;
          font-family: var(--font-sans);
        }

        /* --- STICKY NAV --- */
        .mag-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 40px;
          z-index: 1000;
          transition: all 0.4s;
          background: ${scrolled ? 'rgba(11, 17, 32, 0.9)' : '#ffffff'};
          backdrop-filter: ${scrolled ? 'blur(20px)' : 'none'};
          border-bottom: 1px solid rgba(0,0,0,0.1);
        }
        .back-btn {
          color: #000;
          text-decoration: none;
          font-weight: 800;
          font-size: 12px;
          letter-spacing: 2px;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* --- HERO COVER --- */
        .mag-hero {
          height: 85vh;
          margin-top: 95px; /* Navbar height */
          position: relative;
          display: flex;
          align-items: flex-end;
          padding: 60px 8%;
          overflow: hidden;
          background: #000;
        }
        .hero-title-box {
          position: relative;
          z-index: 3;
          max-width: 95%;
          display: inline-block;
          background: rgba(255, 255, 255, 0.95);
          padding: 30px 50px;
          border: 1px solid #000;
          box-shadow: 20px 20px 0px rgba(0,0,0,0.1);
        }
        .mag-tag {
          color: #38bdf8;
          font-weight: 800;
          letter-spacing: 4px;
          font-size: 14px;
          text-transform: uppercase;
          margin-bottom: 16px;
          display: block;
        }
        .mag-name {
          font-size: clamp(24px, 4vw, 56px);
          font-weight: 950;
          line-height: 1;
          display: flex;
          align-items: center;
          gap: 15px;
          text-transform: uppercase;
          margin: 0;
          color: #000;
          letter-spacing: -0.02em;
          transform: skewX(-5deg);
          white-space: nowrap;
        }
        .mag-prefix {
          color: #38bdf8;
          letter-spacing: 4px;
        }

        /* --- EDITORIAL SECTIONS --- */
        .mag-content {
          padding: 100px 8%;
        }
        .editorial-row {
          display: flex;
          gap: 60px;
          margin-bottom: 120px;
          align-items: center;
        }
        .text-col { flex: 1; }
        .img-col { flex: 1.5; }
        
        .editorial-title {
          font-family: var(--font-montserrat);
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 30px;
          color: #000;
          text-transform: uppercase;
        }
        .editorial-p {
          font-family: var(--font-inter);
          font-size: 16px;
          line-height: 1.8;
          color: #334155;
          font-weight: 400;
          text-align: justify;
        }
        .editorial-p p {
          margin-bottom: 20px;
        }
        .editorial-p strong {
          color: #000;
          font-weight: 700;
        }
        
        .carousel-container {
          position: relative;
          width: 100%;
          height: 600px;
          overflow: hidden;
          border-radius: 4px;
          box-shadow: 0 30px 60px rgba(0,0,0,0.5);
        }

        .carousel-image-wrapper {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 1.5s ease-in-out, transform 8s ease-out;
          transform: scale(1.1);
        }
        .carousel-image-wrapper.active {
          opacity: 1;
          transform: scale(1);
        }

        /* --- STATS GRID --- */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
          border-top: 1px solid rgba(0,0,0,0.1);
          padding-top: 60px;
          margin-top: 60px;
        }
        .stat-item h6 {
          font-size: 11px;
          color: #38bdf8;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin: 0 0 10px;
        }
        .stat-item p {
          font-size: 24px;
          font-weight: 700;
          margin: 0;
        }

        /* --- GALLERY --- */
        .mag-gallery {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-top: 100px;
        }
        .gal-img-wrapper {
          position: relative;
          width: 100%;
          height: 600px;
          background: #000;
          border-radius: 4px;
          overflow: hidden;
        }
        .gal-img-wrapper:nth-child(3n) {
          grid-column: span 2;
          height: 800px;
        }

        .instagram-container {
          display: flex;
          flex-direction: column;
          gap: 40px;
          margin-top: 50px;
          width: 100%;
        }
        .instagram-box {
          width: 100%;
          max-width: 540px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          border: 1px solid rgba(0,0,0,0.05);
          transition: transform 0.3s ease;
        }
        .instagram-box:hover {
          transform: translateY(-5px);
        }
        .sessions-label {
          font-family: var(--font-montserrat);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 4px;
          color: #38bdf8;
          text-transform: uppercase;
          margin-bottom: 20px;
          display: block;
          text-align: center;
          border-bottom: 1px solid rgba(0,0,0,0.1);
          padding-bottom: 10px;
        }

        @media (max-width: 900px) {
          .mag-nav {
            padding: 0 20px;
            height: 70px;
          }
          .mag-hero {
            height: 60vh;
            margin-top: 70px;
            padding: 40px 5%;
          }
          .hero-title-box {
            padding: 20px 30px;
            box-shadow: 10px 10px 0px rgba(0,0,0,0.1);
          }
          .mag-name {
            font-size: clamp(18px, 6vw, 32px);
            gap: 10px;
          }
          .mag-tag {
            font-size: 10px;
            letter-spacing: 2px;
          }
          .mag-content {
            padding: 60px 5%;
          }
          .editorial-row { 
            flex-direction: column; 
            text-align: left; 
            gap: 40px;
            margin-bottom: 60px;
          }
          .editorial-title {
            font-size: 24px;
            margin-bottom: 20px;
          }
          .editorial-p {
            font-size: 15px;
            line-height: 1.6;
          }
          .img-col {
            width: 100%;
          }
          .carousel-container {
            height: 350px;
          }
          .stats-grid { 
            grid-template-columns: 1fr; 
            gap: 20px;
            padding-top: 40px;
          }
          .stat-item p {
            font-size: 20px;
          }
          .gal-img-wrapper {
            height: 400px;
          }
          .gal-img-wrapper:nth-child(3n) { 
            grid-column: span 1; 
            height: 400px;
          }
          .instagram-box {
            max-width: 100%;
          }
          .download-btn-container {
            justify-content: center;
          }
          .mag-download-btn {
            width: 100%;
            justify-content: center;
            padding: 14px 20px;
            font-size: 12px;
          }
        }

        /* --- DOWNLOAD BUTTON --- */
        .download-btn-container {
          margin-top: 40px;
          display: flex;
          justify-content: flex-start;
        }
        .mag-download-btn {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
          color: white;
          padding: 16px 32px;
          border-radius: 50px;
          font-weight: 800;
          text-decoration: none;
          font-size: 14px;
          letter-spacing: 1px;
          text-transform: uppercase;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 10px 20px rgba(14, 165, 233, 0.3);
        }
        .mag-download-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 30px rgba(14, 165, 233, 0.4);
          background: linear-gradient(135deg, #7dd3fc 0%, #38bdf8 100%);
        }
        .mag-download-btn span {
          background: rgba(255,255,255,0.2);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }
      `}</style>

      <Navbar />

      <header className="mag-hero">
        <Image 
          src={rider.cover}
          alt={rider.name}
          fill
          priority
          style={{ objectFit: 'cover', objectPosition: 'center top' }}
          className="hero-bg-img"
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0b1120, transparent 60%)', zIndex: 2 }} />
        <div className="hero-title-box">
          <h1 className="mag-name">
            <span className="mag-prefix">R I D E R</span> 
            <span>/</span>
            <span>{formatSpaced(rider.name)}</span>
          </h1>
        </div>
      </header>

      <main className="mag-content">
        <div className="editorial-row">
          <div className="text-col">
            <h2 className="editorial-title">
              {rider.title || 'LA ESENCIA DEL RIDER'}
            </h2>
            <div 
              className="editorial-p" 
              dangerouslySetInnerHTML={{ __html: rider.bio }} 
            />
            {/* INSTAGRAM VIDEOS */}
            {(rider.instagramUrls || (rider.instagramUrl ? [rider.instagramUrl] : [])).length > 0 && (
              <div className="instagram-container">
                <span className="sessions-label">LATEST SESSIONS</span>
                {(rider.instagramUrls || (rider.instagramUrl ? [rider.instagramUrl] : [])).map((url, i) => (
                  <div key={i} className="instagram-box">
                    <blockquote 
                      className="instagram-media" 
                      data-instgrm-permalink={url} 
                      data-instgrm-version="14"
                      style={{ width: '100%', border: 'none', background: '#fff', margin: '0' }}
                    >
                      <a href={url}>Cargando video de Instagram...</a>
                    </blockquote>
                  </div>
                ))}
              </div>
            )}

            {(rider.instagramUrls || rider.instagramUrl) && (
              <Script 
                src="https://www.instagram.com/embed.js" 
                strategy="lazyOnload" 
                onLoad={() => {
                  if (window.instgrm) {
                    window.instgrm.Embeds.process();
                  }
                }}
              />
            )}

            {rider.magazine && (
              <div className="download-btn-container">
                <a 
                  href={rider.magazine} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mag-download-btn"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  descargar REVISTA PAULO
                </a>
              </div>
            )}
          </div>
          <div className="img-col">
            <div className="carousel-container">
              {rider.gallery.map((img, i) => (
                <div key={i} className={`carousel-image-wrapper ${i === index ? 'active' : ''}`}>
                  <Image 
                    src={img} 
                    fill
                    sizes="(max-width: 900px) 100vw, 50vw"
                    priority={i === 0}
                    style={{ objectFit: 'cover' }}
                    alt={`Rider ${i}`} 
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>

      <footer style={{ padding: '100px 40px', textAlign: 'center', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <p style={{ color: '#475569', fontSize: '12px', letterSpacing: '4px' }}>WAVE SURF CLUB © 2015-2026</p>
      </footer>
    </div>
  );
}
