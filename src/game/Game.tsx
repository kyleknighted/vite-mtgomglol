import { useCallback, useEffect, useRef, useState } from 'react';
import supabase from '../supabaseClient';
import { usePlayerId } from '../hooks';

export const Game = ({ playerGameId }: { playerGameId?: string }) => {
  const playerId = usePlayerId();
  const allPlayerIdsRef = useRef<string[]>();
  const playerCountRef = useRef<number>();
  const [loading, setLoading] = useState(!playerGameId);
  const [gameFull, setGameFull] = useState(false);
  const [currentGameId, setCurrentGameId] = useState(playerGameId);

  useEffect(() => {
    if (currentGameId) {
      setLoading(false);
    } else {
      supabase
        .from('Games')
        .select()
        .eq('creator_id', playerId)
        .eq('ended', false)
        .then((response) => {
          setCurrentGameId(response.data?.[0]?.id);
          setLoading(false);
        });
    }

    if (playerGameId) {
      console.log(playerGameId);
      supabase
        .from('Games')
        .select()
        .eq('id', playerGameId)
        .eq('ended', false)
        .then((response) => {
          console.log(response);
          if (response.error) {
            throw new Error(response.error.message);
          }
          const data = response.data?.[0];

          if (!data) {
            // no data means this isn't a valid game
            setCurrentGameId(undefined);
          }

          if (data.creator_id === playerId) {
            // creator is trying to load player link, go back to home
            window.history.replaceState(null, '', '/');
          }

          // check if player is currently in the game
          if (data.player_ids && !data.player_ids.includes(playerId)) {
            // couldn't find player, check to see if the game is full
            if (data.player_counter >= data.player_ids.length) {
              setGameFull(true);
            }
          }
        });
    }
  }, [currentGameId, playerId]);

  const handleStartGame = useCallback(async () => {
    const response = await supabase
      .from('Games')
      .insert({ creator_id: playerId, player_count: playerCountRef.current })
      .select();

    if (response.error) {
      throw new Error(response.error.message);
    }

    setCurrentGameId(response.data[0].id);
  }, [playerId]);

  const handleEndGame = useCallback(async () => {
    const response = await supabase
      .from('Games')
      .update({ ended: true })
      .eq('id', currentGameId);

    if (response.error) {
      throw new Error(response.error.message);
    }

    setCurrentGameId(undefined);
  }, [currentGameId]);

  const handlePlayerCountChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      playerCountRef.current = parseInt(event.target.value, 10);
    },
    []
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (gameFull) {
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
              {currentGameId}
            </code>
          </p>

          <button onClick={handleEndGame}>End game</button>
        </div>
      ) : (
        <div>
          <p>
            Player count:
            <select onChange={handlePlayerCountChange}>
              {[5, 6, 7, 8].map((val) => (
                <option value={val}>{val}</option>
              ))}
            </select>
          </p>
          <button onClick={handleStartGame}>Start game</button>
        </div>
      )}
    </div>
  );
};
