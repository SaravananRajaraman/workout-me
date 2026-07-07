import { useStore } from '../state/store';
import { heightForDisplay, type HeightUnit } from '../lib/units';

const GOALS = ['Fat loss + muscle', 'Fat loss', 'Muscle gain', 'Maintain'];

function heightStep(unit: HeightUnit): number {
  return unit === 'ft' ? 2.54 : 1;
}

export function SetupSheet() {
  const { state, setDraft, saveSetup, closeSetup } = useStore();
  const draft = state.draft;
  if (!state.setupOpen || !draft) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,7,5,.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-end', zIndex: 25 }}>
      <div className="scr" style={{ width: '100%', maxHeight: '92%', overflowY: 'auto', background: 'var(--bg)', borderRadius: '28px 28px 0 0', padding: '20px 20px 26px', animation: 'riseIn .28s ease' }}>
        <div style={{ width: 44, height: 4, borderRadius: 2, background: 'var(--line)', margin: '0 auto 14px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 20, color: 'var(--text)' }}>Your details</div>
          <div
            onClick={closeSetup}
            style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--card2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 800, color: 'var(--muted)', fontSize: 16 }}
          >
            ✕
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, marginBottom: 16 }}>
          This is what you share on setup — used across your plan, targets and BMI.
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>Name</div>
          <input
            value={draft.name}
            onChange={(e) => setDraft({ name: e.target.value })}
            placeholder="Your name"
            style={{ width: '100%', border: '1px solid var(--line)', background: 'var(--card)', borderRadius: 14, padding: '12px 14px', fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: 14, color: 'var(--text)', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          <Row
            label="Height"
            value={heightForDisplay(draft.heightCm, draft.heightUnit)}
            onMinus={() => setDraft({ heightCm: Math.max(120, Math.round(draft.heightCm - heightStep(draft.heightUnit))) })}
            onPlus={() => setDraft({ heightCm: Math.min(230, Math.round(draft.heightCm + heightStep(draft.heightUnit))) })}
          />
          <Row
            label="Current weight"
            value={`${draft.weightKg} kg`}
            onMinus={() => setDraft({ weightKg: Math.max(30, Math.round((draft.weightKg - 0.5) * 2) / 2) })}
            onPlus={() => setDraft({ weightKg: Math.min(250, Math.round((draft.weightKg + 0.5) * 2) / 2) })}
          />
          <Row
            label="Target weight"
            value={`${draft.targetKg} kg`}
            onMinus={() => setDraft({ targetKg: Math.max(30, Math.round((draft.targetKg - 0.5) * 2) / 2) })}
            onPlus={() => setDraft({ targetKg: Math.min(250, Math.round((draft.targetKg + 0.5) * 2) / 2) })}
          />
        </div>

        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', margin: '16px 0 8px' }}>Height unit</div>
        <div style={{ display: 'flex', gap: 6, background: 'var(--card2)', borderRadius: 14, padding: 4 }}>
          {(['cm', 'ft'] as const).map((v) => {
            const active = draft.heightUnit === v;
            return (
              <div
                key={v}
                onClick={() => setDraft({ heightUnit: v })}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '10px 0',
                  borderRadius: 11,
                  fontSize: 12.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: active ? 'var(--card)' : 'transparent',
                  boxShadow: active ? '0 2px 6px rgba(0,0,0,.14)' : 'none',
                  color: active ? 'var(--hero1)' : 'var(--muted)',
                }}
              >
                {v === 'cm' ? 'Centimeters' : 'Feet & inches'}
              </div>
            );
          })}
        </div>

        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', margin: '16px 0 8px' }}>Goal</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {GOALS.map((g) => {
            const active = draft.goal === g;
            return (
              <div
                key={g}
                onClick={() => setDraft({ goal: g })}
                style={{
                  padding: '12px 10px',
                  borderRadius: 14,
                  textAlign: 'center',
                  fontSize: 12.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: active ? 'linear-gradient(135deg,var(--hero1),var(--hero2))' : 'var(--card2)',
                  color: active ? '#fff' : 'var(--muted)',
                }}
              >
                {g}
              </div>
            );
          })}
        </div>

        <button
          onClick={saveSetup}
          style={{
            width: '100%',
            marginTop: 20,
            border: 'none',
            background: 'linear-gradient(135deg,var(--hero1),var(--hero2))',
            color: '#fff',
            fontFamily: "'Baloo 2',sans-serif",
            fontWeight: 800,
            fontSize: 16,
            padding: 15,
            borderRadius: 16,
            cursor: 'pointer',
            boxShadow: '0 12px 22px -12px var(--hero1)',
          }}
        >
          Save details
        </button>
      </div>
    </div>
  );
}

function Row({ label, value, onMinus, onPlus }: { label: string; value: string; onMinus: () => void; onPlus: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 15, padding: '12px 14px' }}>
      <span style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--text)' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div onClick={onMinus} style={{ width: 30, height: 30, borderRadius: 10, background: 'var(--card2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18, color: 'var(--text)', cursor: 'pointer' }}>
          −
        </div>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 14, color: 'var(--text)', minWidth: 56, textAlign: 'center' }}>{value}</span>
        <div onClick={onPlus} style={{ width: 30, height: 30, borderRadius: 10, background: 'var(--card2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18, color: 'var(--text)', cursor: 'pointer' }}>
          +
        </div>
      </div>
    </div>
  );
}
