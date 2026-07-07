import type { DayType } from '../data/types';
import { assetUrl } from '../lib/assetPath';
import { useStore } from '../state/store';

const TABS: { key: DayType; label: string }[] = [
  { key: 'push', label: 'Push' },
  { key: 'pull', label: 'Pull' },
  { key: 'legs', label: 'Legs' },
];

export function ConfigScreen() {
  const { state, backToProfile, setCfgTab, library, getPlan, toggleInPlan, resetPlan } = useStore();
  const cfgTab = state.cfgTab;
  const plan = getPlan();
  const cfgPlan = plan[cfgTab];

  const byGroup = new Map<string, typeof library.push>();
  library[cfgTab].forEach((item) => {
    if (!byGroup.has(item.group)) byGroup.set(item.group, []);
    byGroup.get(item.group)!.push(item);
  });

  return (
    <div style={{ padding: '6px 14px 22px', display: 'flex', flexDirection: 'column', gap: 13 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
        <div
          onClick={backToProfile}
          style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--card)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 20, color: 'var(--text)', lineHeight: 1 }}>Configure Workouts</div>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 700, marginTop: 3 }}>Pick the moves for each workout mode</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 7 }}>
        {TABS.map((tab) => {
          const active = cfgTab === tab.key;
          return (
            <div
              key={tab.key}
              onClick={() => setCfgTab(tab.key)}
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '10px 0',
                borderRadius: 13,
                fontFamily: "'Baloo 2',sans-serif",
                fontWeight: 800,
                fontSize: 14,
                cursor: 'pointer',
                background: active ? 'linear-gradient(135deg,var(--hero1),var(--hero2))' : 'var(--card)',
                color: active ? '#fff' : 'var(--muted)',
                border: '1px solid var(--line)',
              }}
            >
              {tab.label}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 2px' }}>
        <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>
          <b style={{ color: 'var(--hero1)', fontFamily: "'Baloo 2',sans-serif" }}>{cfgPlan.length}</b> of {library[cfgTab].length} · {cfgTab}
        </span>
        <span onClick={resetPlan} style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 800, textDecoration: 'underline', cursor: 'pointer' }}>
          Reset
        </span>
      </div>

      {Array.from(byGroup.entries()).map(([group, items]) => (
          <div key={group}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', margin: '8px 2px 8px' }}>
              {group} · {items.length}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {items.map((item) => {
                const inPlan = cfgPlan.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleInPlan(cfgTab, item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      background: 'var(--card)',
                      border: `1.5px solid ${inPlan ? 'var(--hero1)' : 'var(--line)'}`,
                      borderRadius: 15,
                      padding: '9px 12px 9px 9px',
                      cursor: 'pointer',
                      boxShadow: '0 6px 16px -14px var(--shadow)',
                    }}
                  >
                    <div role="img" aria-label={item.name} style={{ width: 52, height: 52, borderRadius: 11, backgroundColor: 'var(--card2)', backgroundImage: `url(${assetUrl(item.img)})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--text)', lineHeight: 1.2 }}>{item.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, marginTop: 2 }}>{item.muscle}</div>
                    </div>
                    <div
                      style={{
                        width: 27,
                        height: 27,
                        borderRadius: 9,
                        border: `2px solid ${inPlan ? 'var(--hero1)' : 'var(--line)'}`,
                        background: inPlan ? 'var(--hero1)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {inPlan ? <span style={{ color: '#fff', fontSize: 14, fontWeight: 900 }}>✓</span> : <span style={{ color: 'var(--muted)', fontSize: 16, fontWeight: 400, lineHeight: 1 }}>+</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
    </div>
  );
}
