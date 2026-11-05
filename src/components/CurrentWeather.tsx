import { formatTemperature, unitLabel } from '../lib/temperature';
import { getWeatherIcon, getWeatherLabel } from '../lib/weatherCodes';
import type { City, CurrentWeather as CurrentWeatherType, Unit } from '../types/weather';

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherType;
  unit: Unit;
}

interface MetricProps {
  icon: string;
  label: string;
  value: string;
}

function Metric({ icon, label, value }: MetricProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
      <span aria-hidden="true" className="text-xl">
        {icon}
      </span>
      <div>
        <p className="text-xs text-white/50">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );
}

/** Seção "hero" com as condições atuais da cidade selecionada. */
export default function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const location = [city.admin1, city.country].filter(Boolean).join(', ');
  const temperature =
    current.temperature === null ? 'Indisponível' : formatTemperature(current.temperature, unit);
  const metricValue = (value: number | null, suffix: string, digits = 0) =>
    value === null ? 'Indisponível' : `${value.toFixed(digits)}${suffix}`;

  return (
    <section
      aria-label="Clima atual"
      className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.03] p-5 shadow-glass backdrop-blur-md sm:p-7 md:p-9"
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-accent-400">
            Clima agora
          </p>
          <h2 className="truncate text-2xl font-bold sm:text-3xl">{city.name}</h2>
          {location && <p className="mt-1 text-white/70">{location}</p>}

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
            <span aria-hidden="true" className="text-5xl sm:text-6xl">
              {getWeatherIcon(current.weatherCode)}
            </span>
            <span className="sr-only">
              Temperatura atual: {temperature}
              {current.temperature !== null && unitLabel(unit).slice(1)}
            </span>
            <span aria-hidden="true" className="text-6xl font-light tracking-tight sm:text-7xl">
              {temperature}
              {current.temperature !== null && unitLabel(unit).slice(1)}
            </span>
          </div>
          <p className="mt-2 text-base text-white/80">{getWeatherLabel(current.weatherCode)}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:w-[min(100%,30rem)]">
          <Metric icon="💧" label="Umidade" value={metricValue(current.humidity, '%')} />
          <Metric icon="💨" label="Vento" value={metricValue(current.windSpeed, ' km/h')} />
          <Metric
            icon="🌧️"
            label="Precipitação"
            value={metricValue(current.precipitation, ' mm', 1)}
          />
          <Metric icon="📊" label="Pressão" value={metricValue(current.pressure, ' hPa')} />
        </div>
      </div>
    </section>
  );
}
