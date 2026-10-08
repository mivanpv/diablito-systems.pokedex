const MAX_BASE_STAT = 255;

interface StatBarProps {
  label: string;
  value: number;
}

export default function StatBar({ label, value }: StatBarProps) {
  const percent = Math.min(100, (value / MAX_BASE_STAT) * 100);
  // red for low stats, navy for average, green for high
  const color = value >= 120 ? 'bg-dex-ok' : value >= 70 ? 'bg-dex-ink' : 'bg-dex-accent';

  return (
    <div className="grid grid-cols-[5.5rem_2rem_1fr] items-center gap-2 sm:grid-cols-[7rem_2.5rem_1fr] sm:gap-3">
      <span className="dex-label">{label}</span>
      <span className="text-right font-display text-sm font-bold tabular-nums">{value}</span>
      <div
        className="h-3 overflow-hidden rounded-full border-2 border-dex-ink bg-dex-surface"
        role="meter"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={MAX_BASE_STAT}
      >
        <div className={`h-full ${color}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
