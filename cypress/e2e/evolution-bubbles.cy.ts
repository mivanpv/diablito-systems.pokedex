import { overrideApi } from '../support/api';

describe('Evolution bubbles', () => {
  const sprite = (name: string) => cy.get(`button[aria-label$="evoluciones de ${name}"]`);
  const nextBubble = () => cy.get('a[aria-label="Ir a Charmeleon (próxima evolución)"]');

  it('opens from the sprite and closes with Escape', () => {
    cy.visit('/#/pokemon/charmander');
    sprite('Charmander').should('have.attr', 'aria-expanded', 'false').click();
    sprite('Charmander').should('have.attr', 'aria-expanded', 'true');
    nextBubble().should('be.visible').and('have.attr', 'title', 'Charmeleon · Nv. 16');

    cy.get('body').type('{esc}');
    nextBubble().should('not.exist');
    sprite('Charmander').should('have.attr', 'aria-expanded', 'false');
  });

  it('opens from the ⇄ Evoluciones button and closes on a backdrop click', () => {
    cy.visit('/#/pokemon/charmander');
    cy.contains('button', 'Evoluciones').click().should('have.attr', 'aria-pressed', 'true');
    nextBubble().should('be.visible');

    // top edge of the backdrop: away from the bubbles and the sprite (its corners are rounded off)
    cy.get('button[aria-label="Cerrar evoluciones"]').click('top');
    nextBubble().should('not.exist');
    cy.contains('button', 'Evoluciones').should('have.attr', 'aria-pressed', 'false');
  });

  it('navigates from a bubble, keeps the filters and closes', () => {
    cy.visit('/#/pokemon/charmander?tipo=fire');
    sprite('Charmander').click();
    nextBubble().click();

    cy.location('hash').should('eq', '#/pokemon/5?tipo=fire');
    cy.contains('h3', 'Charmeleon');
    nextBubble().should('not.exist');

    // reopening on Charmeleon shows Charmander as the previous stage
    sprite('Charmeleon').click();
    cy.get('a[aria-label="Ir a Charmander (evolución anterior)"]').should('be.visible');
  });

  it('says so when the Pokémon has no evolutions', () => {
    cy.visit('/#/pokemon/ditto');
    sprite('Ditto').click();
    cy.contains('Este Pokémon no tiene evoluciones');
    cy.get('a[aria-label^="Ir a"]').should('not.exist');
  });

  it('says so when the evolution chain fails to load', () => {
    overrideApi('https://pokeapi.co/api/v2/evolution-chain/2/', { statusCode: 500 });
    cy.visit('/#/pokemon/charmander');
    sprite('Charmander').click();
    cy.contains('No se pudieron cargar las evoluciones');
  });
});
