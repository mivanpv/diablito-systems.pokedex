const MAX_BASE_STAT = 255;

interface StatBarProps {
  label: string;
  value: number;
}

export default function StatBar({ label, value }: StatBarProps) {
  const percent = Math.min(100, (value / MAX_BASE_STAT) * 100);

  return (
    <div className="grid grid-cols-[7rem_2.5rem_1fr] items-center gap-2 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-semibold tabular-nums">{value}</span>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-poke-red" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
