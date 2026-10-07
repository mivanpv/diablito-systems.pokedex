import type { ChainLink, EvolutionDetail } from '../types/pokeapi';
import { capitalize } from './format';
import { TYPE_INFO } from './i18n';

/** Where a species sits relative to the one being viewed. */
export type Relation = 'anterior' | 'actual' | 'proxima' | 'otra';

export interface EvolutionNode {
  id: number;
  name: string;
  /** How it evolves from the previous stage (null for the base species). */
  condition: string | null;
  relation: Relation;
}

function idFromSpeciesUrl(url: string): number {
  const segments = url.split('/').filter(Boolean);
  return Number(segments[segments.length - 1]);
}

/** Names on the path from the chain root down to `target` (inclusive), or [] if absent. */
function pathTo(link: ChainLink, target: string): string[] {
  if (link.species.name === target) return [target];
  for (const child of link.evolves_to) {
    const path = pathTo(child, target);
    if (path.length > 0) return [link.species.name, ...path];
  }
  return [];
}

function findLink(link: ChainLink, target: string): ChainLink | null {
  if (link.species.name === target) return link;
  for (const child of link.evolves_to) {
    const found = findLink(child, target);
    if (found) return found;
  }
  return null;
}

function collectNames(link: ChainLink, into: Set<string>): void {
  link.evolves_to.forEach((child) => {
    into.add(child.species.name);
    collectNames(child, into);
  });
}

/**
 * Flattens the evolution tree into stages (base, stage 1, stage 2...), tagging each
 * species as previous/current/next relative to `current`. Branches (Eevee) share a stage.
 */
export function buildStages(chain: ChainLink, current: string): EvolutionNode[][] {
  const path = pathTo(chain, current);
  const ancestors = new Set(path.slice(0, -1));
  const descendants = new Set<string>();
  const currentLink = findLink(chain, current);
  if (currentLink) collectNames(currentLink, descendants);

  const relationOf = (name: string): Relation => {
    if (name === current) return 'actual';
    if (ancestors.has(name)) return 'anterior';
    if (descendants.has(name)) return 'proxima';
    return 'otra';
  };

  const stages: EvolutionNode[][] = [];
  const visit = (link: ChainLink, depth: number) => {
    (stages[depth] = stages[depth] ?? []).push({
      id: idFromSpeciesUrl(link.species.url),
      name: link.species.name,
      condition: depth === 0 ? null : describeEvolution(link.evolution_details),
      relation: relationOf(link.species.name),
    });
    link.evolves_to.forEach((child) => visit(child, depth + 1));
  };
  visit(chain, 0);
  return stages;
}

const TIME_OF_DAY: Record<string, string> = { day: 'de día', night: 'de noche', dusk: 'al atardecer' };

/** Short Spanish description of how a species evolves ("Nv. 16", "Usar Water Stone"...). */
export function describeEvolution(details: EvolutionDetail[]): string {
  const detail = details.find((d) => d.is_default) ?? details[0];
  if (!detail) return 'Condición especial';

  const parts: string[] = [];
  const trigger = detail.trigger?.name;

  if (trigger === 'trade') parts.push('Intercambio');
  if (detail.min_level !== null) parts.push(`Nv. ${detail.min_level}`);
  if (detail.item) parts.push(`Usar ${capitalize(detail.item.name)}`);
  if (detail.held_item) parts.push(`Equipado con ${capitalize(detail.held_item.name)}`);
  if (detail.min_happiness !== null) parts.push('Amistad alta');
  if (detail.min_affection !== null) parts.push('Afecto alto');
  if (detail.min_beauty !== null) parts.push('Belleza alta');
  if (detail.known_move) parts.push(`Sabiendo ${capitalize(detail.known_move.name)}`);
  if (detail.known_move_type) {
    parts.push(`Movimiento tipo ${TYPE_INFO[detail.known_move_type.name]?.label ?? capitalize(detail.known_move_type.name)}`);
  }
  if (detail.location) parts.push(`En ${capitalize(detail.location.name)}`);
  if (detail.time_of_day && TIME_OF_DAY[detail.time_of_day]) parts.push(TIME_OF_DAY[detail.time_of_day]);

  if (parts.length > 0) return parts.join(' · ');
  if (trigger === 'level-up') return 'Subir de nivel';
  return trigger ? capitalize(trigger) : 'Condición especial';
}
