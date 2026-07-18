export type DayType = 'push' | 'pull' | 'legs';

/** What kind of day today is — a workout type or a rest day. */
export type ScheduleDay = 'rest' | DayType;

export interface ExerciseSeed {
  name: string;
  muscle: string;
  sets?: number;
  reps?: number;
  last?: number;
  img: string;
  gifUrl?: string;
  tip: string;
  time?: boolean;
  dur?: number;
  alts?: ExerciseSeed[];
}

export interface LibraryExercise {
  id: string;
  type: DayType;
  name: string;
  muscle: string;
  group: string;
  img: string;
  gifUrl?: string;
  tip: string;
  sets: number;
  reps: number;
  last: number;
  time: boolean;
  dur: number;
}

export interface SetLog {
  w: number;
  r: number;
  done: boolean;
}
