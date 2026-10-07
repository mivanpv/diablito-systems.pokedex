import { capitalize } from '../utils/format';
import { TYPE_INFO } from '../utils/i18n';

export default function TypeBadge({ type }: { type: string }) {
  const info = TYPE_INFO[type];

  return (
    <span
      className="rounded border-2 border-dex-ink px-1.5 py-0.5 font-display text-[11px] font-bold uppercase text-white [text-shadow:1px_1px_0_rgba(0,0,0,0.35)]"
      style={{ backgroundColor: info?.color ?? '#64748b' }}
    >
      {info?.label ?? capitalize(type)}
    </span>
  );
}
