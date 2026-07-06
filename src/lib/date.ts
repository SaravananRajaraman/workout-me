export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function daysAgoISO(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return isoDate(d);
}

export function startOfWeek(d: Date): Date {
  const day = d.getDay();
  const diff = (day + 6) % 7; // Monday-start week
  const monday = new Date(d);
  monday.setDate(d.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function weekKey(dateISO: string): string {
  return isoDate(startOfWeek(new Date(dateISO)));
}

/** Consecutive-day streak counting back from today, based on a set of session dates (YYYY-MM-DD). */
export function computeStreak(sessionDates: Set<string>): number {
  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  // Allow today to be "in progress" without breaking the streak if no session logged yet today.
  if (!sessionDates.has(isoDate(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (sessionDates.has(isoDate(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Last `days` days (oldest first) as YYYY-MM-DD, for a consistency dot grid. */
export function lastNDays(days: number): string[] {
  const out: string[] = [];
  for (let i = days - 1; i >= 0; i--) out.push(daysAgoISO(i));
  return out;
}

export function formatRelative(iso: string | null): string {
  if (!iso) return 'Never synced';
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Synced just now';
  if (mins < 60) return `Synced ${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Synced ${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `Synced ${days}d ago`;
}
