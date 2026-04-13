'use client';

import { useState, useEffect } from 'react';
import { getEventQuotes, updateQuoteStatus, deleteEventQuote, getBranches } from '@/lib/data';
import { ClipboardList, User, MapPin, Search, Calendar, Users, Mail, Phone, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function CotizacionesPage() {
  const [quotes, setQuotes] = useState([]);
  const [filteredQuotes, setFilteredQuotes] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('todos'); // 'todos', 'pending', 'lista'
  const [filterBranch, setFilterBranch] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterData();
  }, [quotes, filterStatus, filterBranch, searchTerm]);

  async function loadData() {
    setLoading(true);
    try {
      const [quotesData, branchesData] = await Promise.all([
        getEventQuotes(),
        getBranches()
      ]);
      setQuotes(quotesData);
      setBranches(branchesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function filterData() {
    let result = [...quotes];

    if (filterStatus !== 'todos') {
      result = result.filter(q => {
        const status = (q.status || 'pending').toLowerCase();
        return status === filterStatus;
      });
    }

    if (filterBranch !== 'todas') {
      result = result.filter(q => q.content?.datos?.sede === filterBranch);
    }

    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      result = result.filter(q => 
        q.content?.datos?.nombre?.toLowerCase().includes(query) || 
        q.content?.datos?.rut?.toLowerCase().includes(query) ||
        q.content?.datos?.email?.toLowerCase().includes(query)
      );
    }

    setFilteredQuotes(result);
  }

  const handleToggleStatus = async (quote) => {
    const currentStatus = (quote.status || 'pending').toLowerCase();
    const nextStatus = currentStatus === 'pending' ? 'lista' : 'pending';
    
    // Si pasamos a LISTA, mostramos alerta diferente
    const result = await Swal.fire({
      title: '¿Confirmar como FINALIZADA?',
      text: `La cotización pasará a estado LISTA (Verde)`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, finalizar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#22c55e'
    });

    if (result.isConfirmed) {
      const { error } = await updateQuoteStatus(quote.id, nextStatus);
      if (error) {
        Swal.fire('Error', 'No se pudo actualizar el estado. Prueba refrescando.', 'error');
      } else {
        setQuotes(quotes.map(q => q.id === quote.id ? { ...q, status: nextStatus } : q));
        Swal.fire({
          title: '¡Tarea Finalizada!',
          text: 'Ya puedes borrarla si lo deseas.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    }
  };

  const handleDelete = async (quote) => {
    const result = await Swal.fire({
      title: '¿Eliminar Cotización?',
      text: "Esta acción no se puede deshacer y el registro desaparecerá de la base de datos.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar permanentemente',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444'
    });

    if (result.isConfirmed) {
      const { error } = await deleteEventQuote(quote.id);
      if (error) {
        Swal.fire('Error', 'No se pudo eliminar el registro.', 'error');
      } else {
        setQuotes(quotes.filter(q => q.id !== quote.id));
        Swal.fire('Eliminado', 'La cotización ha sido borrada.', 'success');
      }
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // KPI calculations
  const totalPendientes = quotes.filter(q => (q.status || 'pending').toLowerCase() === 'pending').length;
  const totalListas = quotes.filter(q => q.status?.toLowerCase() === 'lista').length;
  const totalEmpresa = quotes.filter(q => q.content?.datos?.tipo_evento === 'PASEO DE EMPRESA').length;

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* ── Header ── */}
      <header style={{ marginBottom: '40px', borderBottom: '2px solid var(--border-subtle)', paddingBottom: '24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, #38bdf8, #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 15px -3px rgba(56, 189, 248, 0.3)' }}>
          <ClipboardList size={32} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: '36px', fontWeight: 950, color: 'var(--accent-primary)', margin: 0, letterSpacing: '-0.5px' }}>
            GESTIÓN DE COTIZACIONES
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginTop: '6px', fontWeight: 500 }}>
            Administra las solicitudes de eventos, paseos de curso y empresas.
          </p>
        </div>
      </header>

      {/* ── KPIs ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 32 }}>
        <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: 24, border: '1.5px solid var(--border-subtle)', borderLeft: '6px solid var(--color-warning)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 800, textTransform: 'uppercase' }}>Pendientes de Revisión</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--color-warning)', marginTop: 8 }}>{totalPendientes}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: 24, border: '1.5px solid var(--border-subtle)', borderLeft: '6px solid var(--color-success)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 800, textTransform: 'uppercase' }}>Cotizaciones Listas</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--color-success)', marginTop: 8 }}>{totalListas}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: 24, border: '1.5px solid var(--border-subtle)', borderLeft: '6px solid #8b5cf6' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 800, textTransform: 'uppercase' }}>Paseos de Empresa</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: '#8b5cf6', marginTop: 8 }}>{totalEmpresa}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: 24, border: '1.5px solid var(--border-subtle)', borderLeft: '6px solid #38bdf8' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 800, textTransform: 'uppercase' }}>Total Solicitudes</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: '#38bdf8', marginTop: 8 }}>{quotes.length}</div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 300 }}>
          <Search size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: 48, height: 50, fontSize: 15 }}
            placeholder="Buscar por RUT, Nombre o Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div style={{ display: 'flex', gap: 8 }}>
          <select 
            className="form-input" 
            style={{ width: 200, height: 50, fontWeight: 600 }}
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
          >
            <option value="todas">Todas las Sedes</option>
            <option value="Concón">Concón</option>
            <option value="Punta de Piedra">Punta de Piedra</option>
            <option value="Pichilemu">Pichilemu</option>
          </select>

          <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '12px', border: '1.5px solid var(--border-subtle)' }}>
            <button 
              className={`btn-filter ${filterStatus === 'todos' ? 'active' : ''}`} 
              onClick={() => setFilterStatus('todos')}
              style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: filterStatus === 'todos' ? '#38bdf8' : 'transparent', color: filterStatus === 'todos' ? '#fff' : 'var(--text-muted)', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
            >
              TODOS
            </button>
            <button 
              className={`btn-filter ${filterStatus === 'pending' ? 'active' : ''}`} 
              onClick={() => setFilterStatus('pending')}
              style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: filterStatus === 'pending' ? 'var(--color-warning)' : 'transparent', color: filterStatus === 'pending' ? '#fff' : 'var(--text-muted)', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
            >
              PENDIENTE
            </button>
            <button 
              className={`btn-filter ${filterStatus === 'lista' ? 'active' : ''}`} 
              onClick={() => setFilterStatus('lista')}
              style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: filterStatus === 'lista' ? 'var(--color-success)' : 'transparent', color: filterStatus === 'lista' ? '#fff' : 'var(--text-muted)', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
            >
              LISTA
            </button>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}></th>
              <th>Cliente / Contacto</th>
              <th>Sede / Evento</th>
              <th style={{ textAlign: 'center' }}>Participantes</th>
              <th style={{ textAlign: 'center' }}>Fecha Evento</th>
              <th style={{ textAlign: 'center' }}>Fecha Solicitud</th>
              <th style={{ textAlign: 'center' }}>Estado</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Cargando cotizaciones...</td></tr>
            ) : filteredQuotes.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No se encontraron solicitudes.</td></tr>
            ) : (
              filteredQuotes.map(q => {
                const d = q.content?.datos || {};
                const currentStatus = (q.status || 'pending').toLowerCase();
                
                return (
                  <tr key={q.id}>
                    <td style={{ textAlign: 'center' }}>
                      {currentStatus === 'lista' ? (
                        <button 
                          onClick={() => handleDelete(q)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px' }}
                          title="Eliminar Registro"
                        >
                          <Trash2 size={18} />
                        </button>
                      ) : (
                        <div style={{ width: '34px' }} />
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: 14 }}>{d.nombre}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <User size={12} /> {d.rut}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Mail size={12} /> {d.email || 'N/A'}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Phone size={12} /> {d.telefono}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 800 }}>
                        <MapPin size={12} /> {d.sede?.toUpperCase()}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginTop: 8 }}>
                        {d.tipo_evento}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, maxWidth: '250px', lineBreak: 'anywhere' }}>
                        "{d.mensaje_cliente}"
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{ fontSize: 14, fontWeight: 900, color: '#1e293b' }}>
                          {d.adultos + d.niños} <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>TOTAL</span>
                        </div>
                        <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700 }}>
                          {d.adultos} ADU / {d.niños} NIÑ
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--text-primary)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <Calendar size={16} color="#38bdf8" />
                        {formatDate(d.fecha_deseada)}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                      {formatDate(q.created_at)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {currentStatus === 'lista' ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a', padding: '6px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: 900 }}>
                          <CheckCircle2 size={14} /> LISTA
                        </div>
                      ) : (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(245, 158, 11, 0.1)', color: '#d97706', padding: '6px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: 900 }}>
                          <Clock size={14} /> PENDIENTE
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        onClick={() => handleToggleStatus(q)}
                        style={{ 
                          padding: '8px 16px', 
                          borderRadius: '8px', 
                          border: 'none', 
                          background: currentStatus === 'lista' ? '#f1f5f9' : '#38bdf8',
                          color: currentStatus === 'lista' ? '#475569' : '#fff',
                          fontSize: '11px', 
                          fontWeight: 950, 
                          cursor: 'pointer',
                          boxShadow: currentStatus === 'lista' ? 'none' : '0 4px 6px -1px rgba(56, 189, 248, 0.2)'
                        }}
                      >
                        {currentStatus === 'lista' ? 'PENDIENTE' : 'MARCAR LISTA'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .btn-filter {
          transition: all 0.2s ease;
        }
        .btn-filter:hover {
          opacity: 0.8;
        }
        .data-table tr:hover {
          background: rgba(56, 189, 248, 0.02);
        }
      `}</style>
    </div>
  );
}
