import type { DayType, SetLog, Slot } from '../data/types';
import type { Units } from '../lib/units';

export type Screen = 'signin' | 'today' | 'exercise' | 'progress' | 'profile' | 'config' | 'sync';

export interface UserProfile {
  name: string;
  gym: string;
  heightCm: number;
  weightKg: number;
  targetKg: number;
  goal: string;
  units: Units;
}

export interface RestState {
  open: boolean;
  total: number;
  left: number;
}

export type SyncStatus = 'idle' | 'syncing' | 'done' | 'error';

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
  slot: Slot;
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
  selDOW: number;
  activeSlot: Slot | null;
  activeId: string | null;
  plan: Partial<Record<Slot, string[]>>;
  mirror: Partial<Record<DayType, boolean>>;
  cfgTab: DayType;
  cfgDay: 1 | 2;
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
}

export const defaultUser: UserProfile = {
  name: 'You',
  gym: 'My Gym',
  heightCm: 175,
  weightKg: 75,
  targetKg: 70,
  goal: 'Fat loss + muscle',
  units: 'kg',
};
