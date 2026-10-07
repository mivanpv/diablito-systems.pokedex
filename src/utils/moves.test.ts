import type { Pokemon } from '../types/pokeapi';
import { defaultGame, gameLabel, gamesFor, methodLabel, movesFor } from './moves';

const entry = (game: string, method: string, level = 0) => ({
  level_learned_at: level,
  move_learn_method: { name: method, url: '' },
  version_group: { name: game, url: '' },
});

const pokemon = {
  moves: [
    { move: { name: 'thunderbolt', url: '' }, version_group_details: [entry('scarlet-violet', 'machine'), entry('red-blue', 'machine')] },
    { move: { name: 'thunder-shock', url: '' }, version_group_details: [entry('scarlet-violet', 'level-up', 1), entry('red-blue', 'level-up', 1)] },
    // learned at evolution (0) and at level 12 in the same game: keep the earliest
    { move: { name: 'quick-attack', url: '' }, version_group_details: [entry('scarlet-violet', 'level-up', 12), entry('scarlet-violet', 'level-up', 0)] },
    { move: { name: 'agility', url: '' }, version_group_details: [entry('scarlet-violet', 'level-up', 24)] },
    { move: { name: 'charm', url: '' }, version_group_details: [entry('scarlet-violet', 'egg')] },
    // "champions" has a higher PokéAPI id but only "train" moves; it must not be the default
    { move: { name: 'protect', url: '' }, version_group_details: [entry('champions', 'train')] },
  ],
} as unknown as Pokemon;

describe('games', () => {
  it('orders games newest first, with spin-offs last', () => {
    expect(gamesFor(pokemon)).toEqual(['scarlet-violet', 'red-blue', 'champions']);
  });

  it('defaults to the newest game with level-up moves', () => {
    expect(defaultGame(pokemon)).toBe('scarlet-violet');
  });

  it('has Spanish labels with a readable fallback', () => {
    expect(gameLabel('scarlet-violet')).toBe('Escarlata/Púrpura');
    expect(gameLabel('some-new-game')).toBe('Some New Game');
    expect(methodLabel('machine')).toBe('MT');
  });
});

describe('movesFor', () => {
  it('groups by method in a fixed order and sorts level-up moves by level', () => {
    const groups = movesFor(pokemon, 'scarlet-violet');
    expect(groups.map((g) => g.method)).toEqual(['level-up', 'machine', 'egg']);
    expect(groups[0].moves).toEqual([
      { name: 'quick-attack', level: 0 },
      { name: 'thunder-shock', level: 1 },
      { name: 'agility', level: 24 },
    ]);
  });

  it('only includes moves of the selected game', () => {
    const groups = movesFor(pokemon, 'red-blue');
    expect(groups.flatMap((g) => g.moves.map((m) => m.name)).sort()).toEqual(['thunder-shock', 'thunderbolt']);
  });
});
