import type { City } from '../types/weather';

interface SearchResultsProps {
  cities: City[];
  selectedCityId: number | null;
  disabled?: boolean;
  onSelect: (city: City) => void;
}

function cityLocation(city: City): string {
  return [city.admin1, city.country].filter(Boolean).join(', ');
}

export default function SearchResults({
  cities,
  selectedCityId,
  disabled = false,
  onSelect,
}: SearchResultsProps) {
  if (cities.length === 0) return null;

  return (
    <section
      aria-label="Resultados da busca"
      className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md shadow-glass"
    >
      <h2 className="mb-3 text-sm font-semibold text-white/70">Cidades encontradas</h2>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {cities.slice(0, 3).map((city) => (
          <li key={city.id}>
            <button
              type="button"
              aria-label={`${city.name}, ${cityLocation(city) || 'Localização não informada'}`}
              aria-pressed={selectedCityId === city.id}
              disabled={disabled}
              onClick={() => onSelect(city)}
              className="flex min-h-14 w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-night-800/70 px-4 py-3 text-left transition hover:border-accent-400/60 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 disabled:cursor-wait disabled:opacity-60"
            >
              <span className="min-w-0">
                <span className="block truncate font-semibold">{city.name}</span>
                <span className="block truncate text-sm text-white/60">
                  {cityLocation(city) || 'Localização não informada'}
                </span>
              </span>
              <span aria-hidden="true" className="text-accent-400">
                →
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
