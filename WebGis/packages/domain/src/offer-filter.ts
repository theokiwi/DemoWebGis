import type { Facility, OfferView } from './model.js';

export function canonicalCategoryKey(categories: readonly string[]): string {
  return [...new Set(categories.map((value) => value.trim()).filter(Boolean))].sort().join(',');
}

export function filterFacilities(facilities: readonly Facility[], view: OfferView, categories: readonly string[]): Facility[] {
  const wanted = new Set(categories);
  return facilities.filter((facility) => facility.active && (view === 'total' || facility.servesSus) &&
    (wanted.size === 0 || facility.categories.some((category) => wanted.has(category))));
}
