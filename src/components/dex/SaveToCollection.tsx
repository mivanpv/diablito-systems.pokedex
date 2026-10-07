import { useCollections } from '../../context/CollectionsContext';
import SaveToListButton from '../SaveToListButton';

interface SaveToCollectionProps {
  pokemon: { id: number; name: string };
  displayName: string;
}

/** Saves the Pokémon into the last list used, or any list via the menu (which can create one). */
export default function SaveToCollection({ pokemon, displayName }: SaveToCollectionProps) {
  const { lists, lastListId, isIn, toggle, createList } = useCollections();

  return (
    <SaveToListButton
      lists={lists.map((l) => ({ id: l.id, name: l.name, count: l.pokemon.length }))}
      currentId={lastListId}
      isIn={(listId) => isIn(listId, pokemon.id)}
      onToggle={(listId) => toggle(listId, pokemon)}
      onCreate={(name) => createList(name, pokemon) !== null}
      itemName={displayName}
      texts={{
        choose: 'Elegir lista o crear una nueva',
        newPlaceholder: 'Nueva lista…',
        newLabel: 'Nombre de la nueva lista',
        hint: 'La lista que elijas queda seleccionada para la próxima vez.',
      }}
    />
  );
}
