import { useState } from 'react';
import { useAsync } from '../../hooks/useAsync';
import { searchCards } from '../../services/tcgdex';
import ErrorMessage from '../ErrorMessage';
import Loader from '../Loader';
import TcgCardTile from '../TcgCardTile';

const CARDS_PER_PAGE = 12;

export default function TcgCardsSection({ pokemonName, displayName }: { pokemonName: string; displayName: string }) {
  const [visible, setVisible] = useState(CARDS_PER_PAGE);
  const { data, error, loading } = useAsync((signal) => searchCards(pokemonName, signal), [pokemonName]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <span className="dex-label">Cartas de {displayName}</span>
        {data && <span className="font-display text-xs font-bold">{data.cards.length}</span>}
      </div>

      {loading && <Loader label="Buscando cartas" />}
      {error && <ErrorMessage>No se pudieron cargar las cartas: {error.message}</ErrorMessage>}
      {data && data.cards.length === 0 && (
        <p className="text-sm text-dex-muted">No hay cartas registradas para este Pokémon.</p>
      )}
      {data && data.lang === 'en' && data.cards.length > 0 && (
        <p className="text-sm text-dex-muted">No hay cartas en español; se muestran las ediciones en inglés.</p>
      )}

      {data && data.cards.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {data.cards.slice(0, visible).map((card) => (
              <TcgCardTile key={card.id} card={card} lang={data.lang} />
            ))}
          </div>
          {visible < data.cards.length && (
            <button onClick={() => setVisible((v) => v + CARDS_PER_PAGE)} className="dex-btn self-center">
              Ver más cartas ▼
            </button>
          )}
        </>
      )}
    </div>
  );
}
