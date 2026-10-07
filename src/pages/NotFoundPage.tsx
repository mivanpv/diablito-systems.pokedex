import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-slate-500">Esta página no existe… ¡quizá huyó como un Abra!</p>
      <Link to="/" className="rounded-lg bg-poke-red px-4 py-2 font-semibold text-white hover:bg-red-700">
        Volver a la Pokédex
      </Link>
    </div>
  );
}
