'use client';

import { useState } from 'react';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function AntigravityPlayground() {
  const [tarea, setTarea] = useState('');
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const enviarTarea = async () => {
    setCargando(true);
    setError(null);
    setResultado(null);

    try {
      const respuesta = await fetch('/api/antigravity/procesar-y-evaluar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tarea })
      });

      if (!respuesta.ok) {
        const errData = await respuesta.json();
        throw new Error(errData.error || 'Error en la respuesta del servidor');
      }

      const datos = await respuesta.json();
      setResultado(datos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ 
      padding: '32px', 
      background: 'var(--bg-secondary)', 
      borderRadius: 'var(--radius-lg)', 
      border: '1px solid var(--border-subtle)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
    }}>
      <h2 style={{ 
        fontSize: '1.5rem', 
        fontWeight: '800', 
        marginBottom: '24px', 
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-display)'
      }}>
        Antigravity Playground
      </h2>
      
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="tarea" style={{ 
          display: 'block', 
          fontSize: '12px', 
          fontWeight: '700', 
          color: 'var(--text-secondary)', 
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          Tarea para el Sistema de Agentes:
        </label>
        <textarea
          id="tarea"
          rows="5"
          className="form-input"
          value={tarea}
          onChange={(e) => setTarea(e.target.value)}
          placeholder="Ej: Generar un componente React básico para mostrar una lista de productos de surf."
          style={{ minHeight: '120px', resize: 'vertical' }}
        />
      </div>

      <button
        onClick={enviarTarea}
        disabled={cargando || !tarea}
        className="btn btn-primary"
        style={{ width: 'auto', minWidth: '180px' }}
      >
        {cargando ? (
          <><Loader2 size={18} className="animate-spin" style={{ marginRight: '10px' }} /> Procesando...</>
        ) : (
          <><Send size={18} style={{ marginRight: '10px' }} /> Enviar Tarea</>
        )}
      </button>

      {error && (
        <div style={{ 
          marginTop: '20px', 
          padding: '16px', 
          background: 'rgba(239, 68, 68, 0.1)', 
          color: 'var(--color-danger)', 
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '14px'
        }}>
          <AlertCircle size={20} />
          <strong>Error:</strong> {error}
        </div>
      )}

      {resultado && (
        <div style={{ marginTop: '40px', animation: 'fadeUp 0.5s ease both' }}>
          <h3 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '700', 
            marginBottom: '20px',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-display)'
          }}>
            Resultados del Proceso
          </h3>
          
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ 
              fontSize: '11px', 
              fontWeight: '700', 
              color: 'var(--text-muted)', 
              marginBottom: '10px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Solución Generada (Agente Principal)
            </h4>
            <pre style={{ 
              padding: '20px', 
              background: 'var(--bg-surface)', 
              borderRadius: 'var(--radius-md)', 
              overflowX: 'auto', 
              fontSize: '13px',
              fontFamily: 'var(--font-mono)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              lineHeight: '1.6'
            }}>
              {resultado.solucion}
            </pre>
          </div>

          <div>
            <h4 style={{ 
              fontSize: '11px', 
              fontWeight: '700', 
              color: 'var(--text-muted)', 
              marginBottom: '10px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Evaluación (Agente Evaluador)
            </h4>
            <div style={{ 
              padding: '20px', 
              borderRadius: 'var(--radius-md)', 
              background: resultado.evaluacion.estado === 'CORRECTO' ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
              border: `1px solid ${resultado.evaluacion.estado === 'CORRECTO' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
              color: resultado.evaluacion.estado === 'CORRECTO' ? 'var(--color-success)' : 'var(--color-danger)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                {resultado.evaluacion.estado === 'CORRECTO' ? (
                  <CheckCircle size={20} />
                ) : (
                  <AlertCircle size={20} />
                )}
                <span style={{ fontWeight: '800', letterSpacing: '1px' }}>{resultado.evaluacion.estado}</span>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                {resultado.evaluacion.explicacion}
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
