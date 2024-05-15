import { useLocalStorage } from "@uidotdev/usehooks";
import { useEffect } from "react";

const generateRandomId = () => {
  return `${Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, '')
    .substring(2, 10)}`;
};

export const usePlayerId = () => {
  const [playerId, setPlayerId] = useLocalStorage<string>('mtgomglol-playerId');

  useEffect(() => {
    if (!playerId) {
      setPlayerId(generateRandomId());
    }
  }, [playerId]);

  return playerId;
}