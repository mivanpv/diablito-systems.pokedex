import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-xl rounded-xl border-[3px] border-dex-ink bg-dex-ink p-3">
      <div className="flex flex-col items-center gap-5 rounded-lg bg-dex-paper py-12 text-center">
        <h1 className="font-display text-5xl font-bold text-dex-accent">404</h1>
        <p className="text-base">
          Esta página no existe… ¡quizá huyó como un Abra!<span className="animate-blink">_</span>
        </p>
        <Link to="/" className="dex-btn">
          ◄ Volver a la Pokédex
        </Link>
      </div>
    </div>
  );
}
