import { useEffect, useState } from 'react';
import './App.css';
import { Game } from './game';

function App() {
  const [gameId, setGameId] = useState<string>();

  useEffect(() => {
    if (window.location.pathname !== '/') {
      setGameId(window.location.pathname.replace('/', ''));
    }
  }, []);

  return (
    <>
      <Game playerGameId={gameId} />
    </>
  );
}

export default App;
