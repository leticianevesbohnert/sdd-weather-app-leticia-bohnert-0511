import { getDayLabel, getShortDate } from '../lib/format';
import { formatTemperature, unitLabel } from '../lib/temperature';
import { getWeatherIcon, getWeatherLabel } from '../lib/weatherCodes';
import type { ForecastDay, Unit } from '../types/weather';

interface ForecastCardProps {
  day: ForecastDay;
  index: number;
  unit: Unit;
}

/** Card de um dia da previsão. */
export default function ForecastCard({ day, index, unit }: ForecastCardProps) {
  const temperature = (value: number | null) =>
    value === null
      ? 'Indisponível'
      : `${formatTemperature(value, unit)}${unitLabel(unit).slice(1)}`;

  return (
    <li className="flex min-w-0 flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-center backdrop-blur-md sm:p-4">
      <p className="font-semibold">{getDayLabel(day.date, index)}</p>
      <p className="text-xs text-white/50">{getShortDate(day.date)}</p>
      <span aria-hidden="true" className="text-3xl" title={getWeatherLabel(day.weatherCode)}>
        {getWeatherIcon(day.weatherCode)}
      </span>
      <p className="flex flex-wrap justify-center gap-x-2 text-sm">
        <span className="font-semibold">
          <span className="sr-only">Máxima: </span>
          {temperature(day.max)}
        </span>
        <span className="text-white/70">
          <span className="sr-only">Mínima: </span>
          {temperature(day.min)}
        </span>
      </p>
      <p className="text-xs text-accent-400">
        💧{' '}
        {day.precipitationProbability === null
          ? 'Indisponível'
          : `${day.precipitationProbability}%`}
      </p>
      <p className="text-xs text-white/60">
        💨 {day.windSpeed === null ? 'Indisponível' : `${Math.round(day.windSpeed)} km/h`}
      </p>
    </li>
  );
}
