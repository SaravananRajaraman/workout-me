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
import type { DayType, SetLog, Slot } from '../data/types';
import {
  allSlots,
  buildLibrary,
  day2Default,
  slotBase,
  slotDayNum,
} from '../data/exercises';
import { loadJSON, saveJSON } from './storage';
import { defaultUser, type BodyweightEntry, type Screen, type Session, type UserProfile } from './types';
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

function keyOf(slot: Slot, id: string) {
  return `${slot}:${id}`;
}

export function useSlamPPLStore() {
  const { library, libById, defaultPlan } = useMemo(() => buildLibrary(), []);

  const [onboarded, setOnboarded] = usePersisted<boolean>('onboarded', false);
  const [screen, setScreen] = useState<Screen>(onboarded ? 'today' : 'signin');
  const [theme, setThemeState] = usePersisted<'light' | 'dark'>('theme', 'light');
  const [selDOW, setSelDOW] = useState<number>(new Date().getDay());
  const [activeSlot, setActiveSlot] = useState<Slot | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [plan, setPlan] = usePersisted<Partial<Record<Slot, string[]>>>('plan', {});
  const [mirror, setMirror] = usePersisted<Partial<Record<DayType, boolean>>>('mirror', {});
  const [cfgTab, setCfgTab] = useState<DayType>('push');
  const [cfgDay, setCfgDay] = useState<1 | 2>(1);
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

  const getMirror = useCallback(() => mirror, [mirror]);

  const defaultSlotPlan = useCallback(
    (slot: Slot): string[] => {
      const base = slotBase(slot);
      if (slotDayNum(slot) === 2) return (day2Default[base] || []).filter((id) => libById[id]);
      return defaultPlan[base].slice();
    },
    [defaultPlan, libById],
  );

  const getPlan = useCallback((): Record<Slot, string[]> => {
    const base = {} as Record<Slot, string[]>;
    allSlots.forEach((s) => {
      base[s] = defaultSlotPlan(s);
    });
    Object.keys(plan).forEach((s) => {
      const slot = s as Slot;
      const val = plan[slot];
      if (base[slot] && Array.isArray(val)) base[slot] = val;
    });
    return base;
  }, [plan, defaultSlotPlan]);

  const effSlot = useCallback(
    (slot: Slot): Slot => {
      const base = slotBase(slot);
      if (slotDayNum(slot) === 2 && getMirror()[base]) return `${base}1` as Slot;
      return slot;
    },
    [getMirror],
  );

  const planItems = useCallback(
    (slot: Slot) => getPlan()[effSlot(slot)].map((id) => libById[id]).filter(Boolean),
    [getPlan, effSlot, libById],
  );

  const persistPlan = useCallback((p: Partial<Record<Slot, string[]>>) => setPlan(p), [setPlan]);
  const persistMirror = useCallback((m: Partial<Record<DayType, boolean>>) => setMirror(m), [setMirror]);

  const toggleMirror = useCallback(
    (base: DayType) => {
      persistMirror({ ...mirror, [base]: !mirror[base] });
    },
    [mirror, persistMirror],
  );

  const toggleInPlan = useCallback(
    (slot: Slot, id: string) => {
      const currentPlan = getPlan();
      const list = currentPlan[slot].slice();
      const base = slotBase(slot);
      const at = list.indexOf(id);
      if (at >= 0) {
        if (list.length <= 1) return;
        list.splice(at, 1);
      } else {
        const order = library[base].map((x) => x.id);
        list.push(id);
        list.sort((a, b) => order.indexOf(a) - order.indexOf(b));
      }
      persistPlan({ ...currentPlan, [slot]: list });
    },
    [getPlan, library, persistPlan],
  );

  const swapInPlan = useCallback(
    (slot: Slot, oldId: string, newId: string) => {
      const currentPlan = getPlan();
      const list = currentPlan[slot].map((id) => (id === oldId ? newId : id));
      persistPlan({ ...currentPlan, [slot]: list });
      const ko = keyOf(slot, oldId);
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
    const p: Partial<Record<Slot, string[]>> = {};
    allSlots.forEach((s) => {
      p[s] = defaultSlotPlan(s);
    });
    persistPlan(p);
  }, [defaultSlotPlan, persistPlan]);

  const getSets = useCallback(
    (slot: Slot, id: string): SetLog[] | null => {
      const ex = libById[id];
      if (!ex || ex.time) return null;
      const k = keyOf(slot, id);
      if (logs[k]) return logs[k];
      return Array.from({ length: ex.sets }, () => ({ w: ex.last, r: ex.reps, done: false }));
    },
    [libById, logs],
  );

  const writeSets = useCallback(
    (slot: Slot, id: string, arr: SetLog[]) => {
      setLogs((prev) => ({ ...prev, [keyOf(slot, id)]: arr }));
    },
    [setLogs],
  );

  const adjW = useCallback(
    (slot: Slot, id: string, si: number, d: number) => {
      const arr = (getSets(slot, id) ?? []).map((x) => ({ ...x }));
      arr[si].w = Math.max(0, Math.round((arr[si].w + d) * 2) / 2);
      writeSets(slot, id, arr);
    },
    [getSets, writeSets],
  );

  const adjR = useCallback(
    (slot: Slot, id: string, si: number, d: number) => {
      const arr = (getSets(slot, id) ?? []).map((x) => ({ ...x }));
      arr[si].r = Math.max(0, arr[si].r + d);
      writeSets(slot, id, arr);
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
    (slot: Slot, id: string, si: number) => {
      const arr = (getSets(slot, id) ?? []).map((x) => ({ ...x }));
      arr[si].done = !arr[si].done;
      writeSets(slot, id, arr);
      if (arr[si].done) startRest(90);
    },
    [getSets, writeSets, startRest],
  );

  const toggleTime = useCallback(
    (slot: Slot, id: string) => {
      const k = keyOf(slot, id);
      setDoneTime((prev) => ({ ...prev, [k]: !prev[k] }));
    },
    [setDoneTime],
  );

  const isExDone = useCallback(
    (slot: Slot, id: string): boolean => {
      const ex = libById[id];
      if (!ex) return false;
      if (ex.time) return !!doneTime[keyOf(slot, id)];
      const sets = getSets(slot, id);
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
  const selectDOW = useCallback((dow: number) => {
    setSelDOW(dow);
    setScreen('today');
    setActiveId(null);
  }, []);
  const openEx = useCallback((slot: Slot, id: string) => {
    setActiveSlot(slot);
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
    (slot: Slot) => {
      const items = planItems(slot);
      const date = todayISO();
      const sessionItems = items
        .map((ex) => {
          if (ex.time) return null;
          const sets = getSets(slot, ex.id) ?? [];
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
        id: `${date}-${slot}-${Date.now()}`,
        date,
        dow: selDOW,
        slot,
        type: slotBase(slot),
        items: sessionItems,
        totalVolume: sessionItems.reduce((sum, i) => sum + i.volume, 0),
      };
      setSessions((prev) => {
        const already = prev.some((s) => s.date === date && s.slot === slot);
        if (already) {
          return prev.map((s) => (s.date === date && s.slot === slot ? session : s));
        }
        return [...prev, session];
      });
    },
    [planItems, getSets, selDOW, setSessions],
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
      if (Object.keys(remote.mirror).length && Object.keys(mirror).length === 0) {
        setMirror(remote.mirror);
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
    [plan, mirror, setUser, setPlan, setMirror, setSessions, setBodyweight],
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
          mirror,
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
    [applyRemoteMerge, user, theme, plan, mirror, sessions, bodyweight, setLastSyncedAt],
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
      selDOW,
      activeSlot,
      activeId,
      cfgTab,
      cfgDay,
      mirror,
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
    getPlan,
    effSlot,
    planItems,
    getSets,
    isExDone,
    toggleMirror,
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
    selectDOW,
    openEx,
    back,
    openConfig,
    backToProfile,
    setCfgTab,
    setCfgDay,
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

export type Store = ReturnType<typeof useSlamPPLStore>;

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const store = useSlamPPLStore();
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
