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
    vi.useRealTimers();
  });

  describe('searchCities', () => {
    it('retorna lista vazia para input vazio sem chamar a rede', async () => {
      const fetchSpy = vi.fn();
      vi.stubGlobal('fetch', fetchSpy);
      const result = await searchCities('   ');
      expect(result).toEqual([]);
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('envia os parâmetros de geocoding e mapeia cidades brasileiras', async () => {
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
      const result = await searchCities('  São Paulo  ');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Seattle');
      expect(result[0]).toMatchObject({
        id: 1,
        country: 'Estados Unidos',
        admin1: 'Washington',
        latitude: 47.6,
        longitude: -122.33,
      });
      const requestUrl = new URL(String(vi.mocked(fetch).mock.calls[0][0]));
      expect(requestUrl.searchParams.get('name')).toBe('São Paulo');
      expect(requestUrl.searchParams.get('countryCode')).toBe('BR');
      expect(requestUrl.searchParams.get('count')).toBe('3');
      expect(requestUrl.searchParams.get('language')).toBe('pt');
      expect(requestUrl.searchParams.get('format')).toBe('json');
    });

    it('retorna vazio quando não há results', async () => {
      vi.stubGlobal('fetch', mockFetchOnce({}));
      expect(await searchCities('xyzxyz')).toEqual([]);
    });

    it('lança erro tipado em resposta não-ok', async () => {
      vi.stubGlobal('fetch', mockFetchOnce({}, false));
      await expect(searchCities('Seattle')).rejects.toBeInstanceOf(WeatherServiceError);
    });

    it('normaliza falhas de rede como erro tipado', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));
      await expect(searchCities('Seattle')).rejects.toMatchObject({
        name: 'WeatherServiceError',
        message: 'Falha de rede. Verifique sua conexão.',
      });
    });

    it('normaliza timeout como erro tipado', async () => {
      vi.useFakeTimers();
      const fetchMock = vi.fn(
        (_input: RequestInfo | URL, init?: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener(
              'abort',
              () => reject(new DOMException('Aborted', 'AbortError')),
              { once: true },
            );
          }),
      );
      vi.stubGlobal('fetch', fetchMock);

      const request = searchCities('Seattle');
      const rejection = expect(request).rejects.toMatchObject({
        name: 'WeatherServiceError',
        message: 'A requisição demorou demais. Tente novamente.',
      });
      await vi.advanceTimersByTimeAsync(10_000);
      await rejection;
      expect(fetchMock).toHaveBeenCalledOnce();
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
      expect(data.current).toMatchObject({
        humidity: 80,
        windSpeed: 10,
        pressure: 1015,
        precipitation: 0,
        weatherCode: 3,
      });
      expect(data.forecast).toHaveLength(5);
      expect(data.forecast[0].date).toBe('2026-06-17');
      expect(data.forecast[0]).toMatchObject({
        weatherCode: 61,
        max: 19,
        min: 11,
        windSpeed: 11,
        precipitationProbability: 90,
      });
      expect(data.forecast.map(({ date }) => date)).not.toContain('2026-06-16');
      expect(data.forecast[4].precipitationProbability).toBeNull();
      expect(data.forecast[4].max).toBeNull();
      expect(data.forecast[4].windSpeed).toBe(15);
      const requestUrl = new URL(String(vi.mocked(fetch).mock.calls[0][0]));
      expect(requestUrl.searchParams.get('latitude')).toBe(String(CITY.latitude));
      expect(requestUrl.searchParams.get('longitude')).toBe(String(CITY.longitude));
      expect(requestUrl.searchParams.get('forecast_days')).toBe('6');
      expect(requestUrl.searchParams.get('timezone')).toBe('auto');
      expect(requestUrl.searchParams.get('current')).toContain('temperature_2m');
      expect(requestUrl.searchParams.get('daily')).toContain('precipitation_probability_max');
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

    it('lança erro tipado quando a API de previsão responde com falha HTTP', async () => {
      vi.stubGlobal('fetch', mockFetchOnce({}, false));
      await expect(getWeather(CITY)).rejects.toMatchObject({
        name: 'WeatherServiceError',
        message: 'Não foi possível carregar o clima. Tente novamente.',
      });
    });

    it('mantém campos meteorológicos opcionais ausentes como nulos', async () => {
      vi.stubGlobal(
        'fetch',
        mockFetchOnce({
          current: {
            time: '2026-06-16T12:00',
            temperature_2m: 18,
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
      expect(data.current).toMatchObject({
        humidity: null,
        windSpeed: null,
        pressure: null,
        precipitation: null,
        weatherCode: null,
      });
      expect(data.forecast[0]).toMatchObject({
        weatherCode: null,
        max: null,
        min: null,
        windSpeed: null,
        precipitationProbability: null,
      });
    });
  });
});
