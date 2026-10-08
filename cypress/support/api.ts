// Canned responses for the three public APIs, keyed by the exact URL the app requests.
// Anything not listed here answers 404, so the tests never depend on the real services.

const POKEMON_URL = (id: number) => `https://pokeapi.co/api/v2/pokemon/${id}/`;
const SPRITE = (path: string) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${path}`;
const es = { name: 'es', url: '' };
const en = { name: 'en', url: '' };

const charmander = {
  id: 4,
  name: 'charmander',
  height: 6,
  weight: 85,
  types: [{ slot: 1, type: { name: 'fire', url: '' } }],
  stats: [
    { base_stat: 39, effort: 0, stat: { name: 'hp', url: '' } },
    { base_stat: 52, effort: 0, stat: { name: 'attack', url: '' } },
  ],
  abilities: [{ ability: { name: 'blaze', url: '' }, is_hidden: false, slot: 1 }],
  moves: [
    {
      move: { name: 'ember', url: '' },
      version_group_details: [
        { level_learned_at: 4, move_learn_method: { name: 'level-up', url: '' }, version_group: { name: 'scarlet-violet', url: '' } },
      ],
    },
  ],
  species: { name: 'charmander', url: '' },
  sprites: { front_default: SPRITE('4.png'), front_shiny: SPRITE('shiny/4.png') },
  cries: { latest: null, legacy: null },
};

const charmeleon = {
  id: 5,
  name: 'charmeleon',
  height: 11,
  weight: 190,
  types: [{ slot: 1, type: { name: 'fire', url: '' } }],
  stats: [],
  abilities: [],
  moves: [],
  species: { name: 'charmeleon', url: '' },
  sprites: { front_default: SPRITE('5.png'), front_shiny: SPRITE('shiny/5.png') },
  cries: { latest: null, legacy: null },
};

const ditto = {
  id: 132,
  name: 'ditto',
  height: 3,
  weight: 40,
  types: [{ slot: 1, type: { name: 'normal', url: '' } }],
  stats: [],
  abilities: [],
  moves: [],
  species: { name: 'ditto', url: '' },
  // no shiny sprite: the viewer hides the shiny toggle
  sprites: { front_default: SPRITE('132.png'), front_shiny: null },
  cries: { latest: null, legacy: null },
};

// TCGdex has no Spanish cards for it: the Cartas TCG tab falls back to English
const mew = {
  id: 151,
  name: 'mew',
  height: 4,
  weight: 40,
  types: [{ slot: 1, type: { name: 'psychic', url: '' } }],
  stats: [],
  abilities: [],
  moves: [],
  species: { name: 'mew', url: '' },
  sprites: { front_default: SPRITE('151.png'), front_shiny: SPRITE('shiny/151.png') },
  cries: { latest: null, legacy: null },
};

export const responses: Record<string, unknown> = {
  'https://pokeapi.co/api/v2/pokemon?limit=2000': {
    count: 4,
    next: null,
    previous: null,
    results: [
      { name: 'bulbasaur', url: POKEMON_URL(1) },
      { name: 'charmander', url: POKEMON_URL(4) },
      { name: 'charmeleon', url: POKEMON_URL(5) },
      // alternate form: must never be listed
      { name: 'charizard-mega-x', url: POKEMON_URL(10034) },
    ],
  },
  'https://pokeapi.co/api/v2/type/fire': {
    id: 10,
    name: 'fire',
    pokemon: [
      { slot: 1, pokemon: { name: 'charmander', url: POKEMON_URL(4) } },
      { slot: 1, pokemon: { name: 'charmeleon', url: POKEMON_URL(5) } },
    ],
  },
  'https://pokeapi.co/api/v2/pokemon/charmander': charmander,
  'https://pokeapi.co/api/v2/pokemon/4': charmander,
  'https://pokeapi.co/api/v2/pokemon/5': charmeleon,
  'https://pokeapi.co/api/v2/pokemon/charmeleon': charmeleon,
  'https://pokeapi.co/api/v2/pokemon-species/charmander': {
    id: 4,
    name: 'charmander',
    names: [{ name: 'Charmander', language: es }],
    genera: [{ genus: 'Pokémon Lagartija', language: es }],
    flavor_text_entries: [{ flavor_text: 'Prefiere\nlas cosas calientes.', language: es, version: { name: 'x', url: '' } }],
    evolution_chain: { url: 'https://pokeapi.co/api/v2/evolution-chain/2/' },
  },
  'https://pokeapi.co/api/v2/pokemon-species/charmeleon': {
    id: 5,
    name: 'charmeleon',
    names: [{ name: 'Charmeleon', language: es }],
    genera: [{ genus: 'Pokémon Llama', language: es }],
    flavor_text_entries: [],
    evolution_chain: { url: 'https://pokeapi.co/api/v2/evolution-chain/2/' },
  },
  'https://pokeapi.co/api/v2/evolution-chain/2/': {
    id: 2,
    chain: {
      species: { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon-species/4/' },
      is_baby: false,
      evolution_details: [],
      evolves_to: [
        {
          species: { name: 'charmeleon', url: 'https://pokeapi.co/api/v2/pokemon-species/5/' },
          is_baby: false,
          // PokéAPI sends every condition, null when unused; the app compares with !== null
          evolution_details: [
            { trigger: { name: 'level-up', url: '' }, min_level: 16, min_happiness: null, min_affection: null, min_beauty: null, time_of_day: '' },
          ],
          evolves_to: [],
        },
      ],
    },
  },
  // no evolutions
  'https://pokeapi.co/api/v2/pokemon/ditto': ditto,
  'https://pokeapi.co/api/v2/pokemon-species/ditto': {
    id: 132,
    name: 'ditto',
    names: [{ name: 'Ditto', language: es }],
    genera: [{ genus: 'Pokémon Transform.', language: es }],
    flavor_text_entries: [],
    evolution_chain: { url: 'https://pokeapi.co/api/v2/evolution-chain/66/' },
  },
  'https://pokeapi.co/api/v2/evolution-chain/66/': {
    id: 66,
    chain: {
      species: { name: 'ditto', url: 'https://pokeapi.co/api/v2/pokemon-species/132/' },
      is_baby: false,
      evolution_details: [],
      evolves_to: [],
    },
  },
  'https://pokeapi.co/api/v2/pokemon/mew': mew,
  'https://pokeapi.co/api/v2/pokemon-species/mew': {
    id: 151,
    name: 'mew',
    names: [{ name: 'Mew', language: es }],
    genera: [{ genus: 'Pokémon Nueva Especie', language: es }],
    flavor_text_entries: [],
    evolution_chain: { url: 'https://pokeapi.co/api/v2/evolution-chain/77/' },
  },
  'https://pokeapi.co/api/v2/ability/blaze': {
    id: 66,
    name: 'blaze',
    names: [{ name: 'Mar Llamas', language: es }],
    flavor_text_entries: [{ flavor_text: 'Potencia los ataques\nde tipo Fuego.', language: es, version_group: { name: 'x', url: '' } }],
    effect_entries: [{ effect: '', short_effect: 'Strengthens fire moves.', language: en }],
  },
  'https://pokeapi.co/api/v2/move/ember': {
    id: 52,
    name: 'ember',
    names: [{ name: 'Ascuas', language: es }],
    type: { name: 'fire', url: '' },
    damage_class: { name: 'special', url: '' },
    power: 40,
    accuracy: 100,
    pp: 25,
    priority: 0,
    effect_chance: 10,
    flavor_text_entries: [{ flavor_text: 'Ataca con llamas\npequeñas.', language: es, version_group: { name: 'x', url: '' } }],
    effect_entries: [{ effect: '', short_effect: 'Has a $effect_chance% chance to burn the target.', language: en }],
  },
  'https://api.tcgdex.net/v2/es/cards?name=charmander': [{ id: 'sv03.5-004', localId: '004', name: 'Charmander' }],
  'https://api.tcgdex.net/v2/es/cards/sv03.5-004': {
    id: 'sv03.5-004',
    localId: '004',
    name: 'Charmander',
    category: 'Pokémon',
    set: { id: 'sv03.5', name: '151', cardCount: { official: 165, total: 207 } },
    pricing: {
      tcgplayer: { updated: '2026-10-06T00:00:00Z', unit: 'USD', normal: { lowPrice: 1, marketPrice: 2, highPrice: 5 } },
    },
  },
  'https://api.tcgdex.net/v2/es/cards?name=mew': [],
  // TCGdex matches names by "contains": the app must keep Mew cards and drop Mewtwo
  'https://api.tcgdex.net/v2/en/cards?name=mew': [
    { id: 'sv03.5-151', localId: '151', name: 'Mew ex' },
    { id: 'sv03.5-150', localId: '150', name: 'Mewtwo' },
    { id: 'swsh8-113', localId: '113', name: 'Mew V' },
    { id: 'sm11-71', localId: '71', name: 'Mewtwo & Mew-GX' },
  ],
  'https://api.tcgdex.net/v2/en/cards/sv03.5-151': {
    id: 'sv03.5-151',
    localId: '151',
    name: 'Mew ex',
    category: 'Pokémon',
    set: { id: 'sv03.5', name: '151', cardCount: { official: 165, total: 207 } },
    pricing: {
      tcgplayer: { updated: '2026-10-06T00:00:00Z', unit: 'USD', holofoil: { lowPrice: 3, marketPrice: 4, highPrice: 9 } },
    },
  },
  'https://api.tcgdex.net/v2/en/cards/swsh8-113': {
    id: 'swsh8-113',
    localId: '113',
    name: 'Mew V',
    category: 'Pokémon',
    set: { id: 'swsh8', name: 'Fusion Strike', cardCount: { official: 264, total: 284 } },
  },
  'https://api.tcgdex.net/v2/en/cards/sm11-71': {
    id: 'sm11-71',
    localId: '71',
    name: 'Mewtwo & Mew-GX',
    category: 'Pokémon',
    set: { id: 'sm11', name: 'Unified Minds', cardCount: { official: 236, total: 258 } },
  },
  'https://open.er-api.com/v6/latest/USD': {
    result: 'success',
    base_code: 'USD',
    time_last_update_utc: '',
    rates: { USD: 1, MXN: 20, EUR: 0.5 },
  },
};

export interface MockResponse {
  statusCode: number;
  body?: unknown;
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Makes one URL answer differently in the current test, e.g. `overrideApi(url, { statusCode: 500 })`.
 * Call it before cy.visit(). The newest intercept wins, so it takes precedence over mockApis().
 */
export function overrideApi(url: string, { statusCode, body = { error: 'Mocked error' } }: MockResponse) {
  // a RegExp, because a string URL is a glob and "?" in a query string would match any character
  cy.intercept(new RegExp(`^${escapeRegExp(url)}$`), { statusCode, body });
}

/** Routes every API call to `responses` and every sprite or cry to a local file. */
export function mockApis() {
  for (const host of ['https://pokeapi.co/**', 'https://api.tcgdex.net/**', 'https://open.er-api.com/**']) {
    cy.intercept(host, (req) => {
      const body = responses[req.url];
      if (body === undefined) {
        // eslint-disable-next-line no-console
        console.warn(`[e2e] unmocked request: ${req.url}`);
        req.reply({ statusCode: 404, body: { error: 'Not found' } });
      } else {
        req.reply({ statusCode: 200, body });
      }
    });
  }
  cy.intercept('https://raw.githubusercontent.com/**', { fixture: 'pixel.png' });
}
