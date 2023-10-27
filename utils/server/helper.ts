import { GameTurn, Lobby, Message } from "@/types";
import { Server as ServerIO } from "socket.io";
import { checkHowManyAlive, startBombTimer } from "@/utils/gameUtils";
import { clearLobby, getLobby } from "@/utils/lobbyUtils";

export const defaultLobby = JSON.stringify([
  {
    id: "public",
    name: "Public Lobby",
    maxPlayers: 16,
    players: [],
    status: "waiting",
    dictionary: "russian",
    host: "richardscull",
    createdAt: new Date().toISOString(),
  },
]);

export async function fetchServerApi(path: string, method: string, body?: any) {
  const res = await fetch(`${process.env["NEXT_PUBLIC_URL"]}/api/${path}`, {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  return res.json();
}

export async function finishGame(socket: ServerIO, lobbyId: string) {
  let lobby = await getLobby(lobbyId);
  if (!lobby) return console.error("❌ Lobby not found");

  const playersAlive = await checkHowManyAlive(lobbyId);
  const gameDuration = Math.floor((Date.now() - lobby.gameStartedAt!) / 1000);

  const winnerUsername =
    playersAlive.length === 0 ? "💀 No one" : `🏆 ${playersAlive[0].username}`;
  const bestGuesser = lobby.playersStatistics?.sort(
    (a, b) => b.wordsFound - a.wordsFound
  )[0] || { username: "No one", wordsFound: 0 };

  socket.emit("receiveMessage", {
    username: "System Message",
    lobbyId: lobbyId,
    type: "server",
    userType: "system",
    message: `Game finished! 🎉 GG!\n⌛ Game lasted ${gameDuration} seconds.\n${winnerUsername} survived!\n📗 Most words guessed by ${bestGuesser.username}, with ${bestGuesser.wordsFound} words guessed!`,
  } as Message);

  lobby = (await clearLobby(lobbyId)) || lobby;
  socket.emit("gameFinished", {
    lobby: lobby,
    winner: playersAlive[0],
  });
}

export async function initializeBomb(socket: ServerIO, lobby: Lobby) {
  const isExploded = await startBombTimer(
    lobby.id,
    lobby.currentTurn as GameTurn
  );

  if (isExploded) toNextTurn(socket, lobby.id);
}

export function toNextTurn(socket: ServerIO, lobbyId: string) {
  fetchServerApi("game/nextTurn", "POST", {
    lobbyId: lobbyId,
  }).then((data) => {
    if (data.error) return console.error(`❌ ${data.error}`);
    if (data.finished) return finishGame(socket, data.lobby.id);

    socket.emit("nextTurn", {
      lobby: data.lobby,
    });

    initializeBomb(socket, data.lobby);
  });
}
