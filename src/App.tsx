import { useEffect } from 'react';
import { StoreProvider, useStore } from './state/store';
import { SignInScreen } from './screens/SignInScreen';
import { TodayScreen } from './screens/TodayScreen';
import { ExerciseScreen } from './screens/ExerciseScreen';
import { ProgressScreen } from './screens/ProgressScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { ConfigScreen } from './screens/ConfigScreen';
import { SyncScreen } from './screens/SyncScreen';
import { BottomNav } from './components/BottomNav';
import { SetupSheet } from './components/SetupSheet';
import { RestTimerSheet } from './components/RestTimerSheet';

function Shell() {
  const { state } = useStore();

  useEffect(() => {
    document.documentElement.dataset.theme = state.theme;
  }, [state.theme]);

  const showNav = ['today', 'progress', 'profile', 'sync'].includes(state.screen);

  return (
    <div style={{ height: '100dvh', background: 'var(--bg)', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 430, height: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
        <div className="scr" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          {state.screen === 'signin' && <SignInScreen />}
          {state.screen === 'today' && <TodayScreen />}
          {state.screen === 'exercise' && <ExerciseScreen />}
          {state.screen === 'progress' && <ProgressScreen />}
          {state.screen === 'profile' && <ProfileScreen />}
          {state.screen === 'config' && <ConfigScreen />}
          {state.screen === 'sync' && <SyncScreen />}
        </div>
        {showNav && <BottomNav />}
        <SetupSheet />
        <RestTimerSheet />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
