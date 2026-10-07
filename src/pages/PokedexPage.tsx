import { useNavigate, useSearchParams } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage';
import Loader from '../components/Loader';
import Pagination from '../components/Pagination';
import PokemonCard from '../components/PokemonCard';
import SearchBar from '../components/SearchBar';
import { useAsync } from '../hooks/useAsync';
import { getPokemonList, idFromUrl, PAGE_SIZE } from '../services/pokeapi';

export default function PokedexPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get('page')) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const { data, error, loading } = useAsync((signal) => getPokemonList(offset, signal), [offset]);
  const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 1;

  const handleSearch = (query: string) => {
    // "#025" or "025" -> 25; anything else is treated as a name.
    const numeric = query.replace(/^#/, '');
    const target = /^\d+$/.test(numeric) ? String(Number(numeric)) : query.toLowerCase().replace(/\s+/g, '-');
    navigate(`/pokemon/${encodeURIComponent(target)}`);
  };

  const goToPage = (next: number) => setParams({ page: String(next) });

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Pokédex</h1>
        <p className="text-sm text-slate-500">
          Explora todos los Pokémon, consulta sus cartas del TCG y el precio de cada una en tu moneda.
        </p>
        <SearchBar onSearch={handleSearch} />
      </section>

      {loading && <Loader />}
      {error && <ErrorMessage>No se pudo cargar la Pokédex: {error.message}</ErrorMessage>}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {data.results.map((pokemon) => (
              <PokemonCard key={pokemon.name} id={idFromUrl(pokemon.url)} name={pokemon.name} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
        </>
      )}
    </div>
  );
}
