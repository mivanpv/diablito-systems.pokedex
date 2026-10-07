import { useEffect, useRef, useState } from 'react';

type CryKind = 'latest' | 'legacy';

interface CryButtonProps {
  cries: { latest: string | null; legacy: string | null } | undefined;
  displayName: string;
}

/** PokéAPI cries are OGG files, which some browsers (Safari) can't play. */
function canPlayOgg(): boolean {
  try {
    return document.createElement('audio').canPlayType('audio/ogg; codecs="vorbis"') !== '';
  } catch {
    return false;
  }
}

/**
 * 🔊 plays the Pokémon's cry; "8-bit" plays the original Game Boy-era cry when it exists.
 * The audio stops when the viewer switches Pokémon (this component is remounted).
 */
export default function CryButton({ cries, displayName }: CryButtonProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState<CryKind | null>(null);
  const [failed, setFailed] = useState(false);
  const [supported] = useState(canPlayOgg);

  useEffect(() => {
    const holder = audioRef;
    return () => holder.current?.pause();
  }, []);

  if (!cries?.latest && !cries?.legacy) return null;

  const play = (kind: CryKind) => {
    const url = cries[kind];
    if (!url) return;
    audioRef.current?.pause();

    const audio = new Audio(url);
    audio.volume = 0.6; // cries are loud
    audioRef.current = audio;
    setFailed(false);
    setPlaying(kind);

    const fail = () => {
      setPlaying(null);
      setFailed(true);
    };
    audio.addEventListener('ended', () => setPlaying(null));
    audio.addEventListener('error', fail);
    audio.play().catch(fail);
  };

  const unsupportedTitle = 'Tu navegador no puede reproducir el formato OGG de los sonidos (p. ej. Safari).';
  const baseClass = 'dex-btn py-1';

  return (
    <span className="inline-flex items-center gap-1.5">
      {cries.latest && (
        <button
          type="button"
          className={`${baseClass} px-2 ${playing === 'latest' ? 'animate-pulse' : ''}`}
          onClick={() => play('latest')}
          disabled={!supported}
          aria-label={`Escuchar el grito de ${displayName}`}
          title={supported ? `Escuchar el grito de ${displayName}` : unsupportedTitle}
        >
          <span aria-hidden="true">{playing === 'latest' ? '🔊' : '🔈'}</span>
        </button>
      )}
      {cries.legacy && (
        <button
          type="button"
          className={`${baseClass} px-1.5 text-[10px] ${playing === 'legacy' ? 'animate-pulse' : ''}`}
          onClick={() => play('legacy')}
          disabled={!supported}
          aria-label={`Escuchar el grito clásico (8 bits) de ${displayName}`}
          title={supported ? 'Grito clásico de los juegos originales' : unsupportedTitle}
        >
          8-bit
        </button>
      )}
      {failed && (
        <span role="status" className="font-display text-[10px] text-dex-accent">
          No se pudo reproducir
        </span>
      )}
    </span>
  );
}
