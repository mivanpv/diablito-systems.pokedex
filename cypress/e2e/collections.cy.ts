import { COLLECTIONS_KEY, panel, readStorage, visitWithStorage } from '../support/storage';

describe('Collections', () => {
  const badge = () => cy.get('a[href="#/colecciones"]');

  it('saves a Pokémon, creates a list and keeps everything after a reload', () => {
    cy.visit('/#/pokemon/charmander');
    badge().should('have.attr', 'aria-label', 'Mi colección: 0 Pokémon guardados');

    cy.contains('button', 'Agregar a Favoritos').click();
    cy.contains('button', 'En Favoritos').should('have.attr', 'aria-pressed', 'true');
    badge().should('have.attr', 'aria-label', 'Mi colección: 1 Pokémon guardados');

    cy.get('button[aria-label="Elegir lista o crear una nueva"]').click();
    cy.get('input[aria-label="Nombre de la nueva lista"]').type('Equipo fuego');
    cy.contains('button', '+ Crear').click();
    cy.contains('button', 'En Equipo fuego');

    cy.reload();
    cy.contains('button', 'En Equipo fuego');

    badge().click();
    cy.location('hash').should('eq', '#/colecciones');
    cy.contains('1 Pokémon guardados · 2 listas');
    cy.contains('Equipo fuego');
    // Favoritos can't be deleted; only the custom list offers it
    cy.get('button').filter(':contains("Eliminar lista")').should('have.length', 1);
  });

  it('returns with Volver to the exact Pokémon, tab and filters', () => {
    cy.visit('/#/pokemon/charmander?tipo=fire&pestana=estadisticas');
    badge().click();
    cy.contains('button', 'Volver').click();
    cy.location('hash').should('eq', '#/pokemon/charmander?tipo=fire&pestana=estadisticas');
    cy.contains('[role="tab"][aria-selected="true"]', 'Estadísticas');
  });

  describe('managing lists', () => {
    const charmander = { id: 4, name: 'charmander', addedAt: 0 };
    const seed = (lastListId: string) => ({
      [COLLECTIONS_KEY]: {
        lists: [
          { id: 'favoritos', name: 'Favoritos', pokemon: [charmander] },
          { id: 'equipo', name: 'Equipo fuego', pokemon: [charmander] },
        ],
        lastListId,
      },
    });
    const currentBadge = (title: string) => panel(title).find('h2 + div').contains('Actual');

    it('removing a Pokémon does not change the current list', () => {
      visitWithStorage('/#/colecciones', seed('equipo'));
      cy.get('button[aria-label="Quitar Charmander de Favoritos"]').click();
      panel('Favoritos').should('contain', 'Esta lista está vacía.');
      currentBadge('Equipo fuego');
      readStorage(COLLECTIONS_KEY).its('lastListId').should('eq', 'equipo');

      // Favoritos stays, and can't be deleted, even when it is empty
      panel('Favoritos').contains('button', 'Eliminar lista').should('not.exist');
    });

    it('creating a list with an existing name reuses it and makes it current', () => {
      visitWithStorage('/#/colecciones', seed('favoritos'));
      currentBadge('Favoritos');
      cy.get('input[aria-label="Nombre de la nueva lista"]').type('equipo FUEGO');
      cy.contains('button', '+ Crear lista').click();
      // Charmander is in both lists but counts once
      cy.contains('1 Pokémon guardados · 2 listas');
      currentBadge('Equipo fuego');
    });

    it('deletes a list after confirming, and the next save goes to Favoritos', () => {
      visitWithStorage('/#/colecciones', seed('equipo'));
      panel('Equipo fuego').contains('button', 'Eliminar lista').click();
      cy.contains('¿Eliminar «Equipo fuego»?');
      cy.contains('button', 'Cancelar').click();
      cy.contains('h2', 'Equipo fuego');

      panel('Equipo fuego').contains('button', 'Eliminar lista').click();
      cy.contains('button', 'Sí, eliminar').click();
      cy.contains('h2', 'Equipo fuego').should('not.exist');
      cy.contains('1 Pokémon guardados · 1 listas');
      currentBadge('Favoritos');

      cy.get('a[href="#/pokemon/charmander"]').click();
      cy.contains('button', 'En Favoritos').should('have.attr', 'aria-pressed', 'true');
    });
  });
});
