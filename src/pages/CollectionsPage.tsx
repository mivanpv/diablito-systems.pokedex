import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import SectionPanel from '../components/SectionPanel';
import { useCollections } from '../context/CollectionsContext';
import { spriteUrl } from '../services/pokeapi';
import { DEFAULT_LIST_ID, PokemonList } from '../utils/collections';
import { capitalize, padId } from '../utils/format';

/** "Mi colección": every saved list with its Pokémon; create, delete lists and remove Pokémon. */
export default function CollectionsPage() {
  const { lists, lastListId, savedCount, createList } = useCollections();
  const [newName, setNewName] = useState('');

  const handleCreate = (event: FormEvent) => {
    event.preventDefault();
    if (createList(newName)) setNewName('');
  };

  return (
    <div className="flex flex-col gap-5">
      <SectionPanel title="Mi colección" aside={`${savedCount} Pokémon guardados · ${lists.length} listas`}>
        <form onSubmit={handleCreate} className="flex gap-3">
          <input
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="Nombre de la nueva lista…"
            aria-label="Nombre de la nueva lista"
            maxLength={40}
            className="dex-input flex-1"
          />
          <button type="submit" className="dex-btn dex-btn-accent px-4 text-sm" disabled={!newName.trim()}>
            + Crear lista
          </button>
        </form>
        <p className="text-sm text-dex-muted">
          Guarda Pokémon desde el visor con el botón <b>☆ Agregar</b>. La última lista que uses queda seleccionada.
        </p>
      </SectionPanel>

      {lists.map((list) => (
        <ListPanel key={list.id} list={list} isCurrent={list.id === lastListId} />
      ))}
    </div>
  );
}

function ListPanel({ list, isCurrent }: { list: PokemonList; isCurrent: boolean }) {
  const { remove, deleteList } = useCollections();
  const [confirming, setConfirming] = useState(false);
  const canDelete = list.id !== DEFAULT_LIST_ID;

  return (
    <SectionPanel
      title={list.name}
      aside={
        <span className="flex items-center gap-2">
          {isCurrent && (
            <span className="rounded bg-dex-ink px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">Actual</span>
          )}
          {list.pokemon.length} Pokémon
        </span>
      }
    >
      {list.pokemon.length === 0 ? (
        <p className="text-sm text-dex-muted">Esta lista está vacía.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {list.pokemon.map((p) => (
            <li key={p.id} className="dex-tile relative flex flex-col items-center gap-1 p-2">
              <Link to={`/pokemon/${p.name}`} className="flex w-full flex-col items-center gap-1 hover:opacity-80">
                <img src={spriteUrl(p.id)} alt="" loading="lazy" className="sprite h-16 w-16" />
                <span className="w-full truncate text-center text-sm font-bold">{capitalize(p.name)}</span>
                <span className="font-display text-[11px] text-dex-muted">{padId(p.id)}</span>
              </Link>
              <button
                type="button"
                onClick={() => remove(list.id, p.id)}
                aria-label={`Quitar ${capitalize(p.name)} de ${list.name}`}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded border-2 border-dex-ink bg-dex-paper text-xs hover:bg-red-50 hover:text-dex-accent"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {canDelete && (
        <div className="flex justify-end gap-2 border-t-2 border-dashed border-dex-line pt-3">
          {confirming ? (
            <>
              <span className="self-center text-sm">¿Eliminar «{list.name}»?</span>
              <button type="button" className="dex-btn dex-btn-accent" onClick={() => deleteList(list.id)}>
                Sí, eliminar
              </button>
              <button type="button" className="dex-btn" onClick={() => setConfirming(false)}>
                Cancelar
              </button>
            </>
          ) : (
            <button type="button" className="dex-btn" onClick={() => setConfirming(true)}>
              Eliminar lista
            </button>
          )}
        </div>
      )}
    </SectionPanel>
  );
}
