import { createSpreadsheet, findSpreadsheet, getValues, renameFile, updateValues } from './api';
import type { BodyweightEntry, Session, UserProfile } from '../../state/types';
import type { DayType } from '../../data/types';

const FILE_TITLE = 'Workout Me Data';
const OLD_FILE_TITLE = 'Slam PPL Data';
const TAB_TITLES = ['Profile', 'Plan', 'Sessions', 'Bodyweight'];

const SESSION_HEADER = ['id', 'date', 'dow', 'type', 'exerciseId', 'name', 'muscle', 'setIndex', 'weight', 'reps'];
const BODYWEIGHT_HEADER = ['date', 'kg'];

export interface RemoteState {
  profileMap: Record<string, string>;
  plan: Record<string, string[]>;
  sessions: Session[];
  bodyweight: BodyweightEntry[];
}

export async function ensureSpreadsheet(accessToken: string): Promise<string> {
  const existing = await findSpreadsheet(accessToken, FILE_TITLE);
  if (existing) return existing;
  // Migrate a spreadsheet created under the app's previous name ("Slam PPL").
  const legacy = await findSpreadsheet(accessToken, OLD_FILE_TITLE);
  if (legacy) {
    await renameFile(accessToken, legacy, FILE_TITLE);
    return legacy;
  }
  return createSpreadsheet(accessToken, FILE_TITLE, TAB_TITLES);
}

export async function pushAll(
  accessToken: string,
  spreadsheetId: string,
  data: {
    user: UserProfile | null;
    theme: string;
    plan: Record<string, string[]>;
    sessions: Session[];
    bodyweight: BodyweightEntry[];
  },
): Promise<void> {
  const u = data.user;
  const profileRows = [
    ['key', 'value'],
    ['name', u?.name ?? ''],
    ['gym', u?.gym ?? ''],
    ['heightCm', String(u?.heightCm ?? '')],
    ['weightKg', String(u?.weightKg ?? '')],
    ['targetKg', String(u?.targetKg ?? '')],
    ['goal', u?.goal ?? ''],
    ['heightUnit', u?.heightUnit ?? 'cm'],
    ['theme', data.theme],
  ];
  const planRows = [
    ['key', 'value'],
    ['plan_json', JSON.stringify(data.plan ?? {})],
  ];
  const sessionRows: (string | number)[][] = [SESSION_HEADER];
  data.sessions.forEach((s) => {
    s.items.forEach((item) => {
      item.sets.forEach((set, i) => {
        sessionRows.push([s.id, s.date, s.dow, s.type, item.exerciseId, item.name, item.muscle, i + 1, set.w, set.r]);
      });
    });
  });
  const bwRows: (string | number)[][] = [BODYWEIGHT_HEADER];
  data.bodyweight.forEach((b) => bwRows.push([b.date, b.kg]));

  await Promise.all([
    updateValues(accessToken, spreadsheetId, 'Profile!A1:B9', profileRows),
    updateValues(accessToken, spreadsheetId, 'Plan!A1:B2', planRows),
    updateValues(accessToken, spreadsheetId, `Sessions!A1:K${sessionRows.length + 1}`, sessionRows),
    updateValues(accessToken, spreadsheetId, `Bodyweight!A1:B${bwRows.length + 1}`, bwRows),
  ]);
}

export async function pullAll(accessToken: string, spreadsheetId: string): Promise<RemoteState> {
  const [profileRows, planRows, sessionRows, bwRows] = await Promise.all([
    getValues(accessToken, spreadsheetId, 'Profile!A1:B9'),
    getValues(accessToken, spreadsheetId, 'Plan!A1:B2'),
    getValues(accessToken, spreadsheetId, 'Sessions!A1:K200000'),
    getValues(accessToken, spreadsheetId, 'Bodyweight!A1:B20000'),
  ]);

  const profileMap: Record<string, string> = {};
  profileRows.slice(1).forEach(([k, v]) => {
    if (k) profileMap[k] = v ?? '';
  });

  let plan: Record<string, string[]> = {};
  planRows.slice(1).forEach(([k, v]) => {
    if (k === 'plan_json' && v) {
      try {
        plan = JSON.parse(v);
      } catch {
        /* ignore malformed remote data */
      }
    }
  });

  // Sheets written before the day-variant system was removed have an extra
  // "slot" column (e.g. "push1") between dow and type.
  const legacySessionLayout = sessionRows[0]?.[3] === 'slot';
  const sessionsById = new Map<string, Session>();
  sessionRows.slice(1).forEach((rawRow) => {
    const row = legacySessionLayout ? [...rawRow.slice(0, 3), ...rawRow.slice(4)] : rawRow;
    const [id, date, dowStr, type, exerciseId, name, muscle, setIdxStr, wStr, rStr] = row;
    if (!id) return;
    let session = sessionsById.get(id);
    if (!session) {
      session = {
        id,
        date,
        dow: Number(dowStr) || 0,
        type: type as DayType,
        items: [],
        totalVolume: 0,
      };
      sessionsById.set(id, session);
    }
    let item = session.items.find((i) => i.exerciseId === exerciseId);
    if (!item) {
      item = { exerciseId, name, muscle, sets: [], volume: 0 };
      session.items.push(item);
    }
    const w = Number(wStr) || 0;
    const r = Number(rStr) || 0;
    const setIdx = Number(setIdxStr) || item.sets.length + 1;
    item.sets[setIdx - 1] = { w, r };
    item.volume = item.sets.reduce((sum, s) => sum + (s ? s.w * s.r : 0), 0);
  });
  sessionsById.forEach((s) => {
    s.totalVolume = s.items.reduce((sum, i) => sum + i.volume, 0);
    s.items.forEach((i) => {
      i.sets = i.sets.filter(Boolean);
    });
  });

  const bodyweight: BodyweightEntry[] = bwRows
    .slice(1)
    .filter((row) => row[0])
    .map((row) => ({ date: row[0], kg: Number(row[1]) || 0 }));

  return {
    profileMap,
    plan,
    sessions: Array.from(sessionsById.values()),
    bodyweight,
  };
}
