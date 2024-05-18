import { useCallback, useEffect, useRef, useState } from 'react';
import supabase from '../supabaseClient';
import { usePlayerId } from '../hooks';
import CreateGame from './CreateGame';

export const Game = () => {
  const playerId = usePlayerId();
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<{max: number; total: number}>({max: 0, total: 0});
  const [currentGameId, setCurrentGameId] = useState<string>();

  const handleStartGame = useCallback((gameData: {id: string; maxPlayers: number; total?: number;}) => {
    setCurrentGameId(gameData.id);
    setPlayers({
      max: gameData.maxPlayers,
      total: gameData.total || 1
    });

    setLoading(false);
  }, []);

  useEffect(() => {
    if(currentGameId) {
      supabase
        .from('Games')
        .select()
        .eq('id', currentGameId)
        .eq('ended', false)
        .then((response) => {
          if (response.error) {
            throw new Error(response.error.message);
          }
          const data = response.data?.[0];

          if (!data) {
            // no data means this isn't a valid game
            window.history.replaceState({}, '', '/');
            setLoading(false);
            setCurrentGameId(undefined);
          } else {
            handleStartGame({id: data.id, maxPlayers: data.player_count, total: (data.player_ids ?? []).length + 1});
          }
        });
    }
  }, [currentGameId,handleStartGame]);

  useEffect(() => {
    if (window.location.pathname !== '/') {
      setCurrentGameId(window.location.pathname.replace('/', ''));
    } else {
      setLoading(false);
    }
  }, [window.location.pathname]);

  // useEffect(() => {
  //   if(currentGameId) {
  //     supabase
  //       .channel(currentGameId)
  //       .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'Games' }, payload => {
  //         console.log('Change received!', payload)
  //       })
  //       .subscribe()

  // }

  //   return () => {
  //     second
  //   }
  // }, [currentGameId])

  const handleEndGame = useCallback(async () => {
    const response = await supabase
      .from('Games')
      .update({ ended: true })
      .eq('id', currentGameId);

    if (response.error) {
      throw new Error(response.error.message);
    }

    setCurrentGameId(undefined);
    window.history.replaceState({}, '', '/');
  }, [currentGameId]);

  if(loading) {
    return <div>Loading...</div>;
  }

  if (players.max < players.total) {
    return <div>All seats taken...</div>;
  }

  return (
    <div>
      {currentGameId ? (
        <div>
          <p>
            Invite your friends: <br />
            <code>
              {window.location.href}
            </code>
          </p>

          <p>Waiting on {players.max - players.total} players</p>

          <button onClick={handleEndGame}>End game</button>
        </div>
      ) : (
        <CreateGame onStartGame={handleStartGame} />
      )}
    </div>
  );
};
