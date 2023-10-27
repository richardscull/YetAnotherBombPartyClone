import { getLobby } from "../lobbyUtils";

export async function checkHowManyAlive(lobbyId: string) {
    const lobby = await getLobby(lobbyId);
    if (!lobby) return [];
  
    const players = lobby.playersStatistics;
    if (!players) return [];
  
    return players.filter((player) => player.lives > 0);
  }
  