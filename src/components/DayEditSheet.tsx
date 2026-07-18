import { useEffect, useState } from 'react';
import { useStore } from '../state/store';
import type { DayType } from '../data/types';
import { allTypes, typeName } from '../data/exercises';

interface EditRow {
  exerciseId: string;
  name: string;
  muscle: string;
  sets: { w: number; r: number }[];
}

export function DayEditSheet() {
  const { state, closeDayEdit, getSessionForDate, saveDaySession, deleteDaySession, planItems } = useStore();
  const date = state.editDate;
  const existing = date ? getSessionForDate(date) : undefined;

  const [type, setType] = useState<DayType | null>(null);
  const [rows, setRows] = useState<EditRow[]>([]);

  useEffect(() => {
    if (!date) return;
    const s = getSessionForDate(date);
    if (s) {
      setType(s.type);
      setRows(s.items.map((i) => ({ exerciseId: i.exerciseId, name: i.name, muscle: i.muscle, sets: i.sets.map((x) => ({ ...x })) })));
    } else {
      setType(null);
      setRows([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  if (!date) return null;

  const pickType = (t: DayType) => {
    setType(t);
    const items = planItems(t).filter((ex) => !ex.time);
    setRows(
      items.map((ex) => ({
        exerciseId: ex.id,
        name: ex.name,
        muscle: ex.muscle,
        sets: Array.from({ length: ex.sets }, () => ({ w: ex.last, r: ex.reps })),
      })),
    );
  };

  const adjW = (ri: number, si: number, d: number) => {
    setRows((prev) =>
      prev.map((row, i) => (i !== ri ? row : { ...row, sets: row.sets.map((s, j) => (j !== si ? s : { ...s, w: Math.max(0, Math.round((s.w + d) * 2) / 2) })) })),
    );
  };
  const adjR = (ri: number, si: number, d: number) => {
    setRows((prev) => prev.map((row, i) => (i !== ri ? row : { ...row, sets: row.sets.map((s, j) => (j !== si ? s : { ...s, r: Math.max(0, s.r + d) })) })));
  };
  const addSet = (ri: number) => {
    setRows((prev) => prev.map((row, i) => (i !== ri ? row : { ...row, sets: [...row.sets, { ...(row.sets[row.sets.length - 1] ?? { w: 0, r: 8 }) }] })));
  };
  const removeSet = (ri: number, si: number) => {
    setRows((prev) => prev.map((row, i) => (i !== ri ? row : { ...row, sets: row.sets.filter((_, j) => j !== si) })));
  };

  const save = () => {
    if (!type) return;
    const items = rows
      .filter((r) => r.sets.length > 0)
      .map((r) => ({
        exerciseId: r.exerciseId,
        name: r.name,
        muscle: r.muscle,
        sets: r.sets.map((s) => ({ w: s.w, r: s.r })),
        volume: r.sets.reduce((sum, s) => sum + s.w * s.r, 0),
      }));
    if (!items.length) return;
    saveDaySession(date, type, items);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,7,5,.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-end', zIndex: 25 }}>
      <div className="scr" style={{ width: '100%', maxHeight: '92%', overflowY: 'auto', background: 'var(--bg)', borderRadius: '28px 28px 0 0', padding: '20px 20px 26px', animation: 'riseIn .28s ease' }}>
        <div style={{ width: 44, height: 4, borderRadius: 2, background: 'var(--line)', margin: '0 auto 14px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 20, color: 'var(--text)' }}>{date}</div>
          <div
            onClick={closeDayEdit}
            style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--card2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 800, color: 'var(--muted)', fontSize: 16 }}
          >
            ✕
          </div>
        </div>

        {!type ? (
          <>
            <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, margin: '10px 0 14px' }}>What did you train this day?</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {allTypes.map((t) => (
                <div
                  key={t}
                  onClick={() => pickType(t)}
                  style={{ padding: '14px 8px', borderRadius: 14, textAlign: 'center', fontSize: 13, fontWeight: 800, cursor: 'pointer', background: 'var(--card2)', color: 'var(--hero1)' }}
                >
                  {typeName[t]}
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700, margin: '8px 0 14px' }}>{typeName[type]}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {rows.map((row, ri) => (
                <div key={row.exerciseId} style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16, padding: '12px 13px' }}>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--text)', marginBottom: 9 }}>{row.name}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {row.sets.map((s, si) => (
                      <div key={si} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ width: 16, fontSize: 11, fontWeight: 800, color: 'var(--muted)' }}>{si + 1}</span>
                        <Stepper value={`${s.w} kg`} onMinus={() => adjW(ri, si, -1)} onPlus={() => adjW(ri, si, 1)} />
                        <Stepper value={`${s.r}`} onMinus={() => adjR(ri, si, -1)} onPlus={() => adjR(ri, si, 1)} />
                        <div
                          onClick={() => removeSet(ri, si)}
                          style={{ width: 26, height: 26, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', cursor: 'pointer', fontSize: 15, fontWeight: 800 }}
                        >
                          ×
                        </div>
                      </div>
                    ))}
                    <div onClick={() => addSet(ri)} style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--hero1)', cursor: 'pointer', marginTop: 2 }}>
                      + Add set
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={save}
              style={{
                width: '100%',
                marginTop: 20,
                border: 'none',
                background: 'linear-gradient(135deg,var(--hero1),var(--hero2))',
                color: '#fff',
                fontFamily: "'Baloo 2',sans-serif",
                fontWeight: 800,
                fontSize: 16,
                padding: 15,
                borderRadius: 16,
                cursor: 'pointer',
                boxShadow: '0 12px 22px -12px var(--hero1)',
              }}
            >
              Save workout
            </button>
            {existing && (
              <button
                onClick={() => deleteDaySession(date)}
                style={{ width: '100%', marginTop: 10, border: 'none', background: 'var(--card2)', color: 'var(--hero1)', fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 13, padding: 13, borderRadius: 14, cursor: 'pointer' }}
              >
                Remove this workout
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Stepper({ value, onMinus, onPlus }: { value: string; onMinus: () => void; onPlus: () => void }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--card2)', borderRadius: 10, padding: '5px 8px' }}>
      <div onClick={onMinus} style={{ width: 22, height: 22, borderRadius: 7, background: 'var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14, color: 'var(--text)', cursor: 'pointer' }}>
        −
      </div>
      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 12.5, color: 'var(--text)' }}>{value}</span>
      <div onClick={onPlus} style={{ width: 22, height: 22, borderRadius: 7, background: 'var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14, color: 'var(--text)', cursor: 'pointer' }}>
        +
      </div>
    </div>
  );
}
