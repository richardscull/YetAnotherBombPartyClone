import { GameTurn, Lobby, Message } from "@/types";
import { Server as ServerIO } from "socket.io";
import { clearLobby, getLobby } from "@/utils/lobbyUtils";
import { Bomb } from "./types";
import { checkHowManyAlive } from "../game/utils";
import startBombTimer from "../game/startBombTimer";
import millisecondsToString from "../msToTime";

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
  const gameDuration = millisecondsToString(
    Date.now() - (lobby.gameStartedAt || Date.now())
  );

  const winnerUsername =
    playersAlive.length === 0 ? "💀 No one" : `🏆 ${playersAlive[0].username}`;
  const winnerAvatar = lobby.players.find(
    (player) => player.username === playersAlive[0]?.username
  )?.avatar;

  const wordsFoundTotal = lobby.playersStatistics!.reduce(
    (acc, cur) => acc + cur.wordsFound,
    0
  );

  socket.emit("receiveMessage", {
    username: "System Message",
    lobbyId: lobbyId,
    type: "server",
    userType: "system",
    message: `Game finished! 🎉 GG!\n📑 Game lasted ${gameDuration} and ${wordsFoundTotal} words were used. \n${winnerUsername} survived!`,
  } as Message);

  lobby = (await clearLobby(lobbyId)) || lobby;
  socket.emit("gameFinished", {
    lobby: lobby,
    winner: playersAlive[0]
      ? {
          username: playersAlive[0].username,
          avatar: winnerAvatar,
        }
      : undefined,
  });
}

export async function initializeBomb(
  socket: ServerIO,
  lobby: Lobby,
  turnsPromptExist?: number
) {
  let bomb = await startBombTimer(lobby.id, lobby.currentTurn as GameTurn);
  bomb = {
    ...bomb,
    times: (turnsPromptExist || 0) + 1,
  };

  if (bomb.isExploded) {
    const playersAlive = await checkHowManyAlive(lobby.id);

    switch (playersAlive.length) {
      case 1:
        bomb = undefined as any;
        break;
      case 2:
        if ((turnsPromptExist || 0) + 1 >= 2) bomb = undefined as any;
        break;
      default:
        if ((turnsPromptExist || 0) + 1 >= 3) bomb = undefined as any;
        break;
    }

    toNextTurn(socket, lobby.id, bomb);
  }
}

export function toNextTurn(socket: ServerIO, lobbyId: string, bomb?: Bomb) {
  fetchServerApi("game/nextTurn", "POST", {
    lobbyId: lobbyId,
    prompt: bomb?.prompt || undefined,
  }).then((data) => {
    if (data.error) return console.error(`❌ ${data.error}`);
    if (data.finished) return finishGame(socket, data.lobby.id);

    socket.emit("nextTurn", {
      lobby: data.lobby,
    });

    initializeBomb(socket, data.lobby, bomb?.times);
  });
}
