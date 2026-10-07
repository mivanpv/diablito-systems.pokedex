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
  /** Cry audio (OGG). `legacy` is the original 8-bit cry, only for older Pokémon. */
  cries?: { latest: string | null; legacy: string | null };
  /** `ability` can be null for removed abilities. */
  abilities: { ability: NamedAPIResource | null; is_hidden: boolean; slot: number }[];
  /** Every move the Pokémon can learn, with how/when per game (version group). */
  moves: {
    move: NamedAPIResource;
    version_group_details: {
      level_learned_at: number;
      move_learn_method: NamedAPIResource;
      version_group: NamedAPIResource;
    }[];
  }[];
  species: NamedAPIResource;
  sprites: {
    front_default: string | null;
    front_shiny?: string | null;
    other?: {
      'official-artwork'?: { front_default: string | null };
    };
    versions?: {
      'generation-v'?: {
        'black-white'?: { animated?: { front_default: string | null; front_shiny?: string | null } };
      };
    };
  };
}

export interface Ability {
  id: number;
  name: string;
  names: { name: string; language: NamedAPIResource }[];
  flavor_text_entries: {
    flavor_text: string;
    language: NamedAPIResource;
    version_group: NamedAPIResource;
  }[];
  /** Detailed battle effect; PokéAPI has no Spanish entries for these. */
  effect_entries: { effect: string; short_effect: string; language: NamedAPIResource }[];
}

export interface Move {
  id: number;
  name: string;
  names: { name: string; language: NamedAPIResource }[];
  type: NamedAPIResource;
  /** physical | special | status */
  damage_class: NamedAPIResource | null;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  priority: number;
  /** Percent chance of the secondary effect; replaces `$effect_chance` in effect texts. */
  effect_chance: number | null;
  flavor_text_entries: { flavor_text: string; language: NamedAPIResource; version_group: NamedAPIResource }[];
  /** English/other languages only in PokéAPI. */
  effect_entries: { effect: string; short_effect: string; language: NamedAPIResource }[];
}

/** Lightweight list entry; the id is parsed from the resource URL. */
export interface PokemonSummary {
  id: number;
  name: string;
}

export interface TypeDetail {
  id: number;
  name: string;
  pokemon: { slot: number; pokemon: NamedAPIResource }[];
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
  evolution_chain: { url: string } | null;
}

/** One way a species evolves (PokéAPI lists several per game; `is_default` marks the main one). */
export interface EvolutionDetail {
  is_default?: boolean;
  trigger: NamedAPIResource | null;
  min_level: number | null;
  item: NamedAPIResource | null;
  held_item: NamedAPIResource | null;
  known_move: NamedAPIResource | null;
  known_move_type: NamedAPIResource | null;
  location: NamedAPIResource | null;
  min_happiness: number | null;
  min_affection: number | null;
  min_beauty: number | null;
  time_of_day: string;
}

export interface ChainLink {
  species: NamedAPIResource;
  is_baby: boolean;
  /** How this species evolves from its parent (empty for the base species). */
  evolution_details: EvolutionDetail[];
  evolves_to: ChainLink[];
}

export interface EvolutionChain {
  id: number;
  chain: ChainLink;
}
