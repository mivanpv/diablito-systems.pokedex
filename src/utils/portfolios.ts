/**
 * TCG card portfolios ("portafolios"), stored in the browser. Same rules as Pokémon
 * collections (a default that can't be deleted, the last one used is pre-selected),
 * plus a quantity per card so the portfolio can be valued like an investment.
 */
import type { PriceSummary } from './pricing';

export const DEFAULT_PORTFOLIO_ID = 'principal';
const DEFAULT_PORTFOLIO_NAME = 'Mi portafolio';

export interface PortfolioCard {
  /** TCGdex card id (same across languages, e.g. "swsh3-136"). */
  id: string;
  /** Language used to open the card page. */
  lang: string;
  name: string;
  image?: string;
  quantity: number;
  addedAt: number;
}

export interface Portfolio {
  id: string;
  name: string;
  cards: PortfolioCard[];
}

export interface PortfoliosState {
  /** The default portfolio is always first and can't be deleted. */
  portfolios: Portfolio[];
  /** Last portfolio the user saved into; pre-selected for the next save. */
  lastPortfolioId: string;
}

export type CardRef = Pick<PortfolioCard, 'id' | 'lang' | 'name' | 'image'>;

export function initialPortfolios(): PortfoliosState {
  return {
    portfolios: [{ id: DEFAULT_PORTFOLIO_ID, name: DEFAULT_PORTFOLIO_NAME, cards: [] }],
    lastPortfolioId: DEFAULT_PORTFOLIO_ID,
  };
}

/** Validates data read from storage; anything malformed is dropped instead of crashing the app. */
export function parsePortfolios(raw: unknown): PortfoliosState {
  const state = initialPortfolios();
  if (!raw || typeof raw !== 'object') return state;
  const { portfolios, lastPortfolioId } = raw as Partial<PortfoliosState>;

  if (Array.isArray(portfolios)) {
    const valid = portfolios
      .filter((p): p is Portfolio => !!p && typeof p.id === 'string' && typeof p.name === 'string' && Array.isArray(p.cards))
      .map((p) => ({
        id: p.id,
        name: p.name,
        cards: p.cards
          .filter((c) => !!c && typeof c.id === 'string' && typeof c.name === 'string')
          .map((c) => ({
            ...c,
            lang: typeof c.lang === 'string' ? c.lang : 'es',
            quantity: Number.isInteger(c.quantity) && c.quantity > 0 ? c.quantity : 1,
          })),
      }));
    const stored = valid.find((p) => p.id === DEFAULT_PORTFOLIO_ID);
    state.portfolios = [stored ?? state.portfolios[0], ...valid.filter((p) => p.id !== DEFAULT_PORTFOLIO_ID)];
  }

  if (typeof lastPortfolioId === 'string' && state.portfolios.some((p) => p.id === lastPortfolioId)) {
    state.lastPortfolioId = lastPortfolioId;
  }
  return state;
}

function updatePortfolio(state: PortfoliosState, portfolioId: string, update: (p: Portfolio) => Portfolio): PortfoliosState {
  return { ...state, portfolios: state.portfolios.map((p) => (p.id === portfolioId ? update(p) : p)) };
}

export function isInPortfolio(state: PortfoliosState, portfolioId: string, cardId: string): boolean {
  return !!state.portfolios.find((p) => p.id === portfolioId)?.cards.some((c) => c.id === cardId);
}

/** Adds the card once (quantity 1) and makes that portfolio the default for the next save. */
export function addCard(state: PortfoliosState, portfolioId: string, card: CardRef, now = Date.now()): PortfoliosState {
  if (!state.portfolios.some((p) => p.id === portfolioId)) return state;
  const next = isInPortfolio(state, portfolioId, card.id)
    ? state
    : updatePortfolio(state, portfolioId, (p) => ({ ...p, cards: [...p.cards, { ...card, quantity: 1, addedAt: now }] }));
  return { ...next, lastPortfolioId: portfolioId };
}

/** Removing doesn't change the default portfolio: only saving does. */
export function removeCard(state: PortfoliosState, portfolioId: string, cardId: string): PortfoliosState {
  return updatePortfolio(state, portfolioId, (p) => ({ ...p, cards: p.cards.filter((c) => c.id !== cardId) }));
}

export function toggleCard(state: PortfoliosState, portfolioId: string, card: CardRef): PortfoliosState {
  return isInPortfolio(state, portfolioId, card.id) ? removeCard(state, portfolioId, card.id) : addCard(state, portfolioId, card);
}

/** Quantity is clamped to 1–999; use removeCard to take a card out. */
export function setQuantity(state: PortfoliosState, portfolioId: string, cardId: string, quantity: number): PortfoliosState {
  const clamped = Math.min(999, Math.max(1, Math.round(quantity) || 1));
  return updatePortfolio(state, portfolioId, (p) => ({
    ...p,
    cards: p.cards.map((c) => (c.id === cardId ? { ...c, quantity: clamped } : c)),
  }));
}

/**
 * Creates a portfolio and selects it as the default. A name that already exists (ignoring
 * case) reuses that portfolio. Returns portfolioId null for a blank name.
 */
export function createPortfolio(
  state: PortfoliosState,
  name: string,
  id = `portafolio-${Date.now().toString(36)}`
): { state: PortfoliosState; portfolioId: string | null } {
  const trimmed = name.trim().replace(/\s+/g, ' ');
  if (!trimmed) return { state, portfolioId: null };

  const existing = state.portfolios.find((p) => p.name.toLowerCase() === trimmed.toLowerCase());
  if (existing) return { state: { ...state, lastPortfolioId: existing.id }, portfolioId: existing.id };

  return {
    state: { portfolios: [...state.portfolios, { id, name: trimmed, cards: [] }], lastPortfolioId: id },
    portfolioId: id,
  };
}

export function deletePortfolio(state: PortfoliosState, portfolioId: string): PortfoliosState {
  if (portfolioId === DEFAULT_PORTFOLIO_ID) return state;
  return {
    portfolios: state.portfolios.filter((p) => p.id !== portfolioId),
    lastPortfolioId: state.lastPortfolioId === portfolioId ? DEFAULT_PORTFOLIO_ID : state.lastPortfolioId,
  };
}

/** Total copies across every portfolio (for the header badge). */
export function countCards(state: PortfoliosState): number {
  return state.portfolios.reduce((sum, p) => sum + p.cards.reduce((s, c) => s + c.quantity, 0), 0);
}

export interface Valuation {
  /** Market value in the target currency (sum of market × quantity). */
  total: number;
  /** Sum of the min / max prices × quantity, for cards that publish them. */
  low: number;
  high: number;
  /** Cards whose prices are still loading. */
  pending: number;
  /** Cards with no market price (not counted in the total). */
  unpriced: number;
  /** Amounts that couldn't be converted (no exchange rates), by source currency. */
  unconverted: Record<string, number>;
}

/**
 * Values a portfolio. `summaries[cardId]` is undefined while loading and null when the card has
 * no prices. `convert` turns an amount in a source currency into the target one (null = no rate).
 */
export function valuePortfolio(
  cards: PortfolioCard[],
  summaries: Record<string, PriceSummary | null | undefined>,
  convert: (amount: number, currency: string) => number | null
): Valuation {
  const result: Valuation = { total: 0, low: 0, high: 0, pending: 0, unpriced: 0, unconverted: {} };

  cards.forEach((card) => {
    const summary = summaries[card.id];
    if (summary === undefined) {
      result.pending += 1;
      return;
    }
    if (summary === null || summary.market === null) {
      result.unpriced += 1;
      return;
    }

    const market = convert(summary.market * card.quantity, summary.currency);
    if (market === null) {
      result.unconverted[summary.currency] = (result.unconverted[summary.currency] ?? 0) + summary.market * card.quantity;
      return;
    }
    result.total += market;
    // a missing min/max falls back to the market price so the range stays meaningful
    result.low += convert((summary.low ?? summary.market) * card.quantity, summary.currency) ?? 0;
    result.high += convert((summary.high ?? summary.market) * card.quantity, summary.currency) ?? 0;
  });

  return result;
}
