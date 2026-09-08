import { describe, expect, it } from 'vitest';
import { assignRiskBands, calculateVulnerability, canonicalCategoryKey, percentileRanks, selectNearestByMode } from '../src/index.js';

describe('normalização', () => {
  it('usa posto médio e inverte quando solicitado', () => {
    expect(percentileRanks([10, 20, 20, 40])).toEqual([0, 0.5, 0.5, 1]);
    expect(percentileRanks([10, 40], true)).toEqual([1, 0]);
    expect(percentileRanks([10])).toEqual([0.5]);
  });
});

describe('vulnerabilidade', () => {
  it('usa V06006 invertida e classifica ausências', () => {
    const result = calculateVulnerability([
      { geocode: '1', population: 10, medianIncomeBrl: 1000, childrenShare: .1, olderPeopleShare: .2 },
      { geocode: '2', population: 10, medianIncomeBrl: 3000, childrenShare: .2, olderPeopleShare: null }
    ]);
    expect(result[0]!.income.score).toBe(1);
    expect(result[1]!.confidence).toBe('partial');
  });
});

describe('distâncias e filtros', () => {
  it('seleciona destinos independentes com desempate por CNES', () => {
    const nearest = selectNearestByMode([
      { facilityCnesId: '002', straightLineM: 10, walkingM: 30, transitMinutes: 8 },
      { facilityCnesId: '001', straightLineM: 10, walkingM: 20, transitMinutes: 12 }
    ]);
    expect(nearest.straightLine?.facilityCnesId).toBe('001');
    expect(nearest.walking?.facilityCnesId).toBe('001');
    expect(nearest.transit?.facilityCnesId).toBe('002');
    expect(canonicalCategoryKey(['ubs', 'hospital', 'ubs'])).toBe('hospital,ubs');
  });

  it('promove empates na fronteira para maior risco', () => {
    expect(assignRiskBands([0, .2, .2, .7, 1])).toEqual([1, 3, 3, 4, 5]);
  });
});
