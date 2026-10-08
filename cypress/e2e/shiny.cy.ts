const SPRITES = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

describe('Shiny toggle', () => {
  const shinyButton = () => cy.contains('button', 'Shiny');
  const sprite = (alt: string) => cy.get(`img[alt="${alt}"]`);

  it('switches the sprite and stays on while browsing other Pokémon', () => {
    cy.visit('/#/pokemon/charmander');
    shinyButton().should('have.attr', 'aria-pressed', 'false');
    sprite('Charmander').should('have.attr', 'src', `${SPRITES}/4.png`);

    shinyButton().click().should('have.attr', 'aria-pressed', 'true');
    sprite('Charmander (shiny)').should('have.attr', 'src', `${SPRITES}/shiny/4.png`);

    // next Pokémon (#0005): still shiny
    cy.contains('a', '#0005').click();
    cy.contains('h3', 'Charmeleon');
    shinyButton().should('have.attr', 'aria-pressed', 'true');
    sprite('Charmeleon (shiny)').should('have.attr', 'src', `${SPRITES}/shiny/5.png`);

    shinyButton().click();
    sprite('Charmeleon').should('have.attr', 'src', `${SPRITES}/5.png`);
  });

  it('is hidden for a Pokémon without a shiny sprite, and comes back on for the next one', () => {
    cy.visit('/#/pokemon/charmander');
    shinyButton().click();

    cy.get('input[aria-label="Nombre o número del Pokémon"]').type('ditto{enter}');
    cy.contains('h3', 'Ditto');
    shinyButton().should('not.exist');
    sprite('Ditto').should('have.attr', 'src', `${SPRITES}/132.png`);

    cy.get('input[aria-label="Nombre o número del Pokémon"]').type('charmander{enter}');
    sprite('Charmander (shiny)').should('exist');
  });
});
