import { defineConfig } from 'cypress';
import { mkdirSync, renameSync } from 'fs';
import { basename, join } from 'path';

// Screenshots for the user manual (public/manual), taken against the real APIs so the sprites, cards
// and prices look real. Not part of `npm run test:e2e`: run it with `npm run manual:capturas`.
const IMG_DIR = join(__dirname, 'public', 'manual', 'img');

export default defineConfig({
  e2e: {
    baseUrl: 'http://127.0.0.1:3000/diablito-systems.pokedex',
    specPattern: 'cypress/manual/**/*.cy.ts',
    supportFile: false,
    viewportWidth: 1280,
    viewportHeight: 900,
    video: false,
    retries: 0,
    // the real APIs are slower than the mocks
    defaultCommandTimeout: 20000,
    setupNodeEvents(on) {
      // a window bigger than the viewport, so full-page screenshots aren't scaled down
      on('before:browser:launch', (browser, options) => {
        if (browser.family === 'chromium') options.args.push('--window-size=1600,1200');
        return options;
      });
      // Cypress saves into a folder per spec; the manual wants public/manual/img/<name>.png
      on('after:screenshot', (details) => {
        mkdirSync(IMG_DIR, { recursive: true });
        const path = join(IMG_DIR, basename(details.path));
        renameSync(details.path, path);
        return { path };
      });
    },
  },
});
