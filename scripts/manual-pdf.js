// Prints public/manual/index.html to public/manual/Manual-de-usuario.pdf with a headless Chrome or Edge
// (no extra dependencies). Set CHROME_PATH to use a specific browser.
const { execFileSync } = require('child_process');
const { join } = require('path');
const { pathToFileURL } = require('url');
const { findBrowser } = require('./browser');

const root = join(__dirname, '..');
const source = join(root, 'public', 'manual', 'index.html');
const output = join(root, 'public', 'manual', 'Manual-de-usuario.pdf');

const browser = findBrowser();

execFileSync(
  browser,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-pdf-header-footer',
    // give the fonts and screenshots time to load before printing
    '--virtual-time-budget=10000',
    `--print-to-pdf=${output}`,
    pathToFileURL(source).href,
  ],
  { stdio: 'inherit' }
);
console.log(`PDF generado: ${output}`);
