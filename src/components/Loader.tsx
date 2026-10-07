export default function Loader({ label = 'Cargando' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-1 py-8 font-display text-xs font-bold uppercase tracking-widest text-dex-muted" role="status">
      {label}
      <span className="animate-blink">▮</span>
    </div>
  );
}
