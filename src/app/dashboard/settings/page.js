'use client';

import { useState, useEffect } from 'react';
import { getMockUser } from '@/lib/mock-data';
import { useRouter } from 'next/navigation';
import { BRANCHES, ROLE_LABELS } from '@/lib/constants';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = getMockUser();
    if (!u || u.role !== 'superadmin') {
      router.replace('/dashboard');
      return;
    }
    setUser(u);
  }, [router]);

  if (!user) return null;

  return (
    <div>
      {/* Header notice */}
      <div style={{
        padding: '14px 20px',
        background: 'rgba(14,165,233,0.08)',
        border: '1px solid rgba(14,165,233,0.2)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--text-accent)',
        fontSize: 13,
        marginBottom: 28
      }}>
        🔐 Solo el <strong>SuperAdmin</strong> puede acceder a esta sección
      </div>

      <div className="settings-grid">

        {/* Supabase Connection */}
        <div className="settings-card">
          <h3>⚡ Conexión Supabase</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label>Supabase URL</label>
              <input className="form-input" placeholder="https://xxxx.supabase.co" defaultValue="https://YOUR_PROJECT.supabase.co" />
            </div>
            <div className="form-group">
              <label>Anon Key</label>
              <input className="form-input" type="password" placeholder="eyJ..." />
            </div>
            <div className="form-group">
              <label>Service Role Key</label>
              <input className="form-input" type="password" placeholder="eyJ..." />
            </div>
            <div style={{
              padding: '12px 16px',
              background: 'rgba(234,179,8,0.08)',
              border: '1px solid rgba(234,179,8,0.2)',
              borderRadius: 'var(--radius-md)',
              fontSize: 12,
              color: '#fde047'
            }}>
              ⚠️ Configura estas variables en el archivo <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4 }}>.env.local</code> de tu proyecto.
            </div>
          </div>
        </div>

        {/* Sucursales */}
        <div className="settings-card">
          <h3>🏢 Sucursales Registradas</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {BRANCHES.map(b => (
              <div key={b.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}>
                <span style={{ fontSize: 24 }}>{b.emoji}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{b.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>ID: {b.id}</div>
                </div>
                <span className="av-badge av-optimal" style={{ marginLeft: 'auto' }}>Activa</span>
              </div>
            ))}
          </div>
        </div>

        {/* Roles y Permisos */}
        <div className="settings-card">
          <h3>👥 Roles del Sistema</h3>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rol</th>
                  <th>POS</th>
                  <th>Inventario</th>
                  <th>Dashboard</th>
                  <th>Cierre</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>SuperAdmin</td>
                  <td>✅</td><td>✅ CRUD</td><td>✅</td><td>✅</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Caja</td>
                  <td>✅</td><td>👁️ Read</td><td>✅</td><td>✅</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Asistente</td>
                  <td>✅</td><td>🚫</td><td>🚫</td><td>🚫</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Sistema AV */}
        <div className="settings-card">
          <h3>🏄 Sistema AV — Lógica de Salud</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { badge: 'av-optimal', icon: '✅', level: 'AV1 — ÓPTIMO', desc: 'Menos de 3 meses desde ingreso o último reset' },
              { badge: 'av-review', icon: '🕒', level: 'AV2 — REVISIÓN', desc: 'Entre 3 y 6 meses — Programar inspección' },
              { badge: 'av-repair', icon: '🔧', level: 'AV3 — REPARACIÓN', desc: 'Entre 6 y 9 meses — Ocultar de Asistente' },
              { badge: 'av-urgent', icon: '⚠️', level: 'URGENTE — VENCIDO', desc: 'Más de 9 meses — Bloqueo total de arriendo' },
            ].map((item) => (
              <div key={item.level} style={{
                display: 'flex', gap: 12, alignItems: 'flex-start',
                padding: '12px', background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)'
              }}>
                <span className={`av-badge ${item.badge}`}>{item.icon} {item.level.split('—')[0].trim()}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{item.level}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{item.desc}</div>
                </div>
              </div>
            ))}
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              🔄 Solo el SuperAdmin puede hacer <strong style={{ color: 'var(--text-secondary)' }}>Reset AV</strong> actualizando la <code>entry_date</code>.
            </div>
          </div>
        </div>

        {/* SuperAdmin Info */}
        <div className="settings-card">
          <h3>🔑 Cuenta SuperAdmin</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label>Email</label>
              <input className="form-input" value={user.email} readOnly />
            </div>
            <div className="form-group">
              <label>Nombre</label>
              <input className="form-input" defaultValue={user.name} />
            </div>
            <div className="form-group">
              <label>RUT</label>
              <input className="form-input" value={user.rut} readOnly />
            </div>
            <button className="btn btn-primary" onClick={() => alert('En producción, esto actualizaría el perfil en Supabase.')}>
              Guardar Cambios
            </button>
          </div>
        </div>

        {/* SQL Script */}
        <div className="settings-card">
          <h3>🗄️ Script SQL para Supabase</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
            Ejecuta este script en el SQL Editor de Supabase para inicializar la base de datos.
          </p>
          <a
            href="/supabase-init.sql"
            download
            className="btn btn-secondary btn-full"
          >
            📥 Descargar supabase-init.sql
          </a>
        </div>
      </div>
    </div>
  );
}
