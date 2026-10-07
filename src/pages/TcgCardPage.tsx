import { useNavigate, useParams } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage';
import Loader from '../components/Loader';
import PriceTag from '../components/PriceTag';
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
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-baseline justify-between">
        <h3 className="font-semibold">{title}</h3>
        <span className="text-xs text-slate-400">Precio original en {currency}</span>
      </div>
      <dl className="divide-y divide-slate-100">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between py-2 text-sm">
            <dt className="text-slate-600">{row.label}</dt>
            <dd>
              <PriceTag amount={row.amount} sourceCurrency={currency} />
            </dd>
          </div>
        ))}
      </dl>
      {updated && (
        <p className="mt-2 text-xs text-slate-400">
          Actualizado: {new Date(updated).toLocaleString('es-MX')}
        </p>
      )}
    </div>
  );
}

export default function TcgCardPage() {
  const { lang = 'es', id = '' } = useParams();
  const navigate = useNavigate();
  const { currency, ratesError, lastUpdate } = useCurrency();
  const { data: card, error, loading } = useAsync((signal) => getCard(lang, id, signal), [lang, id]);

  if (loading) return <Loader label="Cargando carta…" />;
  if (error || !card) {
    return (
      <ErrorMessage>
        {isNotFound(error) ? `La carta «${id}» no existe.` : `No se pudo cargar la carta: ${error?.message}`}
      </ErrorMessage>
    );
  }

  const image = cardImageUrl(card, 'high');
  const cardmarket = card.pricing?.cardmarket;
  const tcgplayer = card.pricing?.tcgplayer;
  const hasPrices =
    (cardmarket && cardmarketRows(cardmarket).length > 0) || (tcgplayer && tcgplayerRows(tcgplayer).length > 0);

  return (
    <div className="flex flex-col gap-6">
      <button onClick={() => navigate(-1)} className="self-start text-sm text-poke-red hover:underline">
        ← Volver
      </button>

      <div className="grid gap-8 md:grid-cols-[minmax(0,22rem)_1fr]">
        {image ? (
          <img src={image} alt={card.name} className="mx-auto w-full max-w-sm rounded-xl shadow-lg" />
        ) : (
          <div className="flex aspect-[245/342] w-full max-w-sm items-center justify-center rounded-xl bg-slate-200 text-slate-500">
            Sin imagen
          </div>
        )}

        <div className="flex flex-col gap-5">
          <div>
            <h1 className="text-3xl font-bold">{card.name}</h1>
            <p className="text-slate-500">
              {card.set.name} · {card.localId}
              {card.set.cardCount && `/${card.set.cardCount.official}`}
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            {[
              ['Categoría', card.category],
              ['Rareza', card.rarity],
              ['PS', card.hp],
              ['Tipo', card.types?.join(', ')],
              ['Fase', card.stage],
              ['Ilustrador', card.illustrator],
            ]
              .filter(([, value]) => value !== undefined && value !== '')
              .map(([label, value]) => (
                <div key={label}>
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="font-semibold">{value}</dd>
                </div>
              ))}
          </dl>

          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-bold">Precios en {currency}</h2>
            {ratesError && (
              <ErrorMessage>No se pudieron obtener los tipos de cambio; se muestran los precios originales.</ErrorMessage>
            )}
            {!hasPrices && <p className="text-sm text-slate-500">No hay información de precios para esta carta.</p>}
            {tcgplayer && (
              <PriceTable title="TCGplayer" currency={tcgplayer.unit} rows={tcgplayerRows(tcgplayer)} updated={tcgplayer.updated} />
            )}
            {cardmarket && (
              <PriceTable title="Cardmarket" currency={cardmarket.unit} rows={cardmarketRows(cardmarket)} updated={cardmarket.updated} />
            )}
            {hasPrices && lastUpdate && (
              <p className="text-xs text-slate-400">
                Tipo de cambio de ExchangeRate-API, actualizado: {new Date(lastUpdate).toLocaleString('es-MX')}
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
