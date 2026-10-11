/**
 * Formula 1 Constructor Liveries & Color Lookup for 2026 Season.
 * Team colours are DATA, not decoration. Fixed 1:1 mapping everywhere.
 */

export const TEAM_COLORS: Record<string, string> = {
  mercedes: '#27F4D2',
  ferrari: '#E8002D',
  mclaren: '#FF8000',
  red_bull: '#3671C6',
  rb: '#6692FF',
  aston_martin: '#229971',
  alpine: '#FF87BC',
  williams: '#64C4FF',
  haas: '#B6BABD',
  audi: '#EE3344',
  cadillac: '#D1D5DB',
};

export const FALLBACK_TEAM_COLOR = '#47E5BC';

export function getTeamColor(constructorId: string | undefined): string {
  if (!constructorId) return FALLBACK_TEAM_COLOR;
  return TEAM_COLORS[constructorId] ?? FALLBACK_TEAM_COLOR;
}
