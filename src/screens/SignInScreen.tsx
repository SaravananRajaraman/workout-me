import { useStore } from '../state/store';

export function SignInScreen() {
  const { signIn, skipSignin, state } = useStore();

  return (
    <div style={{ padding: '30px 26px 26px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 15, minHeight: '100%', flex: 1 }}>
      <div
        style={{
          width: 70,
          height: 70,
          borderRadius: 22,
          background: 'linear-gradient(135deg,var(--hero1),var(--hero2))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 26,
          boxShadow: '0 18px 34px -14px var(--hero1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <div style={{ width: 8, height: 24, borderRadius: 2, background: '#fff' }} />
          <div style={{ width: 22, height: 8, borderRadius: 2, background: '#fff' }} />
          <div style={{ width: 8, height: 24, borderRadius: 2, background: '#fff' }} />
        </div>
      </div>
      <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 26, color: 'var(--text)', marginTop: 4 }}>Slam PPL</div>
      <div style={{ fontSize: 13.5, color: 'var(--muted)', fontWeight: 700, marginTop: -8 }}>Push · Pull · Legs — every rep counts</div>
      <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, lineHeight: 1.6, maxWidth: 230, marginTop: 4 }}>
        Sign in to back up every workout to Google Drive and pick up on any device.
      </div>
      <button
        onClick={signIn}
        disabled={!state.googleConfigured}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 11,
          background: '#fff',
          border: '1px solid #e4ded7',
          borderRadius: 16,
          padding: 14,
          fontFamily: "'Nunito',sans-serif",
          fontWeight: 800,
          fontSize: 14,
          color: '#3c3c3c',
          cursor: state.googleConfigured ? 'pointer' : 'not-allowed',
          opacity: state.googleConfigured ? 1 : 0.5,
          marginTop: 10,
          boxShadow: '0 6px 16px -8px rgba(0,0,0,.2)',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.2 17.7 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v9.1h12.4c-.5 2.9-2.1 5.3-4.6 7l7.1 5.5c4.2-3.9 6.6-9.6 6.6-16.5z" />
          <path fill="#FBBC05" d="M10.4 28.3c-.5-1.4-.8-2.9-.8-4.3s.3-3 .8-4.3l-7.8-6.1C1 16.7 0 20.2 0 24s1 7.3 2.6 10.4l7.8-6.1z" />
          <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.1-5.5c-2 1.3-4.5 2.1-8.8 2.1-6.3 0-11.7-3.7-13.6-9.1l-7.8 6.1C6.5 42.6 14.6 48 24 48z" />
        </svg>
        Continue with Google
      </button>
      {!state.googleConfigured && (
        <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700 }}>
          Google sign-in isn&apos;t configured yet — set VITE_GOOGLE_CLIENT_ID to enable it.
        </div>
      )}
      <div onClick={skipSignin} style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 800, textDecoration: 'underline', marginTop: 'auto', cursor: 'pointer' }}>
        Continue without syncing
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, opacity: 0.8 }}>Your data stays private — only you can see it.</div>
    </div>
  );
}
