// src/app/admin/(panel)/loading.tsx  (esqueleto instantáneo al navegar)
export default function PanelLoading() {
  return (
    <div aria-busy="true" aria-label="Cargando" className="animate-pulse motion-reduce:animate-none">
      <div className="mb-6 h-10 w-52 rounded-xl bg-primary/10" />
      <div className="mb-6 flex gap-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-10 w-28 rounded-full bg-primary/10" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-52 rounded-2xl bg-primary/10" />
        ))}
      </div>
    </div>
  );
}