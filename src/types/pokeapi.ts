export interface NamedAPIResource {
  name: string;
  url: string;
}

export interface NamedAPIResourceList {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedAPIResource[];
}

export interface PokemonType {
  slot: number;
  type: NamedAPIResource;
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: NamedAPIResource;
}

export interface Pokemon {
  id: number;
  name: string;
  height: number; // decimetres
  weight: number; // hectograms
  types: PokemonType[];
  stats: PokemonStat[];
  species: NamedAPIResource;
  sprites: {
    front_default: string | null;
    other?: {
      'official-artwork'?: { front_default: string | null };
    };
  };
}

export interface PokemonSpecies {
  id: number;
  name: string;
  names: { name: string; language: NamedAPIResource }[];
  genera: { genus: string; language: NamedAPIResource }[];
  flavor_text_entries: {
    flavor_text: string;
    language: NamedAPIResource;
    version: NamedAPIResource;
  }[];
}
