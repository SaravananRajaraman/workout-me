import type { CSSProperties } from 'react';
import { useStore } from '../state/store';
import { heightForDisplay } from '../lib/units';

export function ProfileScreen() {
  const { getUser, openSetup, openConfig, go, setTheme, state, library, signOut } = useStore();
  const user = getUser();
  const isDark = state.theme === 'dark';
  const bmiVal = user.weightKg / Math.pow(user.heightCm / 100, 2);
  const bmiCat = bmiVal < 18.5 ? 'low' : bmiVal < 25 ? 'healthy' : bmiVal < 30 ? 'high' : 'obese';
  const initial = (user.name || 'A').trim().charAt(0).toUpperCase();
  const libTotal = library.push.length + library.pull.length + library.legs.length;

  const segStyle = (active: boolean): CSSProperties => ({
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '9px 0',
    borderRadius: 10,
    cursor: 'pointer',
    background: active ? 'var(--card)' : 'transparent',
    boxShadow: active ? '0 2px 6px rgba(0,0,0,.12)' : 'none',
  });

  return (
    <div style={{ padding: '6px 16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginTop: 6 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 18,
            background: 'linear-gradient(135deg,var(--hero1),var(--hero2))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Baloo 2',sans-serif",
            fontWeight: 800,
            fontSize: 23,
            color: '#fff',
            boxShadow: '0 10px 20px -10px var(--hero1)',
          }}
        >
          {initial}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 20, color: 'var(--text)' }}>{user.name}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>{user.gym}</div>
        </div>
        <div
          onClick={openSetup}
          style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 13, padding: '8px 12px', cursor: 'pointer', boxShadow: '0 4px 12px -8px var(--shadow)' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--hero1)" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
          </svg>
          <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--hero1)' }}>Edit</span>
        </div>
      </div>

      <div style={{ background: 'linear-gradient(135deg,var(--hero1),var(--hero2))', borderRadius: 18, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 14px 26px -16px var(--hero1)' }}>
        <div>
          <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,.85)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em' }}>Current goal</div>
          <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 17, color: '#fff', marginTop: 2 }}>{user.goal}</div>
        </div>
        <span style={{ fontSize: 26 }}>🎯</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <StatTile label="Height" value={heightForDisplay(user.heightCm, user.heightUnit)} />
        <StatTile label="Weight" value={`${user.weightKg} kg`} />
        <StatTile label="Target" value={`${user.targetKg} kg`} />
        <StatTile label="BMI" value={bmiVal.toFixed(1)} suffix={bmiCat} />
      </div>

      <div
        onClick={openConfig}
        style={{ display: 'flex', alignItems: 'center', gap: 13, background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 18, padding: '14px 16px', cursor: 'pointer', boxShadow: '0 8px 22px -16px var(--shadow)' }}
      >
        <div style={{ width: 44, height: 44, borderRadius: 13, background: 'linear-gradient(135deg,var(--hero1),var(--hero2))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6.5 6.5 17.5 17.5" />
            <path d="m21 21-1-1" />
            <path d="m3 3 1 1" />
            <path d="m18 22 4-4" />
            <path d="m2 6 4-4" />
            <path d="m3 10 7-7" />
            <path d="m14 21 7-7" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>Configure workouts</div>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 700, marginTop: 2 }}>Build P·P·L from {libTotal} exercises</div>
        </div>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth={2.4} strokeLinecap="round">
          <polyline points="9 6 15 12 9 18" />
        </svg>
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 18, padding: '6px 16px', boxShadow: '0 8px 22px -16px var(--shadow)' }}>
        <div style={{ padding: '14px 0 13px', borderBottom: '1px solid var(--line)' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', marginBottom: 11 }}>Appearance</div>
          <div style={{ display: 'flex', gap: 6, background: 'var(--card2)', borderRadius: 13, padding: 4 }}>
            <div onClick={() => setTheme('light')} style={segStyle(!isDark)}>
              <span style={{ fontSize: 13 }}>☀️</span>
              <span style={{ fontSize: 12.5, fontWeight: 800, color: !isDark ? 'var(--hero1)' : 'var(--muted)' }}>Light</span>
            </div>
            <div onClick={() => setTheme('dark')} style={segStyle(isDark)}>
              <span style={{ fontSize: 13 }}>🌙</span>
              <span style={{ fontSize: 12.5, fontWeight: 800, color: isDark ? 'var(--hero1)' : 'var(--muted)' }}>Dark</span>
            </div>
          </div>
        </div>
        <div onClick={openSetup} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--line)', cursor: 'pointer' }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>Height unit</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--muted)' }}>{user.heightUnit === 'ft' ? 'Feet & inches' : 'Centimeters (cm)'}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth={2.4} strokeLinecap="round">
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </div>
        </div>
        <div onClick={() => go('sync')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--line)', cursor: 'pointer' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>Google account</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, marginTop: 1 }}>{state.signedIn ? state.googleEmail ?? 'Connected' : 'Not connected'}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: state.signedIn ? 'var(--good)' : 'var(--muted)' }} />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth={2.4} strokeLinecap="round">
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0' }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>Rest timer default</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--muted)' }}>90 s</span>
        </div>
      </div>

      <div onClick={signOut} style={{ textAlign: 'center', fontSize: 13, color: 'var(--hero1)', fontWeight: 800, padding: 6, cursor: 'pointer' }}>
        Sign out
      </div>

      <div style={{ textAlign: 'center', fontSize: 10.5, color: 'var(--muted)', fontWeight: 600, opacity: 0.7, padding: '2px 12px' }}>
        Exercise images &amp; animations © Gym Visual (gymvisual.com), via{' '}
        <a href="https://github.com/hasaneyldrm/exercises-dataset" target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>
          exercises-dataset
        </a>{' '}
        (MIT)
      </div>
      <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--muted)', fontWeight: 700, opacity: 0.6, fontFamily: "'JetBrains Mono',monospace" }}>
        v{__APP_VERSION__} · {__BUILD_COMMIT__} · {new Date(__BUILD_TIME__).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
      </div>
    </div>
  );
}

function StatTile({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16, padding: '13px 14px' }}>
      <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 18, color: 'var(--text)', marginTop: 3 }}>
        {value} {suffix && <span style={{ fontSize: 10, color: 'var(--hero1)' }}>{suffix}</span>}
      </div>
    </div>
  );
}
