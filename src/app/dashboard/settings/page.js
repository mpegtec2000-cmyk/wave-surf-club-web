'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/data';
import { useRouter } from 'next/navigation';
import { BRANCHES, ROLE_LABELS } from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import { 
  CreditCard, ShieldCheck, Save, Globe, Zap, AlertTriangle, Building2, 
  Users, Check, Eye, X, Activity, CheckCircle2, Clock, Wrench, 
  RotateCcw, Key, Database, Download, Lock, RefreshCw, Server
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);
  
  // Flow Settings State
  const [flowConfig, setFlowConfig] = useState({
    apiKey: '',
    secretKey: '',
    baseUrl: 'https://sandbox.flow.cl/api',
    isSaving: false
  });

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const u = getCurrentUser();
    if (!u || u.role !== 'superadmin') {
      router.replace('/dashboard');
      return;
    }
    setUser(u);
    loadFlowConfig();
  }, [router]);

  const loadFlowConfig = async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['flow_api_key', 'flow_secret_key', 'flow_url']);
    
    if (data) {
      const config = {};
      data.forEach(item => {
        if (item.key === 'flow_api_key') config.apiKey = item.value;
        if (item.key === 'flow_secret_key') config.secretKey = item.value;
        if (item.key === 'flow_url') config.baseUrl = item.value;
      });
      setFlowConfig(prev => ({ ...prev, ...config }));
    }
  };

  const saveFlowConfig = async () => {
    setFlowConfig(prev => ({ ...prev, isSaving: true }));
    
    const updates = [
      { key: 'flow_api_key', value: flowConfig.apiKey },
      { key: 'flow_secret_key', value: flowConfig.secretKey },
      { key: 'flow_url', value: flowConfig.baseUrl }
    ];

    try {
      for (const update of updates) {
        await supabase
          .from('site_settings')
          .update({ value: update.value, updated_at: new Date() })
          .eq('key', update.key);
      }
      showToast('Credenciales de Flow actualizadas con éxito', 'success');
    } catch (e) {
      showToast('Error al guardar credenciales: ' + e.message, 'error');
    } finally {
      setFlowConfig(prev => ({ ...prev, isSaving: false }));
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
            Administración &amp; Parámetros de Plataforma
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight mt-0.5">
            Configuración del Sistema
          </h1>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold self-start sm:self-auto">
          <Lock size={13} className="text-amber-600" />
          <span>Acceso Restringido: SuperAdmin</span>
        </div>
      </div>

      {/* ── Settings Bento Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Card 1: Supabase Database Status */}
        <div className="p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center">
                <Database size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-neutral-900">Conexión a Base de Datos</h3>
                <p className="text-[11px] text-neutral-400">Instancia en la nube de Supabase PostgreSQL</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Conectado
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400 font-mono text-[11px]">PROJECT REF:</span>
                <span className="font-mono font-bold text-neutral-800">keaoaxltnbdxysysxxem</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400 font-mono text-[11px]">ENDPOINT:</span>
                <span className="font-mono text-neutral-700 truncate max-w-[220px]">https://keaoaxltnbdxysysxxem.supabase.co</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400 font-mono text-[11px]">LATENCIA / SYNC:</span>
                <span className="font-mono font-bold text-emerald-600">Tiempo Real (Websockets activos)</span>
              </div>
            </div>

            <div className="text-[11px] text-neutral-500">
              Todas las transacciones, inventarios y clientes se sincronizan automáticamente con persistencia en PostgreSQL.
            </div>
          </div>
        </div>

        {/* Card 2: Flow Payment Gateway Configuration */}
        <div className="p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-neutral-100 text-neutral-800 border border-neutral-200 flex items-center justify-center">
                <CreditCard size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-neutral-900">Pasarela Flow Pagos</h3>
                <p className="text-[11px] text-neutral-400">Webpay Plus, Servipag y Multicaja para la Tienda Online</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
                API Key
              </label>
              <input
                type="text"
                value={flowConfig.apiKey}
                onChange={e => setFlowConfig({ ...flowConfig, apiKey: e.target.value })}
                placeholder="flow_api_key..."
                className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs font-mono font-bold text-neutral-900 focus:bg-white focus:border-neutral-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
                Secret Key
              </label>
              <input
                type="password"
                value={flowConfig.secretKey}
                onChange={e => setFlowConfig({ ...flowConfig, secretKey: e.target.value })}
                placeholder="••••••••••••••••"
                className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs font-mono font-bold text-neutral-900 focus:bg-white focus:border-neutral-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
                Ambiente de Pasarela
              </label>
              <select
                value={flowConfig.baseUrl}
                onChange={e => setFlowConfig({ ...flowConfig, baseUrl: e.target.value })}
                className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs font-semibold text-neutral-800 focus:bg-white focus:border-neutral-900 outline-none"
              >
                <option value="https://sandbox.flow.cl/api">Sandbox (Pruebas / Certificación)</option>
                <option value="https://www.flow.cl/api">Producción (Cobro Real)</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                onClick={saveFlowConfig}
                disabled={flowConfig.isSaving}
                className="w-full h-10 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs inline-flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save size={14} /> {flowConfig.isSaving ? 'Guardando...' : 'Guardar Parámetros Flow'}
              </button>
            </div>
          </div>
        </div>

        {/* Card 3: Branches / Centros de Costo Overview */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-200/60 flex items-center justify-center">
                <Building2 size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-neutral-900">Sucursales Habilitadas (Centros de Costo)</h3>
                <p className="text-[11px] text-neutral-400">Sedes operativas con control de inventario y caja independiente</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-lg">
              {BRANCHES.length} sedes
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {BRANCHES.map(b => (
              <div key={b.id} className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-900 text-sm">{b.name}</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white border border-neutral-200 text-neutral-600">
                    ID #{b.id}
                  </span>
                </div>
                <div className="text-xs font-mono text-neutral-500">{b.short_name}</div>
                <div className="pt-2 border-t border-neutral-200/60 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Operacional &amp; Auditoría Activa
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Toast Feedback */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl border shadow-xl text-xs font-bold animate-in fade-in slide-in-from-bottom-3 duration-200 ${
          toast.type === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-700'
            : 'bg-neutral-900 border-neutral-800 text-white'
        }`}>
          {toast.msg}
        </div>
      )}

    </div>
  );
}
