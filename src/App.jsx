import { useState, useCallback } from 'react';
import SetupScreen from './components/SetupScreen';
import ModeScreen from './components/ModeScreen';
import PreviewScreen from './components/PreviewScreen';
import DrawEqual from './components/DrawEqual';
import DrawOne from './components/DrawOne';

export default function App() {
  const [screen, setScreen] = useState('setup');
  const [participants, setParticipants] = useState([]);
  const [mode, setMode] = useState(null);

  const reset = useCallback(() => {
    setScreen('setup');
    setParticipants([]);
    setMode(null);
  }, []);

  if (screen === 'setup') {
    return (
      <SetupScreen onStart={names => {
        setParticipants(names);
        if (names.length === 12) {
          // 12 players = exactly 1 group each, skip mode/preview
          setMode('equal');
          setScreen('draw');
        } else {
          setScreen('mode');
        }
      }} />
    );
  }
  if (screen === 'mode') {
    return (
      <ModeScreen
        participants={participants}
        onSelect={m => { setMode(m); setScreen('preview'); }}
        onBack={() => setScreen('setup')}
      />
    );
  }
  if (screen === 'preview') {
    return <PreviewScreen onBeginDraw={() => setScreen('draw')} onBack={() => setScreen('mode')} />;
  }
  if (mode === 'equal') return <DrawEqual participants={participants} onReset={reset} />;
  return <DrawOne participants={participants} onReset={reset} />;
}
