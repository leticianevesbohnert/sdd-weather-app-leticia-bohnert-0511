import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';

const cities = [
  {
    id: 1,
    name: 'São Paulo',
    country: 'Brasil',
    admin1: 'São Paulo',
    latitude: -23.55,
    longitude: -46.63,
  },
  {
    id: 2,
    name: 'São Paulo',
    country: 'Brasil',
    admin1: 'Amazonas',
    latitude: -7.6,
    longitude: -63.03,
  },
];

const forecast = {
  current: {
    time: '2026-06-16T12:00',
    temperature_2m: 18,
    relative_humidity_2m: 75,
    wind_speed_10m: 12,
    surface_pressure: 1015,
    precipitation: 0,
    weather_code: 3,
  },
  daily: {
    time: ['2026-06-16', '2026-06-17', '2026-06-18', '2026-06-19', '2026-06-20', '2026-06-21'],
    weather_code: [3, 61, 80, 1, 0, 2],
    temperature_2m_max: [20, 19, 22, 24, 25, 23],
    temperature_2m_min: [12, 11, 13, 14, 15, 14],
    wind_speed_10m_max: [10, 11, 12, 13, 14, 15],
    precipitation_probability_max: [20, 90, 70, 10, 0, 30],
  },
};

function installWeatherResponses() {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    const body = url.includes('geocoding-api') ? { results: cities } : forecast;
    return {
      ok: true,
      json: async () => body,
    } as Response;
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renderiza a marca e o estado inicial vazio', () => {
    render(<App />);
    expect(screen.getByText('WeatherView')).toBeInTheDocument();
    expect(screen.getByText(/busque uma cidade para começar/i)).toBeInTheDocument();
  });

  it('mostra a barra de busca e o alternador de unidade', () => {
    render(<App />);
    expect(screen.getByLabelText(/buscar cidade/i)).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /unidade de temperatura/i })).toBeInTheDocument();
  });

  it('permite desambiguar cidades e abrir outra opção sem refazer a busca', async () => {
    const user = userEvent.setup();
    const fetchMock = installWeatherResponses();
    render(<App />);

    await user.type(screen.getByRole('textbox', { name: /buscar cidade/i }), 'São Paulo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    const results = await screen.findByRole('region', { name: /resultados da busca/i });
    expect(results).toHaveTextContent('Cidades encontradas');
    expect(screen.getByRole('button', { name: 'São Paulo, São Paulo, Brasil' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'São Paulo, Amazonas, Brasil' })).toBeVisible();

    await user.click(screen.getByRole('button', { name: /São Paulo, Amazonas, Brasil/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /São Paulo, Amazonas, Brasil/i })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);

    await user.click(screen.getByRole('button', { name: '°F' }));
    expect(screen.getByText('64°F')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(await screen.findByRole('heading', { name: 'Buscas recentes' })).toBeInTheDocument();
  });

  it('repete a busca após erro de geocoding e mostra estado vazio quando não há cidade', async () => {
    const user = userEvent.setup();
    let geocodingAttempts = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        if (String(input).includes('geocoding-api')) {
          geocodingAttempts += 1;
          if (geocodingAttempts === 1) throw new Error('offline');
          return {
            ok: true,
            json: async () => ({ results: [] }),
          } as Response;
        }
        return { ok: true, json: async () => forecast } as Response;
      }),
    );
    render(<App />);

    await user.type(screen.getByRole('textbox', { name: /buscar cidade/i }), 'Cidade teste');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Falha de rede');

    await user.click(screen.getByRole('button', { name: /tentar novamente/i }));
    expect(await screen.findByText(/nenhuma cidade encontrada/i)).toBeInTheDocument();
    expect(geocodingAttempts).toBe(2);
  });

  it('reabre cidades do histórico e permite apagá-lo', async () => {
    const user = userEvent.setup();
    const fetchMock = installWeatherResponses();
    render(<App />);

    await user.type(screen.getByRole('textbox', { name: /buscar cidade/i }), 'São Paulo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await screen.findByRole('region', { name: /clima atual/i });
    await waitFor(() => {
      expect(window.localStorage.getItem('weatherview.search-history')).toContain('São Paulo');
    });

    const history = screen.getByRole('region', { name: /buscas recentes/i });
    await user.click(within(history).getByRole('button', { name: /São Paulo, São Paulo/i }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));

    await user.click(screen.getByRole('button', { name: /limpar histórico/i }));
    expect(
      await screen.findByText(/suas cidades consultadas aparecerão aqui/i),
    ).toBeInTheDocument();
    expect(window.localStorage.getItem('weatherview.search-history')).toBe('[]');
  });
});
