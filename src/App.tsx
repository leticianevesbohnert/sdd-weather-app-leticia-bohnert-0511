import { useEffect, useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import SearchHistory from './components/SearchHistory';
import SearchResults from './components/SearchResults';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { useSearchHistory } from './hooks/useSearchHistory';
import { useWeather } from './hooks/useWeather';
import type { Unit } from './types/weather';

/**
 * WeatherView — aplicação completa de previsão do tempo.
 *
 * Construída ao longo do treinamento de Spec-Driven Development com GitHub
 * Copilot, do briefing à entrega.
 */
export default function App() {
  const { status, data, error, query, cities, search, selectCity, retry } = useWeather();
  const { history, error: historyError, recordCity, clearHistory } = useSearchHistory();
  const [unit, setUnit] = useState<Unit>('celsius');

  useEffect(() => {
    if (status === 'success' && data) recordCity(data.city);
  }, [status, data, recordCity]);

  return (
    <div className="flex min-h-screen flex-col text-white">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-night-900/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <a
            href="/"
            className="flex w-fit items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
          >
            <span
              aria-hidden="true"
              className="grid h-10 w-10 place-items-center rounded-xl border border-sun/20 bg-sun/10 text-xl text-sun"
            >
              ☀️
            </span>
            <span>
              <span className="block text-lg font-bold leading-tight">WeatherView</span>
              <span className="text-xs text-white/60">Previsão do tempo</span>
            </span>
          </a>
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center lg:w-[min(100%,48rem)]">
            <SearchBar onSearch={search} disabled={status === 'loading'} />
            <UnitToggle unit={unit} onChange={setUnit} />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        {status === 'idle' && (
          <EmptyState
            title="Busque uma cidade para começar"
            hint="Digite o nome de uma cidade brasileira para consultar as condições do tempo."
          />
        )}

        {status === 'loading' && <LoadingState />}

        {status === 'selecting' && (
          <p role="status" className="text-sm text-white/70">
            Selecione uma cidade para consultar o clima.
          </p>
        )}

        {status === 'empty' && (
          <EmptyState
            title={`Nenhuma cidade encontrada para "${query}"`}
            hint="Verifique a grafia e tente novamente."
          />
        )}

        {status === 'error' && error && <ErrorState message={error} onRetry={retry} />}

        <SearchResults
          cities={cities}
          selectedCityId={status === 'success' ? (data?.city.id ?? null) : null}
          disabled={status === 'loading'}
          onSelect={selectCity}
        />

        <SearchHistory
          cities={history}
          error={historyError}
          onSelect={selectCity}
          onClear={clearHistory}
        />

        {status === 'success' && data && (
          <>
            <CurrentWeather city={data.city} current={data.current} unit={unit} />
            <ForecastList forecast={data.forecast} unit={unit} />
          </>
        )}
      </main>

      <footer className="border-t border-white/10 px-4 py-6 text-center text-sm text-white/60">
        Dados por{' '}
        <a
          href="https://open-meteo.com/"
          target="_blank"
          rel="noreferrer"
          className="text-accent-400 hover:underline"
        >
          Open-Meteo
        </a>
      </footer>
    </div>
  );
}
