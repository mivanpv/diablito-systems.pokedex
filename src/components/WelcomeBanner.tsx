import { useEffect, useState } from 'react';
import { Link, useMatch } from 'react-router-dom';

export const WELCOME_KEY = 'pokedex:welcome-dismissed';

function wasDismissed(): boolean {
  try {
    return localStorage.getItem(WELCOME_KEY) === '1';
  } catch {
    return false;
  }
}

function rememberDismissed() {
  try {
    localStorage.setItem(WELCOME_KEY, '1');
  } catch {
    // private mode: the banner shows again next visit
  }
}

/**
 * First-visit notice pointing new users to the help page. It goes away for good when closed or
 * once the user opens the help page.
 */
export default function WelcomeBanner() {
  const [dismissed, setDismissed] = useState(wasDismissed);
  const onHelpPage = useMatch('/ayuda') !== null;

  useEffect(() => {
    if (onHelpPage && !dismissed) {
      rememberDismissed();
      setDismissed(true);
    }
  }, [onHelpPage, dismissed]);

  if (dismissed) return null;

  const close = () => {
    rememberDismissed();
    setDismissed(true);
  };

  return (
    <aside
      aria-label="Bienvenida"
      className="mb-3 flex flex-wrap items-center gap-3 rounded-lg border-2 border-dex-ink bg-dex-paper px-3 py-2 shadow-hard sm:mb-5"
    >
      <span
        aria-hidden="true"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-dex-accent font-display text-sm font-bold text-white"
      >
        ?
      </span>
      <p className="min-w-0 flex-1 basis-48 text-sm">
        <b>¿Primera vez en la Pokédex?</b> Consulta el manual de usuario para conocer todo lo que puedes hacer.
      </p>
      <div className="flex gap-2">
        <Link to="/ayuda" className="dex-btn dex-btn-accent">
          Ver ayuda
        </Link>
        <button type="button" className="dex-btn px-2.5" onClick={close} aria-label="Cerrar aviso de bienvenida">
          ✕
        </button>
      </div>
    </aside>
  );
}
