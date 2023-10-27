import { Lobby, Player } from "@/types";
import fs from "fs/promises";
import { generatePrompt } from "./gameUtils";

export async function getLobby(id: string) {
  const lobbies = JSON.parse(
    await fs.readFile("./lobbies.json", "utf8")
  ) as Lobby[];

  const lobby = lobbies.find((lobby) => lobby.id === id);
  return lobby || null;
}

export async function addPlayerToLobby(lobbyId: string, player: Player) {
  const lobbies = JSON.parse(
    await fs.readFile("./lobbies.json", "utf8")
  ) as Lobby[];

  const lobby = lobbies.find((lobby) => lobby.id === lobbyId);
  if (!lobby) return console.log("Lobby not found");

  lobbies[lobbies.indexOf(lobby)].players = [...lobby.players, player];
  fs.writeFile("./lobbies.json", JSON.stringify(lobbies));
  return lobby;
}

export async function removePlayerFromLobby(lobbyId: string, player: Player) {
  const lobbies = JSON.parse(
    await fs.readFile("./lobbies.json", "utf8")
  ) as Lobby[];

  const lobby = lobbies.find((lobby) => lobby.id === lobbyId);
  if (!lobby) return console.log("Lobby not found");

  lobbies[lobbies.indexOf(lobby)].players = lobby.players.filter(
    (cPlayer) => cPlayer.username !== player.username
  );
  fs.writeFile("./lobbies.json", JSON.stringify(lobbies));
  return lobby;
}

export async function startGameInLobby(lobbyId: string) {
  const lobbies = JSON.parse(
    await fs.readFile("./lobbies.json", "utf8")
  ) as Lobby[];

  const lobby = lobbies.find((lobby) => lobby.id === lobbyId);
  if (!lobby) return console.log("Lobby not found");

  lobbies[lobbies.indexOf(lobby)].status = "playing";
  lobbies[lobbies.indexOf(lobby)].gameStartedAt = Date.now();

  lobbies[lobbies.indexOf(lobby)].words = {
    wordsUsed: [],
  };

  if (lobby.players.length < 1) {
    return console.log("Not enough players");
  }

  lobbies[lobbies.indexOf(lobby)].playersStatistics = lobby.players.map(
    (player) => ({
      username: player.username,
      lives: 3,
      wordsFound: 0,
    })
  );

  lobbies[lobbies.indexOf(lobby)].currentTurn = {
    username: lobby.playersStatistics![0].username,
    prompt: (await generatePrompt(lobbyId)) || "",
  };

  fs.writeFile("./lobbies.json", JSON.stringify(lobbies));
  return lobby;
}

export async function updateLobby(lobbyId: string, lobbyNew: Lobby) {
  const lobbies = JSON.parse(
    await fs.readFile("./lobbies.json", "utf8")
  ) as Lobby[];

  const lobby = lobbies.find((lobby) => lobby.id === lobbyId);
  if (!lobby) return console.log("Lobby not found");

  lobbies[lobbies.indexOf(lobby)] = lobbyNew;
  fs.writeFile("./lobbies.json", JSON.stringify(lobbies));
  return lobbyNew;
}

export async function clearLobby(lobbyId: string) {
  const lobbies = JSON.parse(
    await fs.readFile("./lobbies.json", "utf8")
  ) as Lobby[];

  const lobby = lobbies.find((lobby) => lobby.id === lobbyId);
  if (!lobby) return console.log("Lobby not found");

  const cleanLobby = {
    ...lobby,
    players: [],
    words: undefined,
    playersStatistics: undefined,
    currentTurn: undefined,
    gameStartedAt: undefined,
    status: "waiting",
  } as Lobby;

  lobbies[lobbies.indexOf(lobby)] = cleanLobby;
  await fs.writeFile("./lobbies.json", JSON.stringify(lobbies));
  return cleanLobby;
}
