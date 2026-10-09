// Prints public/manual/index.html to public/manual/Manual-de-usuario.pdf with a headless Chrome or Edge
// (no extra dependencies). Set CHROME_PATH to use a specific browser.
const { execFileSync } = require('child_process');
const { existsSync } = require('fs');
const { join } = require('path');
const { pathToFileURL } = require('url');

const root = join(__dirname, '..');
const source = join(root, 'public', 'manual', 'index.html');
const output = join(root, 'public', 'manual', 'Manual-de-usuario.pdf');

const candidates = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean);

const browser = candidates.find((path) => existsSync(path));
if (!browser) {
  console.error('No se encontró Chrome ni Edge. Indica la ruta con la variable CHROME_PATH.');
  process.exit(1);
}

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
