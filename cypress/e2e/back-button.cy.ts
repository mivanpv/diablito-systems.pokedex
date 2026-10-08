// With no in-app history (the page was opened from a link or bookmark), Volver goes to the Pokédex
// instead of leaving the site. Returning to the previous page is covered in collections.cy.ts
// and portfolios.cy.ts.
describe('Volver without in-app history', () => {
  [
    ['a card page', '/#/carta/es/sv03.5-004', 'Charmander'],
    ['the collections page', '/#/colecciones', 'Mi colección'],
    ['the portfolios page', '/#/portafolios', 'Mis portafolios'],
  ].forEach(([page, path, content]) => {
    it(`goes to the Pokédex from ${page} opened directly`, () => {
      cy.visit(path);
      cy.contains(content);
      cy.contains('button', 'Volver').click();
      cy.location('hash').should('eq', '#/');
      cy.contains('Selecciona un Pokémon');
    });
  });
});
