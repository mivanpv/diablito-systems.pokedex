import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import BackButton from '../components/BackButton';
import SectionPanel from '../components/SectionPanel';
import { useCurrency } from '../context/CurrencyContext';
import { usePortfolios } from '../context/PortfoliosContext';
import { getCard } from '../services/tcgdex';
import { formatCurrency } from '../utils/format';
import { DEFAULT_PORTFOLIO_ID, Portfolio, PortfolioCard, Valuation, valuePortfolio } from '../utils/portfolios';
import { PriceSummary, summarizePricing } from '../utils/pricing';

type Summaries = Record<string, PriceSummary | null | undefined>;

/**
 * Loads each card's prices (cached by fetchJson) and fills the map as they arrive, so totals
 * update progressively. undefined = loading, null = no prices.
 */
function useCardSummaries(cards: PortfolioCard[]): Summaries {
  const [summaries, setSummaries] = useState<Summaries>({});
  const key = cards.map((c) => `${c.lang}:${c.id}`).join('|');

  useEffect(() => {
    const controller = new AbortController();
    cards.forEach((card) => {
      getCard(card.lang, card.id, controller.signal).then(
        (detail) => {
          if (!controller.signal.aborted) setSummaries((s) => ({ ...s, [card.id]: summarizePricing(detail.pricing) }));
        },
        () => {
          if (!controller.signal.aborted) setSummaries((s) => ({ ...s, [card.id]: null }));
        }
      );
    });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return summaries;
}

/** Formats amounts already converted to the selected currency. */
function useMoney() {
  const { currency, convertToSelected } = useCurrency();
  return {
    currency,
    convert: convertToSelected,
    format: (amount: number) => formatCurrency(amount, currency),
  };
}

export default function PortfoliosPage() {
  const { portfolios, cardCount, createPortfolio } = usePortfolios();
  const [newName, setNewName] = useState('');
  const { currency, convert, format } = useMoney();

  // One price lookup per distinct card across all portfolios.
  const allCards = useMemo(() => {
    const byId = new Map<string, PortfolioCard>();
    portfolios.forEach((p) => p.cards.forEach((c) => byId.set(c.id, c)));
    return Array.from(byId.values());
  }, [portfolios]);
  const summaries = useCardSummaries(allCards);

  const grandTotal = useMemo(
    () => valuePortfolio(portfolios.flatMap((p) => p.cards), summaries, convert),
    [portfolios, summaries, convert]
  );

  const handleCreate = (event: FormEvent) => {
    event.preventDefault();
    if (createPortfolio(newName)) setNewName('');
  };

  return (
    <div className="flex flex-col gap-5">
      <BackButton />
      <SectionPanel title="Mis portafolios" aside={`${cardCount} cartas · ${portfolios.length} portafolios`}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="dex-label">Valor total de mercado</span>
            <p className="font-display text-3xl font-bold text-dex-accent">{format(grandTotal.total)}</p>
            <p className="text-sm text-dex-muted">
              Rango: {format(grandTotal.low)} – {format(grandTotal.high)} · en {currency}
            </p>
          </div>
          <form onSubmit={handleCreate} className="flex min-w-0 basis-full gap-3 sm:min-w-[16rem] sm:max-w-md sm:flex-1">
            <input
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder="Nombre del nuevo portafolio…"
              aria-label="Nombre del nuevo portafolio"
              maxLength={40}
              className="dex-input min-w-0 flex-1"
            />
            <button type="submit" className="dex-btn dex-btn-accent px-4 text-sm" disabled={!newName.trim()}>
              + Crear
            </button>
          </form>
        </div>
        <ValuationNotes valuation={grandTotal} />
        <p className="text-sm text-dex-muted">
          Agrega cartas con el botón <b>＋ Agregar</b> en la pestaña <b>Cartas TCG</b> de cualquier Pokémon o en el detalle de
          una carta. El valor usa el precio de mercado de TCGplayer (o Cardmarket) × cantidad, convertido a tu moneda.
        </p>
      </SectionPanel>

      {portfolios.map((portfolio) => (
        <PortfolioPanel key={portfolio.id} portfolio={portfolio} summaries={summaries} />
      ))}
    </div>
  );
}

function ValuationNotes({ valuation }: { valuation: Valuation }) {
  const notes: string[] = [];
  if (valuation.pending > 0) notes.push(`Cargando precios de ${valuation.pending} carta(s)…`);
  if (valuation.unpriced > 0) notes.push(`${valuation.unpriced} carta(s) sin precio no se incluyen en el total.`);
  const unconverted = Object.entries(valuation.unconverted);
  if (unconverted.length > 0) {
    notes.push(
      `Sin tipo de cambio: ${unconverted.map(([cur, amount]) => formatCurrency(amount, cur)).join(' + ')} no se incluyen.`
    );
  }
  if (notes.length === 0) return null;
  return <p className="font-display text-[11px] text-dex-muted">{notes.join(' ')}</p>;
}

function PortfolioPanel({ portfolio, summaries }: { portfolio: Portfolio; summaries: Summaries }) {
  const { lastPortfolioId, deletePortfolio } = usePortfolios();
  const { convert, format } = useMoney();
  const [confirming, setConfirming] = useState(false);
  const valuation = useMemo(() => valuePortfolio(portfolio.cards, summaries, convert), [portfolio.cards, summaries, convert]);
  const copies = portfolio.cards.reduce((sum, c) => sum + c.quantity, 0);

  return (
    <SectionPanel
      title={portfolio.name}
      aside={
        <span className="flex items-center gap-2">
          {portfolio.id === lastPortfolioId && (
            <span className="rounded bg-dex-ink px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">Actual</span>
          )}
          {copies} cartas · <b className="text-dex-ink">{format(valuation.total)}</b>
        </span>
      }
    >
      {portfolio.cards.length === 0 ? (
        <p className="text-sm text-dex-muted">Este portafolio está vacío.</p>
      ) : (
        <>
          <div className="hidden grid-cols-[3rem_1fr_7rem_7.5rem_7rem_2rem] gap-3 px-2 sm:grid">
            <span />
            <span className="dex-label">Carta</span>
            <span className="dex-label text-right">Precio</span>
            <span className="dex-label text-center">Cantidad</span>
            <span className="dex-label text-right">Valor</span>
            <span />
          </div>
          <ul className="flex flex-col gap-2">
            {portfolio.cards.map((card) => (
              <CardRow key={card.id} portfolioId={portfolio.id} card={card} summary={summaries[card.id]} />
            ))}
          </ul>

          <div className="flex flex-wrap items-end justify-between gap-3 border-t-2 border-dashed border-dex-line pt-3">
            <ValuationNotes valuation={valuation} />
            <div className="ml-auto text-right">
              <span className="dex-label">Total del portafolio</span>
              <p className="font-display text-2xl font-bold">{format(valuation.total)}</p>
              <p className="text-xs text-dex-muted">
                Rango mín – máx: {format(valuation.low)} – {format(valuation.high)}
              </p>
            </div>
          </div>
        </>
      )}

      {portfolio.id !== DEFAULT_PORTFOLIO_ID && (
        <div className="flex justify-end gap-2 border-t-2 border-dashed border-dex-line pt-3">
          {confirming ? (
            <>
              <span className="self-center text-sm">¿Eliminar «{portfolio.name}»?</span>
              <button type="button" className="dex-btn dex-btn-accent" onClick={() => deletePortfolio(portfolio.id)}>
                Sí, eliminar
              </button>
              <button type="button" className="dex-btn" onClick={() => setConfirming(false)}>
                Cancelar
              </button>
            </>
          ) : (
            <button type="button" className="dex-btn" onClick={() => setConfirming(true)}>
              Eliminar portafolio
            </button>
          )}
        </div>
      )}
    </SectionPanel>
  );
}

interface CardRowProps {
  portfolioId: string;
  card: PortfolioCard;
  summary: PriceSummary | null | undefined;
}

function CardRow({ portfolioId, card, summary }: CardRowProps) {
  const { setQuantity, remove } = usePortfolios();
  const { convert, format } = useMoney();

  const unit = summary?.market != null ? convert(summary.market, summary.currency) : null;
  const priceText =
    summary === undefined
      ? 'Cargando…'
      : unit !== null
        ? format(unit)
        : summary?.market != null
          ? formatCurrency(summary.market, summary.currency)
          : 'Sin precio';
  const valueText = unit !== null ? format(unit * card.quantity) : '—';

  return (
    <li className="dex-tile grid grid-cols-[3rem_1fr_auto] items-center gap-x-3 gap-y-2 p-2 sm:grid-cols-[3rem_1fr_7rem_7.5rem_7rem_2rem]">
      {card.image ? (
        <img src={`${card.image}/low.webp`} alt="" loading="lazy" className="w-12 rounded" />
      ) : (
        <span className="flex h-16 w-12 items-center justify-center rounded bg-dex-surface text-[10px] text-dex-muted">—</span>
      )}
      <Link to={`/carta/${card.lang}/${encodeURIComponent(card.id)}`} className="min-w-0 hover:underline">
        <span className="block truncate text-sm font-bold">{card.name}</span>
        <span className="block font-display text-[11px] text-dex-muted">
          {card.id}
          {summary && ` · ${summary.source}`}
        </span>
      </Link>
      <span className="text-right font-display text-sm sm:order-none" title="Precio de mercado por carta">
        <span className="dex-label mr-1 sm:hidden">Precio</span>
        {priceText}
      </span>

      <div className="col-span-2 col-start-2 flex items-center gap-1 sm:col-span-1 sm:col-start-auto sm:justify-center">
        <button
          type="button"
          className="dex-btn h-7 w-7 p-0"
          onClick={() => setQuantity(portfolioId, card.id, card.quantity - 1)}
          disabled={card.quantity <= 1}
          aria-label={`Quitar una copia de ${card.name}`}
        >
          −
        </button>
        <span className="w-9 text-center font-display text-sm font-bold" aria-label={`Cantidad de ${card.name}`}>
          {card.quantity}
        </span>
        <button
          type="button"
          className="dex-btn h-7 w-7 p-0"
          onClick={() => setQuantity(portfolioId, card.id, card.quantity + 1)}
          aria-label={`Agregar una copia de ${card.name}`}
        >
          +
        </button>
      </div>

      <span className="text-right font-display text-sm font-bold" title="Precio × cantidad">
        <span className="dex-label mr-1 sm:hidden">Valor</span>
        {valueText}
      </span>
      <button
        type="button"
        onClick={() => remove(portfolioId, card.id)}
        aria-label={`Quitar ${card.name} del portafolio`}
        className="flex h-7 w-7 items-center justify-center justify-self-end rounded border-2 border-dex-ink text-xs hover:bg-red-50 hover:text-dex-accent"
      >
        ✕
      </button>
    </li>
  );
}
