import { useLocation, useNavigate } from 'react-router-dom';

/**
 * "◄ Volver": returns to the previous in-app page (keeping its Pokémon, tab and filters,
 * which live in the URL). When the page was opened directly (shared link, reload), there's
 * no in-app history — React Router marks that first entry with key "default" — so it goes
 * to `fallback` instead of leaving the site.
 */
export default function BackButton({ fallback = '/' }: { fallback?: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const hasInAppHistory = location.key !== 'default';

  return (
    <button
      type="button"
      onClick={() => (hasInAppHistory ? navigate(-1) : navigate(fallback))}
      className="dex-btn self-start"
    >
      ◄ Volver
    </button>
  );
}
