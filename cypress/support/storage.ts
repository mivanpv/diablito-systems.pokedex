// Saved state the app reads from localStorage on load, so a test can start from a given
// collection, portfolio or currency without clicking through the UI first.

export const COLLECTIONS_KEY = 'pokedex:collections';
export const PORTFOLIOS_KEY = 'pokedex:portfolios';
export const CURRENCY_KEY = 'pokedex:currency';
export const WELCOME_KEY = 'pokedex:welcome-dismissed';

/** Visits `path` with localStorage pre-filled. Strings are stored as-is; anything else as JSON. */
export function visitWithStorage(path: string, entries: Record<string, unknown>) {
  cy.visit(path, {
    onBeforeLoad(win) {
      Object.entries(entries).forEach(([key, value]) =>
        win.localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
      );
    },
  });
}

/** Reads a JSON value the app saved in localStorage. */
export function readStorage(key: string) {
  return cy.window().then((win) => JSON.parse(win.localStorage.getItem(key) ?? 'null'));
}

/** The Charmander card from the mocked TCGdex search (USD 1 / 2 / 5). */
export const charmanderCard = (quantity: number) => ({
  id: 'sv03.5-004',
  lang: 'es',
  name: 'Charmander',
  quantity,
  addedAt: 0,
});

/** The panel of a collection list or portfolio, found by its title. */
export const panel = (title: string) => cy.contains('h2', title).closest('section');

/**
 * Intl's es-MX format puts a non-breaking space after a currency code ("EUR 1.00"). Use this with
 * should('contain'), which compares raw text; cy.contains() already treats it as a normal space.
 */
export const money = (text: string) => text.replace(/([A-Z]{3}) (?=\d)/g, '$1\u00a0');
