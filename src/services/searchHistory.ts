import type { City } from '../types/weather';

export const SEARCH_HISTORY_STORAGE_KEY = 'weatherview.search-history';
export const SEARCH_HISTORY_LIMIT = 5;

function isCity(value: unknown): value is City {
  if (typeof value !== 'object' || value === null) return false;
  const city = value as Partial<City>;
  return (
    typeof city.id === 'number' &&
    typeof city.name === 'string' &&
    typeof city.country === 'string' &&
    (city.admin1 === undefined || typeof city.admin1 === 'string') &&
    typeof city.latitude === 'number' &&
    typeof city.longitude === 'number'
  );
}

export function getSearchHistory(): City[] {
  const stored = window.localStorage.getItem(SEARCH_HISTORY_STORAGE_KEY);
  if (stored === null) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(stored);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('O histórico salvo está inválido e não pôde ser carregado.');
    }
    throw error;
  }

  if (!Array.isArray(parsed) || !parsed.every(isCity)) {
    throw new Error('O histórico salvo está inválido e não pôde ser carregado.');
  }
  return parsed.slice(0, SEARCH_HISTORY_LIMIT);
}

export function saveSearchHistory(cities: City[]): void {
  window.localStorage.setItem(
    SEARCH_HISTORY_STORAGE_KEY,
    JSON.stringify(cities.slice(0, SEARCH_HISTORY_LIMIT)),
  );
}

export function updateSearchHistory(history: City[], city: City): City[] {
  return [city, ...history.filter((item) => item.id !== city.id)].slice(0, SEARCH_HISTORY_LIMIT);
}
