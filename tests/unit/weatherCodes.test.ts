import { describe, expect, it } from 'vitest';
import { getWeatherIcon, getWeatherInfo, getWeatherLabel } from '../../src/lib/weatherCodes';

describe('weatherCodes', () => {
  it('mapeia códigos conhecidos', () => {
    expect(getWeatherLabel(0)).toBe('Céu limpo');
    expect(getWeatherIcon(95)).toBe('⛈️');
  });

  it('usa fallback para código desconhecido', () => {
    const info = getWeatherInfo(123456);
    expect(info.label).toBe('Condição desconhecida');
    expect(info.icon).toBeTruthy();
  });

  it('identifica condição ausente como indisponível', () => {
    expect(getWeatherLabel(null)).toBe('Condição indisponível');
  });
});
