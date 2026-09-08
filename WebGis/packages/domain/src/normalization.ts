export function percentileRanks(values: readonly (number | null)[], invert = false): (number | null)[] {
  const valid = values.flatMap((value, index) => value === null || !Number.isFinite(value) ? [] : [{ value, index }]);
  if (valid.length === 0) return values.map(() => null);
  if (valid.length === 1) return values.map((value) => value === null ? null : 0.5);

  const sorted = [...valid].sort((a, b) => a.value - b.value || a.index - b.index);
  const output: (number | null)[] = values.map(() => null);
  let start = 0;
  while (start < sorted.length) {
    let end = start;
    while (end + 1 < sorted.length && sorted[end + 1]!.value === sorted[start]!.value) end += 1;
    const averageRank = ((start + 1) + (end + 1)) / 2;
    const percentile = (averageRank - 1) / (sorted.length - 1);
    const score = invert ? 1 - percentile : percentile;
    for (let cursor = start; cursor <= end; cursor += 1) output[sorted[cursor]!.index] = score;
    start = end + 1;
  }
  return output;
}

export function meanAvailable(values: readonly (number | null)[], minimum = 1): number | null {
  const valid = values.filter((value): value is number => value !== null && Number.isFinite(value));
  return valid.length < minimum ? null : valid.reduce((sum, value) => sum + value, 0) / valid.length;
}
