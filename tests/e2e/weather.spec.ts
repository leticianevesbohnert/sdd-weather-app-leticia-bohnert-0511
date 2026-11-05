import { expect, type Page, test } from '@playwright/test';

const geocoding = {
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
};

const homonymousCities = {
  results: [
    {
      id: 2,
      name: 'São Paulo',
      country: 'Brasil',
      admin1: 'São Paulo',
      latitude: -23.55,
      longitude: -46.63,
    },
    {
      id: 3,
      name: 'São Paulo',
      country: 'Brasil',
      admin1: 'Amazonas',
      latitude: -7.6,
      longitude: -63.03,
    },
  ],
};

const forecast = {
  current: {
    time: '2026-06-16T12:00',
    temperature_2m: 0,
    relative_humidity_2m: 80,
    wind_speed_10m: 10,
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

async function mockApis(page: Page, geocodingResponse = geocoding) {
  await page.route('**/geocoding-api.open-meteo.com/**', (route) =>
    route.fulfill({ json: geocodingResponse }),
  );
  await page.route('**/api.open-meteo.com/**', (route) => route.fulfill({ json: forecast }));
}

test('fluxo completo: buscar, consultar previsão, trocar unidade e reabrir histórico', async ({
  page,
}) => {
  await mockApis(page);
  await page.goto('/');

  await page.getByLabel(/buscar cidade/i).fill('Seattle');
  await page.getByRole('button', { name: /buscar/i }).click();

  await expect(page.getByRole('heading', { name: 'Seattle' })).toBeVisible();
  await expect(page.getByRole('region', { name: /previsão dos próximos 5 dias/i })).toBeVisible();

  await expect(page.getByText('0°C').first()).toBeVisible();
  await page.getByRole('button', { name: '°F' }).click();
  await expect(page.getByText('32°F').first()).toBeVisible();

  const history = page.getByRole('region', { name: /buscas recentes/i });
  const recentCity = history.getByRole('button', { name: 'Seattle, Washington' });
  await expect(recentCity).toBeVisible();
  await recentCity.click();
  await expect(page.getByRole('heading', { name: 'Seattle' })).toBeVisible();
});

test('seleciona a cidade correta entre resultados homônimos', async ({ page }) => {
  await mockApis(page, homonymousCities);
  await page.goto('/');

  await page.getByLabel(/buscar cidade/i).fill('São Paulo');
  await page.getByRole('button', { name: /buscar/i }).click();

  const amazonasCity = page.getByRole('button', { name: 'São Paulo, Amazonas, Brasil' });
  await expect(amazonasCity).toBeVisible();
  await amazonasCity.click();
  await expect(amazonasCity).toHaveAttribute('aria-pressed', 'true');
});

test('estado vazio quando a cidade não existe', async ({ page }) => {
  await page.route('**/geocoding-api.open-meteo.com/**', (route) => route.fulfill({ json: {} }));
  await page.goto('/');

  await page.getByLabel(/buscar cidade/i).fill('xyzxyz');
  await page.getByRole('button', { name: /buscar/i }).click();

  await expect(page.getByText(/nenhuma cidade encontrada/i)).toBeVisible();
});

test('permite tentar novamente após falha ao carregar o clima', async ({ page }) => {
  let forecastAttempts = 0;
  await page.route('**/geocoding-api.open-meteo.com/**', (route) =>
    route.fulfill({ json: geocoding }),
  );
  await page.route('**/api.open-meteo.com/**', (route) => {
    forecastAttempts += 1;
    return forecastAttempts === 1
      ? route.fulfill({ status: 503, json: { error: 'indisponível' } })
      : route.fulfill({ json: forecast });
  });
  await page.goto('/');

  await page.getByLabel(/buscar cidade/i).fill('Seattle');
  await page.getByRole('button', { name: /buscar/i }).click();
  await expect(page.getByRole('alert')).toContainText('Não foi possível carregar o clima');

  await page.getByRole('button', { name: /tentar novamente/i }).click();
  await expect(page.getByRole('heading', { name: 'Seattle' })).toBeVisible();
  expect(forecastAttempts).toBe(2);
});

test('viewport mobile renderiza o fluxo principal', async ({ page }) => {
  await mockApis(page);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');

  await page.getByLabel(/buscar cidade/i).fill('Seattle');
  await page.getByRole('button', { name: /buscar/i }).click();
  await expect(page.getByRole('heading', { name: 'Seattle' })).toBeVisible();
  const { documentWidth, viewportWidth } = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  expect(documentWidth).toBeLessThanOrEqual(viewportWidth);
});
