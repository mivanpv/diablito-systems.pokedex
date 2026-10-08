import { charmanderCard, panel, PORTFOLIOS_KEY, readStorage, visitWithStorage } from '../support/storage';

// Mocked card prices are USD 1 (min) / 2 (market) / 5 (max), at a rate of 20 MXN per USD.
describe('TCG cards and portfolios', () => {
  it('shows card prices converted to MXN and opens the card page', () => {
    cy.visit('/#/pokemon/charmander?pestana=cartas');
    cy.get('a[href="#/carta/es/sv03.5-004"]').should('contain', 'Mercado$40.00').and('contain', '$20.00 – $100.00').click();

    cy.location('hash').should('eq', '#/carta/es/sv03.5-004');
    cy.contains('151 · 004/165');

    cy.contains('button', 'Volver').click();
    cy.location('hash').should('eq', '#/pokemon/charmander?pestana=cartas');
    cy.contains('[role="tab"][aria-selected="true"]', 'Cartas TCG');
  });

  it('adds a card to the portfolio and values it by market price × quantity', () => {
    cy.visit('/#/pokemon/charmander?pestana=cartas');
    cy.contains('button', 'Agregar a Mi portafolio').click();
    cy.get('a[href="#/portafolios"]').should('have.attr', 'aria-label', 'Mis portafolios: 1 cartas').click();

    cy.contains('li.dex-tile', 'Charmander').should('contain', '$40.00');
    cy.contains('Total del portafolio$40.00');

    cy.get('button[aria-label="Agregar una copia de Charmander"]').click();
    cy.get('[aria-label="Cantidad de Charmander"]').should('have.text', '2');
    cy.contains('Total del portafolio$80.00');
    cy.contains('Rango mín – máx: $40.00 – $200.00');
  });

  describe('managing portfolios', () => {
    const seed = (...portfolios: { id: string; name: string; quantity: number }[]) => ({
      [PORTFOLIOS_KEY]: {
        portfolios: portfolios.map(({ id, name, quantity }) => ({ id, name, cards: [charmanderCard(quantity)] })),
        lastPortfolioId: portfolios[0].id,
      },
    });
    const quantity = () => cy.get('[aria-label="Cantidad de Charmander"]');

    it('keeps the quantity between 1 and 999', () => {
      visitWithStorage('/#/portafolios', seed({ id: 'principal', name: 'Mi portafolio', quantity: 998 }));
      cy.get('button[aria-label="Agregar una copia de Charmander"]').click().click();
      quantity().should('have.text', '999');
      readStorage(PORTFOLIOS_KEY).its('portfolios.0.cards.0.quantity').should('eq', 999);
      cy.contains('Total del portafolio$39,960.00');
    });

    it('cannot go below one copy, and removing the card empties the portfolio', () => {
      visitWithStorage('/#/portafolios', seed({ id: 'principal', name: 'Mi portafolio', quantity: 2 }));
      cy.get('button[aria-label="Quitar una copia de Charmander"]').click();
      quantity().should('have.text', '1');
      cy.get('button[aria-label="Quitar una copia de Charmander"]').should('be.disabled');

      cy.get('button[aria-label="Quitar Charmander del portafolio"]').click();
      panel('Mi portafolio').should('contain', 'Este portafolio está vacío.');
      cy.get('a[href="#/portafolios"]').should('have.attr', 'aria-label', 'Mis portafolios: 0 cartas');
    });

    it('adds up every portfolio in the grand total and updates it when one is deleted', () => {
      visitWithStorage(
        '/#/portafolios',
        seed({ id: 'principal', name: 'Mi portafolio', quantity: 1 }, { id: 'inversion', name: 'Inversión', quantity: 3 })
      );
      panel('Mi portafolio').should('contain', 'Total del portafolio$40.00');
      panel('Inversión').should('contain', 'Total del portafolio$120.00');
      cy.contains('Valor total de mercado$160.00');
      cy.contains('Rango: $80.00 – $400.00');

      // the default portfolio can't be deleted
      panel('Mi portafolio').contains('button', 'Eliminar portafolio').should('not.exist');
      panel('Inversión').contains('button', 'Eliminar portafolio').click();
      cy.contains('button', 'Sí, eliminar').click();
      cy.contains('h2', 'Inversión').should('not.exist');
      cy.contains('Valor total de mercado$40.00');
    });

    it('creates a portfolio that becomes the target of the next save', () => {
      cy.visit('/#/portafolios');
      cy.get('input[aria-label="Nombre del nuevo portafolio"]').type('Inversión');
      cy.contains('button', '+ Crear').click();
      panel('Inversión').should('contain', 'Actual');

      cy.visit('/#/pokemon/charmander?pestana=cartas');
      cy.contains('button', 'Agregar a Inversión').click();
      readStorage(PORTFOLIOS_KEY).its('portfolios.1.cards.0.id').should('eq', 'sv03.5-004');
    });
  });
});
