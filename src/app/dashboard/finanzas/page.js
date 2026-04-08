'use client';

import { useState, useEffect } from 'react';
import { getFinancialSummary, getBranches } from '@/lib/data';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart } from 'lucide-react';

export default function FinanzasGlobales() {
  const [summary, setSummary] = useState({});
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const b = await getBranches();
      const s = await getFinancialSummary();
      setBranches(b);
      setSummary(s);
      setLoading(false);
    }
    loadData();
  }, []);

  const formatMoney = (n) => '$ ' + (n || 0).toLocaleString('es-CL');

  if (loading) return <div className="p-12 text-center animate-pulse">Cargando Auditoría Financiera...</div>;

  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '48px', borderBottom: '2px solid var(--border-subtle)', paddingBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '36px', fontWeight: 950, color: 'var(--accent-primary)', marginBottom: '8px' }}>🏦 FINANZAS GLOBALES</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', fontWeight: 500 }}>Control Consolidado de Centros de Costo — Wave Surf Club</p>
        </div>
        <div style={{ padding: '12px 24px', background: '#fff', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-subtle)', textAlign: 'right' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Consolidado Total</span>
          <div className="mono" style={{ fontSize: '24px', fontWeight: 950, color: 'var(--accent-action)' }}>
            {formatMoney(Object.values(summary).reduce((s, b) => s + b.net, 0))}
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
        {branches.map(branch => {
          const stats = summary[branch.id] || { income: 0, expense: 0, net: 0, count: 0 };
          return (
            <div key={branch.id} className="data-header-section" style={{ background: '#fff', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: '1.5px solid var(--border-subtle)' }}>
              <div style={{ padding: '24px', borderBottom: '1.5px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-primary)' }}>
                <span style={{ fontSize: '24px' }}>{branch.emoji}</span>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: 'var(--accent-primary)' }}>{branch.name.toUpperCase()}</h3>
              </div>
              
              <div style={{ padding: '32px' }}>
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '13px' }}>Ingresos Totales</span>
                    <TrendingUp size={18} color="var(--color-success)" />
                  </div>
                  <div className="mono" style={{ fontSize: '22px', fontWeight: 850, color: 'var(--color-success)' }}>
                    {formatMoney(stats.income)}
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '13px' }}>Gastos Operativos</span>
                    <TrendingDown size={18} color="var(--color-danger)" />
                  </div>
                  <div className="mono" style={{ fontSize: '22px', fontWeight: 850, color: 'var(--color-danger)' }}>
                    {formatMoney(stats.expense)}
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1.5px dashed var(--border-subtle)', margin: '24px 0' }} />

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 800, fontSize: '14px' }}>UTILIDAD NETA</span>
                    <DollarSign size={18} color="var(--accent-action)" />
                  </div>
                  <div className="mono" style={{ fontSize: '32px', fontWeight: 950, color: 'var(--accent-primary)' }}>
                    {formatMoney(stats.net)}
                  </div>
                  <p style={{ marginTop: '12px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>
                    Basado en {stats.count} sesiones consolidadas.
                  </p>
                </div>
              </div>
              
              <div style={{ padding: '16px 32px', background: 'rgba(15, 23, 42, 0.03)', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ height: '8px', width: '100%', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${Math.min(100, (stats.income > 0 ? (stats.net / stats.income) * 100 : 0))}%`, 
                    background: 'var(--accent-action)' 
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                   <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)' }}> MARGEN OPERATIVO </span>
                   <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--accent-primary)' }}>
                     {stats.income > 0 ? ((stats.net / stats.income) * 100).toFixed(1) : 0}%
                   </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '48px', background: '#fff', borderRadius: 'var(--radius-xl)', padding: '40px', border: '1.5px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <BarChart3 size={24} style={{ color: 'var(--accent-action)' }} />
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 950, color: 'var(--accent-primary)' }}>Métricas Comparativas por Sede</h2>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'flex-end', height: '300px', gap: '64px', padding: '0 40px' }}>
          {branches.map(branch => {
             const stats = summary[branch.id] || { income: 0, expense: 0, net: 0 };
             // Use a relative scale based on the highest income
             const incomes = Object.values(summary).map(s => s.income);
             const maxInc = incomes.length > 0 ? Math.max(...incomes, 100000) : 100000;
             const hIncome = (stats.income / maxInc) * 100;
             const hExpense = (stats.expense / maxInc) * 100;

             return (
               <div key={branch.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', height: '100%' }}>
                 <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '100%', width: '100%' }}>
                    <div style={{ flex: 1, height: `${hIncome}%`, background: 'var(--color-success)', borderRadius: '4px 4px 0 0', opacity: 0.8 }} />
                    <div style={{ flex: 1, height: `${hExpense}%`, background: 'var(--color-danger)', borderRadius: '4px 4px 0 0', opacity: 0.8 }} />
                 </div>
                 <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)' }}>{branch.short_name}</span>
               </div>
             )
          })}
        </div>
      </div>
    </div>
  );
}
