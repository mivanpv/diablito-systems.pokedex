import { charmanderCard, COLLECTIONS_KEY, PORTFOLIOS_KEY, visitWithStorage } from '../support/storage';

// The device frame clips its content (overflow-hidden), so a too-wide element doesn't scroll the
// page: it just gets cut off on the right. Look for any element that sticks out of the frame or
// out of its own clipping/scrolling ancestor instead of checking the page width.
function overflowingElements(doc: Document) {
  const offenders: string[] = [];
  const describe = (el: Element) =>
    `<${el.tagName.toLowerCase()} class="${el.getAttribute('class') ?? ''}"> "${(el.textContent ?? '').trim().slice(0, 30)}"`;

  doc.querySelectorAll('.dex-device *').forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    // nearest ancestor that clips horizontally
    let box = el.parentElement;
    while (box && doc.defaultView!.getComputedStyle(box).overflowX === 'visible') box = box.parentElement;
    if (!box) return;
    const bounds = box.getBoundingClientRect();
    if (rect.right > bounds.right + 1 || rect.left < bounds.left - 1) offenders.push(describe(el));
  });
  if (doc.documentElement.scrollWidth > doc.documentElement.clientWidth) offenders.push('the page scrolls sideways');
  return offenders;
}

const expectNoOverflow = () =>
  cy.document().then((doc) => {
    const offenders = overflowingElements(doc);
    expect(offenders, `elements wider than their container:\n${offenders.join('\n')}\n`).to.have.length(0);
  });

const pages: [string, string, () => void][] = [
  ['the empty Pokédex', '/', () => cy.contains('Selecciona un Pokémon')],
  ['Datos', '/#/pokemon/charmander', () => cy.contains('Pokémon Lagartija')],
  ['Estadísticas', '/#/pokemon/charmander?pestana=estadisticas', () => cy.contains('Total')],
  ['Evolución', '/#/pokemon/charmander?pestana=evolucion', () => cy.contains('Charmeleon')],
  ['Movimientos', '/#/pokemon/charmander?pestana=movimientos', () => cy.contains('Ascuas')],
  ['Cartas TCG', '/#/pokemon/charmander?pestana=cartas', () => cy.contains('Mercado')],
  ['a card page', '/#/carta/es/sv03.5-004', () => cy.contains('Volver')],
  ['the help page', '/#/ayuda', () => cy.contains('Descargar PDF')],
];

describe('Small screens', () => {
  [320, 375].forEach((width) => {
    describe(`${width}px wide`, () => {
      beforeEach(() => cy.viewport(width, 740));

      pages.forEach(([name, path, ready]) => {
        it(`fits ${name}`, () => {
          cy.visit(path);
          ready();
          expectNoOverflow();
        });
      });

      it('fits the collections page', () => {
        visitWithStorage('/#/colecciones', {
          [COLLECTIONS_KEY]: {
            lists: [{ id: 'favoritos', name: 'Favoritos', pokemon: [{ id: 4, name: 'charmander', addedAt: 0 }] }],
            lastListId: 'favoritos',
          },
        });
        cy.contains('Charmander');
        expectNoOverflow();
      });

      it('fits the portfolios page', () => {
        visitWithStorage('/#/portafolios', {
          [PORTFOLIOS_KEY]: {
            portfolios: [{ id: 'principal', name: 'Mi portafolio', cards: [charmanderCard(2)] }],
            lastPortfolioId: 'principal',
          },
        });
        cy.contains('Charmander');
        expectNoOverflow();
      });
    });
  });
});
