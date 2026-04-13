'use client';

import { useState, useEffect } from 'react';
import { getSubscriptions, getCurrentUser, getBranches } from '@/lib/data';
import { CalendarDays, Package, User, MapPin, Search } from 'lucide-react';
import { useBranch } from '@/lib/branch-context';

export default function SubscriptionsPage() {
  const { branches } = useBranch();
  const [subs, setSubs] = useState([]);
  const [filteredSubs, setFilteredSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('todos'); // 'todos', 'mensualidad', 'bodega'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSubscriptions();
  }, []);

  useEffect(() => {
    filterData();
  }, [subs, filterType, searchTerm]);

  async function loadSubscriptions() {
    setLoading(true);
    const data = await getSubscriptions();
    setSubs(data);
    setLoading(false);
  }

  function filterData() {
    let result = [...subs];

    if (filterType !== 'todos') {
      result = result.filter(s => s.category === filterType);
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(s => 
        s.client_rut?.toLowerCase().includes(q) || 
        s.profiles?.name?.toLowerCase().includes(q)
      );
    }

    setFilteredSubs(result);
  }

  const getDaysLeft = (validUntil) => {
    if (!validUntil) return 0;
    const now = new Date();
    const end = new Date(validUntil);
    const diff = end - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const formatMoney = (n) => '$ ' + (n || 0).toLocaleString('es-CL');

  // KPI calculations
  const totalActivas = subs.filter(s => getDaysLeft(s.valid_until) > 0).length;
  const expiradas = subs.filter(s => getDaysLeft(s.valid_until) <= 0).length;
  const bodegaCount = subs.filter(s => s.category === 'bodega' && getDaysLeft(s.valid_until) > 0).length;
  const mensualCount = subs.filter(s => s.category === 'mensualidad' && getDaysLeft(s.valid_until) > 0).length;

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* ── Header ── */}
      <header style={{ marginBottom: '40px', borderBottom: '2px solid var(--border-subtle)', paddingBottom: '24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)' }}>
          <CalendarDays size={32} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: '36px', fontWeight: 950, color: 'var(--accent-primary)', margin: 0, letterSpacing: '-0.5px' }}>
            MENSUALIDADES Y BODEGA
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginTop: '6px', fontWeight: 500 }}>
            Control de suscripciones, arriendos a largo plazo y membresías activas.
          </p>
        </div>
      </header>

      {/* ── KPIs ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 32 }}>
        <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: 24, border: '1.5px solid var(--border-subtle)', borderLeft: '6px solid var(--color-success)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 800, textTransform: 'uppercase' }}>Suscripciones Activas</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--text-primary)', marginTop: 8 }}>{totalActivas}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: 24, border: '1.5px solid var(--border-subtle)', borderLeft: '6px solid var(--color-danger)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 800, textTransform: 'uppercase' }}>Suscripciones Vencidas</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--color-danger)', marginTop: 8 }}>{expiradas}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: 24, border: '1.5px solid var(--border-subtle)', borderLeft: '6px solid #8b5cf6' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 800, textTransform: 'uppercase' }}>Cupos Bodega Activos</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: '#8b5cf6', marginTop: 8 }}>{bodegaCount}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: 24, border: '1.5px solid var(--border-subtle)', borderLeft: '6px solid #ec4899' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 800, textTransform: 'uppercase' }}>Mensualidades Activas</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: '#ec4899', marginTop: 8 }}>{mensualCount}</div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
          <Search size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: 48, height: 50, fontSize: 15 }}
            placeholder="Buscar por RUT o Nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={`btn ${filterType === 'todos' ? 'active' : ''}`} onClick={() => setFilterType('todos')} style={{ background: filterType === 'todos' ? 'var(--accent-action)' : '#fff', color: filterType === 'todos' ? '#fff' : 'var(--text-muted)', border: '1.5px solid var(--border-subtle)' }}>
            Todos
          </button>
          <button className={`btn ${filterType === 'mensualidad' ? 'active' : ''}`} onClick={() => setFilterType('mensualidad')} style={{ background: filterType === 'mensualidad' ? '#ec4899' : '#fff', color: filterType === 'mensualidad' ? '#fff' : 'var(--text-muted)', border: '1.5px solid var(--border-subtle)' }}>
            Mensualidades
          </button>
          <button className={`btn ${filterType === 'bodega' ? 'active' : ''}`} onClick={() => setFilterType('bodega')} style={{ background: filterType === 'bodega' ? '#8b5cf6' : '#fff', color: filterType === 'bodega' ? '#fff' : 'var(--text-muted)', border: '1.5px solid var(--border-subtle)' }}>
            Bodega
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Cliente / Datos</th>
              <th>Tipo Suscripción</th>
              <th style={{ textAlign: 'center' }}>Sede</th>
              <th>Fecha Pago</th>
              <th style={{ textAlign: 'right' }}>Monto Pagado</th>
              <th style={{ textAlign: 'center' }}>Días Restantes</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Cargando datos...</td></tr>
            ) : filteredSubs.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No hay suscripciones registradas.</td></tr>
            ) : (
              filteredSubs.map(s => {
                const daysLeft = getDaysLeft(s.valid_until);
                const isBodega = s.category === 'bodega';
                const shortBranch = branches.find(b => b.id === s.branch_id)?.short_name || `SEDE ${s.branch_id}`;

                return (
                  <tr key={s.id}>
                    <td>
                      <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: 14 }}>{s.profiles?.name || 'Cliente sin nombre'}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>💳 RUT: {s.client_rut}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>📱 Fono: {s.profiles?.phone || 'N/A'}</div>
                    </td>
                    <td>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: isBodega ? '#f3e8ff' : '#fce7f3', color: isBodega ? '#7e22ce' : '#be185d', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 800 }}>
                        {isBodega ? <Package size={14} /> : <User size={14} />}
                        {s.category.toUpperCase()} 
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, fontWeight: 700, textTransform: 'uppercase' }}>
                        Periodo: {s.subscription_period?.replace('_', ' ')}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>
                      <span style={{ fontSize: 11, background: 'var(--bg-primary)', padding: '2px 8px', borderRadius: 4, border: '1px solid var(--border-subtle)' }}>
                        <MapPin size={10} style={{ display: 'inline', marginRight: 4 }}/>
                        {shortBranch.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      {new Date(s.created_at).toLocaleDateString('es-CL')}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 900, fontFamily: 'var(--font-mono)', fontSize: 15 }}>
                      {formatMoney(s.total)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ 
                        fontSize: 20, fontWeight: 900, fontFamily: 'var(--font-mono)',
                        color: daysLeft > 5 ? 'var(--color-success)' : daysLeft > 0 ? 'var(--color-warning)' : 'var(--color-danger)'
                      }}>
                        {daysLeft}
                      </div>
                    </td>
                    <td>
                      {daysLeft > 0 ? (
                        <span className="av-badge av-optimal">ACTIVA</span>
                      ) : (
                        <span className="av-badge av-urgent">VENCIDA</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
