import { overrideApi } from '../support/api';

const LIST_URL = 'https://pokeapi.co/api/v2/pokemon?limit=2000';

describe('Errors and offline', () => {
  it('says it is offline when the Pokédex list cannot be loaded', () => {
    overrideApi(LIST_URL, { statusCode: 500 });
    cy.visit('/');
    cy.contains('SIN CONEXIÓN');
    cy.contains(`No se pudo cargar la lista: Error 500 al consultar ${LIST_URL}`);
    cy.contains('button', 'Aleatorio').should('be.disabled');

    // the direct search does not need the list
    cy.get('input[aria-label="Nombre o número del Pokémon"]').type('charmander{enter}');
    cy.contains('h3', 'Charmander');
  });

  it('tells a read error apart from a missing Pokémon', () => {
    overrideApi('https://pokeapi.co/api/v2/pokemon/charmander', { statusCode: 500 });
    cy.visit('/#/pokemon/charmander');
    cy.contains('Error de lectura');
    cy.contains('Error 500 al consultar https://pokeapi.co/api/v2/pokemon/charmander');
    cy.contains('¡Pokémon no encontrado!').should('not.exist');
  });

  it('says so when the TCG cards cannot be loaded', () => {
    overrideApi('https://api.tcgdex.net/v2/es/cards?name=charmander', { statusCode: 500 });
    cy.visit('/#/pokemon/charmander?pestana=cartas');
    cy.contains('No se pudieron cargar las cartas: Error 500');
  });

  it('shows a 404 message for a card that does not exist', () => {
    cy.visit('/#/carta/es/xx-999');
    cy.contains('La carta «xx-999» no existe.');
  });

  it('shows a generic message when a card fails to load', () => {
    overrideApi('https://api.tcgdex.net/v2/es/cards/sv03.5-004', { statusCode: 500 });
    cy.visit('/#/carta/es/sv03.5-004');
    cy.contains('No se pudo cargar la carta: Error 500');
  });

  it('shows the 404 page for an unknown route and goes back to the Pokédex', () => {
    cy.visit('/#/no-existe');
    cy.contains('h1', '404');
    cy.contains('Esta página no existe');
    cy.contains('a', 'Volver a la Pokédex').click();
    cy.location('hash').should('eq', '#/');
    cy.contains('Selecciona un Pokémon');
  });
});
