// Walks through the app against the real APIs and saves the screenshots used by the user manual
// (public/manual/index.html) in public/manual/img. Run it with `npm run manual:capturas`.

const LOADING_TEXTS = ['Leyendo datos', 'Buscando cartas', 'Cargando precio', 'Buscando evoluciones', 'Cargando evoluciones', 'Cargando…', 'Buscando…'];

/** Waits until every image inside `subject` has loaded (lazy ones too) and no loader is showing. */
function settle(subject: () => Cypress.Chainable<JQuery<HTMLElement>>) {
  subject().then(($el) => $el.find('img').removeAttr('loading'));
  subject().should(($el) => {
    $el.find('img').each((_, img) => {
      expect((img as HTMLImageElement).complete, (img as HTMLImageElement).src).to.equal(true);
    });
    LOADING_TEXTS.forEach((text) => expect($el.text()).not.to.contain(text));
  });
  // let the pop and fade animations finish
  cy.wait(500);
}

const viewer = () => cy.contains('h2', 'visor matricial').closest('section');
const stage = () => viewer().find('button[aria-label*="evoluciones de"]').parent();
const panel = (title: string) => cy.contains('h2', title).closest('section');
const tab = (label: string) => cy.contains('[role="tab"]', label).click().blur();
const page = () => cy.get('#root');
/** Card tiles in the Cartas TCG tab that have an image and a market price. */
const pricedCards = () => viewer().find('.dex-tile').filter(':has(img)').filter(':contains("Mercado")');

const COLLECTIONS = {
  lists: [
    {
      id: 'favoritos',
      name: 'Favoritos',
      pokemon: [
        { id: 6, name: 'charizard', addedAt: 0 },
        { id: 25, name: 'pikachu', addedAt: 0 },
        { id: 94, name: 'gengar', addedAt: 0 },
        { id: 149, name: 'dragonite', addedAt: 0 },
      ],
    },
    {
      id: 'equipo-fuego',
      name: 'Equipo fuego',
      pokemon: [
        { id: 4, name: 'charmander', addedAt: 0 },
        { id: 37, name: 'vulpix', addedAt: 0 },
        { id: 58, name: 'growlithe', addedAt: 0 },
      ],
    },
  ],
  lastListId: 'favoritos',
};

describe('Capturas del manual de usuario', () => {
  // the screenshots show the app without the first-visit welcome banner, except the help ones
  beforeEach(() => {
    if (Cypress.currentTest.title === 'ayuda') return;
    cy.on('window:before:load', (win) => win.localStorage.setItem('pokedex:welcome-dismissed', '1'));
  });

  it('pantalla inicial y búsquedas', () => {
    cy.visit('/');
    cy.contains('Pokémon indexados');
    settle(page);
    cy.screenshot('01-inicio', { capture: 'viewport' });
    cy.get('header').screenshot('02-encabezado');

    cy.get('input[aria-label="Nombre o número del Pokémon"]').type('pikachu');
    panel('Búsqueda directa').screenshot('03-busqueda-directa');

    cy.contains('button', 'Fuego').click();
    cy.contains('button[aria-pressed]', /^C$/).click();
    cy.contains('Pokémon encontrados');
    settle(() => panel('Índice por tipo y letra'));
    panel('Índice por tipo y letra').screenshot('04-indice');
  });

  it('visor del Pokémon', () => {
    cy.visit('/#/pokemon/charizard');
    cy.contains('h3', 'Charizard');
    cy.contains('Habilidades y efectos');
    settle(viewer);
    viewer().screenshot('05-visor-datos');

    cy.contains('button', 'Shiny').click().blur();
    settle(viewer);
    stage().screenshot('06-shiny');
    cy.contains('button', 'Shiny').click();

    cy.contains('button', 'Evoluciones').click().blur();
    settle(viewer);
    stage().screenshot('07-burbujas-evolucion');
    cy.get('body').type('{esc}');

    tab('Estadísticas');
    settle(viewer);
    viewer().screenshot('08-estadisticas');

    tab('Evolución');
    cy.contains('Cadena evolutiva');
    settle(viewer);
    viewer().screenshot('09-evolucion');

    tab('Movimientos');
    cy.get('button[aria-expanded]').filter(':contains("Nv.")').first().click();
    settle(viewer);
    viewer().screenshot('10-movimientos');
  });

  it('cartas TCG y portafolios', () => {
    cy.visit('/#/pokemon/charizard?pestana=cartas');
    cy.contains('Cartas de Charizard');
    settle(viewer);
    viewer().screenshot('11-cartas');

    // two cards with image and price into "Mi portafolio"
    pricedCards().eq(0).contains('button', 'Agregar a Mi portafolio').click();
    pricedCards().eq(1).contains('button', 'Agregar a Mi portafolio').click();
    pricedCards().eq(1).scrollIntoView({ offset: { top: -250, left: 0 } });
    pricedCards().eq(1).find('button[aria-label="Elegir portafolio o crear uno nuevo"]').click();
    cy.get('[role="dialog"]').should('be.visible');
    cy.wait(300);
    cy.screenshot('12-guardar-en-portafolio', { capture: 'viewport' });
    cy.get('body').type('{esc}');

    pricedCards().eq(0).find('a[href^="#/carta/"]').click();
    cy.contains('h2', 'Precios en');
    settle(page);
    cy.screenshot('13-carta-detalle', { capture: 'fullPage' });

    cy.get('a[href="#/portafolios"]').click();
    cy.contains('Total del portafolio');
    cy.get('button[aria-label^="Agregar una copia de"]').last().click().click().blur();
    settle(page);
    cy.screenshot('14-portafolios', { capture: 'fullPage' });
  });

  it('colecciones', () => {
    cy.visit('/#/pokemon/pikachu', {
      onBeforeLoad(win) {
        win.localStorage.setItem('pokedex:collections', JSON.stringify(COLLECTIONS));
      },
    });
    cy.contains('h3', 'Pikachu');
    cy.get('button[aria-label="Elegir lista o crear una nueva"]').click();
    cy.get('[role="dialog"]').should('be.visible');
    settle(viewer);
    cy.scrollTo('top');
    cy.screenshot('15-guardar-en-coleccion', { capture: 'viewport' });

    cy.get('a[href="#/colecciones"]').click();
    cy.contains('h2', 'Equipo fuego');
    settle(page);
    cy.screenshot('16-colecciones', { capture: 'fullPage' });
  });

  it('ayuda', () => {
    cy.visit('/');
    cy.contains('Pokémon indexados');
    cy.get('aside[aria-label="Bienvenida"]').screenshot('19-bienvenida');

    cy.get('a[aria-label="Ayuda y manual de usuario"]').click();
    cy.contains('Ir directo a un tema');
    settle(page);
    cy.screenshot('20-ayuda', { capture: 'fullPage' });
  });

  it('vista en celular', () => {
    cy.viewport('iphone-x');
    cy.visit('/');
    cy.contains('Pokémon indexados');
    settle(page);
    cy.screenshot('17-celular-busqueda', { capture: 'viewport' });

    // selecting a Pokémon scrolls the viewer into view
    cy.get('input[aria-label="Nombre o número del Pokémon"]').type('pikachu{enter}').blur();
    cy.contains('h3', 'Pikachu');
    settle(viewer);
    cy.screenshot('18-celular-visor', { capture: 'viewport' });
  });
});
