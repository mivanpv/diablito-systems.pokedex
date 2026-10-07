import type { Pokemon } from '../types/pokeapi';
import { capitalize } from './format';

/**
 * Games (PokéAPI version groups) from newest to oldest, with Spanish names.
 * PokéAPI's numeric ids are not chronological (e.g. "blue-japan" is 29), so order lives here.
 * Spin-offs and Japan-only releases go last.
 */
const GAMES: [string, string][] = [
  ['mega-dimension', 'Leyendas Z-A: Megadimensión'],
  ['legends-za', 'Leyendas Pokémon: Z-A'],
  ['the-indigo-disk', 'Escarlata/Púrpura: El disco índigo'],
  ['the-teal-mask', 'Escarlata/Púrpura: La máscara turquesa'],
  ['scarlet-violet', 'Escarlata/Púrpura'],
  ['legends-arceus', 'Leyendas Pokémon: Arceus'],
  ['brilliant-diamond-shining-pearl', 'Diamante Brillante/Perla Reluciente'],
  ['the-crown-tundra', 'Espada/Escudo: Las nieves de la corona'],
  ['the-isle-of-armor', 'Espada/Escudo: La isla de la armadura'],
  ['sword-shield', 'Espada/Escudo'],
  ['lets-go-pikachu-lets-go-eevee', "Let's Go, Pikachu!/Eevee!"],
  ['ultra-sun-ultra-moon', 'Ultrasol/Ultraluna'],
  ['sun-moon', 'Sol/Luna'],
  ['omega-ruby-alpha-sapphire', 'Rubí Omega/Zafiro Alfa'],
  ['x-y', 'X/Y'],
  ['black-2-white-2', 'Negro 2/Blanco 2'],
  ['black-white', 'Negro/Blanco'],
  ['heartgold-soulsilver', 'Oro HeartGold/Plata SoulSilver'],
  ['platinum', 'Platino'],
  ['diamond-pearl', 'Diamante/Perla'],
  ['emerald', 'Esmeralda'],
  ['firered-leafgreen', 'Rojo Fuego/Verde Hoja'],
  ['ruby-sapphire', 'Rubí/Zafiro'],
  ['crystal', 'Cristal'],
  ['gold-silver', 'Oro/Plata'],
  ['yellow', 'Amarillo'],
  ['red-blue', 'Rojo/Azul'],
  ['champions', 'Pokémon Champions'],
  ['xd', 'Pokémon XD'],
  ['colosseum', 'Pokémon Colosseum'],
  ['blue-japan', 'Azul (Japón)'],
  ['red-green-japan', 'Rojo/Verde (Japón)'],
];

const GAME_ORDER = new Map(GAMES.map(([name], index) => [name, index]));
const GAME_LABELS = new Map(GAMES);

export function gameLabel(versionGroup: string): string {
  return GAME_LABELS.get(versionGroup) ?? capitalize(versionGroup);
}

const METHOD_ORDER = ['level-up', 'machine', 'egg', 'tutor'];
const METHOD_LABELS: Record<string, string> = {
  'level-up': 'Por nivel',
  machine: 'MT',
  egg: 'Huevo',
  tutor: 'Tutor',
  train: 'Entrenamiento',
  'form-change': 'Cambio de forma',
};

export function methodLabel(method: string): string {
  return METHOD_LABELS[method] ?? capitalize(method);
}

export interface LearnableMove {
  name: string;
  /** Level for "level-up" moves; 0 means it is learned when evolving. */
  level: number;
}

export interface MoveGroup {
  method: string;
  moves: LearnableMove[];
}

/** Games where the Pokémon has moves, newest first. */
export function gamesFor(pokemon: Pokemon): string[] {
  const names = new Set<string>();
  pokemon.moves.forEach((m) => m.version_group_details.forEach((d) => names.add(d.version_group.name)));
  const rank = (name: string) => GAME_ORDER.get(name) ?? GAMES.length;
  return Array.from(names).sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
}

/** Newest game where the Pokémon learns moves by level (falls back to the newest game at all). */
export function defaultGame(pokemon: Pokemon): string | null {
  const games = gamesFor(pokemon);
  const withLevelUp = games.find((game) =>
    pokemon.moves.some((m) =>
      m.version_group_details.some((d) => d.version_group.name === game && d.move_learn_method.name === 'level-up')
    )
  );
  return withLevelUp ?? games[0] ?? null;
}

/**
 * Moves learnable in `game`, grouped by learn method (Por nivel, MT, Huevo, Tutor, then others).
 * Level-up moves are sorted by level; the rest alphabetically.
 */
export function movesFor(pokemon: Pokemon, game: string): MoveGroup[] {
  const byMethod = new Map<string, Map<string, number>>();

  pokemon.moves.forEach(({ move, version_group_details }) => {
    version_group_details
      .filter((d) => d.version_group.name === game)
      .forEach((d) => {
        const method = d.move_learn_method.name;
        const moves = byMethod.get(method) ?? new Map<string, number>();
        const known = moves.get(move.name);
        // a move can appear twice (e.g. at evolution and at a level): keep the earliest
        moves.set(move.name, known === undefined ? d.level_learned_at : Math.min(known, d.level_learned_at));
        byMethod.set(method, moves);
      });
  });

  const rank = (method: string) => {
    const index = METHOD_ORDER.indexOf(method);
    return index === -1 ? METHOD_ORDER.length : index;
  };

  return Array.from(byMethod.keys())
    .sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))
    .map((method) => {
      const moves = Array.from(byMethod.get(method)!.entries()).map(([name, level]) => ({ name, level }));
      moves.sort((a, b) => (method === 'level-up' ? a.level - b.level : 0) || a.name.localeCompare(b.name));
      return { method, moves };
    });
}
