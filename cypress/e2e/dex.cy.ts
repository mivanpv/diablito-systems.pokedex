describe('Pokédex', () => {
  it('shows the three sections and indexes species only, starting on the first available letter', () => {
    cy.visit('/');
    cy.contains('Búsqueda directa');
    cy.contains('Índice por tipo y letra');
    cy.contains('Selecciona un Pokémon');
    cy.contains('3 Pokémon indexados');

    // "A" has no Pokémon in the mocked list, so the index falls back to "B"
    cy.get('button.dex-chip-accent[aria-pressed="true"]').should('have.text', 'B');
    cy.get('a[href^="#/pokemon/"]').should('have.length', 1).and('contain', 'Bulbasaur');
  });

  it('opens a Pokémon by number from the direct search', () => {
    cy.visit('/');
    cy.get('input[aria-label="Nombre o número del Pokémon"]').type('#004{enter}');
    cy.location('hash').should('eq', '#/pokemon/4');
    cy.contains('h3', 'Charmander');
    cy.contains('Pokémon Lagartija');
    cy.contains('Prefiere las cosas calientes.');
    cy.contains('Mar Llamas');
  });

  it('opens a random Pokémon from the whole Pokédex and keeps the filters', () => {
    // the type filter narrows the index, not the random pick: the full list is bulbasaur, charmander, charmeleon
    cy.visit('/#/?tipo=fire');
    cy.contains('2 Pokémon encontrados');
    cy.window().then((win) => cy.stub(win.Math, 'random').returns(0.99));
    cy.contains('button', 'Aleatorio').click();
    cy.location('hash').should('eq', '#/pokemon/charmeleon?tipo=fire');
    cy.contains('h3', 'Charmeleon');

    cy.window().then((win) => (win.Math.random as sinon.SinonStub).returns(0.4));
    cy.contains('button', 'Aleatorio').click();
    cy.location('hash').should('eq', '#/pokemon/charmander?tipo=fire');
    cy.contains('h3', 'Charmander');
  });

  it('says so when the Pokémon does not exist', () => {
    cy.visit('/');
    cy.get('input[aria-label="Nombre o número del Pokémon"]').type('missingno{enter}');
    cy.contains('¡Pokémon no encontrado!');
    cy.contains('No hay registros de «missingno»');
  });

  it('filters by type and keeps the filters in the URL while browsing', () => {
    cy.visit('/');
    cy.contains('button', 'Fuego').click();
    cy.location('hash').should('contain', 'tipo=fire');
    cy.contains('2 Pokémon encontrados');
    cy.get('button.dex-chip-accent[aria-pressed="true"]').should('have.text', 'C');

    cy.contains('a', 'Charmeleon').click();
    cy.location('hash').should('eq', '#/pokemon/charmeleon?tipo=fire');
    cy.contains('a[aria-current="page"]', 'Charmeleon');

    // a reload restores the same Pokémon and filters
    cy.reload();
    cy.contains('h3', 'Charmeleon');
    cy.contains('2 Pokémon encontrados');
  });

  it('navigates the evolution chain and keeps the open tab', () => {
    cy.visit('/#/pokemon/charmander');
    cy.contains('[role="tab"]', 'Evolución').click();
    cy.contains('Cadena evolutiva');
    cy.contains('Nv. 16');

    cy.get('a[title="Ver Charmeleon"]').click();
    cy.location('hash').should('eq', '#/pokemon/5?pestana=evolucion');
    cy.contains('h3', 'Charmeleon');
    cy.contains('[role="tab"][aria-selected="true"]', 'Evolución');
    cy.get('a[title="Ver Charmander"]').should('exist');
  });

  it('expands a move to show its details', () => {
    cy.visit('/#/pokemon/charmander?pestana=movimientos');
    cy.contains('Escarlata/Púrpura');
    cy.contains('button[aria-expanded]', 'Ascuas').click();
    cy.contains('Ataca con llamas pequeñas.');
    cy.contains('Has a 10% chance to burn the target.');
  });
});
