import { Link } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';
import { useAsync } from '../hooks/useAsync';
import { cardImageUrl, getCard } from '../services/tcgdex';
import type { TcgCardBrief, TcgLang } from '../types/tcgdex';
import { formatCurrency } from '../utils/format';
import { PriceSummary, summarizePricing } from '../utils/pricing';
import SaveToPortfolio from './SaveToPortfolio';

interface TcgCardTileProps {
  card: TcgCardBrief;
  lang: TcgLang;
}

export default function TcgCardTile({ card, lang }: TcgCardTileProps) {
  const image = cardImageUrl(card, 'low');
  // The search result has no prices; load the card's detail (cached, so the detail page opens instantly).
  const { data, error, loading } = useAsync((signal) => getCard(lang, card.id, signal), [lang, card.id]);
  const summary = data ? summarizePricing(data.pricing) : null;

  // A button can't live inside a link: the link covers image, name and price; the portfolio button sits below.
  return (
    <div className="dex-tile flex flex-col gap-2 p-2 transition hover:border-dex-ink">
      <Link to={`/carta/${lang}/${encodeURIComponent(card.id)}`} className="group flex flex-1 flex-col gap-1.5">
        {image ? (
          <img
            src={image}
            alt={card.name}
            loading="lazy"
            className="aspect-[245/342] w-full rounded object-cover transition group-hover:-translate-y-0.5"
          />
        ) : (
          <div className="flex aspect-[245/342] w-full items-center justify-center rounded bg-dex-surface p-2 text-center font-display text-[11px] text-dex-muted">
            Sin imagen
          </div>
        )}
        <span className="truncate text-sm font-semibold leading-tight" title={card.name}>
          {card.name}
        </span>
        <span className="font-display text-[10px] text-dex-muted">{card.id}</span>

        <div className="mt-auto rounded bg-dex-surface px-1.5 py-1">
          {loading && <span className="font-display text-[10px] text-dex-muted">Cargando precio…</span>}
          {(error || (data && !summary)) && <span className="font-display text-[10px] text-dex-muted">Sin precio</span>}
          {summary && <PriceLines summary={summary} />}
        </div>
      </Link>
      <SaveToPortfolio card={{ id: card.id, lang, name: card.name, image: card.image }} compact />
    </div>
  );
}

function PriceLines({ summary }: { summary: PriceSummary }) {
  const { currency, convertToSelected } = useCurrency();
  // Converted to the selected currency; shown in the source currency if rates are unavailable.
  const format = (amount: number | null) => {
    if (amount === null) return '—';
    const converted = convertToSelected(amount, summary.currency);
    return converted === null ? formatCurrency(amount, summary.currency) : formatCurrency(converted, currency);
  };

  return (
    <div
      className="flex flex-col gap-0.5"
      title={`Precios de ${summary.source} (${summary.currency}), convertidos a ${currency}`}
    >
      <div className="flex items-baseline justify-between gap-1">
        <span className="font-display text-[9px] font-bold uppercase text-dex-muted">Mercado</span>
        <span className="font-display text-xs font-bold text-dex-ink">{format(summary.market)}</span>
      </div>
      <div className="flex flex-col">
        <span className="font-display text-[9px] font-bold uppercase text-dex-muted">Rango mín – máx</span>
        <span className="font-display text-[10px] leading-tight text-dex-ink">
          {format(summary.low)} – {format(summary.high)}
        </span>
      </div>
    </div>
  );
}
