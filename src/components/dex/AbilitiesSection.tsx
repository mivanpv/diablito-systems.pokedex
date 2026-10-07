import { useAsync } from '../../hooks/useAsync';
import {
  abilityBattleEffect,
  abilityDescription,
  abilityName,
  getAbility,
} from '../../services/pokeapi';
import type { Pokemon } from '../../types/pokeapi';
import ErrorMessage from '../ErrorMessage';
import Loader from '../Loader';

function slotLabel(slot: number, isHidden: boolean): string {
  if (isHidden) return 'Oculta';
  return slot === 1 ? 'Principal' : 'Secundaria';
}

/** "Habilidades y efectos" block: loads every ability of the Pokémon in parallel. */
export default function AbilitiesSection({ pokemon }: { pokemon: Pokemon }) {
  const slots = pokemon.abilities
    .filter((a) => a.ability !== null)
    .sort((a, b) => a.slot - b.slot);

  const { data, error, loading } = useAsync(
    (signal) => Promise.all(slots.map((s) => getAbility(s.ability!.name, signal))),
    [pokemon.id]
  );

  if (slots.length === 0) return null;

  return (
    <div className="dex-tile flex flex-col gap-3">
      <span className="dex-label">Habilidades y efectos</span>

      {loading && <Loader label="Cargando habilidades" />}
      {error && <ErrorMessage>No se pudieron cargar las habilidades: {error.message}</ErrorMessage>}

      {data && (
        <ul className="flex flex-col gap-2">
          {slots.map((slot, index) => {
            const ability = data[index];
            const description = abilityDescription(ability);
            const battleEffect = abilityBattleEffect(ability);
            const hidden = slot.is_hidden;

            return (
              <li key={slot.slot} className="rounded-md border-2 border-dex-line bg-dex-surface p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-display text-sm font-bold">{abilityName(ability)}</span>
                  <span
                    className={`rounded border-2 px-1.5 py-0.5 font-display text-[10px] font-bold uppercase ${
                      hidden ? 'border-dex-accent text-dex-accent' : 'border-dex-ink'
                    }`}
                  >
                    {slotLabel(slot.slot, hidden)}
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-dex-muted">
                  {description ?? 'Sin descripción en español.'}
                </p>
                {battleEffect && (
                  <details className="mt-1.5 text-xs">
                    <summary className="cursor-pointer font-display font-bold text-dex-ink">Efecto en combate (inglés)</summary>
                    <p className="mt-1 leading-relaxed text-dex-muted" lang="en">
                      {battleEffect}
                    </p>
                  </details>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
