export type DayType = 'push' | 'pull' | 'legs';
export type Slot = 'push1' | 'push2' | 'pull1' | 'pull2' | 'legs1' | 'legs2';

export interface ExerciseSeed {
  name: string;
  muscle: string;
  sets?: number;
  reps?: number;
  last?: number;
  img: string;
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
