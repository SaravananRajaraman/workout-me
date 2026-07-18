import { useMemo, useState } from 'react';
import { useStore } from '../state/store';
import { computeProgress } from '../lib/analytics';
import { addMonths, isSameMonth, monthGrid, monthLabel, startOfMonth, todayISO } from '../lib/date';

const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function ProgressScreen() {
  const { state, getUser, openDayEdit } = useStore();
  const stats = useMemo(() => computeProgress(state.sessions, state.bodyweight), [state.sessions, state.bodyweight]);
  const user = getUser();

  const today = todayISO();
  const currentMonth = useMemo(() => startOfMonth(new Date()), []);
  const [viewMonth, setViewMonth] = useState(currentMonth);
  const sessionDates = useMemo(() => new Set(state.sessions.map((s) => s.date)), [state.sessions]);
  const cells = useMemo(() => monthGrid(viewMonth), [viewMonth]);
  const atCurrentMonth = isSameMonth(viewMonth, currentMonth);
  const sessionsInMonth = useMemo(
    () => cells.filter((c) => c !== null && sessionDates.has(c)).length,
    [cells, sessionDates],
  );

  const bw = stats.bodyweightSeries;
  const hasBw = bw.length >= 2;
  let bwPath = '';
  let bwArea = '';
  let dotX = 0;
  let dotY = 0;
  if (hasBw) {
    const vals = bw.map((b) => b.kg);
    const minB = Math.min(...vals) - 1;
    const maxB = Math.max(...vals) + 1;
    const cw = 232;
    const ch = 84;
    const ox = 8;
    const oy = 10;
    const pts = bw.map((b, i) => [ox + i * (cw / (bw.length - 1)), oy + ch - ((b.kg - minB) / (maxB - minB || 1)) * ch]);
    bwPath = pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
    bwArea = `M ${ox},${oy + ch} ${pts.map((p) => `L ${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')} L ${ox + cw},${oy + ch} Z`;
    dotX = pts[pts.length - 1][0];
    dotY = pts[pts.length - 1][1];
  }
  const bwCurrent = bw.length ? bw[bw.length - 1].kg : user.weightKg;
  const bwDeltaKg = bw.length ? bwCurrent - bw[0].kg : 0;
  const maxVol = Math.max(...stats.weeklyVolume.map((w) => w.total), 1);

  return (
    <div style={{ padding: '6px 16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 24, color: 'var(--text)', marginTop: 4 }}>Progress</div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 20, padding: 16, boxShadow: '0 8px 22px -16px var(--shadow)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em' }}>Body weight</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginTop: 3 }}>
              <span style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 28, color: 'var(--text)' }}>
                {bwCurrent} kg
              </span>
              {bw.length > 1 && (
                <span style={{ fontSize: 12, fontWeight: 800, color: bwDeltaKg <= 0 ? 'var(--good)' : 'var(--hero1)' }}>
                  {bwDeltaKg > 0 ? '+' : bwDeltaKg < 0 ? '−' : ''}
                  {Math.abs(bwDeltaKg)} kg
                </span>
              )}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10.5, color: 'var(--muted)', fontWeight: 700 }}>Goal</div>
            <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 16, color: 'var(--text)' }}>
              {user.targetKg} kg
            </div>
          </div>
        </div>
        {hasBw ? (
          <>
            <svg width="100%" height="106" viewBox="0 0 248 106" preserveAspectRatio="none" style={{ marginTop: 8 }}>
              <defs>
                <linearGradient id="bwg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="var(--hero1)" stopOpacity="0.28" />
                  <stop offset="1" stopColor="var(--hero1)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={bwArea} fill="url(#bwg)" />
              <polyline points={bwPath} fill="none" stroke="var(--hero1)" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
              <circle cx={dotX} cy={dotY} r={4.5} fill="var(--hero1)" stroke="var(--card)" strokeWidth={2.5} />
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, color: 'var(--muted)', fontWeight: 700, marginTop: 2 }}>
              <span>{bw[0].date}</span>
              <span>Now</span>
            </div>
          </>
        ) : (
          <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700, marginTop: 12, textAlign: 'center' }}>
            Log your weight a couple of times to see a trend here.
          </div>
        )}
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 20, padding: 16, boxShadow: '0 8px 22px -16px var(--shadow)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em' }}>Consistency</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 15 }}>🔥</span>
            <span style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 17, color: 'var(--hero1)' }}>{stats.streak}</span>
            <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 800 }}>days</span>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
          <div
            onClick={() => setViewMonth((m) => addMonths(m, -1))}
            style={{ width: 26, height: 26, borderRadius: 8, background: 'var(--card2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 800, color: 'var(--text)', fontSize: 13 }}
          >
            ‹
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--text)' }}>{monthLabel(viewMonth)}</div>
          <div
            onClick={() => !atCurrentMonth && setViewMonth((m) => addMonths(m, 1))}
            style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              background: 'var(--card2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: atCurrentMonth ? 'default' : 'pointer',
              fontWeight: 800,
              color: atCurrentMonth ? 'var(--line)' : 'var(--text)',
              fontSize: 13,
            }}
          >
            ›
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5, marginTop: 10 }}>
          {WEEKDAY_LABELS.map((d, i) => (
            <div key={i} style={{ textAlign: 'center', fontSize: 9.5, fontWeight: 800, color: 'var(--muted)' }}>
              {d}
            </div>
          ))}
          {cells.map((iso, i) => {
            if (!iso) return <div key={i} />;
            const done = sessionDates.has(iso);
            const isToday = iso === today;
            const isPast = iso < today;
            const isFuture = iso > today;
            const missed = isPast && !done;
            return (
              <div
                key={i}
                onClick={() => !isFuture && openDayEdit(iso)}
                style={{
                  aspectRatio: '1',
                  borderRadius: 7,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: done ? 'var(--good)' : 'var(--card2)',
                  border: isToday ? '1.5px solid var(--hero1)' : 'none',
                  opacity: isFuture ? 0.45 : 1,
                  cursor: isFuture ? 'default' : 'pointer',
                }}
              >
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 800,
                    color: done ? '#fff' : 'var(--muted)',
                    textDecoration: missed ? 'line-through' : 'none',
                  }}
                >
                  {Number(iso.slice(-2))}
                </span>
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 700, marginTop: 11 }}>
          <b style={{ color: 'var(--text)' }}>{sessionsInMonth}</b> sessions logged this month
        </div>
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 20, padding: 16, boxShadow: '0 8px 22px -16px var(--shadow)' }}>
        <div style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em' }}>Weekly volume</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 6, height: 92, marginTop: 12 }}>
          {stats.weeklyVolume.map((w, i) => (
            <div key={w.weekKey} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', gap: 5 }}>
              <div
                style={{
                  width: '100%',
                  borderRadius: '6px 6px 3px 3px',
                  height: `${Math.round((w.total / maxVol) * 88)}px`,
                  background: i === stats.weeklyVolume.length - 1 ? 'linear-gradient(180deg,var(--hero1),var(--hero2))' : 'var(--card2)',
                }}
              />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--muted)', fontWeight: 700, marginTop: 6 }}>
          <span>8 wks ago</span>
          <span>
            This week · {stats.weeklyVolume[stats.weeklyVolume.length - 1]?.total ?? 0} kg
          </span>
        </div>
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 20, padding: '16px 16px 6px', boxShadow: '0 8px 22px -16px var(--shadow)' }}>
        <div style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em' }}>Personal records</div>
        {stats.prs.map((p) => (
          <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: '1px solid var(--line)' }}>
            <span style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--text)' }}>{p.name}</span>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
                {p.kg > 0 ? `${p.kg} kg` : '—'}
              </span>
              <div style={{ fontSize: 10, color: 'var(--good)', fontWeight: 800 }}>{p.setDate ? `Set ${p.setDate}` : 'Not logged yet'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
