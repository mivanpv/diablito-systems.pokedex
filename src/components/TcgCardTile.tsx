import { Link } from 'react-router-dom';
import { cardImageUrl } from '../services/tcgdex';
import type { TcgCardBrief, TcgLang } from '../types/tcgdex';

interface TcgCardTileProps {
  card: TcgCardBrief;
  lang: TcgLang;
}

export default function TcgCardTile({ card, lang }: TcgCardTileProps) {
  const image = cardImageUrl(card, 'low');

  return (
    <Link
      to={`/carta/${lang}/${encodeURIComponent(card.id)}`}
      className="group flex flex-col gap-1 rounded-lg bg-white p-2 shadow-sm transition hover:shadow-md"
    >
      {image ? (
        <img
          src={image}
          alt={card.name}
          loading="lazy"
          className="aspect-[245/342] w-full rounded object-cover transition group-hover:scale-[1.02]"
        />
      ) : (
        <div className="flex aspect-[245/342] w-full items-center justify-center rounded bg-slate-100 p-2 text-center text-xs text-slate-400">
          Sin imagen
        </div>
      )}
      <span className="truncate text-xs font-medium" title={card.name}>
        {card.name}
      </span>
      <span className="text-[10px] text-slate-400">{card.id}</span>
    </Link>
  );
}
