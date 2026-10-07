import {
  addToList,
  countSaved,
  createList,
  DEFAULT_LIST_ID,
  deleteList,
  initialCollections,
  isInList,
  parseCollections,
  removeFromList,
  toggleInList,
} from './collections';

const pikachu = { id: 25, name: 'pikachu' };
const charmander = { id: 4, name: 'charmander' };

describe('collections', () => {
  it('always starts with the default Favoritos list selected', () => {
    const state = initialCollections();
    expect(state.lists).toEqual([{ id: DEFAULT_LIST_ID, name: 'Favoritos', pokemon: [] }]);
    expect(state.lastListId).toBe(DEFAULT_LIST_ID);
  });

  it('adds a Pokémon once and remembers that list as the last one used', () => {
    let state = createList(initialCollections(), 'Equipo', 'equipo').state;
    state = addToList(state, DEFAULT_LIST_ID, pikachu, 1);
    expect(state.lastListId).toBe(DEFAULT_LIST_ID);
    state = addToList(state, 'equipo', pikachu, 2);
    state = addToList(state, 'equipo', pikachu, 3);
    expect(state.lastListId).toBe('equipo');
    expect(state.lists[1].pokemon).toEqual([{ id: 25, name: 'pikachu', addedAt: 2 }]);
  });

  it('removing does not change the last list used', () => {
    let state = createList(initialCollections(), 'Equipo', 'equipo').state;
    state = addToList(state, DEFAULT_LIST_ID, pikachu);
    state = addToList(state, 'equipo', pikachu);
    state = removeFromList(state, DEFAULT_LIST_ID, 25);
    expect(isInList(state, DEFAULT_LIST_ID, 25)).toBe(false);
    expect(state.lastListId).toBe('equipo');
  });

  it('toggles membership', () => {
    let state = toggleInList(initialCollections(), DEFAULT_LIST_ID, charmander);
    expect(isInList(state, DEFAULT_LIST_ID, 4)).toBe(true);
    state = toggleInList(state, DEFAULT_LIST_ID, charmander);
    expect(isInList(state, DEFAULT_LIST_ID, 4)).toBe(false);
  });

  it('creates lists, selects them, reuses an existing name and ignores blank names', () => {
    const created = createList(initialCollections(), '  Equipo   fuego ', 'fuego');
    expect(created.listId).toBe('fuego');
    expect(created.state.lists[1].name).toBe('Equipo fuego');
    expect(created.state.lastListId).toBe('fuego');

    const again = createList(created.state, 'equipo FUEGO', 'other');
    expect(again.listId).toBe('fuego');
    expect(again.state.lists).toHaveLength(2);

    expect(createList(created.state, '   ').listId).toBeNull();
  });

  it('never deletes Favoritos, and falls back to it when the last list is deleted', () => {
    const { state } = createList(initialCollections(), 'Equipo', 'equipo');
    expect(deleteList(state, DEFAULT_LIST_ID)).toBe(state);
    const after = deleteList(state, 'equipo');
    expect(after.lists.map((l) => l.id)).toEqual([DEFAULT_LIST_ID]);
    expect(after.lastListId).toBe(DEFAULT_LIST_ID);
  });

  it('counts distinct Pokémon across lists', () => {
    let state = createList(initialCollections(), 'Equipo', 'equipo').state;
    state = addToList(state, DEFAULT_LIST_ID, pikachu);
    state = addToList(state, 'equipo', pikachu);
    state = addToList(state, 'equipo', charmander);
    expect(countSaved(state)).toBe(2);
  });

  it('parses stored data defensively', () => {
    expect(parseCollections(null)).toEqual(initialCollections());
    const parsed = parseCollections({
      lists: [{ id: 'x', name: 'X', pokemon: [{ id: 1, name: 'bulbasaur', addedAt: 1 }, { bad: true }] }, 'junk'],
      lastListId: 'missing',
    });
    // Favoritos is restored first, invalid entries are dropped, unknown lastListId falls back
    expect(parsed.lists.map((l) => l.id)).toEqual([DEFAULT_LIST_ID, 'x']);
    expect(parsed.lists[1].pokemon).toHaveLength(1);
    expect(parsed.lastListId).toBe(DEFAULT_LIST_ID);
  });
});
