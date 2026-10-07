import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import BackButton from '../components/BackButton';
import ErrorMessage from '../components/ErrorMessage';
import Loader from '../components/Loader';
import PriceTag from '../components/PriceTag';
import SaveToPortfolio from '../components/SaveToPortfolio';
import SectionPanel from '../components/SectionPanel';
import { useCurrency } from '../context/CurrencyContext';
import { useAsync } from '../hooks/useAsync';
import { isNotFound } from '../services/http';
import { cardImageUrl, getCard } from '../services/tcgdex';
import type { CardmarketPricing, TcgPricing, TcgplayerVariantPricing } from '../types/tcgdex';

const CARDMARKET_FIELDS: [keyof CardmarketPricing, string][] = [
  ['trend', 'Tendencia'],
  ['avg', 'Promedio'],
  ['low', 'Mínimo'],
  ['avg30', 'Promedio 30 días'],
  ['trend-holo', 'Tendencia (holo)'],
  ['low-holo', 'Mínimo (holo)'],
];

const TCGPLAYER_FIELDS: [keyof TcgplayerVariantPricing, string][] = [
  ['marketPrice', 'Mercado'],
  ['lowPrice', 'Mínimo'],
  ['midPrice', 'Medio'],
  ['highPrice', 'Máximo'],
];

const TCGPLAYER_VARIANTS: Record<string, string> = {
  normal: 'Normal',
  holofoil: 'Holo',
  'reverse-holofoil': 'Reverse holo',
  '1st-edition': '1.ª edición',
  '1st-edition-holofoil': '1.ª edición holo',
  unlimited: 'Ilimitada',
  'unlimited-holofoil': 'Ilimitada holo',
};

interface PriceRow {
  label: string;
  amount: number;
}

function cardmarketRows(pricing: CardmarketPricing): PriceRow[] {
  return CARDMARKET_FIELDS.flatMap(([field, label]) => {
    const amount = pricing[field];
    return typeof amount === 'number' && amount > 0 ? [{ label, amount }] : [];
  });
}

function tcgplayerRows(pricing: NonNullable<TcgPricing['tcgplayer']>): PriceRow[] {
  return Object.entries(pricing).flatMap(([variant, value]) => {
    if (typeof value !== 'object' || value === null) return [];
    const variantLabel = TCGPLAYER_VARIANTS[variant] ?? variant;
    return TCGPLAYER_FIELDS.flatMap(([field, label]) => {
      const amount = value[field];
      return typeof amount === 'number' && amount > 0 ? [{ label: `${variantLabel} · ${label}`, amount }] : [];
    });
  });
}

function PriceTable({ title, currency, rows, updated }: { title: string; currency: string; rows: PriceRow[]; updated?: string }) {
  if (rows.length === 0) return null;

  return (
    <div className="dex-tile p-4">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="dex-title">{title}</h3>
        <span className="text-sm text-dex-muted">Precio original en {currency}</span>
      </div>
      <dl className="divide-y-2 divide-dashed divide-dex-line">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3 py-1.5 text-base">
            <dt>{row.label}</dt>
            <dd>
              <PriceTag amount={row.amount} sourceCurrency={currency} />
            </dd>
          </div>
        ))}
      </dl>
      {updated && (
        <p className="mt-2 text-sm text-dex-muted">Actualizado: {new Date(updated).toLocaleString('es-MX')}</p>
      )}
    </div>
  );
}

export default function TcgCardPage() {
  const { lang = 'es', id = '' } = useParams();
  const { currency, ratesError, lastUpdate } = useCurrency();
  const { data: card, error, loading } = useAsync((signal) => getCard(lang, id, signal), [lang, id]);

  // Block body on purpose: recent browsers make scrollTo() return a Promise, and React would
  // treat that returned value as the effect's cleanup ("destroy is not a function").
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const backButton = <BackButton />;

  if (loading) {
    return (
      <div className="flex flex-col gap-5">
        {backButton}
        <div className="dex-tile">
          <Loader label="Cargando carta" />
        </div>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="flex flex-col gap-5">
        {backButton}
        <ErrorMessage>
          {isNotFound(error) ? `La carta «${id}» no existe.` : `No se pudo cargar la carta: ${error?.message}`}
        </ErrorMessage>
      </div>
    );
  }

  const image = cardImageUrl(card, 'high');
  const cardmarket = card.pricing?.cardmarket;
  const tcgplayer = card.pricing?.tcgplayer;
  const hasPrices =
    (cardmarket && cardmarketRows(cardmarket).length > 0) || (tcgplayer && tcgplayerRows(tcgplayer).length > 0);

  const details: [string, string | number | undefined][] = [
    ['Categoría', card.category],
    ['Rareza', card.rarity],
    ['PS', card.hp],
    ['Tipo', card.types?.join(', ')],
    ['Fase', card.stage],
    ['Ilustrador', card.illustrator],
  ];

  return (
    <div className="flex flex-col gap-5">
      {backButton}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:items-start">
        <SectionPanel title="Carta TCG">
          {image ? (
            <img src={image} alt={card.name} className="mx-auto w-full max-w-sm rounded-xl border-[3px] border-dex-ink shadow-device" />
          ) : (
            <div className="dex-tile flex aspect-[245/342] w-full items-center justify-center font-display text-sm text-dex-muted">
              Sin imagen
            </div>
          )}
        </SectionPanel>

        <div className="flex flex-col gap-5">
          <SectionPanel title="Ficha">
            <div className="flex flex-col gap-4">
              <div>
                <h1 className="font-display text-2xl font-bold leading-tight">{card.name}</h1>
                <p className="text-sm text-dex-muted">
                  {card.set.name} · {card.localId}
                  {card.set.cardCount && `/${card.set.cardCount.official}`}
                </p>
              </div>
              <div>
                <SaveToPortfolio card={{ id: card.id, lang, name: card.name, image: card.image }} />
              </div>
              <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {details
                  .filter(([, value]) => value !== undefined && value !== '')
                  .map(([label, value]) => (
                    <div key={label}>
                      <dt className="dex-label">{label}</dt>
                      <dd className="font-display text-sm font-bold">{value}</dd>
                    </div>
                  ))}
              </dl>
            </div>
          </SectionPanel>

          <SectionPanel title={`Precios en ${currency}`}>
            {ratesError && (
              <ErrorMessage>No se pudieron obtener los tipos de cambio; se muestran los precios originales.</ErrorMessage>
            )}
            {!hasPrices && <p className="text-sm text-dex-muted">No hay información de precios para esta carta.</p>}
            {tcgplayer && (
              <PriceTable title="TCGplayer" currency={tcgplayer.unit} rows={tcgplayerRows(tcgplayer)} updated={tcgplayer.updated} />
            )}
            {cardmarket && (
              <PriceTable title="Cardmarket" currency={cardmarket.unit} rows={cardmarketRows(cardmarket)} updated={cardmarket.updated} />
            )}
            {hasPrices && lastUpdate && (
              <p className="text-xs text-dex-muted">
                Tipo de cambio de ExchangeRate-API, actualizado: {new Date(lastUpdate).toLocaleString('es-MX')}
              </p>
            )}
          </SectionPanel>
        </div>
      </div>
    </div>
  );
}
