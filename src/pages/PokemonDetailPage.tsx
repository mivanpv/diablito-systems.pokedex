import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage';
import Loader from '../components/Loader';
import StatBar from '../components/StatBar';
import TcgCardTile from '../components/TcgCardTile';
import TypeBadge from '../components/TypeBadge';
import { useAsync } from '../hooks/useAsync';
import { isNotFound } from '../services/http';
import {
  artworkUrl,
  getPokemon,
  getSpecies,
  spanishDescription,
  spanishGenus,
  spanishName,
} from '../services/pokeapi';
import { searchCards } from '../services/tcgdex';
import { capitalize, padId } from '../utils/format';
import { STAT_LABELS } from '../utils/i18n';

const CARDS_PER_PAGE = 24;

export default function PokemonDetailPage() {
  const { name = '' } = useParams();

  const { data, error, loading } = useAsync(
    async (signal) => {
      const pokemon = await getPokemon(name, signal);
      const species = await getSpecies(pokemon.species.name, signal);
      return { pokemon, species };
    },
    [name]
  );

  if (loading) return <Loader label="Cargando Pokémon…" />;
  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <ErrorMessage>
          {isNotFound(error)
            ? `No encontramos ningún Pokémon llamado «${name}».`
            : `No se pudo cargar el Pokémon: ${error.message}`}
        </ErrorMessage>
        <Link to="/" className="text-poke-red underline">
          ← Volver a la Pokédex
        </Link>
      </div>
    );
  }
  if (!data) return null;

  const { pokemon, species } = data;
  const displayName = spanishName(species) ?? capitalize(pokemon.name);
  const image = pokemon.sprites.other?.['official-artwork']?.front_default ?? artworkUrl(pokemon.id);

  return (
    <div className="flex flex-col gap-8">
      <nav className="flex justify-between text-sm">
        {pokemon.id > 1 ? (
          <Link to={`/pokemon/${pokemon.id - 1}`} className="text-poke-red hover:underline">
            ← {padId(pokemon.id - 1)}
          </Link>
        ) : (
          <span />
        )}
        <Link to="/" className="text-slate-500 hover:underline">
          Pokédex
        </Link>
        <Link to={`/pokemon/${pokemon.id + 1}`} className="text-poke-red hover:underline">
          {padId(pokemon.id + 1)} →
        </Link>
      </nav>

      <section className="grid gap-6 rounded-2xl bg-white p-6 shadow-sm md:grid-cols-2">
        <img src={image} alt={displayName} className="mx-auto aspect-square w-full max-w-xs object-contain" />
        <div className="flex flex-col gap-4">
          <div>
            <span className="text-sm font-medium text-slate-400">{padId(pokemon.id)}</span>
            <h1 className="text-3xl font-bold">{displayName}</h1>
            {spanishGenus(species) && <p className="text-slate-500">{spanishGenus(species)}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            {pokemon.types.map((t) => (
              <TypeBadge key={t.type.name} type={t.type.name} />
            ))}
          </div>
          {spanishDescription(species) && <p className="text-slate-700">{spanishDescription(species)}</p>}
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <dt className="text-slate-500">Altura</dt>
              <dd className="font-semibold">{(pokemon.height / 10).toFixed(1)} m</dd>
            </div>
            <div>
              <dt className="text-slate-500">Peso</dt>
              <dd className="font-semibold">{(pokemon.weight / 10).toFixed(1)} kg</dd>
            </div>
          </dl>
          <div className="flex flex-col gap-2">
            <h2 className="font-semibold">Estadísticas base</h2>
            {pokemon.stats.map((s) => (
              <StatBar key={s.stat.name} label={STAT_LABELS[s.stat.name] ?? s.stat.name} value={s.base_stat} />
            ))}
          </div>
        </div>
      </section>

      {/* key resets the "show more" counter when navigating between Pokémon */}
      <TcgCardsSection key={species.name} pokemonName={species.name} displayName={displayName} />
    </div>
  );
}

function TcgCardsSection({ pokemonName, displayName }: { pokemonName: string; displayName: string }) {
  const [visible, setVisible] = useState(CARDS_PER_PAGE);
  const { data, error, loading } = useAsync((signal) => searchCards(pokemonName, signal), [pokemonName]);

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">
        Cartas TCG de {displayName}
        {data && <span className="ml-2 text-sm font-normal text-slate-500">({data.cards.length})</span>}
      </h2>

      {loading && <Loader label="Buscando cartas…" />}
      {error && <ErrorMessage>No se pudieron cargar las cartas: {error.message}</ErrorMessage>}
      {data && data.cards.length === 0 && (
        <p className="text-sm text-slate-500">No hay cartas registradas para este Pokémon.</p>
      )}
      {data && data.lang === 'en' && data.cards.length > 0 && (
        <p className="text-xs text-slate-500">No hay cartas en español; se muestran las ediciones en inglés.</p>
      )}

      {data && data.cards.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {data.cards.slice(0, visible).map((card) => (
              <TcgCardTile key={card.id} card={card} lang={data.lang} />
            ))}
          </div>
          {visible < data.cards.length && (
            <button
              onClick={() => setVisible((v) => v + CARDS_PER_PAGE)}
              className="self-center rounded-lg bg-white px-4 py-2 font-medium shadow-sm hover:bg-slate-50"
            >
              Ver más cartas
            </button>
          )}
        </>
      )}
    </section>
  );
}
