'use client';

import './login.css';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';
import { Lock, Mail, LogIn, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await loginUser(email, password);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
  };

  return (
    <div className="lg-root">
      <div className="lg-video-wrap">
        <video autoPlay loop muted playsInline preload="auto" className="lg-video">
          <source src="/videos/fondo-wave.mp4" type="video/mp4" />
        </video>
        <div className="lg-overlay" />
      </div>

      <div className="lg-card">
        <Link href="/" className="lg-back">
          <ArrowLeft size={15} />
          <span>VOLVER AL CLUB</span>
        </Link>

        <div className="lg-head">
          <div className="lg-logo">
            <Image src="/logo-wave.png" alt="Wave Surf Club" width={54} height={54} priority />
          </div>
          <h1>WAVE SURF CLUB®</h1>
          <p>SISTEMA ERP &amp; POS · OPERACIONES</p>
        </div>

        <form className="lg-form" onSubmit={handleSubmit}>
          {error && <div className="lg-err">{error}</div>}

          <div className="lg-field">
            <label htmlFor="email"><Mail size={13} /> Correo Institucional</label>
            <input id="email" type="email" placeholder="usuario@wavesurfclub.cl" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </div>

          <div className="lg-field">
            <label htmlFor="password"><Lock size={13} /> Contraseña</label>
            <input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <button type="submit" className="lg-submit" disabled={loading}>
            {loading ? 'AUTENTICANDO...' : (<><LogIn size={16} /><span>INGRESAR AL SISTEMA</span></>)}
          </button>
        </form>
      </div>
    </div>
  );
}
