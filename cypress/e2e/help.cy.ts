import { readStorage, visitWithStorage, WELCOME_KEY } from '../support/storage';

const banner = () => cy.get('aside[aria-label="Bienvenida"]');

/** Requests a link of the page (relative to the site, as the browser would resolve it). */
const requestLink = (href: string) => cy.location('origin').then((origin) => cy.request(`${origin}${href}`));

describe('Help', () => {
  it('welcomes a new user and takes them to the help page', () => {
    cy.visit('/');
    banner().contains('a', 'Ver ayuda').click();
    cy.location('hash').should('eq', '#/ayuda');
    banner().should('not.exist');
    readStorage(WELCOME_KEY).should('eq', 1);

    // opening the help page counts as seen: the banner doesn't come back
    cy.contains('button', 'Volver').click();
    cy.contains('Selecciona un Pokémon');
    banner().should('not.exist');
  });

  it('does not show the welcome again once closed', () => {
    cy.visit('/');
    cy.get('button[aria-label="Cerrar aviso de bienvenida"]').click();
    banner().should('not.exist');

    cy.reload();
    cy.contains('Selecciona un Pokémon');
    banner().should('not.exist');
  });

  it('lets the user read the manual online or download the PDF', () => {
    visitWithStorage('/#/pokemon/charmander', { [WELCOME_KEY]: '1' });
    cy.get('a[aria-label="Ayuda y manual de usuario"]').click();
    cy.location('hash').should('eq', '#/ayuda');

    cy.contains('a', 'Abrir manual')
      .should('have.attr', 'target', '_blank')
      .invoke('attr', 'href')
      .then((href) => {
        expect(href).to.eq('/diablito-systems.pokedex/manual/index.html');
        requestLink(href!).its('body').should('contain', 'MANUAL DE USUARIO');
      });

    cy.contains('a', 'Descargar PDF')
      .should('have.attr', 'download', 'Manual-de-usuario-Pokedex.pdf')
      .invoke('attr', 'href')
      .then((href) => requestLink(href!).its('headers.content-type').should('eq', 'application/pdf'));

    // each chapter link opens the online manual at its section
    cy.contains('a', 'Buscar un Pokémon').should('have.attr', 'href', '/diablito-systems.pokedex/manual/index.html#buscar');
    cy.request('/manual/index.html').its('body').should('contain', 'id="buscar"');

    cy.contains('button', 'Volver').click();
    cy.location('hash').should('eq', '#/pokemon/charmander');
  });
});
