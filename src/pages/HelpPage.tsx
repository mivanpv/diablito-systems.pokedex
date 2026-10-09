import BackButton from '../components/BackButton';
import SectionPanel from '../components/SectionPanel';

// The manual lives in public/manual (regenerated with `npm run manual:capturas` and `npm run manual:pdf`).
export const MANUAL_HTML = `${process.env.PUBLIC_URL}/manual/index.html`;
export const MANUAL_PDF = `${process.env.PUBLIC_URL}/manual/Manual-de-usuario.pdf`;

/** Chapters of the manual, by their anchor in index.html. */
const CHAPTERS: [string, string][] = [
  ['pantalla', 'Conoce la pantalla'],
  ['buscar', 'Buscar un Pokémon'],
  ['visor', 'El visor del Pokémon'],
  ['pestanas', 'Las pestañas de información'],
  ['cartas', 'Cartas TCG y precios'],
  ['colecciones', 'Mis colecciones'],
  ['portafolios', 'Mis portafolios de cartas'],
  ['celular', 'Uso en el celular'],
  ['faq', 'Preguntas frecuentes'],
];

interface HelpOptionProps {
  icon: string;
  title: string;
  description: string;
  href: string;
  action: string;
  download?: string;
}

function HelpOption({ icon, title, description, href, action, download }: HelpOptionProps) {
  return (
    <div className="dex-tile flex flex-col gap-3 p-4">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border-2 border-dex-ink bg-dex-surface font-display text-lg font-bold"
        >
          {icon}
        </span>
        <h3 className="font-display text-base font-bold">{title}</h3>
      </div>
      <p className="flex-1 text-sm text-dex-muted">{description}</p>
      <a
        href={href}
        className="dex-btn dex-btn-accent self-start"
        {...(download ? { download } : { target: '_blank', rel: 'noreferrer' })}
      >
        {action}
      </a>
    </div>
  );
}

/** "Ayuda": lets the user read the manual online or download it as a PDF. */
export default function HelpPage() {
  return (
    <div className="flex flex-col gap-5">
      <BackButton />
      <SectionPanel title="Ayuda" aside="Manual de usuario">
        <p className="text-sm">
          El manual de usuario explica paso a paso cómo buscar Pokémon, consultar su información, ver los precios de sus
          cartas y organizar tus colecciones y portafolios. Elige cómo prefieres consultarlo:
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <HelpOption
            icon="▤"
            title="Leer en línea"
            description="Se abre en una pestaña nueva del navegador y se adapta al celular. Ideal para consultar un tema mientras usas la Pokédex."
            href={MANUAL_HTML}
            action="Abrir manual ↗"
          />
          <HelpOption
            icon="⇩"
            title="Descargar PDF"
            description="Un archivo con capturas de pantalla para guardar, imprimir o leer sin conexión."
            href={MANUAL_PDF}
            action="Descargar PDF"
            download="Manual-de-usuario-Pokedex.pdf"
          />
        </div>
      </SectionPanel>

      <SectionPanel title="Ir directo a un tema">
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {CHAPTERS.map(([anchor, label]) => (
            <li key={anchor}>
              <a
                href={`${MANUAL_HTML}#${anchor}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-2 rounded-md border-2 border-dex-line bg-dex-paper px-3 py-2 text-sm font-semibold transition hover:border-dex-ink"
              >
                {label}
                <span aria-hidden="true" className="font-display text-xs text-dex-muted">
                  ↗
                </span>
              </a>
            </li>
          ))}
        </ul>
      </SectionPanel>
    </div>
  );
}
