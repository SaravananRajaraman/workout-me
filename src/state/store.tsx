import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { DayType, ScheduleDay, SetLog } from '../data/types';
import { allTypes, buildLibrary, nextType } from '../data/exercises';
import { loadJSON, saveJSON } from './storage';
import { defaultUser, type BodyweightEntry, type DaySelection, type Screen, type Session, type UserProfile } from './types';
import { dispW as dispWUnits, wStep as wStepUnits } from '../lib/units';
import { todayISO } from '../lib/date';
import {
  ensureSpreadsheet,
  pullAll,
  pushAll,
} from '../lib/google/sync';
import {
  fetchGoogleEmail,
  isGoogleConfigured,
  requestAccessToken,
  revokeToken,
} from '../lib/google/auth';

function usePersisted<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => loadJSON(key, fallback));
  useEffect(() => {
    saveJSON(key, value);
  }, [key, value]);
  return [value, setValue] as const;
}

function keyOf(type: DayType, id: string) {
  return `${type}:${id}`;
}

export function useWorkoutMeStore() {
  const { library, libById, defaultPlan } = useMemo(() => buildLibrary(), []);

  const [onboarded, setOnboarded] = usePersisted<boolean>('onboarded', false);
  const [screen, setScreen] = useState<Screen>(onboarded ? 'today' : 'signin');
  const [theme, setThemeState] = usePersisted<'light' | 'dark'>('theme', 'light');
  const [daySel, setDaySel] = usePersisted<DaySelection | null>('daySel', null);
  const [activeType, setActiveType] = useState<DayType | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  // Keyed loosely (string) so plans saved under the old per-slot keys ("push1") still load.
  const [plan, setPlan] = usePersisted<Record<string, string[]>>('plan', {});
  const [cfgTab, setCfgTab] = useState<DayType>('push');
  const [logs, setLogs] = usePersisted<Record<string, SetLog[]>>('logs', {});
  const [doneTime, setDoneTime] = usePersisted<Record<string, boolean>>('doneTime', {});
  const [signedIn, setSignedIn] = usePersisted<boolean>('signedIn', false);
  const [googleEmail, setGoogleEmail] = usePersisted<string | null>('googleEmail', null);
  const [wifiOnly, setWifiOnly] = usePersisted<boolean>('wifiOnly', true);
  const [user, setUser] = usePersisted<UserProfile | null>('user', null);
  const [draft, setDraftState] = useState<UserProfile | null>(null);
  const [setupOpen, setSetupOpen] = useState(false);
  const [sessions, setSessions] = usePersisted<Session[]>('sessions', []);
  const [bodyweight, setBodyweight] = usePersisted<BodyweightEntry[]>('bodyweight', []);
  const [spreadsheetId, setSpreadsheetId] = usePersisted<string | null>('spreadsheetId', null);
  const [lastSyncedAt, setLastSyncedAt] = usePersisted<string | null>('lastSyncedAt', null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'done' | 'error'>('idle');
  const [syncError, setSyncError] = useState<string | null>(null);

  const [rest, setRest] = useState({ open: false, total: 90, left: 90 });
  const restTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getUser = useCallback((): UserProfile => user ?? defaultUser, [user]);
  const units = useCallback(() => getUser().units, [getUser]);
  const dispW = useCallback((kg: number) => dispWUnits(kg, units()), [units]);
  const wStep = useCallback(() => wStepUnits(units()), [units]);

  // Suggested next workout type: the PPL step after the most recent logged session.
  const suggestedType = useMemo<DayType>(() => {
    if (!sessions.length) return 'push';
    const last = sessions.reduce((a, b) => (b.date.localeCompare(a.date) >= 0 ? b : a));
    return nextType(last.type);
  }, [sessions]);

  // Today's selection: what the user picked today, or the suggested default.
  const day = useMemo<DaySelection>(() => {
    const date = todayISO();
    if (daySel && daySel.date === date) return daySel;
    return { date, type: suggestedType };
  }, [daySel, suggestedType]);

  const selectDayType = useCallback(
    (type: ScheduleDay) => {
      setDaySel({ date: todayISO(), type });
      setActiveId(null);
    },
    [setDaySel],
  );

  const getPlan = useCallback((): Record<DayType, string[]> => {
    const base = {} as Record<DayType, string[]>;
    allTypes.forEach((t) => {
      // Fall back to the legacy per-slot key ("push1") so old saved plans carry over.
      const stored = plan[t] ?? plan[`${t}1`];
      base[t] = Array.isArray(stored) ? stored.filter((id) => libById[id]) : defaultPlan[t].slice();
      if (!base[t].length) base[t] = defaultPlan[t].slice();
    });
    return base;
  }, [plan, defaultPlan, libById]);

  const planItems = useCallback(
    (type: DayType) => getPlan()[type].map((id) => libById[id]).filter(Boolean),
    [getPlan, libById],
  );

  const persistPlan = useCallback((p: Record<string, string[]>) => setPlan(p), [setPlan]);

  const toggleInPlan = useCallback(
    (type: DayType, id: string) => {
      const currentPlan = getPlan();
      const list = currentPlan[type].slice();
      const at = list.indexOf(id);
      if (at >= 0) {
        if (list.length <= 1) return;
        list.splice(at, 1);
      } else {
        const order = library[type].map((x) => x.id);
        list.push(id);
        list.sort((a, b) => order.indexOf(a) - order.indexOf(b));
      }
      persistPlan({ ...currentPlan, [type]: list });
    },
    [getPlan, library, persistPlan],
  );

  const swapInPlan = useCallback(
    (type: DayType, oldId: string, newId: string) => {
      const currentPlan = getPlan();
      const list = currentPlan[type].map((id) => (id === oldId ? newId : id));
      persistPlan({ ...currentPlan, [type]: list });
      const ko = keyOf(type, oldId);
      setLogs((prev) => {
        const next = { ...prev };
        delete next[ko];
        return next;
      });
      setDoneTime((prev) => {
        const next = { ...prev };
        delete next[ko];
        return next;
      });
      setActiveId(newId);
    },
    [getPlan, persistPlan, setLogs, setDoneTime],
  );

  const resetPlan = useCallback(() => {
    const p: Record<string, string[]> = {};
    allTypes.forEach((t) => {
      p[t] = defaultPlan[t].slice();
    });
    persistPlan(p);
  }, [defaultPlan, persistPlan]);

  const getSets = useCallback(
    (type: DayType, id: string): SetLog[] | null => {
      const ex = libById[id];
      if (!ex || ex.time) return null;
      const k = keyOf(type, id);
      if (logs[k]) return logs[k];
      return Array.from({ length: ex.sets }, () => ({ w: ex.last, r: ex.reps, done: false }));
    },
    [libById, logs],
  );

  const writeSets = useCallback(
    (type: DayType, id: string, arr: SetLog[]) => {
      setLogs((prev) => ({ ...prev, [keyOf(type, id)]: arr }));
    },
    [setLogs],
  );

  const adjW = useCallback(
    (type: DayType, id: string, si: number, d: number) => {
      const arr = (getSets(type, id) ?? []).map((x) => ({ ...x }));
      arr[si].w = Math.max(0, Math.round((arr[si].w + d) * 2) / 2);
      writeSets(type, id, arr);
    },
    [getSets, writeSets],
  );

  const adjR = useCallback(
    (type: DayType, id: string, si: number, d: number) => {
      const arr = (getSets(type, id) ?? []).map((x) => ({ ...x }));
      arr[si].r = Math.max(0, arr[si].r + d);
      writeSets(type, id, arr);
    },
    [getSets, writeSets],
  );

  const startRest = useCallback((sec: number) => {
    if (restTimerRef.current) clearInterval(restTimerRef.current);
    setRest({ open: true, total: sec, left: sec });
    restTimerRef.current = setInterval(() => {
      setRest((s) => {
        const l = s.left - 1;
        if (l <= 0) {
          if (restTimerRef.current) clearInterval(restTimerRef.current);
          return { ...s, left: 0 };
        }
        return { ...s, left: l };
      });
    }, 1000);
  }, []);

  const toggleSet = useCallback(
    (type: DayType, id: string, si: number) => {
      const arr = (getSets(type, id) ?? []).map((x) => ({ ...x }));
      arr[si].done = !arr[si].done;
      writeSets(type, id, arr);
      if (arr[si].done) startRest(90);
    },
    [getSets, writeSets, startRest],
  );

  const toggleTime = useCallback(
    (type: DayType, id: string) => {
      const k = keyOf(type, id);
      setDoneTime((prev) => ({ ...prev, [k]: !prev[k] }));
    },
    [setDoneTime],
  );

  const isExDone = useCallback(
    (type: DayType, id: string): boolean => {
      const ex = libById[id];
      if (!ex) return false;
      if (ex.time) return !!doneTime[keyOf(type, id)];
      const sets = getSets(type, id);
      return sets ? sets.every((x) => x.done) : false;
    },
    [libById, doneTime, getSets],
  );

  const addRest = useCallback((d: number) => {
    setRest((s) => ({ ...s, left: Math.max(0, s.left + d), total: Math.max(s.total, s.left + d) }));
  }, []);

  const skipRest = useCallback(() => {
    if (restTimerRef.current) clearInterval(restTimerRef.current);
    setRest((s) => ({ ...s, open: false }));
  }, []);

  useEffect(
    () => () => {
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    },
    [],
  );

  const go = useCallback((s: Screen) => setScreen(s), []);
  const openEx = useCallback((type: DayType, id: string) => {
    setActiveType(type);
    setActiveId(id);
    setScreen('exercise');
  }, []);
  const back = useCallback(() => {
    setScreen('today');
    setActiveId(null);
  }, []);
  const openConfig = useCallback(() => setScreen('config'), []);
  const backToProfile = useCallback(() => setScreen('profile'), []);
  const setTheme = useCallback((t: 'light' | 'dark') => setThemeState(t), [setThemeState]);

  const openSetup = useCallback(() => {
    setDraftState({ ...getUser() });
    setSetupOpen(true);
  }, [getUser]);
  const closeSetup = useCallback(() => setSetupOpen(false), []);
  const setDraft = useCallback((patch: Partial<UserProfile>) => {
    setDraftState((d) => (d ? { ...d, ...patch } : d));
  }, []);
  const saveSetup = useCallback(() => {
    if (draft) {
      setUser(draft);
      const date = todayISO();
      setBodyweight((prev) => {
        const next = prev.filter((b) => b.date !== date);
        next.push({ date, kg: draft.weightKg });
        next.sort((a, b) => a.date.localeCompare(b.date));
        return next;
      });
    }
    setSetupOpen(false);
  }, [draft, setUser, setBodyweight]);

  const logBodyweight = useCallback(
    (kg: number) => {
      const date = todayISO();
      setBodyweight((prev) => {
        const next = prev.filter((b) => b.date !== date);
        next.push({ date, kg });
        next.sort((a, b) => a.date.localeCompare(b.date));
        return next;
      });
      setUser((u) => (u ? { ...u, weightKg: kg } : { ...defaultUser, weightKg: kg }));
    },
    [setBodyweight, setUser],
  );

  const finishWorkout = useCallback(
    (type: DayType) => {
      const items = planItems(type);
      const date = todayISO();
      const sessionItems = items
        .map((ex) => {
          if (ex.time) return null;
          const sets = getSets(type, ex.id) ?? [];
          const doneSets = sets.filter((s) => s.done);
          if (!doneSets.length) return null;
          return {
            exerciseId: ex.id,
            name: ex.name,
            muscle: ex.muscle,
            sets: doneSets.map((s) => ({ w: s.w, r: s.r })),
            volume: doneSets.reduce((sum, s) => sum + s.w * s.r, 0),
          };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null);

      if (!sessionItems.length) return;

      const session: Session = {
        id: `${date}-${type}-${Date.now()}`,
        date,
        dow: new Date().getDay(),
        type,
        items: sessionItems,
        totalVolume: sessionItems.reduce((sum, i) => sum + i.volume, 0),
      };
      setSessions((prev) => {
        const already = prev.some((s) => s.date === date && s.type === type);
        if (already) {
          return prev.map((s) => (s.date === date && s.type === type ? session : s));
        }
        return [...prev, session];
      });
    },
    [planItems, getSets, setSessions],
  );

  // --- Google sync ---
  const applyRemoteMerge = useCallback(
    (remote: Awaited<ReturnType<typeof pullAll>>) => {
      if (Object.keys(remote.profileMap).length) {
        setUser((prev) => {
          if (prev) return prev; // local profile wins if it already exists
          const m = remote.profileMap;
          return {
            name: m.name || defaultUser.name,
            gym: m.gym || defaultUser.gym,
            heightCm: Number(m.heightCm) || defaultUser.heightCm,
            weightKg: Number(m.weightKg) || defaultUser.weightKg,
            targetKg: Number(m.targetKg) || defaultUser.targetKg,
            goal: m.goal || defaultUser.goal,
            units: m.units === 'lb' ? 'lb' : 'kg',
          };
        });
      }
      if (Object.keys(remote.plan).length && Object.keys(plan).length === 0) {
        setPlan(remote.plan);
      }
      if (remote.sessions.length) {
        setSessions((prev) => {
          const byId = new Map(prev.map((s) => [s.id, s]));
          remote.sessions.forEach((s) => {
            if (!byId.has(s.id)) byId.set(s.id, s);
          });
          return Array.from(byId.values());
        });
      }
      if (remote.bodyweight.length) {
        setBodyweight((prev) => {
          const byDate = new Map(prev.map((b) => [b.date, b]));
          remote.bodyweight.forEach((b) => {
            if (!byDate.has(b.date)) byDate.set(b.date, b);
          });
          return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
        });
      }
    },
    [plan, setUser, setPlan, setSessions, setBodyweight],
  );

  const runSync = useCallback(
    async (accessToken: string, sheetId: string) => {
      setSyncStatus('syncing');
      setSyncError(null);
      try {
        const remote = await pullAll(accessToken, sheetId);
        applyRemoteMerge(remote);
        await pushAll(accessToken, sheetId, {
          user: user ?? defaultUser,
          theme,
          plan,
          sessions,
          bodyweight,
        });
        setLastSyncedAt(new Date().toISOString());
        setSyncStatus('done');
      } catch (err) {
        setSyncStatus('error');
        setSyncError(err instanceof Error ? err.message : 'Sync failed');
      }
    },
    [applyRemoteMerge, user, theme, plan, sessions, bodyweight, setLastSyncedAt],
  );

  const signIn = useCallback(async () => {
    try {
      const token = await requestAccessToken(true);
      const email = await fetchGoogleEmail(token);
      setSignedIn(true);
      setGoogleEmail(email);
      setOnboarded(true);
      setScreen('today');
      const sheetId = spreadsheetId ?? (await ensureSpreadsheet(token));
      setSpreadsheetId(sheetId);
      await runSync(token, sheetId);
    } catch (err) {
      setSyncStatus('error');
      setSyncError(err instanceof Error ? err.message : 'Google sign-in failed');
    }
  }, [setSignedIn, setGoogleEmail, setOnboarded, spreadsheetId, setSpreadsheetId, runSync]);

  const skipSignin = useCallback(() => {
    setSignedIn(false);
    setOnboarded(true);
    setScreen('today');
  }, [setSignedIn, setOnboarded]);

  const signOut = useCallback(async () => {
    await revokeToken();
    setSignedIn(false);
    setGoogleEmail(null);
    setSpreadsheetId(null);
    setScreen('signin');
  }, [setSignedIn, setGoogleEmail, setSpreadsheetId]);

  const syncNow = useCallback(async () => {
    try {
      const token = await requestAccessToken(false);
      const sheetId = spreadsheetId ?? (await ensureSpreadsheet(token));
      if (!spreadsheetId) setSpreadsheetId(sheetId);
      await runSync(token, sheetId);
    } catch (err) {
      setSyncStatus('error');
      setSyncError(err instanceof Error ? err.message : 'Sync failed');
    }
  }, [spreadsheetId, setSpreadsheetId, runSync]);

  const toggleWifi = useCallback(() => setWifiOnly((w) => !w), [setWifiOnly]);

  return {
    library,
    libById,
    state: {
      screen,
      theme,
      day,
      activeType,
      activeId,
      cfgTab,
      logs,
      doneTime,
      signedIn,
      googleEmail,
      wifiOnly,
      user,
      draft,
      setupOpen,
      sessions,
      bodyweight,
      rest,
      sync: { status: syncStatus, lastSyncedAt, error: syncError },
      googleConfigured: isGoogleConfigured(),
    },
    getUser,
    units,
    dispW,
    wStep,
    suggestedType,
    selectDayType,
    getPlan,
    planItems,
    getSets,
    isExDone,
    toggleInPlan,
    swapInPlan,
    resetPlan,
    adjW,
    adjR,
    toggleSet,
    toggleTime,
    startRest,
    addRest,
    skipRest,
    go,
    openEx,
    back,
    openConfig,
    backToProfile,
    setCfgTab,
    setTheme,
    openSetup,
    closeSetup,
    setDraft,
    saveSetup,
    logBodyweight,
    finishWorkout,
    signIn,
    skipSignin,
    signOut,
    syncNow,
    toggleWifi,
  };
}

export type Store = ReturnType<typeof useWorkoutMeStore>;

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const store = useWorkoutMeStore();
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
