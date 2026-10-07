import type { ChainLink, EvolutionDetail } from '../types/pokeapi';
import { buildStages, describeEvolution } from './evolution';

const detail = (overrides: Partial<EvolutionDetail>): EvolutionDetail => ({
  trigger: { name: 'level-up', url: '' },
  min_level: null,
  item: null,
  held_item: null,
  known_move: null,
  known_move_type: null,
  location: null,
  min_happiness: null,
  min_affection: null,
  min_beauty: null,
  time_of_day: '',
  ...overrides,
});

const link = (name: string, id: number, details: EvolutionDetail[], evolvesTo: ChainLink[] = []): ChainLink => ({
  species: { name, url: `https://pokeapi.co/api/v2/pokemon-species/${id}/` },
  is_baby: false,
  evolution_details: details,
  evolves_to: evolvesTo,
});

// bulbasaur -> ivysaur (Nv. 16) -> venusaur (Nv. 32)
const linear = link('bulbasaur', 1, [], [
  link('ivysaur', 2, [detail({ min_level: 16 })], [link('venusaur', 3, [detail({ min_level: 32 })])]),
]);

// eevee -> vaporeon (water stone) | espeon (friendship, day)
const branched = link('eevee', 133, [], [
  link('vaporeon', 134, [detail({ trigger: { name: 'use-item', url: '' }, item: { name: 'water-stone', url: '' } })]),
  link('espeon', 196, [detail({ min_happiness: 160, time_of_day: 'day' })]),
]);

describe('buildStages', () => {
  it('splits a linear chain into stages and tags previous/current/next', () => {
    const stages = buildStages(linear, 'ivysaur');
    expect(stages.map((s) => s.map((n) => `${n.name}:${n.relation}`))).toEqual([
      ['bulbasaur:anterior'],
      ['ivysaur:actual'],
      ['venusaur:proxima'],
    ]);
    expect(stages[1][0]).toMatchObject({ id: 2, condition: 'Nv. 16' });
    expect(stages[0][0].condition).toBeNull();
  });

  it('keeps branches in the same stage and marks sibling branches as "otra"', () => {
    const stages = buildStages(branched, 'vaporeon');
    expect(stages[1].map((n) => `${n.name}:${n.relation}`)).toEqual(['vaporeon:actual', 'espeon:otra']);
    expect(stages[0][0].relation).toBe('anterior');
  });

  it('marks every branch as next from the base species', () => {
    const stages = buildStages(branched, 'eevee');
    expect(stages[1].every((n) => n.relation === 'proxima')).toBe(true);
  });
});

describe('describeEvolution', () => {
  it('describes items, friendship and time of day in Spanish', () => {
    expect(describeEvolution(branched.evolves_to[0].evolution_details)).toBe('Usar Water Stone');
    expect(describeEvolution(branched.evolves_to[1].evolution_details)).toBe('Amistad alta · de día');
  });

  it('prefers the default entry and handles trades', () => {
    const details = [detail({ min_level: 99 }), detail({ is_default: true, trigger: { name: 'trade', url: '' } })];
    expect(describeEvolution(details)).toBe('Intercambio');
  });
});
