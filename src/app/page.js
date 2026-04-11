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
          <Image 
            src="/FONDO OFICIAL.png" 
            alt="Wave Surf Club - Portada Oficial" 
            fill 
            priority
            quality={100}
            style={{ 
              objectFit: 'cover',
              objectPosition: 'center top'
            }}
          />
        </div>
      </main>

      <style jsx global>{`
        :root {
          --nav-height: 95px;
        }

        @media (max-width: 1023px) {
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

        /* Full screen landing specific */
        .landing-main {
          margin-top: var(--nav-height);
          width: 100%;
          height: calc(100vh - var(--nav-height));
          position: relative;
          overflow: hidden;
        }

        .hero-section {
          position: relative;
          width: 100%;
          height: 100%;
          z-index: 1;
          /* This handles the offset when navigating via /#hero from other pages */
          scroll-margin-top: var(--nav-height);
        }
      `}</style>
    </>
  );
}
