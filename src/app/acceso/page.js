'use client';

import './acceso.css';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User, Briefcase, Lock, Mail, Key } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { loginUser } from '@/lib/data';

function AccesoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'cliente');

  const [clienteView, setClienteView] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [emailColab, setEmailColab] = useState('');
  const [passwordColab, setPasswordColab] = useState('');

  const [cForm, setCForm] = useState({
    nombre: '', apellido: '', rut: '', email: '', telefono: '', password: ''
  });

  const handleClienteLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({
        email: cForm.email,
        password: cForm.password
      });
      if (loginError) throw loginError;
      if (typeof window !== 'undefined' && authData?.user) {
        const meta = authData.user.user_metadata || {};
        localStorage.setItem('wave_client_session', JSON.stringify({
          email: authData.user.email,
          nombre: [meta.nombre, meta.apellido].filter(Boolean).join(' ') || 'Cliente Wave',
          rut: meta.rut || ''
        }));
      }
      setSuccess('Sesión iniciada con éxito. Redirigiendo a tienda...');
      setTimeout(() => router.push('/tienda'), 500);
    } catch {
      setError('Correo o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  const handleClienteRegister = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const { error: authError } = await supabase.auth.signUp({
        email: cForm.email,
        password: cForm.password,
        options: { data: { nombre: cForm.nombre, apellido: cForm.apellido, rut: cForm.rut } }
      });
      if (authError) throw authError;
      setSuccess('¡Registro exitoso! Ya puedes iniciar sesión con tu cuenta.');
      setClienteView('login');
      setCForm({ ...cForm, password: '' });
    } catch (err) {
      setError(err.message || 'Error al registrar la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  const handleColaboradorLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await loginUser(emailColab, passwordColab);
      if (res && !res.error && res.user) {
        setSuccess('¡Acceso concedido! Entrando al ERP...');
        setTimeout(() => router.push('/dashboard'), 500);
      } else {
        setError(res?.error || 'Credenciales inválidas o acceso denegado.');
      }
    } catch {
      setError('Error de conexión al sistema ERP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="acc-root">
      <Navbar />

      <main className="acc-main">
        <div className="acc-card">
          <div className="acc-head">
            <Link href="/" className="acc-logo">
              <Image src="/logo-wave.png" alt="Wave Surf Club" width={48} height={48} priority />
            </Link>
            <h1>PORTAL DE ACCESO®</h1>
            <p>WAVE SURF CLUB · SINCE 2015</p>
          </div>

          <div className="acc-tabs">
            <button
              type="button"
              className={`acc-tab ${activeTab === 'cliente' ? 'active' : ''}`}
              onClick={() => { setActiveTab('cliente'); setError(null); setSuccess(null); }}
            >
              <User size={15} />
              <span>CLIENTE</span>
            </button>
            <button
              type="button"
              className={`acc-tab ${activeTab === 'colaborador' ? 'active' : ''}`}
              onClick={() => { setActiveTab('colaborador'); setError(null); setSuccess(null); }}
            >
              <Briefcase size={15} />
              <span>COLABORADOR</span>
            </button>
          </div>

          <div className="acc-body">
            {error && <div className="acc-msg err">{error}</div>}
            {success && <div className="acc-msg ok">{success}</div>}

            {activeTab === 'cliente' && (
              clienteView === 'login' ? (
                <form onSubmit={handleClienteLogin} className="acc-form">
                  <div className="acc-field">
                    <label><Mail size={13} /> Correo Electrónico</label>
                    <input type="email" required value={cForm.email} onChange={(e) => setCForm({ ...cForm, email: e.target.value })} placeholder="tu@email.com" />
                  </div>
                  <div className="acc-field">
                    <label><Lock size={13} /> Contraseña</label>
                    <input type="password" required value={cForm.password} onChange={(e) => setCForm({ ...cForm, password: e.target.value })} placeholder="••••••••" />
                  </div>
                  <button type="submit" className="acc-btn" disabled={loading}>
                    {loading ? 'INGRESANDO...' : 'INGRESAR A MI CUENTA'}
                  </button>
                  <div className="acc-switch">
                    <span>¿No tienes cuenta?</span>
                    <button type="button" onClick={() => { setClienteView('register'); setError(null); }}>Crear Cuenta</button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleClienteRegister} className="acc-form">
                  <div className="acc-row-2">
                    <div className="acc-field"><label>Nombre</label><input type="text" required value={cForm.nombre} onChange={(e) => setCForm({ ...cForm, nombre: e.target.value })} /></div>
                    <div className="acc-field"><label>Apellido</label><input type="text" required value={cForm.apellido} onChange={(e) => setCForm({ ...cForm, apellido: e.target.value })} /></div>
                  </div>
                  <div className="acc-row-2">
                    <div className="acc-field"><label>RUT</label><input type="text" required value={cForm.rut} onChange={(e) => setCForm({ ...cForm, rut: e.target.value })} placeholder="12.345.678-9" /></div>
                    <div className="acc-field"><label>Teléfono</label><input type="tel" required value={cForm.telefono} onChange={(e) => setCForm({ ...cForm, telefono: e.target.value })} placeholder="+56 9..." /></div>
                  </div>
                  <div className="acc-field"><label><Mail size={13} /> Correo Electrónico</label><input type="email" required value={cForm.email} onChange={(e) => setCForm({ ...cForm, email: e.target.value })} /></div>
                  <div className="acc-field"><label><Lock size={13} /> Contraseña</label><input type="password" required minLength={6} value={cForm.password} onChange={(e) => setCForm({ ...cForm, password: e.target.value })} /></div>
                  <button type="submit" className="acc-btn" disabled={loading}>{loading ? 'REGISTRANDO...' : 'CREAR CUENTA'}</button>
                  <div className="acc-switch">
                    <span>¿Ya tienes cuenta?</span>
                    <button type="button" onClick={() => { setClienteView('login'); setError(null); }}>Iniciar sesión</button>
                  </div>
                </form>
              )
            )}

            {activeTab === 'colaborador' && (
              <div>
                <div className="acc-staff-note">
                  <Key size={14} />
                  <span>ACCESO INTERNO · OPERACIONES ERP &amp; POS</span>
                </div>
                <form onSubmit={handleColaboradorLogin} className="acc-form">
                  <div className="acc-field">
                    <label><Mail size={13} /> Correo Institucional</label>
                    <input type="email" required value={emailColab} onChange={(e) => setEmailColab(e.target.value)} placeholder="usuario@wavesurfclub.cl" />
                  </div>
                  <div className="acc-field">
                    <label><Lock size={13} /> Contraseña ERP</label>
                    <input type="password" required value={passwordColab} onChange={(e) => setPasswordColab(e.target.value)} placeholder="••••••••" />
                  </div>
                  <button type="submit" className="acc-btn" disabled={loading}>
                    {loading ? 'VERIFICANDO...' : 'ENTRAR AL PANEL ERP'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AccesoPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#ffffff' }} />}>
      <AccesoContent />
    </Suspense>
  );
}
