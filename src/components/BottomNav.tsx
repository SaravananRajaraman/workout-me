import { useStore } from '../state/store';

export function BottomNav() {
  const { state, go } = useStore();
  const heroC = 'var(--hero1)';
  const mutedC = 'var(--muted)';
  const items: { key: 'today' | 'progress' | 'profile'; label: string; icon: (color: string) => JSX.Element }[] = [
    {
      key: 'today',
      label: 'Today',
      icon: (color) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2 3 14h7l-1 8 10-12h-7z" />
        </svg>
      ),
    },
    {
      key: 'progress',
      label: 'Progress',
      icon: (color) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="20" x2="4" y2="12" />
          <line x1="10" y1="20" x2="10" y2="5" />
          <line x1="16" y1="20" x2="16" y2="9" />
          <line x1="22" y1="20" x2="4" y2="20" />
        </svg>
      ),
    },
    {
      key: 'profile',
      label: 'Profile',
      icon: (color) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      ),
    },
  ];

  return (
    <div
      style={{
        flexShrink: 0,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '9px 8px calc(env(safe-area-inset-bottom, 0px) + 12px)',
        background: 'var(--card)',
        borderTop: '1px solid var(--line)',
      }}
    >
      {items.map((item) => {
        const active = state.screen === item.key;
        const color = active ? heroC : mutedC;
        return (
          <div
            key={item.key}
            onClick={() => go(item.key)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer', padding: '2px 14px' }}
          >
            {item.icon(color)}
            <span style={{ fontSize: 9.5, fontWeight: 800, color }}>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}
