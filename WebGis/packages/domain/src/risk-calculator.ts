import type { RiskBand } from './model.js';
import { meanAvailable } from './normalization.js';

export function offerDensity(reachableFacilities: number, population: number): number | null {
  return population > 0 ? reachableFacilities * 10_000 / population : null;
}

export function riskScore(distance: number | null, offerRisk: number | null, vulnerability: number | null): number | null {
  return meanAvailable([distance, offerRisk, vulnerability], 3);
}

export function assignRiskBands(scores: readonly (number | null)[]): (RiskBand | null)[] {
  const valid = scores.flatMap((score, index) => score === null ? [] : [{ score, index }])
    .sort((a, b) => a.score - b.score || a.index - b.index);
  const bands: (RiskBand | null)[] = scores.map(() => null);
  for (let start = 0; start < valid.length;) {
    let end = start;
    while (end + 1 < valid.length && valid[end + 1]!.score === valid[start]!.score) end += 1;
    const theoretical = Math.min(5, Math.floor((end * 5) / Math.max(valid.length, 1)) + 1) as RiskBand;
    for (let cursor = start; cursor <= end; cursor += 1) bands[valid[cursor]!.index] = theoretical;
    start = end + 1;
  }
  return bands;
}
