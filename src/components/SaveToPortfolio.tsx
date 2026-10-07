import { usePortfolios } from '../context/PortfoliosContext';
import type { CardRef } from '../utils/portfolios';
import SaveToListButton from './SaveToListButton';

interface SaveToPortfolioProps {
  card: CardRef;
  /** Narrow version for card tiles. */
  compact?: boolean;
}

/** Saves a TCG card into the last portfolio used, or any portfolio via the menu (which can create one). */
export default function SaveToPortfolio({ card, compact }: SaveToPortfolioProps) {
  const { portfolios, lastPortfolioId, isIn, toggle, createPortfolio } = usePortfolios();

  return (
    <SaveToListButton
      lists={portfolios.map((p) => ({ id: p.id, name: p.name, count: p.cards.length }))}
      currentId={lastPortfolioId}
      isIn={(portfolioId) => isIn(portfolioId, card.id)}
      onToggle={(portfolioId) => toggle(portfolioId, card)}
      onCreate={(name) => createPortfolio(name, card) !== null}
      itemName={card.name}
      texts={{
        choose: 'Elegir portafolio o crear uno nuevo',
        newPlaceholder: 'Nuevo portafolio…',
        newLabel: 'Nombre del nuevo portafolio',
        hint: 'El portafolio que elijas queda seleccionado para la próxima vez.',
      }}
      icons={{ saved: '✓', unsaved: '＋' }}
      compact={compact}
    />
  );
}
