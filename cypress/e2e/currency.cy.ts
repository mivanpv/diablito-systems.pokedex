import { overrideApi } from '../support/api';
import { charmanderCard, CURRENCY_KEY, money, panel, PORTFOLIOS_KEY, visitWithStorage } from '../support/storage';

// Mocked card prices are USD 1 (min) / 2 (market) / 5 (max). Rates: 1 USD = 20 MXN = 0.5 EUR; no GBP.
const tile = () => cy.get('a[href="#/carta/es/sv03.5-004"]');
const currencySelect = () => cy.get('select[aria-label="Moneda"]');
const portfolio = (quantity: number) => ({
  portfolios: [{ id: 'principal', name: 'Mi portafolio', cards: [charmanderCard(quantity)] }],
  lastPortfolioId: 'principal',
});

describe('Currency', () => {
  it('converts card prices to the selected currency and remembers it after a reload', () => {
    cy.visit('/#/pokemon/charmander?pestana=cartas');
    currencySelect().should('have.value', 'MXN');
    tile().should('contain', 'Mercado$40.00');

    currencySelect().select('EUR');
    tile().should('contain', money('MercadoEUR 1.00')).and('contain', money('EUR 0.50 – EUR 2.50'));
    cy.window().its('localStorage').invoke('getItem', CURRENCY_KEY).should('eq', 'EUR');

    cy.reload();
    currencySelect().should('have.value', 'EUR');
    tile().should('contain', money('MercadoEUR 1.00'));
  });

  it('shows the source price unchanged when the selected currency is the source one', () => {
    cy.visit('/#/pokemon/charmander?pestana=cartas');
    currencySelect().select('USD');
    tile().should('contain', money('MercadoUSD 2.00')).and('contain', money('USD 1.00 – USD 5.00'));
  });

  it('values the portfolio in the selected currency', () => {
    visitWithStorage('/#/portafolios', { [PORTFOLIOS_KEY]: portfolio(3), [CURRENCY_KEY]: 'EUR' });
    // 3 copies × EUR 1.00, range 3 × EUR 0.50 – 3 × EUR 2.50
    panel('Mi portafolio').should('contain', money('Total del portafolioEUR 3.00'));
    cy.contains('Rango mín – máx: EUR 1.50 – EUR 7.50');
    cy.contains('Valor total de mercadoEUR 3.00');

    currencySelect().select('MXN');
    cy.contains('Valor total de mercado$120.00');
  });

  it('never mixes currencies: amounts without an exchange rate are reported apart', () => {
    visitWithStorage('/#/portafolios', { [PORTFOLIOS_KEY]: portfolio(1), [CURRENCY_KEY]: 'GBP' });
    // the card keeps its USD price, but the GBP total does not include it
    cy.contains('li.dex-tile', 'Charmander').should('contain', money('USD 2.00'));
    cy.contains('Valor total de mercadoGBP 0.00');
    cy.contains('Sin tipo de cambio: USD 2.00 no se incluyen.');
  });

  it('falls back to the source prices when the exchange rates fail to load', () => {
    overrideApi('https://open.er-api.com/v6/latest/USD', { statusCode: 500 });
    cy.visit('/#/pokemon/charmander?pestana=cartas');
    tile().should('contain', money('MercadoUSD 2.00'));
    currencySelect()
      .parent('label')
      .should('have.attr', 'title')
      .and('contain', 'Error 500 al consultar https://open.er-api.com/v6/latest/USD');
  });
});
