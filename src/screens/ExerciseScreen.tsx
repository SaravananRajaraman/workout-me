import { useStore } from '../state/store';

export function ExerciseScreen() {
  const { state, libById, back, effSlot, getPlan, library, swapInPlan, openEx, getSets, toggleTime, toggleSet, adjW, adjR, startRest, dispW, units, isExDone, wStep } = useStore();
  const activeId = state.activeId;
  const activeSlot = state.activeSlot;
  if (!activeId || !activeSlot || !libById[activeId]) return null;

  const ex = libById[activeId];
  const eff = effSlot(activeSlot);
  const planIds = getPlan()[eff];
  const inPlan = planIds.includes(activeId);
  const swapOpts = library[ex.type].filter((o) => o.group === ex.group);
  const hasSwaps = swapOpts.length > 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative', height: 186 }}>
        <div
          role="img"
          aria-label={ex.name}
          style={{ width: '100%', height: '100%', backgroundColor: 'var(--card2)', backgroundImage: `url(${ex.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(0,0,0,.28) 0%,rgba(0,0,0,.05) 40%,rgba(0,0,0,.66) 100%)' }} />
        <div
          onClick={back}
          style={{ position: 'absolute', top: 12, left: 12, width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,.2)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#241c17" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </div>
        <span style={{ position: 'absolute', top: 16, right: 14, background: 'rgba(255,255,255,.92)', color: 'var(--hero1)', fontSize: 10, fontWeight: 800, padding: '5px 11px', borderRadius: 11, textTransform: 'uppercase', letterSpacing: '.03em' }}>
          {ex.muscle}
        </span>
        <div style={{ position: 'absolute', left: 16, right: 16, bottom: 12 }}>
          <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 23, color: '#fff', textShadow: '0 1px 8px rgba(0,0,0,.5)' }}>{ex.name}</div>
        </div>
      </div>

      <div style={{ padding: '16px 16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: 'var(--card2)', borderRadius: 14, padding: '11px 13px' }}>
          <span style={{ fontSize: 15 }}>💡</span>
          <span style={{ fontSize: 12.5, color: 'var(--text)', fontWeight: 600, lineHeight: 1.5 }}>{ex.tip}</span>
        </div>

        {hasSwaps && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 9 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--hero1)" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="17 1 21 5 17 9" />
                <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <polyline points="7 23 3 19 7 15" />
                <path d="M21 13v2a4 4 0 0 1-4 4H3" />
              </svg>
              <span style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 14, color: 'var(--text)' }}>Swap exercise</span>
              <span style={{ fontSize: 10.5, color: 'var(--muted)', fontWeight: 700 }}>same muscle</span>
            </div>
            <div className="scr" style={{ display: 'flex', gap: 9, overflowX: 'auto', paddingBottom: 3 }}>
              {swapOpts.map((o) => {
                const active = o.id === activeId;
                return (
                  <div
                    key={o.id}
                    onClick={() => {
                      if (active) return;
                      if (inPlan) swapInPlan(eff, activeId, o.id);
                      else openEx(activeSlot, o.id);
                    }}
                    style={{ flex: 'none', width: 96, cursor: 'pointer' }}
                  >
                    <div style={{ position: 'relative', height: 66, borderRadius: 13, overflow: 'hidden', border: `2.5px solid ${active ? 'var(--hero1)' : 'transparent'}` }}>
                      <div role="img" aria-label={o.name} style={{ width: '100%', height: '100%', backgroundColor: 'var(--card2)', backgroundImage: `url(${o.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                      {active && (
                        <div style={{ position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: '50%', background: 'var(--hero1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ color: '#fff', fontSize: 10, fontWeight: 900 }}>✓</span>
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: 10.5, fontWeight: 800, color: active ? 'var(--hero1)' : 'var(--muted)', lineHeight: 1.2, marginTop: 5 }}>{o.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {ex.time ? (
          <TimeBlock exId={ex.id} slot={activeSlot} dur={ex.dur} isDone={isExDone(activeSlot, ex.id)} onToggle={() => toggleTime(activeSlot, ex.id)} />
        ) : (
          <SetsBlock
            slot={activeSlot}
            exId={ex.id}
            targetReps={ex.reps}
            sets={getSets(activeSlot, ex.id) ?? []}
            dispW={dispW}
            units={units()}
            onToggle={(si) => toggleSet(activeSlot, ex.id, si)}
            onAdjW={(si, d) => adjW(activeSlot, ex.id, si, d * wStep())}
            onAdjR={(si, d) => adjR(activeSlot, ex.id, si, d)}
            onRest={() => startRest(90)}
          />
        )}
      </div>
    </div>
  );
}

function TimeBlock({ dur, isDone, onToggle }: { exId: string; slot: string; dur: number; isDone: boolean; onToggle: () => void }) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 18, padding: 22, textAlign: 'center', boxShadow: '0 8px 20px -14px var(--shadow)' }}>
      <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 40, color: 'var(--text)' }}>{dur}:00</div>
      <div style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 700, marginTop: 2 }}>at 12% incline · fat-burn pace</div>
      <button
        onClick={onToggle}
        style={{
          marginTop: 16,
          width: '100%',
          border: 'none',
          fontFamily: "'Baloo 2',sans-serif",
          fontWeight: 800,
          fontSize: 15,
          padding: 14,
          borderRadius: 15,
          cursor: 'pointer',
          background: isDone ? 'var(--good)' : 'linear-gradient(135deg,var(--hero1),var(--hero2))',
          color: '#fff',
        }}
      >
        {isDone ? 'Completed ✓' : 'Mark complete'}
      </button>
    </div>
  );
}

function SetsBlock({
  slot,
  targetReps,
  sets,
  dispW,
  units,
  onToggle,
  onAdjW,
  onAdjR,
  onRest,
}: {
  slot: string;
  exId: string;
  targetReps: number;
  sets: { w: number; r: number; done: boolean }[];
  dispW: (kg: number) => number;
  units: string;
  onToggle: (si: number) => void;
  onAdjW: (si: number, d: number) => void;
  onAdjR: (si: number, d: number) => void;
  onRest: () => void;
}) {
  void slot;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 15, color: 'var(--text)' }}>Log your sets</span>
        <span style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 700 }}>Target {targetReps} reps</span>
      </div>
      {sets.map((s, si) => (
        <div
          key={si}
          style={{
            background: 'var(--card)',
            border: `1px solid ${s.done ? 'var(--good)' : 'var(--line)'}`,
            borderRadius: 16,
            padding: '11px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            boxShadow: '0 6px 16px -14px var(--shadow)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{ width: 24, height: 24, borderRadius: 8, background: 'var(--card2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 11, color: 'var(--muted)' }}>
                {si + 1}
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--muted)' }}>Set {si + 1}</span>
            </div>
            <div
              onClick={() => onToggle(si)}
              style={{ width: 28, height: 28, borderRadius: '50%', border: `2px solid ${s.done ? 'var(--good)' : 'var(--line)'}`, background: s.done ? 'var(--good)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              {s.done && <span style={{ color: '#fff', fontSize: 13, fontWeight: 900 }}>✓</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Stepper label="Weight" value={`${dispW(s.w)} ${units}`} onMinus={() => onAdjW(si, -1)} onPlus={() => onAdjW(si, 1)} />
            <Stepper label="Reps" value={String(s.r)} onMinus={() => onAdjR(si, -1)} onPlus={() => onAdjR(si, 1)} />
          </div>
        </div>
      ))}
      <button
        onClick={onRest}
        style={{ border: '2px solid var(--hero1)', background: 'transparent', color: 'var(--hero1)', fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 14, padding: 13, borderRadius: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
      >
        ⏱ Rest timer · 90s
      </button>
    </div>
  );
}

function Stepper({ label, value, onMinus, onPlus }: { label: string; value: string; onMinus: () => void; onPlus: () => void }) {
  return (
    <div style={{ flex: 1, background: 'var(--card2)', borderRadius: 12, padding: '7px 8px' }}>
      <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', textAlign: 'center' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 3 }}>
        <div onClick={onMinus} style={{ width: 26, height: 26, borderRadius: 9, background: 'var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16, color: 'var(--text)', cursor: 'pointer', flexShrink: 0 }}>
          −
        </div>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{value}</span>
        <div onClick={onPlus} style={{ width: 26, height: 26, borderRadius: 9, background: 'var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16, color: 'var(--text)', cursor: 'pointer', flexShrink: 0 }}>
          +
        </div>
      </div>
    </div>
  );
}
