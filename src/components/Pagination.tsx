interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onChange }: PaginationProps) {
  const buttonClass =
    'rounded-lg bg-white px-4 py-2 font-medium shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <nav className="flex items-center justify-center gap-3" aria-label="Paginación">
      <button className={buttonClass} disabled={page <= 1} onClick={() => onChange(page - 1)}>
        ← Anterior
      </button>
      <span className="text-sm text-slate-600">
        Página {page} de {totalPages}
      </span>
      <button className={buttonClass} disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Siguiente →
      </button>
    </nav>
  );
}
