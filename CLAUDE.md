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

- **Single-screen Pokédex** (`src/pages/DexPage.tsx`). It has three numbered sections in `src/components/dex/`:
  1. `DirectSearch`: name or number, with a `<datalist>` autocomplete and a random pick.
  2. `AdvancedSearch`: type chips ("Todos" by default), A–Z letter chips (one is always selected) and the results list, which renders every match.
  3. `PokemonViewer`: a dark bezel around the selected Pokémon. It has a shiny toggle and tabs: Datos, Estadísticas, Evolución, Movimientos and Cartas TCG. Datos includes `AbilitiesSection`, which loads every `/ability/{name}` in parallel. It shows the Spanish name and in-game description, plus the English-only battle effect in a `<details>` element. `EvolutionSection` renders `/evolution-chain` by stage using `utils/evolution.ts#buildStages`, which tags each species as anterior, actual, próxima or otra (a sibling branch). Clicking a species navigates to `/pokemon/{id}`; it uses the id because some species names (deoxys) are not valid Pokémon names. The index list therefore matches the selection by name or by id. Clicking the sprite (or the "⇄ Evoluciones" button) opens `EvolutionBubbles`, an overlay that fans previous stages to the left and next stages to the right; it closes with Escape or a click on the backdrop. The tab and the bubbles share `hooks/useEvolutionStages.ts`. `MovesSection` groups `pokemon.moves` by game and learn method with `utils/moves.ts`. PokéAPI version-group ids are not chronological, so the game order and Spanish game names live in its `GAMES` list. Each `MoveRow` fetches its own `/move/{name}`, which is cached in memory only because each response is about 50 KB. Each `TcgCardTile` fetches its card detail, because the search results carry no prices, and shows `utils/pricing.ts#summarizePricing`: a market price and min–max range from the main TCGplayer variant (USD), falling back to Cardmarket (EUR, which has no maximum). The prices are converted to the selected currency, and the cached detail makes the card page open instantly. The tab is read from `?pestana=` (default `datos`, omitted from the URL), so it persists between Pokémon and when coming back from a card page. The shiny state lives outside the content keyed by name.

  On desktop the viewer sits on the left (`lg:order-1`) and the searches on the right. On mobile the searches come first.

  In `App.tsx`, `DexPage` is a pathless parent route over `/` and `/pokemon/:name`, so it stays mounted while you browse. It reads the selected name with `useMatch`, not `useParams`.
- **Filters and the open viewer tab live in the URL** (`?tipo=fire&letra=C&pestana=cartas`) through `src/hooks/useDexFilters.ts`. Links to a Pokémon must carry the current `search` so the filters survive navigation. A letter is always active (default `A`, which is omitted from the URL), so the index never renders the whole Pokédex. If the letter has no Pokémon of the chosen type, `AdvancedSearch` uses the first letter that does.
- `src/services/http.ts`: `fetchJson<T>` is the only place that calls `fetch`. It caches by URL in memory. `persist: true` also caches in `sessionStorage`. `validate` rejects responses that return 200 but contain an error, so they aren't cached. Concurrent calls for the same URL share one request. `signal` only rejects that caller's promise and never aborts the shared fetch. `HttpError`/`isNotFound` let pages show 404-specific messages.
- `src/services/{pokeapi,tcgdex,exchange}.ts`: one typed module per API. Response types live in `src/types/`.
  - Lists come from `getAllPokemon` (`/pokemon?limit=2000`) or `getPokemonByType` (`/type/{t}`). Ids ≥ 10000 are excluded because they are alternate forms. Lists build sprite URLs from the id (`spriteUrl`), so they don't need one request per Pokémon.
  - `searchCards` queries TCGdex in `es` first and falls back to `en`. It also filters TCGdex's "contains" name match down to whole-word matches. Card routes carry the language: `/carta/:lang/:id`.
- `src/hooks/useAsync.ts`: the standard data-loading pattern for pages: `useAsync(signal => service(..., signal), deps)`. It aborts stale requests when deps change.
- `src/context/CurrencyContext.tsx`: loads exchange rates once. It holds the selected currency (persisted in `localStorage`) and exposes `convertToSelected(amount, sourceCurrency)`. `PriceTag` uses it to show the converted price alongside the original. TCGplayer prices are USD and Cardmarket prices are EUR. `utils/format.ts#convert` does the cross-rate math.
- **Collections** (`#/colecciones`) are saved in `localStorage` under `pokedex:collections` by `context/CollectionsContext.tsx`, which also syncs other tabs through the `storage` event. The rules live in `utils/collections.ts` as pure, tested functions:
  - The "Favoritos" list (`DEFAULT_LIST_ID`) always exists and can't be deleted.
  - `lastListId` is the list used for the next save. Saving into a list or creating a list updates it; removing a Pokémon does not.
  - Creating a list with an existing name reuses that list.
  - Stored data is validated by `parseCollections`.

  In the viewer, `SaveToCollection` is a split button built on the shared `components/SaveToListButton.tsx`: the main part toggles the Pokémon in the last list, and the caret opens a menu to pick lists or create one.
- **Portfolios** (`#/portafolios`) work like collections, but for TCG cards. They are stored in `localStorage` under `pokedex:portfolios` by `context/PortfoliosContext.tsx`; the rules live in `utils/portfolios.ts`.
  - "Mi portafolio" (`DEFAULT_PORTFOLIO_ID`) can't be deleted, and `lastPortfolioId` is pre-selected for the next save.
  - Each card has a quantity, clamped to 1–999.
  - `valuePortfolio` sums market price × quantity (plus a min–max range) in the selected currency. It reports cards that are still loading, cards with no price, and amounts with no exchange rate separately, so a total never mixes currencies.
  - `SaveToPortfolio`, built on `SaveToListButton`, appears on every `TcgCardTile` (`compact`) and on the card page.
- `src/utils/i18n.ts`: maps PokéAPI type and stat ids to Spanish labels and colors. `TYPE_INFO` also drives the type chips.
- **Design system: a light "console" look.** Navy outlines, hard drop shadows and a red accent.
  - Tokens are defined in `tailwind.config.js` and are named by role: `dex-ink` (navy outlines, dark fills, viewer bezel), `dex-frame` (device body), `dex-surface` (sections), `dex-paper` (cards, inputs), `dex-line` (light borders and dashed dividers), `dex-muted` (secondary text), `dex-accent` (primary action, selected letter, Pokédex number) and `dex-ok`. `shadow-hard` and `shadow-device` are the hard shadows.
  - Component classes are in `src/index.css`: `dex-device`, `dex-section`, `dex-title`, `dex-label`, `dex-divider`, `dex-tile`, `dex-btn` and `dex-input`.
  - A `dex-btn` with `aria-pressed="true"` fills navy. Add `dex-chip-accent` to make it fill red instead, or use `dex-btn-accent` for an always-red primary button.
  - Fonts are Space Mono (`font-display`, for titles, labels, numbers and buttons) and Plus Jakarta Sans (`font-body`, the default). Both are bundled through `@fontsource`; don't load them from a CDN.
  - Wrap sections in `SectionPanel`; its `aside` prop holds the status text on the right of the title row.
- `src/App.test.tsx`: a smoke test that mounts the whole app with `fetch` mocked by URL. When you add a new endpoint, add its response to the mock.
- Browser storage access is always wrapped in try/catch, because it can throw in private mode.
