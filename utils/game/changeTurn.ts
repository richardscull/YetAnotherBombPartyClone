import { getLobby } from "../lobbyUtils";

export default async function changeTurn(lobbyId: string) {
  const lobby = await getLobby(lobbyId);
  if (!lobby) return console.log("Lobby not found");

  const players = lobby.playersStatistics;
  const currentPlayer = lobby.currentTurn?.username;

  if (!players || !currentPlayer)
    return console.log("No players or currentPlayer");

  const currentPlayerIndex = players.findIndex(
    (player) => player.username === currentPlayer
  );

  let i = 0;
  if (currentPlayerIndex !== players.length - 1) {
    i = currentPlayerIndex + 1;
  }

  for (; i < players.length; i++) {
    if (players[i].lives > 0) {
      return players[i].username;
    } else if (i === players.length - 1) {
      i = -1;
    }
  }
}
