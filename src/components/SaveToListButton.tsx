import { FormEvent, useEffect, useRef, useState } from 'react';

export interface ListOption {
  id: string;
  name: string;
  /** Items in the list, shown next to its name. */
  count: number;
}

export interface SaveToListTexts {
  /** Accessible name of the caret button, e.g. "Elegir lista o crear una nueva". */
  choose: string;
  /** Placeholder / accessible name of the "create" input. */
  newPlaceholder: string;
  newLabel: string;
  /** Hint under the menu. */
  hint: string;
}

interface SaveToListButtonProps {
  lists: ListOption[];
  /** List used by the main button (the last one the user saved into). */
  currentId: string;
  isIn: (listId: string) => boolean;
  onToggle: (listId: string) => void;
  /** Creates a list (and saves the item into it); returns false if nothing was created. */
  onCreate: (name: string) => boolean;
  /** Name of the item being saved, for the menu title. */
  itemName: string;
  texts: SaveToListTexts;
  icons?: { saved: string; unsaved: string };
  /** Narrow version for small tiles: shorter label, centered menu. */
  compact?: boolean;
}

/**
 * Split button shared by collections and portfolios: the main part saves into (or removes from)
 * the current list; the caret opens a menu to tick any list or create a new one.
 */
export default function SaveToListButton({
  lists,
  currentId,
  isIn,
  onToggle,
  onCreate,
  itemName,
  texts,
  icons = { saved: '★', unsaved: '☆' },
  compact = false,
}: SaveToListButtonProps) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);

  const current = lists.find((l) => l.id === currentId) ?? lists[0];
  const inCurrent = isIn(current.id);
  const savedAnywhere = lists.some((l) => isIn(l.id));

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleCreate = (event: FormEvent) => {
    event.preventDefault();
    if (onCreate(newName)) setNewName('');
  };

  const savedStyle = '!bg-yellow-300 !text-dex-ink';
  const label = inCurrent ? `En ${current.name}` : `Agregar a ${current.name}`;

  return (
    <div ref={rootRef} className={`relative inline-flex ${compact ? 'w-full' : ''}`}>
      <button
        type="button"
        className={`dex-btn min-w-0 rounded-r-none py-1 ${compact ? 'flex-1 px-1.5 text-[10px]' : ''} ${inCurrent ? savedStyle : ''}`}
        aria-pressed={inCurrent}
        onClick={() => onToggle(current.id)}
        title={inCurrent ? `Quitar de ${current.name}` : `Agregar a ${current.name}`}
      >
        <span aria-hidden="true">{inCurrent ? icons.saved : icons.unsaved}</span>
        <span className={`truncate ${compact ? '' : 'max-w-[9rem]'}`}>{label}</span>
      </button>
      <button
        type="button"
        className={`dex-btn rounded-l-none border-l-0 px-2 py-1 ${savedAnywhere ? savedStyle : ''}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={texts.choose}
        onClick={() => setOpen((o) => !o)}
      >
        ▾
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={`Guardar ${itemName}`}
          className={`absolute top-full z-30 mt-2 rounded-lg border-[3px] border-dex-ink bg-dex-paper p-3 shadow-device ${
            compact ? 'left-1/2 w-56 -translate-x-1/2' : 'left-0 w-72'
          }`}
        >
          <p className="dex-label mb-2 truncate">Guardar {itemName} en…</p>
          <ul className="flex max-h-56 flex-col gap-1 overflow-y-auto">
            {lists.map((list) => (
              <li key={list.id}>
                <label
                  className={`flex cursor-pointer items-center gap-2 rounded-md border-2 px-2 py-1.5 text-sm ${
                    list.id === current.id ? 'border-dex-ink' : 'border-transparent hover:bg-dex-surface'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isIn(list.id)}
                    onChange={() => onToggle(list.id)}
                    className="h-4 w-4 accent-dex-accent"
                  />
                  <span className="min-w-0 flex-1 truncate font-semibold">{list.name}</span>
                  {list.id === current.id && (
                    <span className="rounded bg-dex-ink px-1 font-display text-[9px] font-bold uppercase text-white">
                      Actual
                    </span>
                  )}
                  <span className="font-display text-[11px] text-dex-muted">{list.count}</span>
                </label>
              </li>
            ))}
          </ul>

          <form onSubmit={handleCreate} className="mt-3 flex gap-2 border-t-2 border-dashed border-dex-line pt-3">
            <input
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder={texts.newPlaceholder}
              aria-label={texts.newLabel}
              maxLength={40}
              className="dex-input min-w-0 flex-1 px-2 py-1.5 text-sm"
            />
            <button type="submit" className="dex-btn dex-btn-accent" disabled={!newName.trim()}>
              + Crear
            </button>
          </form>
          <p className="mt-2 text-[11px] leading-snug text-dex-muted">{texts.hint}</p>
        </div>
      )}
    </div>
  );
}
