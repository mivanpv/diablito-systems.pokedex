import { ReactNode, useMemo, useState } from 'react';
import { useAsync } from '../../hooks/useAsync';
import { getMove, moveDescription, moveEffect, moveName } from '../../services/pokeapi';
import type { Pokemon } from '../../types/pokeapi';
import { capitalize } from '../../utils/format';
import { defaultGame, gameLabel, gamesFor, LearnableMove, methodLabel, movesFor } from '../../utils/moves';
import TypeBadge from '../TypeBadge';

const DAMAGE_CLASS: Record<string, string> = { physical: 'Físico', special: 'Especial', status: 'Estado' };

/** "Movimientos" tab: moves by game and learn method; each row loads its own details. */
export default function MovesSection({ pokemon }: { pokemon: Pokemon }) {
  const games = useMemo(() => gamesFor(pokemon), [pokemon]);
  const [game, setGame] = useState(() => defaultGame(pokemon));
  const groups = useMemo(() => (game ? movesFor(pokemon, game) : []), [pokemon, game]);
  const [method, setMethod] = useState<string | null>(null);

  // Keep the chosen method when switching games if it still exists there; otherwise the first one.
  const activeGroup = groups.find((g) => g.method === method) ?? groups[0];

  if (!game || groups.length === 0) {
    return (
      <div className="dex-tile">
        <p className="text-sm text-dex-muted">No hay movimientos registrados para este Pokémon.</p>
      </div>
    );
  }

  return (
    <div className="dex-tile flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="dex-label">Movimientos</span>
        <label className="flex items-center gap-2">
          <span className="dex-label">Juego</span>
          <select
            value={game}
            onChange={(event) => setGame(event.target.value)}
            className="max-w-[14rem] rounded-md border-2 border-dex-ink bg-dex-paper px-2 py-1 font-display text-xs font-bold"
          >
            {games.map((g) => (
              <option key={g} value={g}>
                {gameLabel(g)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Método de aprendizaje">
        {groups.map((g) => (
          <button
            key={g.method}
            className="dex-btn"
            aria-pressed={g.method === activeGroup.method}
            onClick={() => setMethod(g.method)}
          >
            {methodLabel(g.method)}
            <span className="opacity-60">{g.moves.length}</span>
          </button>
        ))}
      </div>

      <ul className="flex max-h-[28rem] flex-col gap-2 overflow-y-auto pr-1">
        {activeGroup.moves.map((m) => (
          <MoveRow key={`${activeGroup.method}-${m.name}`} learnable={m} showLevel={activeGroup.method === 'level-up'} />
        ))}
      </ul>
    </div>
  );
}

function MoveRow({ learnable, showLevel }: { learnable: LearnableMove; showLevel: boolean }) {
  const [open, setOpen] = useState(false);
  const { data: move, error } = useAsync((signal) => getMove(learnable.name, signal), [learnable.name]);

  const name = move ? moveName(move) : capitalize(learnable.name);
  const damageClass = move?.damage_class ? DAMAGE_CLASS[move.damage_class.name] ?? capitalize(move.damage_class.name) : null;
  const stats = move
    ? [damageClass, `Pot. ${move.power ?? '—'}`, `Prec. ${move.accuracy !== null ? `${move.accuracy}%` : '—'}`, `PP ${move.pp ?? '—'}`]
        .filter(Boolean)
        .join(' · ')
    : error
      ? 'No se pudieron cargar los detalles'
      : 'Cargando…';

  return (
    <li className={`rounded-md border-2 transition ${open ? 'border-dex-ink' : 'border-dex-line hover:border-dex-ink'} bg-dex-paper`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-2 text-left"
      >
        {showLevel ? (
          <span className="w-11 rounded bg-dex-surface py-1 text-center font-display text-[11px] font-bold">
            {learnable.level === 0 ? 'Evo.' : `Nv. ${learnable.level}`}
          </span>
        ) : (
          <span className="w-0" />
        )}
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold">{name}</span>
          <span className="block truncate font-display text-[11px] text-dex-muted">{stats}</span>
        </span>
        <span className="flex items-center gap-2">
          {move && <TypeBadge type={move.type.name} />}
          <span aria-hidden="true" className={`font-display text-xs transition-transform ${open ? 'rotate-180' : ''}`}>
            ▾
          </span>
        </span>
      </button>

      {open && move && (
        <div className="flex flex-col gap-3 border-t-2 border-dashed border-dex-line px-3 py-3">
          <p className="text-sm leading-relaxed">{moveDescription(move) ?? 'Sin descripción en español.'}</p>
          <dl className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            <Detail label="Clase">{damageClass ?? '—'}</Detail>
            <Detail label="Potencia">{move.power ?? '—'}</Detail>
            <Detail label="Precisión">{move.accuracy !== null ? `${move.accuracy}%` : '—'}</Detail>
            <Detail label="PP">{move.pp ?? '—'}</Detail>
            <Detail label="Prioridad">{move.priority > 0 ? `+${move.priority}` : move.priority}</Detail>
            <Detail label="Prob. efecto">{move.effect_chance !== null ? `${move.effect_chance}%` : '—'}</Detail>
          </dl>
          {moveEffect(move) && (
            <p className="text-xs leading-relaxed text-dex-muted">
              <span className="font-display font-bold text-dex-ink">Efecto (inglés): </span>
              <span lang="en">{moveEffect(move)}</span>
            </p>
          )}
        </div>
      )}
    </li>
  );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded bg-dex-surface px-2 py-1.5">
      <dt className="dex-label text-[10px]">{label}</dt>
      <dd className="font-display text-sm font-bold">{children}</dd>
    </div>
  );
}
