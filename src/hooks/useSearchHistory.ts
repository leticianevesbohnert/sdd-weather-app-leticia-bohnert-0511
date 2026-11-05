import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getSearchHistory,
  saveSearchHistory,
  updateSearchHistory,
} from '../services/searchHistory';
import type { City } from '../types/weather';

interface UseSearchHistoryResult {
  history: City[];
  error: string | null;
  recordCity: (city: City) => void;
  clearHistory: () => void;
}

export function useSearchHistory(): UseSearchHistoryResult {
  const [history, setHistory] = useState<City[]>([]);
  const [error, setError] = useState<string | null>(null);
  const historyRef = useRef(history);

  useEffect(() => {
    try {
      const stored = getSearchHistory();
      historyRef.current = stored;
      setHistory(stored);
    } catch {
      setError('Não foi possível carregar o histórico salvo neste dispositivo.');
    }
  }, []);

  const recordCity = useCallback((city: City) => {
    const updated = updateSearchHistory(historyRef.current, city);
    historyRef.current = updated;
    setHistory(updated);
    try {
      saveSearchHistory(updated);
      setError(null);
    } catch {
      setError('O clima foi carregado, mas não foi possível salvar o histórico.');
    }
  }, []);

  const clearHistory = useCallback(() => {
    historyRef.current = [];
    setHistory([]);
    try {
      saveSearchHistory([]);
      setError(null);
    } catch {
      setError('Não foi possível apagar o histórico salvo neste dispositivo.');
    }
  }, []);

  return { history, error, recordCity, clearHistory };
}
