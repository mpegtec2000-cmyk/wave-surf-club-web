export default function DashboardLoading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Cargando">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map(i => <div key={i} className="wsc-skeleton h-28" />)}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="wsc-skeleton h-72 xl:col-span-2" />
        <div className="wsc-skeleton h-72" />
      </div>
    </div>
  );
}
