'use client';

import { riders } from '@/lib/rider-directory';
import RiderCard from '@/components/RiderCard';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function RidersPage() {
  return (
    <div className="directory-container">
      <style jsx>{`
        .directory-container {
          min-height: 100vh;
          background: #f8fafc;
          padding: calc(var(--nav-height) + 40px) 20px 80px;
          color: #000;
        }

        .header-section {
          max-width: 1200px;
          mx-auto;
          text-align: center;
          margin-bottom: 60px;
        }

        .title {
          font-size: clamp(40px, 8vw, 80px);
          font-weight: 950;
          color: #000;
          letter-spacing: -0.05em;
          margin: 0;
          line-height: 1;
          text-transform: uppercase;
        }

        .subtitle {
          font-size: 14px;
          color: #64748b;
          font-style: italic;
          margin-top: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .divider {
          width: 80px;
          height: 4px;
          background: #000;
          margin: 30px auto;
        }

        .grid-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 24px;
        }

        @media (min-width: 640px) {
          .grid-container { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 768px) {
          .grid-container { grid-template-columns: repeat(3, 1fr); }
        }
        @media (min-width: 1024px) {
          .grid-container { grid-template-columns: repeat(4, 1fr); }
        }

        .back-nav {
          max-width: 1200px;
          margin: 0 auto 40px;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #000;
          text-decoration: none;
          font-weight: 800;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          transition: color 0.3s;
        }
        .back-link:hover {
          color: #2563eb;
        }

        .footer {
          margin-top: 100px;
          text-align: center;
          border-top: 1px solid #e2e8f0;
          padding-top: 60px;
        }
        .footer-text {
          font-size: 11px;
          color: #94a3b8;
          letter-spacing: 0.3em;
          text-transform: uppercase;
        }
      `}</style>

      <Navbar />

      <header className="header-section">
        <h1 className="title">RIDERS</h1>
      </header>

      <div className="grid-container">
        {riders.map((rider) => (
          <RiderCard key={rider.id} ryder={rider} />
        ))}
      </div>

      <footer className="footer">
        <p className="footer-text">WAVE SURF CLUB © 2015-2026</p>
      </footer>
    </div>
  );
}
