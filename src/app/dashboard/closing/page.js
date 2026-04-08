'use client';

import { useState, useEffect, useMemo } from 'react';
import { getMockUser, MOCK_TRANSACTIONS, MOCK_INVENTORY } from '@/lib/mock-data';
import { BRANCHES, PAYMENT_METHODS } from '@/lib/constants';
import { calculateAV } from '@/lib/av-system';

export default function ClosingPage() {
  const [user, setUser] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const u = getMockUser();
    setUser(u);
    if (u) setSelectedBranch(u.branch_id || 1);
  }, []);

  const report = useMemo(() => {
    if (!selectedBranch) return null;

    const branch = BRANCHES.find(b => b.id === selectedBranch);
    const branchTx = MOCK_TRANSACTIONS.filter(t => t.branch_id === selectedBranch);
    const branchInv = MOCK_INVENTORY.filter(i => i.branch_id === selectedBranch);

    const totalIncome = branchTx.filter(t => t.type === 'ingreso').reduce((s, t) => s + t.total, 0);
    const totalExpense = branchTx.filter(t => t.type === 'salida').reduce((s, t) => s + t.total, 0);
    const netBalance = totalIncome - totalExpense;

    const byMethod = {};
    PAYMENT_METHODS.forEach(m => {
      byMethod[m.value] = branchTx.filter(t => t.method === m.value).reduce((s, t) => s + t.total, 0);
    });

    const debtGenerated = branchTx.filter(t => t.method === 'por_pagar').reduce((s, t) => s + t.total, 0);
    const debtPaid = branchTx.filter(t => t.category === 'pago_deuda').reduce((s, t) => s + t.total, 0);

    const av3Items = branchInv.filter(i => calculateAV(i.entry_date).level === 'AV3');
    const expiredItems = branchInv.filter(i => calculateAV(i.entry_date).level === 'URGENTE');
    const incidents = branchTx.filter(t => t.is_incident);

    const fmt = (n) => '$' + n.toLocaleString('es-CL');
    const today = new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return {
      branch, totalIncome, totalExpense, netBalance,
      byMethod, debtGenerated, debtPaid,
      av3Items, expiredItems, incidents,
      text: `==================================================
        CIERRE DE CAJA - WAVE SURF CLUB
==================================================
SUCURSAL: ${branch?.name}
FECHA: ${today}
RESPONSABLE DE TURNO: ${user?.name}
--------------------------------------------------

1. BALANCES DE LA SEDE:
- Ingresos:   ${fmt(totalIncome)}
- Salidas:    ${fmt(totalExpense)}
- TOTAL NETO: ${fmt(netBalance)}

2. MÉTODOS DE PAGO:
- Efectivo:       ${fmt(byMethod.efectivo || 0)}
- Transferencia:  ${fmt(byMethod.transferencia || 0)}
- Tarjeta:        ${fmt(byMethod.tarjeta || 0)}
- Por Pagar:      ${fmt(debtGenerated)}
- Deuda Pagada:   ${fmt(debtPaid)}

3. CONTROL DE ACTIVOS (SEDE ${branch?.name}):
- Alertas AV3 (Reparación): ${av3Items.length > 0 ? av3Items.map(i => i.item_code).join(', ') : 'Ninguna'}
- ALERTAS VENCIDOS (Urgente): ${expiredItems.length > 0 ? expiredItems.map(i => i.item_code).join(', ') : 'Ninguna'}

4. NOTAS E INCIDENCIAS DEL TURNO:
${incidents.length > 0 ? incidents.map(i => `- Incidencia ${i.id}: "${i.incident_note}" - Cargo: ${fmt(i.total)}`).join('\n') : '- Sin incidencias registradas.'}
==================================================
           FIN DEL REPORTE - SINCE 2015
==================================================`
    };
  }, [selectedBranch, user]);

  const handleSend = async () => {
    setSending(true);
    // Simula envío de email
    await new Promise(r => setTimeout(r, 2000));
    setSending(false);
    setSent(true);
  };

  const formatMoney = (n) => '$' + n.toLocaleString('es-CL');

  if (!user || !report) return null;

  return (
    <div>
      {/* Branch selector */}
      {user.role === 'superadmin' && (
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <label style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Seleccionar sede:</label>
          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={selectedBranch || ''}
            onChange={(e) => { setSelectedBranch(Number(e.target.value)); setSent(false); }}
          >
            {BRANCHES.map(b => (
              <option key={b.id} value={b.id}>{b.emoji} {b.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Stats summary */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <div className="stat-card-label">Ingresos</div>
              <div className="stat-card-value" style={{ color: 'var(--color-success)', fontSize: 24 }}>{formatMoney(report.totalIncome)}</div>
            </div>
            <div className="stat-card-icon green">💰</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <div className="stat-card-label">Salidas</div>
              <div className="stat-card-value" style={{ color: 'var(--color-danger)', fontSize: 24 }}>{formatMoney(report.totalExpense)}</div>
            </div>
            <div className="stat-card-icon red">📤</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <div className="stat-card-label">Neto</div>
              <div className="stat-card-value" style={{ fontSize: 24 }}>{formatMoney(report.netBalance)}</div>
            </div>
            <div className="stat-card-icon blue">📊</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <div className="stat-card-label">Alertas</div>
              <div className="stat-card-value" style={{ color: 'var(--color-warning)', fontSize: 24 }}>{report.av3Items.length + report.expiredItems.length}</div>
            </div>
            <div className="stat-card-icon yellow">⚠️</div>
          </div>
        </div>
      </div>

      {/* Report preview */}
      <div className="data-section">
        <div className="data-section-header">
          <h3 className="data-section-title">📋 Vista Previa del Reporte (.txt)</h3>
          <div className="data-section-actions">
            {sent ? (
              <span className="av-badge av-optimal" style={{ fontSize: 13 }}>✅ Enviado a WAVE_SURF_CLUB@outlook.com</span>
            ) : (
              <button
                className="btn btn-primary"
                onClick={handleSend}
                disabled={sending}
              >
                {sending ? '⏳ Enviando...' : '📧 Generar y Enviar Reporte'}
              </button>
            )}
          </div>
        </div>
        <div style={{ padding: 24 }}>
          <div className="closing-preview">
            {report.text}
          </div>
        </div>
      </div>
    </div>
  );
}
