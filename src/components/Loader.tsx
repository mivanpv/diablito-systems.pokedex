export default function Loader({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-500" role="status">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-poke-red" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
