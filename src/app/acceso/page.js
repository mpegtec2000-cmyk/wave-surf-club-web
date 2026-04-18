'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User, Briefcase, Lock, Mail, UserPlus, LogIn, Key, Phone, CreditCard, Calendar } from 'lucide-react';
import Link from 'next/link';
import { loginUser } from '@/lib/data';

function AccesoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'cliente');
  
  // States - Cliente
  const [clienteView, setClienteView] = useState('login'); // 'login' or 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // States - Colaborador
  const [emailColab, setEmailColab] = useState('');
  const [passwordColab, setPasswordColab] = useState('');

  // Cliente form
  const [cForm, setCForm] = useState({
    nombre: '', apellido: '', rut: '', email: '', telefono: '', password: ''
  });

  const handleClienteLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: cForm.email,
        password: cForm.password
      });
      if (loginError) throw loginError;
      
      router.push('/tienda');
    } catch (err) {
      setError('Credenciales inválidas. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleClienteRegister = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      // 1. Sign up in Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email: cForm.email,
        password: cForm.password,
        options: {
          data: {
            nombre: cForm.nombre,
            apellido: cForm.apellido,
            rut: cForm.rut
          }
        }
      });
      if (authError) throw authError;

      // When "Confirm email" is turned on and a user re-registers, 
      // Supabase returns data.user with identities = [] to prevent email enumeration.
      if (!data?.user) {
        throw new Error('No se pudo crear el usuario. Intenta de nuevo.');
      }

      if (data.user.identities && data.user.identities.length === 0) {
        throw new Error('Este correo ya está registrado. Por favor, inicia sesión o verifica tu bandeja de entrada si aún no confirmaste tu cuenta.');
      }

      // 2. Insert into clientes table using upsert to avoid crashing if partially created
      const { error: dbError } = await supabase.from('clientes').upsert({
        auth_user_id: data.user.id,
        nombre: cForm.nombre,
        apellido: cForm.apellido,
        rut: cForm.rut,
        email: cForm.email,
        telefono: cForm.telefono
      }, { onConflict: 'email' });
      
      if (dbError) {
        if (dbError.message.includes('rut')) {
           throw new Error('Este RUT ya se encuentra asociado a otra cuenta.');
        }
        throw dbError;
      }

      setSuccess('¡Registro exitoso! Por favor revisa tu correo electrónico para confirmar tu cuenta y luego inicia sesión.');
      setClienteView('login');
      setCForm({...cForm, password: ''}); // Clear password field
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
      const successLogin = await loginUser(emailColab, passwordColab);
      if (successLogin) {
        router.push('/dashboard');
      } else {
        setError('Credenciales inválidas o acceso denegado.');
      }
    } catch (err) {
      setError('Error de conexión al sistema.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="acceso-container">
      <div className="acceso-wrapper">
        <div className="acceso-header">
          <Link href="/">
            <img src="/logo-wave.png" alt="Wave Surf Club" className="logo" />
          </Link>
          <h2>PORTAL DE ACCESO</h2>
        </div>

        <div className="acceso-tabs">
          <button 
            className={`tab-btn ${activeTab === 'cliente' ? 'active' : ''}`}
            onClick={() => { setActiveTab('cliente'); setError(null); setSuccess(null); }}
          >
            <User size={16} /> CLIENTE
          </button>
          <button 
            className={`tab-btn ${activeTab === 'colaborador' ? 'active' : ''}`}
            onClick={() => { setActiveTab('colaborador'); setError(null); setSuccess(null); }}
          >
            <Briefcase size={16} /> COLABORADOR
          </button>
        </div>

        <div className="acceso-content">
          {error && <div className="alert-error">{error}</div>}
          {success && <div className="alert-success">{success}</div>}

          {/* TAB CLIENTE */}
          {activeTab === 'cliente' && (
            <div className="tab-pane active">
              {clienteView === 'login' ? (
                <form onSubmit={handleClienteLogin} className="auth-form">
                  <div className="form-group">
                    <label><Mail size={14} /> Correo Electrónico</label>
                    <input 
                      type="email" required 
                      value={cForm.email} onChange={e => setCForm({...cForm, email: e.target.value})}
                      placeholder="tu@email.com"
                    />
                  </div>
                  <div className="form-group">
                    <label><Lock size={14} /> Contraseña</label>
                    <input 
                      type="password" required 
                      value={cForm.password} onChange={e => setCForm({...cForm, password: e.target.value})}
                      placeholder="••••••••"
                    />
                  </div>
                  <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? 'INGRESANDO...' : 'INGRESAR A MI CUENTA'}
                  </button>
                  
                  <div className="switch-view">
                    <span>¿No tienes cuenta?</span>
                    <button type="button" onClick={() => { setClienteView('register'); setError(null); }}>Crear una cuenta nueva</button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleClienteRegister} className="auth-form register-form">
                  <div className="form-row">
                    <div className="form-group half">
                      <label><User size={14} /> Nombre</label>
                      <input type="text" required value={cForm.nombre} onChange={e => setCForm({...cForm, nombre: e.target.value})} placeholder="Juan" />
                    </div>
                    <div className="form-group half">
                      <label>Apellido</label>
                      <input type="text" required value={cForm.apellido} onChange={e => setCForm({...cForm, apellido: e.target.value})} placeholder="Pérez" />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group half">
                      <label><CreditCard size={14} /> RUT</label>
                      <input type="text" required value={cForm.rut} onChange={e => setCForm({...cForm, rut: e.target.value})} placeholder="12.345.678-9" />
                    </div>
                    <div className="form-group half">
                      <label><Phone size={14} /> Teléfono</label>
                      <input type="tel" value={cForm.telefono} onChange={e => setCForm({...cForm, telefono: e.target.value})} placeholder="+56 9 1234 5678" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label><Mail size={14} /> Correo Electrónico</label>
                    <input type="email" required value={cForm.email} onChange={e => setCForm({...cForm, email: e.target.value})} placeholder="tu@email.com" />
                  </div>
                  
                  <div className="form-group">
                    <label><Lock size={14} /> Contraseña</label>
                    <input type="password" required minLength={6} value={cForm.password} onChange={e => setCForm({...cForm, password: e.target.value})} placeholder="Mínimo 6 caracteres" />
                  </div>

                  <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? 'REGISTRANDO...' : 'CREAR CUENTA'}
                  </button>

                  <div className="switch-view">
                    <span>¿Ya tienes cuenta?</span>
                    <button type="button" onClick={() => { setClienteView('login'); setError(null); }}>Iniciar sesión</button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB COLABORADOR */}
          {activeTab === 'colaborador' && (
            <div className="tab-pane active">
              <div className="colaborador-banner">
                <Key size={18} />
                <span>ACCESO EXCLUSIVO PERSONAL WAVE SURF CLUB</span>
              </div>
              <form onSubmit={handleColaboradorLogin} className="auth-form">
                <div className="form-group">
                  <label><Mail size={14} /> Correo Institucional</label>
                  <input 
                    type="email" required 
                    value={emailColab} onChange={e => setEmailColab(e.target.value)}
                    placeholder="usuario@wavesurfclub.cl"
                  />
                </div>
                <div className="form-group">
                  <label><Lock size={14} /> Contraseña ERP</label>
                  <input 
                    type="password" required 
                    value={passwordColab} onChange={e => setPasswordColab(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <button type="submit" className="btn-submit btn-colab" disabled={loading}>
                  {loading ? 'ACCEDIENDO...' : 'ACCEDER AL ERP'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .acceso-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000;
          color: #fff;
          font-family: var(--font-sans);
          padding: 20px;
          position: relative;
        }

        .acceso-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(56, 189, 248, 0.05) 0%, #000 70%);
          z-index: 0;
        }

        .acceso-wrapper {
          background: #0a0a0a;
          border: 1px solid #222;
          border-radius: 16px;
          width: 100%;
          max-width: 480px;
          z-index: 10;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
        }

        .acceso-header {
          padding: 30px 30px 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .logo {
          width: 60px;
          height: auto;
          margin-bottom: 15px;
          filter: drop-shadow(0 0 10px rgba(56, 189, 248, 0.2));
        }

        h2 {
          font-size: 16px;
          font-weight: 800;
          letter-spacing: 2px;
          margin: 0;
          color: #fff;
        }

        .acceso-tabs {
          display: flex;
          border-bottom: 1px solid #222;
          background: rgba(255,255,255,0.02);
        }

        .tab-btn {
          flex: 1;
          background: none;
          border: none;
          padding: 16px;
          color: #666;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s;
          border-bottom: 2px solid transparent;
        }

        .tab-btn:hover {
          color: #aaa;
        }

        .tab-btn.active {
          color: #38bdf8;
          border-bottom-color: #38bdf8;
          background: rgba(56, 189, 248, 0.05);
        }

        .acceso-content {
          padding: 30px;
        }

        .alert-error {
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
          padding: 12px;
          border-radius: 8px;
          font-size: 13px;
          margin-bottom: 20px;
          border: 1px solid rgba(239, 68, 68, 0.2);
          text-align: center;
        }

        .alert-success {
          background: rgba(16, 185, 129, 0.1);
          color: #34d399;
          padding: 12px;
          border-radius: 8px;
          font-size: 13px;
          margin-bottom: 20px;
          border: 1px solid rgba(16, 185, 129, 0.2);
          text-align: center;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-row {
          display: flex;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group.half {
          flex: 1;
        }

        .form-group label {
          font-size: 11px;
          font-weight: 700;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .form-group input {
          background: #111;
          border: 1px solid #333;
          padding: 14px;
          border-radius: 8px;
          color: #fff;
          font-size: 14px;
          outline: none;
          transition: all 0.2s;
        }

        .form-group input:focus {
          border-color: #38bdf8;
          background: #151515;
          box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.1);
        }

        .btn-submit {
          background: #fff;
          color: #000;
          border: none;
          padding: 16px;
          border-radius: 8px;
          font-weight: 800;
          font-size: 13px;
          letter-spacing: 1px;
          cursor: pointer;
          margin-top: 10px;
          transition: all 0.2s;
        }

        .btn-submit:hover:not(:disabled) {
          background: #38bdf8;
          color: #fff;
        }

        .btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-colab {
          background: #10151f;
          color: #38bdf8;
          border: 1px solid #1e2a3a;
        }

        .btn-colab:hover:not(:disabled) {
          background: #1e2a3a;
          border-color: #38bdf8;
        }

        .switch-view {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          margin-top: 15px;
          font-size: 12px;
          color: #666;
        }

        .switch-view button {
          background: none;
          border: none;
          color: #38bdf8;
          font-weight: 700;
          cursor: pointer;
          padding: 0;
        }

        .switch-view button:hover {
          text-decoration: underline;
        }

        .colaborador-banner {
          background: #0f1623;
          border: 1px solid #1e2a3a;
          color: #94a3b8;
          padding: 12px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 20px;
        }

        @media (max-width: 480px) {
          .acceso-wrapper {
            border-radius: 0;
            border: none;
            min-height: 100vh;
          }
          .acceso-container {
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default function AccesoPage() {
  return (
    <Suspense fallback={<div style={{minHeight: '100vh', background: '#000'}}></div>}>
      <AccesoContent />
    </Suspense>
  );
}
