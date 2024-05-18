import React, { useCallback, useState } from 'react'
import supabase from '../supabaseClient';
import { usePlayerId } from '../hooks';

const CreateGame = ({onStartGame}:{onStartGame:(data: {id: string; maxPlayers: number;}) => void}) => {
  const playerId = usePlayerId();
  const [playerCount, setPlayerCount] = useState(5);

  const handlePlayerCountChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setPlayerCount(parseInt(event.target.value, 10));
    },
    []
  );

  const handleStartGame = useCallback(async () => {
    const response = await supabase
      .from('Games')
      .insert({ creator_id: playerId, player_count: playerCount })
      .select();

    if (response.error) {
      throw new Error(response.error.message);
    }

    onStartGame({id:response.data[0].id, maxPlayers: playerCount})
    window.history.replaceState({}, '', response.data[0].id);
  }, [playerId, playerCount, onStartGame]);

  return (
    <div>
      <p>
        Player count:
        <select onChange={handlePlayerCountChange} value={playerCount}>
          {[5, 6, 7, 8].map((val) => (
            <option value={val} key={`val-${val}`}>{val}</option>
          ))}
        </select>
      </p>
      <button onClick={handleStartGame}>Start game</button>
    </div>
  )
}

export default CreateGame
