import Link from 'next/link';
import { Compass } from 'lucide-react';

export default function DashboardNotFound() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center">
        <div className="w-11 h-11 mx-auto rounded-xl bg-neutral-100 flex items-center justify-center">
          <Compass size={20} className="text-neutral-700" />
        </div>
        <h2 className="mt-4 text-[17px] font-semibold text-neutral-900">Módulo no encontrado</h2>
        <p className="mt-1.5 text-[13.5px] text-neutral-500">La sección que buscas no existe o fue movida.</p>
        <Link href="/dashboard" className="mt-5 inline-flex items-center h-10 px-4 rounded-xl bg-neutral-900 !text-white text-[13px] font-medium hover:bg-black">Volver al panel</Link>
      </div>
    </div>
  );
}
