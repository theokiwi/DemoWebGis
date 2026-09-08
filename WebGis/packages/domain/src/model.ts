export type OfferView = 'sus' | 'total';
export type Confidence = 'complete' | 'partial' | 'unclassified';
export type RiskBand = 1 | 2 | 3 | 4 | 5;

export interface Facility {
  cnesId: string;
  name: string;
  categories: string[];
  servesSus: boolean;
  active: boolean;
  position: [number, number];
  address: string | null;
}

export interface SectorInput {
  geocode: string;
  population: number;
  medianIncomeBrl: number | null;
  childrenShare: number | null;
  olderPeopleShare: number | null;
}

export interface ModalCost {
  facilityCnesId: string;
  straightLineM: number;
  walkingM: number | null;
  transitMinutes: number | null;
}

export interface IndicatorValue {
  raw: number | null;
  score: number | null;
}

export interface VulnerabilityResult {
  income: IndicatorValue;
  children: IndicatorValue;
  olderPeople: IndicatorValue;
  score: number | null;
  confidence: Confidence;
  missingReasons: string[];
}
