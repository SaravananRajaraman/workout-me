import { useStore } from '../state/store';

export function RestTimerSheet() {
  const { state, addRest, skipRest } = useStore();
  const { open, left, total } = state.rest;
  if (!open) return null;

  const circ = 2 * Math.PI * 78;
  const offset = circ * (1 - left / total);

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,7,5,.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-end', zIndex: 20 }}>
      <div style={{ width: '100%', background: 'var(--bg)', borderRadius: '30px 30px 0 0', padding: '24px 24px 30px', animation: 'riseIn .28s ease' }}>
        <div style={{ width: 44, height: 4, borderRadius: 2, background: 'var(--line)', margin: '0 auto 16px' }} />
        <div style={{ textAlign: 'center', fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 16, color: 'var(--muted)' }}>Rest between sets</div>
        <div style={{ position: 'relative', width: 180, height: 180, margin: '14px auto 6px' }}>
          <svg width="180" height="180" viewBox="0 0 180 180">
            <circle cx="90" cy="90" r="78" fill="none" stroke="var(--card2)" strokeWidth={12} />
            <circle
              cx="90"
              cy="90"
              r="78"
              fill="none"
              stroke="var(--hero1)"
              strokeWidth={12}
              strokeLinecap="round"
              strokeDasharray={circ.toFixed(1)}
              strokeDashoffset={offset.toFixed(1)}
              transform="rotate(-90 90 90)"
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 44, color: 'var(--text)', lineHeight: 1 }}>{left}</span>
            <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 800, marginTop: 2 }}>seconds</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <button onClick={() => addRest(-15)} style={{ flex: 1, border: '1px solid var(--line)', background: 'var(--card)', color: 'var(--text)', fontWeight: 800, fontSize: 13, padding: 13, borderRadius: 15, cursor: 'pointer' }}>
            −15s
          </button>
          <button onClick={() => addRest(15)} style={{ flex: 1, border: '1px solid var(--line)', background: 'var(--card)', color: 'var(--text)', fontWeight: 800, fontSize: 13, padding: 13, borderRadius: 15, cursor: 'pointer' }}>
            +15s
          </button>
        </div>
        <button
          onClick={skipRest}
          style={{ width: '100%', marginTop: 10, border: 'none', background: 'linear-gradient(135deg,var(--hero1),var(--hero2))', color: '#fff', fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 15, padding: 15, borderRadius: 16, cursor: 'pointer', boxShadow: '0 12px 22px -12px var(--hero1)' }}
        >
          Skip rest
        </button>
      </div>
    </div>
  );
}
