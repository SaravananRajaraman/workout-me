import type { ScheduleDay } from '../data/types';
import { typeName, typeSub } from '../data/exercises';
import { assetUrl } from '../lib/assetPath';
import { useStore } from '../state/store';

const MODES: { key: ScheduleDay; label: string; icon: string }[] = [
  { key: 'push', label: 'Push', icon: '🏋️' },
  { key: 'pull', label: 'Pull', icon: '💪' },
  { key: 'legs', label: 'Legs', icon: '🦵' },
  { key: 'rest', label: 'Rest', icon: '🛌' },
];

export function TodayScreen() {
  const { state, suggestedType, getUser, selectDayType, openEx, go, planItems, isExDone, finishWorkout, openSetup } = useStore();
  const gym = getUser().gym;
  const dayType = state.day.type;
  const isRest = dayType === 'rest';
  const curType = isRest ? null : dayType;

  const items = curType ? planItems(curType) : [];
  const itemViews = items.map((ex) => {
    const done = curType ? isExDone(curType, ex.id) : false;
    const setsReps = ex.time ? `${ex.dur} min` : `${ex.sets} × ${ex.reps}`;
    const meta = ex.time ? 'Incline walk · finisher' : `${ex.muscle} · Last ${ex.last} kg`;
    return { ex, done, setsReps, meta };
  });
  const doneCount = itemViews.filter((i) => i.done).length;
  const total = itemViews.length;
  const ctaText = doneCount === 0 ? 'Start Workout' : doneCount >= total ? 'Finish & Save ✓' : 'Continue Workout';

  const startFirst = () => {
    if (!curType) return;
    if (doneCount >= total && total > 0) {
      finishWorkout(curType);
      go('progress');
      return;
    }
    const next = itemViews.find((i) => !i.done);
    if (next) openEx(curType, next.ex.id);
  };

  const heroC = 'var(--hero1)';
  const mutedC = 'var(--muted)';

  return (
    <div style={{ padding: '6px 14px 20px', display: 'flex', flexDirection: 'column', gap: 15 }}>
      <div
        style={{
          borderRadius: 24,
          padding: '17px 18px 18px',
          background: 'linear-gradient(135deg,var(--hero1),var(--hero2))',
          boxShadow: '0 18px 34px -18px var(--hero1)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: -30, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,.09)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,.85)', letterSpacing: '.06em', textTransform: 'uppercase' }}>
            {gym}
          </span>
          <div
            onClick={() => go('sync')}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,.2)', padding: '5px 9px', borderRadius: 13, cursor: 'pointer' }}
          >
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />
            <span style={{ fontSize: 9.5, color: '#fff', fontWeight: 800 }}>
              {!state.signedIn ? 'Local only' : state.sync.status === 'syncing' ? 'Syncing' : 'Synced'}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 12, position: 'relative' }}>
          <div>
            <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 29, color: '#fff', lineHeight: 1 }}>
              {typeName[dayType]}
            </div>
            <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.88)', fontWeight: 700, marginTop: 5 }}>
              {typeSub[dayType]}
              {!isRest ? ` · ${gym}` : ''}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 22, color: '#fff' }}>{isRest ? '—' : `${doneCount}/${total}`}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.8)', fontWeight: 800, letterSpacing: '.04em' }}>DONE</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        {MODES.map((m) => {
          const active = m.key === dayType;
          return (
            <div
              key={m.key}
              onClick={() => selectDayType(m.key)}
              style={
                active
                  ? {
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 5,
                      padding: '9px 0 7px',
                      borderRadius: 14,
                      background: 'linear-gradient(135deg,var(--hero1),var(--hero2))',
                      cursor: 'pointer',
                      boxShadow: '0 8px 16px -8px var(--hero1)',
                    }
                  : { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '9px 0 7px', borderRadius: 14, background: 'var(--card)', cursor: 'pointer', border: '1px solid var(--line)' }
              }
            >
              <span style={{ fontSize: 15, lineHeight: 1 }}>{m.icon}</span>
              <span style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 13, color: active ? '#fff' : m.key === 'rest' ? mutedC : heroC }}>{m.label}</span>
            </div>
          );
        })}
      </div>

      {isRest ? (
        <div style={{ background: 'var(--card)', borderRadius: 20, padding: '26px 22px', textAlign: 'center', boxShadow: '0 8px 22px -14px var(--shadow)', border: '1px solid var(--line)', marginTop: 2 }}>
          <div style={{ fontSize: 40 }}>🛌</div>
          <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 21, color: 'var(--text)', marginTop: 6 }}>Rest & Recover</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, lineHeight: 1.6, marginTop: 8 }}>
            Muscle grows on rest days. Keep protein up, hydrate, and get 7–8 h sleep.
            {' '}Next up: <b style={{ color: 'var(--text)' }}>{typeName[suggestedType]}</b> when you&apos;re back.
          </div>
          <button
            onClick={openSetup}
            style={{ marginTop: 16, border: 'none', background: 'var(--card2)', color: 'var(--hero1)', fontWeight: 800, fontSize: 13, padding: '12px 20px', borderRadius: 14, cursor: 'pointer' }}
          >
            Log today&apos;s body weight
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          {itemViews.map(({ ex, done, setsReps, meta }) => (
            <div
              key={ex.id}
              onClick={() => curType && openEx(curType, ex.id)}
              style={{ background: 'var(--card)', borderRadius: 18, overflow: 'hidden', boxShadow: '0 8px 20px -14px var(--shadow)', border: '1px solid var(--line)', cursor: 'pointer' }}
            >
              <div style={{ position: 'relative', height: 118 }}>
                <div
                  role="img"
                  aria-label={ex.name}
                  style={{ width: '100%', height: '100%', backgroundColor: 'var(--card2)', backgroundImage: `url(${assetUrl(ex.img)})`, backgroundSize: 'auto', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', filter: 'saturate(1.05)' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(0,0,0,.05) 30%,rgba(0,0,0,.72) 100%)' }} />
                <span style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(255,255,255,.92)', color: 'var(--hero1)', fontSize: 9.5, fontWeight: 800, padding: '4px 9px', borderRadius: 9, letterSpacing: '.03em', textTransform: 'uppercase' }}>
                  {ex.muscle}
                </span>
                {done && (
                  <div style={{ position: 'absolute', top: 9, right: 10, width: 26, height: 26, borderRadius: '50%', background: 'var(--good)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,.25)' }}>
                    <span style={{ color: '#fff', fontSize: 14, fontWeight: 900 }}>✓</span>
                  </div>
                )}
                <div style={{ position: 'absolute', left: 12, right: 12, bottom: 9, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <span style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 16.5, color: '#fff', lineHeight: 1.1, maxWidth: 150, textShadow: '0 1px 6px rgba(0,0,0,.4)' }}>{ex.name}</span>
                  <span style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 15, color: '#fff', background: 'rgba(255,255,255,.16)', backdropFilter: 'blur(4px)', padding: '3px 9px', borderRadius: 10, whiteSpace: 'nowrap' }}>
                    {setsReps}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px' }}>
                <span style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 700 }}>{meta}</span>
                <span style={{ fontSize: 11.5, color: 'var(--hero1)', fontWeight: 800 }}>{done ? 'Done' : 'Log sets'} ›</span>
              </div>
            </div>
          ))}
          <button
            onClick={startFirst}
            style={{
              border: 'none',
              background: 'linear-gradient(135deg,var(--hero1),var(--hero2))',
              color: '#fff',
              fontFamily: "'Baloo 2',sans-serif",
              fontWeight: 800,
              fontSize: 16,
              padding: 16,
              borderRadius: 18,
              cursor: 'pointer',
              boxShadow: '0 14px 26px -12px var(--hero1)',
              marginTop: 2,
            }}
          >
            {ctaText}
          </button>
        </div>
      )}
    </div>
  );
}
