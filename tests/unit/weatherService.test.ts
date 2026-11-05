import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

const CITY: City = {
  id: 1,
  name: 'Seattle',
  country: 'Estados Unidos',
  admin1: 'Washington',
  latitude: 47.6,
  longitude: -122.33,
};

function mockFetchOnce(body: unknown, ok = true) {
  return vi.fn().mockResolvedValue({
    ok,
    json: async () => body,
  } as Response);
}

describe('weatherService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('searchCities', () => {
    it('retorna lista vazia para input vazio sem chamar a rede', async () => {
      const fetchSpy = vi.fn();
      vi.stubGlobal('fetch', fetchSpy);
      const result = await searchCities('   ');
      expect(result).toEqual([]);
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('mapeia resultados de geocoding', async () => {
      vi.stubGlobal(
        'fetch',
        mockFetchOnce({
          results: [
            {
              id: 1,
              name: 'Seattle',
              country: 'Estados Unidos',
              admin1: 'Washington',
              latitude: 47.6,
              longitude: -122.33,
            },
          ],
        }),
      );
      const result = await searchCities('Seattle');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Seattle');
      const requestUrl = new URL(String(vi.mocked(fetch).mock.calls[0][0]));
      expect(requestUrl.searchParams.get('countryCode')).toBe('BR');
      expect(requestUrl.searchParams.get('count')).toBe('3');
    });

    it('retorna vazio quando não há results', async () => {
      vi.stubGlobal('fetch', mockFetchOnce({}));
      expect(await searchCities('xyzxyz')).toEqual([]);
    });

    it('lança erro tipado em resposta não-ok', async () => {
      vi.stubGlobal('fetch', mockFetchOnce({}, false));
      await expect(searchCities('Seattle')).rejects.toBeInstanceOf(WeatherServiceError);
    });
  });

  describe('getWeather', () => {
    it('mapeia current e daily para WeatherData', async () => {
      vi.stubGlobal(
        'fetch',
        mockFetchOnce({
          current: {
            time: '2026-06-16T12:00',
            temperature_2m: 18,
            relative_humidity_2m: 80,
            wind_speed_10m: 10,
            surface_pressure: 1015,
            precipitation: 0,
            weather_code: 3,
          },
          daily: {
            time: [
              '2026-06-16',
              '2026-06-17',
              '2026-06-18',
              '2026-06-19',
              '2026-06-20',
              '2026-06-21',
            ],
            weather_code: [3, 61, 80, 1, 0, null],
            temperature_2m_max: [20, 19, 22, 24, 25, null],
            temperature_2m_min: [12, 11, 13, 14, 15, null],
            wind_speed_10m_max: [10, 11, 12, 13, 14, 15],
            precipitation_probability_max: [20, 90, 70, 10, 0, null],
          },
        }),
      );

      const data = await getWeather(CITY);
      expect(data.current.temperature).toBe(18);
      expect(data.forecast).toHaveLength(5);
      expect(data.forecast[0].date).toBe('2026-06-17');
      expect(data.forecast[4].precipitationProbability).toBeNull();
      expect(data.forecast[4].max).toBeNull();
      expect(data.forecast[4].windSpeed).toBe(15);
    });

    it('mantém campos atuais ausentes como indisponíveis', async () => {
      vi.stubGlobal(
        'fetch',
        mockFetchOnce({
          current: {
            time: '2026-06-16T12:00',
            temperature_2m: null,
            relative_humidity_2m: null,
            wind_speed_10m: null,
            surface_pressure: null,
            precipitation: null,
            weather_code: null,
          },
          daily: { time: ['2026-06-17'] },
        }),
      );

      const data = await getWeather(CITY);
      expect(data.current.temperature).toBeNull();
      expect(data.current.humidity).toBeNull();
      expect(data.forecast[0].max).toBeNull();
    });

    it('lança erro quando a resposta está incompleta', async () => {
      vi.stubGlobal('fetch', mockFetchOnce({ current: null, daily: null }));
      await expect(getWeather(CITY)).rejects.toBeInstanceOf(WeatherServiceError);
    });
  });
});
