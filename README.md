# Pokédex Web

Pokédex 100 % client-side hecha con React 18, TypeScript y Tailwind CSS (Create React App). No tiene backend: consume directamente tres APIs públicas que no requieren llave:

| API | Uso |
| --- | --- |
| [PokéAPI](https://pokeapi.co) | Lista, detalle, estadísticas y descripción en español de cada Pokémon |
| [TCGdex](https://tcgdex.dev) | Cartas del TCG de cada Pokémon (en español, con respaldo en inglés) y sus precios en TCGplayer (USD) y Cardmarket (EUR) |
| [ExchangeRate-API](https://www.exchangerate-api.com/docs/free) | Tipos de cambio para mostrar los precios en la moneda elegida (MXN por defecto) |

## Desarrollo

```bash
npm install
npm start          # http://localhost:3000
npm test           # pruebas en modo watch
npm run build      # build de producción en /build
```

## Despliegue en GitHub Pages

El proyecto ya está configurado (`homepage`, `gh-pages`, scripts `predeploy`/`deploy` y `HashRouter`).

1. Si tu usuario o repositorio no son `mivanpv` / `diablito-systems.pokedex`, ajusta el campo `homepage` en `package.json`.
2. Sube el código a GitHub (`git remote add origin ...` y `git push`).
3. Ejecuta:
   ```bash
   npm run deploy
   ```
   Esto genera el build y lo publica en la rama `gh-pages`.
4. La primera vez, en GitHub ve a **Settings → Pages** y selecciona la rama `gh-pages` / carpeta `/ (root)` como origen.

La app quedará en `https://mivanpv.github.io/diablito-systems.pokedex/`.

## Rutas

La Pokédex es una sola pantalla con diseño retro y tres secciones: **1) búsqueda directa** (nombre o número), **2) búsqueda avanzada** (por tipo, "Todos" por defecto, y por letra inicial) y **3) vista del Pokémon seleccionado** con sus cartas TCG.

- `#/` — Pokédex sin selección (tipo "Todos" y letra "A" por defecto; `?tipo=fire&letra=C` cambia los filtros)
- `#/pokemon/:name` — Pokédex con el Pokémon seleccionado (conserva los filtros y la pestaña abierta, p. ej. `?pestana=cartas`)
- `#/carta/:lang/:id` — carta TCG con precios convertidos a la moneda seleccionada
- `#/colecciones` — mis listas de Pokémon guardadas (Favoritos y las que crees), guardadas en el navegador
- `#/portafolios` — portafolios de cartas TCG con cantidad, valor por carta y total en tu moneda
