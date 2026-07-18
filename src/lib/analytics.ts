import { computeStreak, weekKey } from './date';
import type { BodyweightEntry, Session } from '../state/types';

export interface ProgressStats {
  streak: number;
  weeklyVolume: { weekKey: string; total: number }[]; // last 8 weeks, oldest first
  prs: { name: string; kg: number; setDate: string | null }[];
  bodyweightSeries: BodyweightEntry[]; // last 8 entries, oldest first
}

const MARQUEE_LIFTS = ['barbell-bench-press', 'barbell-back-squat', 'deadlift'];
const MARQUEE_LABELS: Record<string, string> = {
  'barbell-bench-press': 'Bench Press',
  'barbell-back-squat': 'Back Squat',
  deadlift: 'Deadlift',
};

export function computeProgress(sessions: Session[], bodyweight: BodyweightEntry[]): ProgressStats {
  const sessionDates = new Set(sessions.map((s) => s.date));
  const streak = computeStreak(sessionDates);

  const weekBuckets = new Map<string, number>();
  sessions.forEach((s) => {
    const wk = weekKey(s.date);
    weekBuckets.set(wk, (weekBuckets.get(wk) ?? 0) + s.totalVolume);
  });
  const now = new Date();
  const weeklyVolume: { weekKey: string; total: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const wk = weekKey(d.toISOString().slice(0, 10));
    weeklyVolume.push({ weekKey: wk, total: weekBuckets.get(wk) ?? 0 });
  }

  const prs = MARQUEE_LIFTS.map((id) => {
    let best = 0;
    let bestDate: string | null = null;
    sessions.forEach((s) => {
      s.items.forEach((item) => {
        if (item.exerciseId !== id) return;
        item.sets.forEach((set) => {
          if (set.w > best) {
            best = set.w;
            bestDate = s.date;
          }
        });
      });
    });
    return { name: MARQUEE_LABELS[id], kg: best, setDate: bestDate };
  });

  const bodyweightSeries = bodyweight.slice(-8);

  return { streak, weeklyVolume, prs, bodyweightSeries };
}
