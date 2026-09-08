import type { ModalCost } from './model.js';

export interface NearestDestinations {
  straightLine: ModalCost | null;
  walking: ModalCost | null;
  transit: ModalCost | null;
}

function minimum(costs: readonly ModalCost[], select: (cost: ModalCost) => number | null): ModalCost | null {
  return costs.reduce<ModalCost | null>((best, current) => {
    const value = select(current);
    if (value === null) return best;
    if (!best) return current;
    const bestValue = select(best);
    return bestValue === null || value < bestValue || (value === bestValue && current.facilityCnesId.localeCompare(best.facilityCnesId) < 0)
      ? current : best;
  }, null);
}

export function selectNearestByMode(costs: readonly ModalCost[]): NearestDestinations {
  return {
    straightLine: minimum(costs, (cost) => cost.straightLineM),
    walking: minimum(costs, (cost) => cost.walkingM),
    transit: minimum(costs, (cost) => cost.transitMinutes)
  };
}

export function median(values: readonly number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2;
}
