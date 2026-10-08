// Mew has no Spanish cards in the mocks; the English search returns Mew and Mewtwo cards.
describe('TCG cards in English', () => {
  it('falls back to English cards and keeps only whole-name matches', () => {
    cy.visit('/#/pokemon/mew?pestana=cartas');
    cy.contains('No hay cartas en español; se muestran las ediciones en inglés.');

    // "Mew ex", "Mew V" and the tag team "Mewtwo & Mew-GX" have "Mew" as a whole word; "Mewtwo" alone doesn't
    cy.get('a[href^="#/carta/"]').should('have.length', 3);
    cy.get('a[href="#/carta/en/sv03.5-151"]').should('contain', 'Mew ex').and('contain', 'Mercado$80.00');
    cy.get('a[href="#/carta/en/swsh8-113"]').should('contain', 'Mew V').and('contain', 'Sin precio');
    cy.get('a[href="#/carta/en/sm11-71"]').should('contain', 'Mewtwo & Mew-GX');
    cy.get('a[href="#/carta/en/sv03.5-150"]').should('not.exist');
  });

  it('opens the English card page and comes back to the tab', () => {
    cy.visit('/#/pokemon/mew?pestana=cartas');
    cy.get('a[href="#/carta/en/sv03.5-151"]').click();
    cy.location('hash').should('eq', '#/carta/en/sv03.5-151');
    cy.contains('Mew ex');
    cy.contains('151 · 151/165');

    cy.contains('button', 'Volver').click();
    cy.location('hash').should('eq', '#/pokemon/mew?pestana=cartas');
    cy.contains('[role="tab"][aria-selected="true"]', 'Cartas TCG');
  });

  it('saves an English card to the portfolio with its language', () => {
    cy.visit('/#/pokemon/mew?pestana=cartas');
    cy.get('a[href="#/carta/en/sv03.5-151"]').parent().contains('button', 'Agregar a Mi portafolio').click();
    cy.get('a[href="#/portafolios"]').click();
    cy.contains('li.dex-tile', 'Mew ex').should('contain', '$80.00').find('a').should('have.attr', 'href', '#/carta/en/sv03.5-151');
  });
});
