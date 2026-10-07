import { Link } from 'react-router-dom';
import { artworkUrl } from '../services/pokeapi';
import { capitalize, padId } from '../utils/format';

interface PokemonCardProps {
  id: number;
  name: string;
}

export default function PokemonCard({ id, name }: PokemonCardProps) {
  return (
    <Link
      to={`/pokemon/${name}`}
      className="group flex flex-col items-center rounded-xl bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <img
        src={artworkUrl(id)}
        alt={capitalize(name)}
        loading="lazy"
        className="aspect-square w-full max-w-[140px] object-contain transition group-hover:scale-105"
      />
      <span className="mt-2 text-xs font-medium text-slate-400">{padId(id)}</span>
      <span className="text-center font-semibold">{capitalize(name)}</span>
    </Link>
  );
}
