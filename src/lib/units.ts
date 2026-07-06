export type Units = 'kg' | 'lb';

export function dispW(kg: number, units: Units): number {
  return units === 'lb' ? Math.round(kg * 2.20462 * 2) / 2 : kg;
}

export function wStep(units: Units): number {
  return units === 'lb' ? 5 : 2.5;
}

export function heightForDisplay(heightCm: number, units: Units): string {
  if (units === 'lb') {
    const ft = Math.floor(heightCm / 30.48);
    const inch = Math.round(heightCm / 2.54 - ft * 12);
    return `${ft}'${inch}"`;
  }
  return `${heightCm} cm`;
}
