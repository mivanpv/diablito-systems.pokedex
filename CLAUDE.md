# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start                                   # dev server on :3000
npm run build                               # production build into build/
CI=true npm test -- --watchAll=false        # run all tests once
npm test -- src/utils/format.test.ts        # run a single test file (add -t "name" for one test)
npx tsc --noEmit                            # type-check only
npm run deploy                              # build + publish build/ to the gh-pages branch
```

## Hard constraints

- **Client-side only.** No backend. All data comes from three keyless public APIs called directly from the browser: PokéAPI, TCGdex and ExchangeRate-API (`open.er-api.com`, base USD). Don't introduce a server, proxy, or API keys.
- **GitHub Pages deployment.** `package.json` `homepage` (`https://mivanpv.github.io/diablito-systems.pokedex`) sets the asset base path. Routing must stay on `HashRouter` (`src/App.tsx`); `BrowserRouter` would 404 on deep links.
- **Create React App** (`react-scripts@5.0.1`). React is pinned to 18.3.1 and TypeScript to 4.9 because react-scripts 5 doesn't support newer versions. Tailwind must stay on v3 (PostCSS plugin), because CRA can't use Tailwind v4.
- UI text is Spanish. Default currency is MXN.

## Architecture

- `src/services/http.ts`: `fetchJson<T>` is the only place that calls `fetch`. It caches by URL in memory. `persist: true` also caches in `sessionStorage`. `validate` rejects responses that return 200 but contain an error, so they aren't cached. `HttpError`/`isNotFound` let pages show 404-specific messages.
- `src/services/{pokeapi,tcgdex,exchange}.ts`: one typed module per API. Response types live in `src/types/`.
  - The list view builds artwork URLs from the id (`artworkUrl`) so it doesn't need one detail request per Pokémon.
  - `searchCards` queries TCGdex in `es` first and falls back to `en`. It also filters TCGdex's "contains" name match down to whole-word matches. Card routes carry the language: `/carta/:lang/:id`.
- `src/hooks/useAsync.ts`: the standard data-loading pattern for pages: `useAsync(signal => service(..., signal), deps)`. It aborts stale requests when deps change.
- `src/context/CurrencyContext.tsx`: loads exchange rates once. It holds the selected currency (persisted in `localStorage`) and exposes `convertToSelected(amount, sourceCurrency)`. `PriceTag` uses it to show the converted price alongside the original. TCGplayer prices are USD and Cardmarket prices are EUR. `utils/format.ts#convert` does the cross-rate math.
- `src/utils/i18n.ts`: maps PokéAPI type and stat ids to Spanish labels and colors.
- Browser storage access is always wrapped in try/catch, because it can throw in private mode.
