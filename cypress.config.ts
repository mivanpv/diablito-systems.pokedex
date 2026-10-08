import { defineConfig } from 'cypress';

// End-to-end tests run against the CRA dev server (`npm run start:e2e`). It serves the app under
// the `homepage` path, like GitHub Pages does. 127.0.0.1 instead of localhost: the dev server only
// listens on IPv4, and Node can resolve localhost to ::1.
export default defineConfig({
  e2e: {
    baseUrl: 'http://127.0.0.1:3000/diablito-systems.pokedex',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    viewportWidth: 1280,
    viewportHeight: 900,
    video: false,
    retries: { runMode: 1, openMode: 0 },
  },
});
