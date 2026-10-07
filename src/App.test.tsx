import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import App from './App';

// Smoke test: mounts the whole app with the three APIs mocked.

// Tells React this environment drives updates through act().
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const POKEMON_URL = (id: number) => `https://pokeapi.co/api/v2/pokemon/${id}/`;

const responses: Record<string, unknown> = {
  'https://pokeapi.co/api/v2/pokemon?limit=2000': {
    count: 3,
    next: null,
    previous: null,
    results: [
      { name: 'bulbasaur', url: POKEMON_URL(1) },
      { name: 'charmander', url: POKEMON_URL(4) },
      { name: 'charizard-mega-x', url: POKEMON_URL(10034) },
    ],
  },
  'https://pokeapi.co/api/v2/type/fire': {
    id: 10,
    name: 'fire',
    pokemon: [{ slot: 1, pokemon: { name: 'charmander', url: POKEMON_URL(4) } }],
  },
  'https://pokeapi.co/api/v2/pokemon/charmander': {
    id: 4,
    name: 'charmander',
    height: 6,
    weight: 85,
    types: [{ slot: 1, type: { name: 'fire', url: '' } }],
    stats: [{ base_stat: 39, effort: 0, stat: { name: 'hp', url: '' } }],
    abilities: [
      { ability: { name: 'blaze', url: '' }, is_hidden: false, slot: 1 },
      { ability: { name: 'solar-power', url: '' }, is_hidden: true, slot: 3 },
    ],
    moves: [
      {
        move: { name: 'ember', url: '' },
        version_group_details: [
          { level_learned_at: 4, move_learn_method: { name: 'level-up', url: '' }, version_group: { name: 'scarlet-violet', url: '' } },
        ],
      },
      {
        move: { name: 'flamethrower', url: '' },
        version_group_details: [
          { level_learned_at: 0, move_learn_method: { name: 'machine', url: '' }, version_group: { name: 'scarlet-violet', url: '' } },
        ],
      },
    ],
    species: { name: 'charmander', url: '' },
    sprites: { front_default: null },
  },
  'https://pokeapi.co/api/v2/move/ember': {
    id: 52,
    name: 'ember',
    names: [{ name: 'Ascuas', language: { name: 'es', url: '' } }],
    type: { name: 'fire', url: '' },
    damage_class: { name: 'special', url: '' },
    power: 40,
    accuracy: 100,
    pp: 25,
    priority: 0,
    effect_chance: 10,
    flavor_text_entries: [
      { flavor_text: 'Ataca con llamas\npequeñas.', language: { name: 'es', url: '' }, version_group: { name: 'x', url: '' } },
    ],
    effect_entries: [{ effect: '', short_effect: 'Has a $effect_chance% chance to burn the target.', language: { name: 'en', url: '' } }],
  },
  'https://pokeapi.co/api/v2/ability/blaze': {
    id: 66,
    name: 'blaze',
    names: [{ name: 'Mar Llamas', language: { name: 'es', url: '' } }],
    flavor_text_entries: [
      { flavor_text: 'Potencia los ataques\nde tipo Fuego.', language: { name: 'es', url: '' }, version_group: { name: 'x', url: '' } },
    ],
    effect_entries: [{ effect: '', short_effect: 'Strengthens fire moves.', language: { name: 'en', url: '' } }],
  },
  'https://pokeapi.co/api/v2/ability/solar-power': {
    id: 94,
    name: 'solar-power',
    names: [],
    flavor_text_entries: [],
    effect_entries: [],
  },
  'https://pokeapi.co/api/v2/pokemon-species/charmander': {
    id: 4,
    name: 'charmander',
    names: [{ name: 'Charmander', language: { name: 'es', url: '' } }],
    genera: [{ genus: 'Pokémon Lagartija', language: { name: 'es', url: '' } }],
    flavor_text_entries: [{ flavor_text: 'Prefiere\nlas cosas calientes.', language: { name: 'es', url: '' }, version: { name: 'x', url: '' } }],
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
          evolution_details: [{ trigger: { name: 'level-up', url: '' }, min_level: 16, time_of_day: '' }],
          evolves_to: [],
        },
      ],
    },
  },
  // evolutions navigate by id
  'https://pokeapi.co/api/v2/pokemon/5': {
    id: 5,
    name: 'charmeleon',
    height: 11,
    weight: 190,
    types: [{ slot: 1, type: { name: 'fire', url: '' } }],
    stats: [],
    abilities: [],
    species: { name: 'charmeleon', url: '' },
    sprites: { front_default: null },
  },
  'https://pokeapi.co/api/v2/pokemon-species/charmeleon': {
    id: 5,
    name: 'charmeleon',
    names: [{ name: 'Charmeleon', language: { name: 'es', url: '' } }],
    genera: [{ genus: 'Pokémon Llama', language: { name: 'es', url: '' } }],
    flavor_text_entries: [],
    evolution_chain: { url: 'https://pokeapi.co/api/v2/evolution-chain/2/' },
  },
  // 102 psychic species with malamar at position 73, as in the real API
  'https://pokeapi.co/api/v2/type/psychic': {
    id: 14,
    name: 'psychic',
    pokemon: Array.from({ length: 102 }, (_, i) => ({
      slot: 1,
      pokemon: i === 72 ? { name: 'malamar', url: POKEMON_URL(687) } : { name: `psy-${i}`, url: POKEMON_URL(i + 1) },
    })),
  },
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
  'https://api.tcgdex.net/v2/es/cards?name=charmander': [{ id: 'sv03.5-004', localId: '004', name: 'Charmander' }],
  'https://api.tcgdex.net/v2/en/cards?name=charmander': [],
  'https://open.er-api.com/v6/latest/USD': {
    result: 'success',
    base_code: 'USD',
    time_last_update_utc: '',
    rates: { USD: 1, MXN: 20 },
  },
};

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  global.fetch = jest.fn(async (url: RequestInfo | URL) => {
    const body = responses[String(url)];
    return { ok: body !== undefined, status: body === undefined ? 404 : 200, json: async () => body } as Response;
  });
  container = document.createElement('div');
  document.body.appendChild(container);
  // collections and the selected currency persist in localStorage; start every test clean
  localStorage.clear();
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

/** Lets the mocked requests resolve and React re-render. */
async function flush() {
  for (let i = 0; i < 5; i++) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }
}

async function renderAt(hash: string) {
  window.location.hash = hash;
  await act(async () => {
    root = createRoot(container);
    root.render(<App />);
  });
  await flush();
}

async function click(element: Element | null | undefined) {
  if (!element) throw new Error('element to click not found');
  await act(async () => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));
  });
  await flush();
}

/** Types into a React-controlled input (the native setter makes React see the change). */
async function type(input: Element | null, value: string) {
  if (!(input instanceof HTMLInputElement)) throw new Error('input not found');
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

const buttonWithText = (text: string) =>
  Array.from(container.querySelectorAll('button')).find((b) => b.textContent?.includes(text));

it('saves to Favoritos, creates a new list that becomes the default, and persists the collection', async () => {
  await renderAt('#/pokemon/charmander');
  const badge = () => container.querySelector('a[href="#/colecciones"]')?.getAttribute('aria-label');
  expect(badge()).toBe('Mi colección: 0 Pokémon guardados');

  // one click saves into the default list
  await click(buttonWithText('Agregar a Favoritos'));
  expect(buttonWithText('En Favoritos')?.getAttribute('aria-pressed')).toBe('true');
  expect(badge()).toBe('Mi colección: 1 Pokémon guardados');

  // the menu creates a list, saves the Pokémon there and selects it for next time
  await click(container.querySelector('button[aria-label="Elegir lista o crear una nueva"]'));
  await type(container.querySelector('input[aria-label="Nombre de la nueva lista"]'), 'Equipo fuego');
  await click(buttonWithText('+ Crear'));
  expect(buttonWithText('En Equipo fuego')).toBeDefined();

  const stored = JSON.parse(localStorage.getItem('pokedex:collections') ?? '{}');
  expect(stored.lists.map((l: { name: string }) => l.name)).toEqual(['Favoritos', 'Equipo fuego']);
  expect(stored.lists[1].pokemon).toEqual([expect.objectContaining({ id: 4, name: 'charmander' })]);
  expect(stored.lastListId).toBe(stored.lists[1].id);

  // after a "reload", the collections page shows both lists, with the new one as the current list
  act(() => root.unmount());
  await renderAt('#/colecciones');
  const text = container.textContent ?? '';
  expect(text).toContain('1 Pokémon guardados · 2 listas');
  expect(text).toContain('Equipo fuego');
  expect(container.querySelectorAll('a[href="#/pokemon/charmander"]')).toHaveLength(2);
  expect(text).toContain('Actual');
  // Favoritos can't be deleted; only the custom list offers it
  expect(Array.from(container.querySelectorAll('button')).filter((b) => b.textContent === 'Eliminar lista')).toHaveLength(1);
});

it('adds a TCG card to the portfolio and values it by market price × quantity', async () => {
  await renderAt('#/pokemon/charmander?pestana=cartas');
  const badge = () => container.querySelector('a[href="#/portafolios"]')?.getAttribute('aria-label');
  expect(badge()).toBe('Mis portafolios: 0 cartas');

  await click(buttonWithText('Agregar a Mi portafolio'));
  expect(buttonWithText('En Mi portafolio')?.getAttribute('aria-pressed')).toBe('true');
  expect(badge()).toBe('Mis portafolios: 1 cartas');

  act(() => root.unmount());
  await renderAt('#/portafolios');
  const row = () => container.querySelector('li.dex-tile')?.textContent ?? '';
  // market USD 2 × 20 MXN = $40.00 per card; quantity 1
  expect(row()).toContain('Charmander');
  expect(row()).toContain('$40.00');
  expect(container.textContent).toContain('Total del portafolio$40.00');

  await click(container.querySelector('button[aria-label="Agregar una copia de Charmander"]'));
  expect(container.querySelector('[aria-label="Cantidad de Charmander"]')?.textContent).toBe('2');
  expect(row()).toContain('$80.00');
  expect(container.textContent).toContain('Total del portafolio$80.00');
  // range uses min USD 1 and max USD 5 per copy
  expect(container.textContent).toContain('Rango mín – máx: $40.00 – $200.00');
  // grand total across portfolios
  expect(container.textContent).toContain('Valor total de mercado$80.00');
  expect(badge()).toBe('Mis portafolios: 2 cartas');
});

it('shows the three sections and an empty viewer on the home route', async () => {
  await renderAt('#/');
  const text = container.textContent ?? '';
  expect(text).toContain('Búsqueda directa');
  expect(text).toContain('Índice por tipo y letra');
  expect(text).toContain('Pokémon seleccionado');
  expect(text).toContain('Selecciona un Pokémon');
  // a letter is always active: "A" has no Pokémon here, so it falls back to the first available ("B");
  // alternate forms (id > 10000, charizard-mega-x) are excluded
  expect(text).toContain('1 Pokémon encontrados');
  expect(container.querySelector('button[aria-pressed="true"].dex-chip-accent')?.textContent).toBe('B');
  const listed = Array.from(container.querySelectorAll('a[href^="#/pokemon/"]')).map((a) => a.textContent);
  expect(listed).toHaveLength(1);
  expect(listed[0]).toContain('Bulbasaur');
});

it('applies the type filter from the URL and shows the selected Pokémon', async () => {
  await renderAt('#/pokemon/charmander?tipo=fire');
  const text = container.textContent ?? '';
  expect(text).toContain('1 Pokémon encontrados');
  expect(text).toContain('Pokémon Lagartija');
  expect(text).toContain('Prefiere las cosas calientes.');
  // abilities: Spanish name + description, hidden badge, and English-name fallback
  expect(text).toContain('Habilidades y efectos');
  expect(text).toContain('Mar Llamas');
  expect(text).toContain('Potencia los ataques de tipo Fuego.');
  expect(text).toContain('Oculta');
  expect(text).toContain('Solar Power');
  expect(container.querySelector('[aria-current="page"]')?.textContent).toContain('Charmander');
});

it('finds dual-type Pokémon by type + letter (Malamar in Psíquico + M)', async () => {
  await renderAt('#/?tipo=psychic&letra=M');
  expect(container.textContent).toContain('1 Pokémon encontrados');
  expect(container.textContent).toContain('Malamar');
});

it('renders every match for the type + letter, not just the first screenful', async () => {
  await renderAt('#/?tipo=psychic&letra=P');
  expect(container.textContent).toContain('101 Pokémon encontrados');
  expect(container.querySelectorAll('a[href^="#/pokemon/"]').length).toBe(101);
});

it('shows the evolution chain and selects an evolution when clicked', async () => {
  await renderAt('#/pokemon/charmander');
  const evolutionTab = Array.from(container.querySelectorAll('[role="tab"]')).find((t) =>
    t.textContent?.includes('Evolución')
  );
  await click(evolutionTab);

  let text = container.textContent ?? '';
  expect(text).toContain('Cadena evolutiva');
  expect(text).toContain('Actual');
  expect(text).toContain('Próxima');
  expect(text).toContain('Nv. 16');

  await click(container.querySelector('a[title="Ver Charmeleon"]'));

  // the open tab travels in the URL with the selection
  expect(window.location.hash).toBe('#/pokemon/5?pestana=evolucion');
  text = container.textContent ?? '';
  expect(container.querySelector('h3')?.textContent).toBe('Charmeleon');
  // the Evolución tab stays open, now with Charmander as the previous stage
  expect(text).toContain('Anterior');
  expect(container.querySelector('a[title="Ver Charmander"]')).not.toBeNull();
});

it('lists moves by learn method and expands a move to show its details', async () => {
  await renderAt('#/pokemon/charmander');
  await click(Array.from(container.querySelectorAll('[role="tab"]')).find((t) => t.textContent?.includes('Movimientos')));

  let text = container.textContent ?? '';
  expect(text).toContain('Escarlata/Púrpura');
  expect(text).toContain('Por nivel');
  expect(text).toContain('Nv. 4');
  expect(text).toContain('Ascuas');
  expect(text).toContain('Especial · Pot. 40 · Prec. 100% · PP 25');

  const row = Array.from(container.querySelectorAll('button[aria-expanded]')).find((b) => b.textContent?.includes('Ascuas'));
  await click(row);
  text = container.textContent ?? '';
  expect(text).toContain('Ataca con llamas pequeñas.');
  expect(text).toContain('Has a 10% chance to burn the target.');

  // the MT group holds the other move; its details failed to load (no mock), the row says so
  await click(Array.from(container.querySelectorAll('button[aria-pressed]')).find((b) => b.textContent?.startsWith('MT')));
  expect(container.textContent).toContain('Flamethrower');
  expect(container.textContent).toContain('No se pudieron cargar los detalles');
});

it('shows the market price and min–max range on each TCG card tile, in the selected currency', async () => {
  await renderAt('#/pokemon/charmander');
  await click(Array.from(container.querySelectorAll('[role="tab"]')).find((t) => t.textContent?.includes('Cartas TCG')));

  const tile = container.querySelector('a[href="#/carta/es/sv03.5-004"]');
  // USD 1 / 2 / 5 at the mocked rate of 20 MXN
  expect(tile?.textContent).toContain('Mercado$40.00');
  expect(tile?.textContent).toContain('$20.00 – $100.00');
});

it('returns to the Cartas TCG tab after visiting a card and pressing Volver', async () => {
  const scrollTo = jest.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
  try {
    await renderAt('#/pokemon/charmander');
    const selectedTab = () => container.querySelector('[role="tab"][aria-selected="true"]')?.textContent;
    await click(Array.from(container.querySelectorAll('[role="tab"]')).find((t) => t.textContent?.includes('Cartas TCG')));
    expect(selectedTab()).toContain('Cartas TCG');
    expect(window.location.hash).toBe('#/pokemon/charmander?pestana=cartas');

    await click(container.querySelector('a[href="#/carta/es/sv03.5-004"]'));
    expect(window.location.hash).toBe('#/carta/es/sv03.5-004');

    await click(Array.from(container.querySelectorAll('button')).find((b) => b.textContent?.includes('Volver')));
    expect(window.location.hash).toBe('#/pokemon/charmander?pestana=cartas');
    expect(selectedTab()).toContain('Cartas TCG');
  } finally {
    scrollTo.mockRestore();
  }
});

it('opens a TCG card page and converts its prices (scrollTo returning a Promise must not break it)', async () => {
  // Recent Chrome returns a Promise from scrollTo(); an effect that returned it crashed on unmount.
  const scrollTo = jest.spyOn(window, 'scrollTo').mockImplementation((() => Promise.resolve()) as unknown as typeof window.scrollTo);
  try {
    await renderAt('#/carta/es/sv03.5-004');
    const text = container.textContent ?? '';
    expect(text).toContain('Charmander');
    expect(text).toContain('151 · 004/165');
    // USD 2 -> MXN 40 at the mocked rate of 20
    expect(text).toContain('$40.00');
    expect(scrollTo).toHaveBeenCalled();
  } finally {
    // unmount here (runs the effect cleanups) while scrollTo still returns a Promise
    act(() => root.unmount());
    root = createRoot(document.createElement('div'));
    scrollTo.mockRestore();
  }
});

it('opens evolution bubbles when the sprite is clicked and navigates from a bubble', async () => {
  await renderAt('#/pokemon/charmander');
  expect(container.querySelector('a[aria-label^="Ir a"]')).toBeNull();

  await click(container.querySelector('button[aria-label="Ver evoluciones de Charmander"]'));
  const bubble = container.querySelector('a[aria-label="Ir a Charmeleon (próxima evolución)"]');
  expect(bubble).not.toBeNull();

  await click(bubble);
  expect(window.location.hash).toBe('#/pokemon/5');
  expect(container.querySelector('h3')?.textContent).toBe('Charmeleon');
  // bubbles close after navigating; reopening shows Charmander as the previous stage
  expect(container.querySelector('a[aria-label^="Ir a"]')).toBeNull();
  await click(container.querySelector('button[aria-label="Ver evoluciones de Charmeleon"]'));
  expect(container.querySelector('a[aria-label="Ir a Charmander (evolución anterior)"]')).not.toBeNull();
});
