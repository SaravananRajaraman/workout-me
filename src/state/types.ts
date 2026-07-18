import type { DayType, ScheduleDay, SetLog } from '../data/types';
import type { HeightUnit } from '../lib/units';

export type Screen = 'signin' | 'today' | 'exercise' | 'progress' | 'profile' | 'config' | 'sync';

export interface UserProfile {
  name: string;
  gym: string;
  heightCm: number;
  heightUnit: HeightUnit;
  weightKg: number;
  targetKg: number;
  goal: string;
}

export interface RestState {
  open: boolean;
  total: number;
  left: number;
}

export type SyncStatus = 'idle' | 'syncing' | 'done' | 'error';

/** The mode the user picked for a given calendar day. */
export interface DaySelection {
  date: string; // YYYY-MM-DD
  type: ScheduleDay;
}

export interface SyncMeta {
  status: SyncStatus;
  lastSyncedAt: string | null;
  error?: string;
}

export interface SessionSet {
  w: number;
  r: number;
}

export interface SessionItem {
  exerciseId: string;
  name: string;
  muscle: string;
  sets: SessionSet[];
  volume: number;
}

export interface Session {
  id: string;
  date: string; // YYYY-MM-DD
  dow: number;
  type: DayType;
  items: SessionItem[];
  totalVolume: number;
}

export interface BodyweightEntry {
  date: string; // YYYY-MM-DD
  kg: number;
}

export interface AppState {
  screen: Screen;
  onboarded: boolean;
  theme: 'light' | 'dark';
  day: DaySelection;
  activeType: DayType | null;
  activeId: string | null;
  plan: Record<string, string[]>;
  cfgTab: DayType;
  logs: Record<string, SetLog[]>;
  doneTime: Record<string, boolean>;
  signedIn: boolean;
  googleEmail: string | null;
  sync: SyncMeta;
  wifiOnly: boolean;
  rest: RestState;
  setupOpen: boolean;
  user: UserProfile | null;
  draft: UserProfile | null;
  sessions: Session[];
  bodyweight: BodyweightEntry[];
  editDate: string | null;
}

export const defaultUser: UserProfile = {
  name: 'You',
  gym: 'My Gym',
  heightCm: 175,
  heightUnit: 'cm',
  weightKg: 75,
  targetKg: 70,
  goal: 'Fat loss + muscle',
};
