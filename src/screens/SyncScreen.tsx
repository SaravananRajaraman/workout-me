import { useStore } from '../state/store';
import { formatRelative } from '../lib/date';

export function SyncScreen() {
  const { state, back, signIn, signOut, syncNow, toggleWifi } = useStore();
  const syncing = state.sync.status === 'syncing';
  const initial = (state.googleEmail || 'G').trim().charAt(0).toUpperCase();

  return (
    <div style={{ padding: '6px 16px 20px', display: 'flex', flexDirection: 'column', gap: 13 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
        <div onClick={back} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--card)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </div>
        <span style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 21, color: 'var(--text)' }}>Google Sync</span>
      </div>

      {!state.signedIn ? (
        <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 18, padding: 18, textAlign: 'center', boxShadow: '0 8px 22px -16px var(--shadow)' }}>
          <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, lineHeight: 1.6, marginBottom: 14 }}>
            You&apos;re not connected. Sign in with Google to back up your workouts to Drive and Sheets.
          </div>
          <button
            onClick={signIn}
            disabled={!state.googleConfigured}
            style={{
              width: '100%',
              border: 'none',
              background: 'linear-gradient(135deg,var(--hero1),var(--hero2))',
              color: '#fff',
              fontFamily: "'Baloo 2',sans-serif",
              fontWeight: 800,
              fontSize: 15,
              padding: 14,
              borderRadius: 15,
              cursor: state.googleConfigured ? 'pointer' : 'not-allowed',
              opacity: state.googleConfigured ? 1 : 0.5,
            }}
          >
            Connect Google account
          </button>
          {!state.googleConfigured && (
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, marginTop: 10 }}>
              Missing VITE_GOOGLE_CLIENT_ID — see .env.example.
            </div>
          )}
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 18, padding: 14, boxShadow: '0 8px 22px -16px var(--shadow)' }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--card2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 16, color: 'var(--hero1)' }}>
              {initial}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--text)' }}>{state.googleEmail ?? 'Connected'}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--good)' }} />
                <span style={{ fontSize: 11, color: 'var(--good)', fontWeight: 800 }}>Connected</span>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 18, padding: '6px 16px', boxShadow: '0 8px 22px -16px var(--shadow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--line)' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>Last synced</div>
                <div style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 700, marginTop: 2 }}>
                  {state.sync.status === 'error' ? state.sync.error : formatRelative(state.sync.lastSyncedAt)}
                </div>
              </div>
              <button
                onClick={syncNow}
                disabled={syncing}
                style={{ display: 'flex', alignItems: 'center', gap: 7, border: 'none', background: 'var(--card2)', color: 'var(--text)', fontWeight: 800, fontSize: 12, padding: '9px 14px', borderRadius: 13, cursor: syncing ? 'default' : 'pointer' }}
              >
                {syncing ? (
                  <>
                    <span style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid var(--muted)', borderTopColor: 'var(--hero1)', display: 'inline-block', animation: 'spin .9s linear infinite' }} />
                    Syncing
                  </>
                ) : (
                  <>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--good)', display: 'inline-block' }} />
                    Sync now
                  </>
                )}
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>Auto-sync on Wi-Fi only</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, marginTop: 1 }}>Save mobile data</div>
              </div>
              <div
                onClick={toggleWifi}
                style={{ width: 46, height: 27, borderRadius: 14, background: state.wifiOnly ? 'linear-gradient(90deg,var(--hero1),var(--hero2))' : 'var(--line)', position: 'relative', cursor: 'pointer', flexShrink: 0, transition: 'background .15s' }}
              >
                <div style={{ width: 21, height: 21, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: state.wifiOnly ? 22 : 3, transition: 'left .15s', boxShadow: '0 1px 3px rgba(0,0,0,.3)' }} />
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 18, padding: '15px 16px', boxShadow: '0 8px 22px -16px var(--shadow)' }}>
            <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600, lineHeight: 1.6 }}>
              Your data is stored in a private &quot;Slam PPL Data&quot; spreadsheet in your Google Drive — profile, plan, sessions and body-weight logs, all in one place.
            </div>
          </div>

          <div onClick={signOut} style={{ textAlign: 'center', fontSize: 13, color: 'var(--hero1)', fontWeight: 800, padding: 6, cursor: 'pointer' }}>
            Disconnect Google account
          </div>
        </>
      )}
    </div>
  );
}
