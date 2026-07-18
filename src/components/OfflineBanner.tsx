import { useOnline } from '../lib/useOnline';

export function OfflineBanner() {
  const online = useOnline();
  if (online) return null;

  return (
    <div
      style={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        padding: '7px 12px',
        background: 'var(--card2)',
        borderBottom: '1px solid var(--line)',
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--muted)', flexShrink: 0 }} />
      <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--muted)' }}>You&apos;re offline — your workout data still saves locally</span>
    </div>
  );
}
