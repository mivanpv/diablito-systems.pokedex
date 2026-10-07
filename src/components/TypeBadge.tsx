import { capitalize } from '../utils/format';
import { TYPE_INFO } from '../utils/i18n';

export default function TypeBadge({ type }: { type: string }) {
  const info = TYPE_INFO[type];

  return (
    <span
      className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white"
      style={{ backgroundColor: info?.color ?? '#64748b' }}
    >
      {info?.label ?? capitalize(type)}
    </span>
  );
}
