import { describe, expect, it } from 'vitest';
import { getDayLabel, getShortDate } from '../../src/lib/format';

describe('format', () => {
  it('rotula o primeiro dia como amanhã', () => {
    expect(getDayLabel('2026-06-17', 0)).toBe('Amanhã');
  });

  it('usa dia da semana para os demais', () => {
    expect(getDayLabel('2026-06-18', 1)).toBe('Qui');
  });

  it('formata data curta', () => {
    expect(getShortDate('2026-06-16')).toBe('16 Jun');
  });
});
