import { FormEvent, useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Busca por nombre o número (ej. pikachu, 25)"
        aria-label="Buscar Pokémon"
        className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 focus:border-poke-red focus:outline-none focus:ring-2 focus:ring-poke-red/30"
      />
      <button
        type="submit"
        className="rounded-lg bg-poke-red px-4 py-2 font-semibold text-white hover:bg-red-700"
      >
        Buscar
      </button>
    </form>
  );
}
