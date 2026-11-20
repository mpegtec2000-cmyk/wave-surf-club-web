'use client';

import './riders.css';

import { riders } from '@/lib/rider-directory';
import RiderCard from '@/components/RiderCard';
import Navbar from '@/components/Navbar';

export default function RidersPage() {
  return (
    <div className="riders-root">
      <Navbar />

      <div className="riders-inner">
        <header className="riders-header">
          <span className="riders-kicker">WAVE SURF CLUB® · TEAM ROSTER</span>
          <h1 className="riders-title">RIDERS®</h1>
          <p className="riders-sub">
            Atletas, coaches certificados ISA y referentes de la nueva generación del surf y skate chileno.
          </p>
        </header>

        <div className="riders-grid">
          {riders.map((rider) => (
            <RiderCard key={rider.id} ryder={rider} />
          ))}
        </div>

        <footer className="riders-footer">
          <p>WAVE SURF CLUB® © 2015-2026</p>
        </footer>
      </div>
    </div>
  );
}
