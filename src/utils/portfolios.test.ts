import {
  addCard,
  countCards,
  createPortfolio,
  DEFAULT_PORTFOLIO_ID,
  deletePortfolio,
  initialPortfolios,
  isInPortfolio,
  parsePortfolios,
  PortfolioCard,
  removeCard,
  setQuantity,
  toggleCard,
  valuePortfolio,
} from './portfolios';
import type { PriceSummary } from './pricing';

const furret = { id: 'swsh3-136', lang: 'es', name: 'Furret' };
const pikachu = { id: 'cel25-5', lang: 'es', name: 'Pikachu' };

describe('portfolios state', () => {
  it('starts with the default portfolio selected', () => {
    const state = initialPortfolios();
    expect(state.portfolios).toEqual([{ id: DEFAULT_PORTFOLIO_ID, name: 'Mi portafolio', cards: [] }]);
    expect(state.lastPortfolioId).toBe(DEFAULT_PORTFOLIO_ID);
  });

  it('adds a card once with quantity 1 and remembers the portfolio as the last one used', () => {
    let state = createPortfolio(initialPortfolios(), 'Inversión', 'inv').state;
    state = addCard(state, DEFAULT_PORTFOLIO_ID, furret, 1);
    state = addCard(state, 'inv', furret, 2);
    state = addCard(state, 'inv', furret, 3);
    expect(state.lastPortfolioId).toBe('inv');
    expect(state.portfolios[1].cards).toEqual([{ ...furret, quantity: 1, addedAt: 2 }]);
  });

  it('removing does not change the last portfolio; toggle adds and removes', () => {
    let state = createPortfolio(initialPortfolios(), 'Inversión', 'inv').state;
    state = addCard(state, DEFAULT_PORTFOLIO_ID, furret);
    state = addCard(state, 'inv', furret);
    state = removeCard(state, DEFAULT_PORTFOLIO_ID, furret.id);
    expect(state.lastPortfolioId).toBe('inv');
    state = toggleCard(state, DEFAULT_PORTFOLIO_ID, pikachu);
    expect(isInPortfolio(state, DEFAULT_PORTFOLIO_ID, pikachu.id)).toBe(true);
    state = toggleCard(state, DEFAULT_PORTFOLIO_ID, pikachu);
    expect(isInPortfolio(state, DEFAULT_PORTFOLIO_ID, pikachu.id)).toBe(false);
  });

  it('clamps quantities to 1–999', () => {
    let state = addCard(initialPortfolios(), DEFAULT_PORTFOLIO_ID, furret);
    state = setQuantity(state, DEFAULT_PORTFOLIO_ID, furret.id, 0);
    expect(state.portfolios[0].cards[0].quantity).toBe(1);
    state = setQuantity(state, DEFAULT_PORTFOLIO_ID, furret.id, 5000);
    expect(state.portfolios[0].cards[0].quantity).toBe(999);
    state = setQuantity(state, DEFAULT_PORTFOLIO_ID, furret.id, 3);
    expect(countCards(state)).toBe(3);
  });

  it('reuses portfolios by name, ignores blank names and never deletes the default', () => {
    const created = createPortfolio(initialPortfolios(), ' Inversión  2026 ', 'inv');
    expect(created.state.portfolios[1].name).toBe('Inversión 2026');
    expect(createPortfolio(created.state, 'inversión 2026', 'x').portfolioId).toBe('inv');
    expect(createPortfolio(created.state, '  ').portfolioId).toBeNull();

    expect(deletePortfolio(created.state, DEFAULT_PORTFOLIO_ID)).toBe(created.state);
    const after = deletePortfolio(created.state, 'inv');
    expect(after.portfolios).toHaveLength(1);
    expect(after.lastPortfolioId).toBe(DEFAULT_PORTFOLIO_ID);
  });

  it('parses stored data defensively', () => {
    const parsed = parsePortfolios({
      portfolios: [{ id: 'x', name: 'X', cards: [{ id: 'a', name: 'A', quantity: -2 }, { nope: 1 }] }],
      lastPortfolioId: 'gone',
    });
    expect(parsed.portfolios.map((p) => p.id)).toEqual([DEFAULT_PORTFOLIO_ID, 'x']);
    expect(parsed.portfolios[1].cards).toEqual([{ id: 'a', name: 'A', lang: 'es', quantity: 1 }]);
    expect(parsed.lastPortfolioId).toBe(DEFAULT_PORTFOLIO_ID);
  });
});

describe('valuePortfolio', () => {
  const card = (id: string, quantity: number): PortfolioCard => ({ id, lang: 'es', name: id, quantity, addedAt: 0 });
  const usd = (market: number | null, low: number | null, high: number | null): PriceSummary => ({
    source: 'TCGplayer',
    currency: 'USD',
    market,
    low,
    high,
  });
  const toMxn = (amount: number, currency: string) => (currency === 'USD' ? amount * 20 : null);

  it('sums market × quantity and the min–max range in the target currency', () => {
    const result = valuePortfolio([card('a', 2), card('b', 1)], { a: usd(2, 1, 5), b: usd(10, null, null) }, toMxn);
    expect(result.total).toBe(2 * 2 * 20 + 10 * 20); // 280
    expect(result.low).toBe(2 * 1 * 20 + 10 * 20); // missing min falls back to market
    expect(result.high).toBe(2 * 5 * 20 + 10 * 20);
  });

  it('reports pending, unpriced and unconvertible cards separately', () => {
    const eur: PriceSummary = { source: 'Cardmarket', currency: 'EUR', market: 3, low: 1, high: null };
    const result = valuePortfolio(
      [card('loading', 1), card('none', 1), card('nomarket', 1), card('eur', 2)],
      { none: null, nomarket: usd(null, 1, 2), eur },
      toMxn
    );
    expect(result).toMatchObject({ total: 0, pending: 1, unpriced: 2, unconverted: { EUR: 6 } });
  });
});
