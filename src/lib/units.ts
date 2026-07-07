export type HeightUnit = 'cm' | 'ft';

export function heightForDisplay(heightCm: number, unit: HeightUnit): string {
  if (unit === 'ft') {
    const { ft, inch } = cmToFeetInches(heightCm);
    return `${ft}'${inch}"`;
  }
  return `${heightCm} cm`;
}

export function cmToFeetInches(heightCm: number): { ft: number; inch: number } {
  const totalInches = Math.round(heightCm / 2.54);
  return { ft: Math.floor(totalInches / 12), inch: totalInches % 12 };
}

export function feetInchesToCm(ft: number, inch: number): number {
  return Math.round((ft * 12 + inch) * 2.54);
}
