// Finds a local Chrome or Edge for the headless manual scripts. Set CHROME_PATH to use a specific browser.
const { existsSync } = require('fs');

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

function findBrowser() {
  const browser = candidates.find((path) => existsSync(path));
  if (!browser) {
    console.error('No se encontró Chrome ni Edge. Indica la ruta con la variable CHROME_PATH.');
    process.exit(1);
  }
  return browser;
}

module.exports = { findBrowser };
