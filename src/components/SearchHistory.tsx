import type { City } from '../types/weather';

interface SearchHistoryProps {
  cities: City[];
  error: string | null;
  onSelect: (city: City) => void;
  onClear: () => void;
}

export default function SearchHistory({ cities, error, onSelect, onClear }: SearchHistoryProps) {
  return (
    <section
      aria-labelledby="search-history-heading"
      className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 id="search-history-heading" className="font-semibold">
          Buscas recentes
        </h2>
        {cities.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-md px-2 py-1 text-sm text-white/70 underline-offset-4 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
          >
            Limpar histórico
          </button>
        )}
      </div>
      {cities.length === 0 ? (
        <p className="text-sm text-white/60">Suas cidades consultadas aparecerão aqui.</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {cities.map((city) => (
            <li key={city.id}>
              <button
                type="button"
                onClick={() => onSelect(city)}
                className="rounded-full border border-white/10 bg-night-800/70 px-3 py-2 text-sm text-white/80 transition hover:border-accent-400/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
              >
                {city.name}
                {city.admin1 ? `, ${city.admin1}` : ''}
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && (
        <p role="status" className="mt-3 text-sm text-amber-200">
          {error}
        </p>
      )}
    </section>
  );
}
