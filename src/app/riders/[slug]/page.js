'use client';

import './rider-detail.css';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import Script from 'next/script';
import Navbar from '@/components/Navbar';
import { RIDERS_DATA } from '@/lib/riders-data';
import { ArrowLeft, Download } from 'lucide-react';

export default function RiderMagazine() {
  const params = useParams();
  const slug = params?.slug;
  const rider = RIDERS_DATA[slug] || RIDERS_DATA.default;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (rider.gallery && rider.gallery.length > 1) {
      const interval = setInterval(() => {
        setIndex((prev) => (prev + 1) % rider.gallery.length);
      }, 4500);
      return () => clearInterval(interval);
    }
  }, [rider.gallery]);

  return (
    <div className="rmag-root">
      <Navbar />

      <header className="rmag-hero">
        <Image
          src={rider.cover}
          alt={rider.name}
          fill
          priority
          style={{ objectFit: 'cover', objectPosition: 'center top' }}
        />
        <div className="rmag-hero-grad" />
        <div className="rmag-title-box">
          <Link href="/riders" className="rmag-back">
            <ArrowLeft size={14} /> TODOS LOS RIDERS
          </Link>
          <span className="rmag-role">{rider.role || 'TEAM RIDER'}</span>
          <h1 className="rmag-name">{rider.name.toUpperCase()}</h1>
        </div>
      </header>

      <main className="rmag-content">
        <div className="rmag-row">
          <div className="rmag-text-col">
            <span className="rmag-kicker">PERFIL &amp; TRAYECTORIA</span>
            <h2 className="rmag-title">{rider.title || rider.name.toUpperCase()}</h2>

            <div className="rmag-bio" dangerouslySetInnerHTML={{ __html: rider.bio }} />

            {rider.stats && (
              <div className="rmag-stats">
                <div className="rmag-stat">
                  <h6>TABLA</h6>
                  <p>{rider.stats.board}</p>
                </div>
                <div className="rmag-stat">
                  <h6>STANCE</h6>
                  <p>{rider.stats.stance}</p>
                </div>
                <div className="rmag-stat">
                  <h6>SPOT LOCAL</h6>
                  <p>{rider.stats.local}</p>
                </div>
              </div>
            )}

            {rider.youtubeUrl && (
              <div className="rmag-media-block">
                <span className="rmag-sessions-label">LATEST FILM</span>
                <div className="rmag-video-wrap">
                  <iframe
                    src={rider.youtubeUrl}
                    title={`${rider.name} Film`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {(rider.instagramUrls || (rider.instagramUrl ? [rider.instagramUrl] : [])).length > 0 && (
              <div className="rmag-media-block">
                <span className="rmag-sessions-label">LATEST SESSIONS</span>
                <div className="rmag-insta-list">
                  {(rider.instagramUrls || [rider.instagramUrl]).map((url, i) => (
                    <div key={i} className="rmag-insta-box">
                      <blockquote
                        className="instagram-media"
                        data-instgrm-permalink={url}
                        data-instgrm-version="14"
                        style={{ width: '100%', border: 'none', background: '#fff', margin: 0 }}
                      >
                        <a href={url} target="_blank" rel="noopener noreferrer">Ver sesión en Instagram</a>
                      </blockquote>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(rider.instagramUrls || rider.instagramUrl) && (
              <Script
                src="https://www.instagram.com/embed.js"
                strategy="lazyOnload"
                onLoad={() => {
                  if (window.instgrm) window.instgrm.Embeds.process();
                }}
              />
            )}

            {rider.magazine && (
              <div className="rmag-dl-wrap">
                <a href={rider.magazine} target="_blank" rel="noopener noreferrer" className="rmag-dl-btn">
                  <Download size={16} />
                  <span>DESCARGAR REVISTA {rider.name.toUpperCase()}</span>
                </a>
              </div>
            )}
          </div>

          <div className="rmag-img-col">
            <div className="rmag-carousel">
              {(rider.gallery || [rider.cover]).map((img, i) => (
                <div key={i} className={`rmag-slide ${i === index ? 'active' : ''}`}>
                  <Image
                    src={img}
                    fill
                    loading="eager"
                    sizes="(max-width: 900px) 100vw, 50vw"
                    priority={i === 0}
                    style={{ objectFit: 'cover' }}
                    alt={`${rider.name} ${i + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="rmag-footer">
        <p>WAVE SURF CLUB® © 2015-2026</p>
      </footer>
    </div>
  );
}
