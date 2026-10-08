import { mockApis } from './api';

// Every test starts with the APIs mocked. Cypress clears localStorage and sessionStorage between
// tests, so collections, portfolios, the currency and the HTTP cache start clean as well.
beforeEach(() => {
  mockApis();
});
