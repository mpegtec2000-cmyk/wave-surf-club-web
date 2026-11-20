'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, LayoutDashboard } from 'lucide-react';

export default function DashboardError({ error, reset }) {
  useEffect(() => { console.error('[dashboard]', error); }, [error]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="max-w-md w-full bg-white border border-neutral-200 rounded-2xl p-8 text-center shadow-sm">
        <div className="w-11 h-11 mx-auto rounded-xl bg-neutral-100 flex items-center justify-center">
          <AlertTriangle size={20} className="text-neutral-700" />
        </div>
        <h2 className="mt-4 text-[17px] font-semibold text-neutral-900">No pudimos cargar este módulo</h2>
        <p className="mt-1.5 text-[13.5px] text-neutral-500">
          Ocurrió un error inesperado. Tus datos están seguros; puedes reintentar o volver al panel.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <button type="button" onClick={() => reset()} className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-neutral-900 text-white text-[13px] font-medium hover:bg-black">
            <RotateCcw size={15} /> Reintentar
          </button>
          <Link href="/dashboard" className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-neutral-200 text-[13px] font-medium hover:bg-neutral-50">
            <LayoutDashboard size={15} /> Ir al panel
          </Link>
        </div>
      </div>
    </div>
  );
}
