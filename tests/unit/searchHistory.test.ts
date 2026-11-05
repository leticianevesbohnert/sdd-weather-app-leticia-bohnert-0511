import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  getSearchHistory,
  SEARCH_HISTORY_LIMIT,
  saveSearchHistory,
  updateSearchHistory,
} from '../../src/services/searchHistory';
import type { City } from '../../src/types/weather';

const city = (id: number): City => ({
  id,
  name: `Cidade ${id}`,
  country: 'Brasil',
  admin1: 'Estado',
  latitude: -10,
  longitude: -50,
});

describe('searchHistory', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('mantém cidades recentes sem duplicatas e respeita o limite', () => {
    let history = Array.from({ length: SEARCH_HISTORY_LIMIT }, (_, index) => city(index + 1));
    history = updateSearchHistory(history, city(2));
    expect(history.map(({ id }) => id)).toEqual([2, 1, 3, 4, 5]);

    history = updateSearchHistory(history, city(6));
    expect(history.map(({ id }) => id)).toEqual([6, 2, 1, 3, 4]);
  });

  it('salva e carrega o histórico do navegador', () => {
    const history = [city(2), city(1)];
    saveSearchHistory(history);
    expect(getSearchHistory()).toEqual(history);
  });

  it('reporta conteúdo salvo inválido em vez de descartá-lo silenciosamente', () => {
    window.localStorage.setItem('weatherview.search-history', '{invalid');
    expect(() => getSearchHistory()).toThrow(/histórico salvo está inválido/i);
  });
});
