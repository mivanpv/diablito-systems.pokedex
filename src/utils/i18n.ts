// PokéAPI type/stat identifiers -> Spanish labels and badge colors.

export const TYPE_INFO: Record<string, { label: string; color: string }> = {
  normal: { label: 'Normal', color: '#9fa19f' },
  fire: { label: 'Fuego', color: '#e62829' },
  water: { label: 'Agua', color: '#2980ef' },
  electric: { label: 'Eléctrico', color: '#fac000' },
  grass: { label: 'Planta', color: '#3fa129' },
  ice: { label: 'Hielo', color: '#3dcef3' },
  fighting: { label: 'Lucha', color: '#ff8000' },
  poison: { label: 'Veneno', color: '#9141cb' },
  ground: { label: 'Tierra', color: '#915121' },
  flying: { label: 'Volador', color: '#81b9ef' },
  psychic: { label: 'Psíquico', color: '#ef4179' },
  bug: { label: 'Bicho', color: '#91a119' },
  rock: { label: 'Roca', color: '#afa981' },
  ghost: { label: 'Fantasma', color: '#704170' },
  dragon: { label: 'Dragón', color: '#5060e1' },
  dark: { label: 'Siniestro', color: '#624d4e' },
  steel: { label: 'Acero', color: '#60a1b8' },
  fairy: { label: 'Hada', color: '#ef70ef' },
};

export const STAT_LABELS: Record<string, string> = {
  hp: 'PS',
  attack: 'Ataque',
  defense: 'Defensa',
  'special-attack': 'Ataque Esp.',
  'special-defense': 'Defensa Esp.',
  speed: 'Velocidad',
};
