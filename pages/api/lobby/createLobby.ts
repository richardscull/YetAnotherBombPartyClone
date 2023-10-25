import { Lobby, Player } from "@/types";
import { NextApiRequest, NextApiResponse } from "next";
import { generatePrompt } from "../game/nextTurn";
const fsp = require("fs").promises;

export async function getLobby(id: string) {
  const lobbies = JSON.parse(
    await fsp.readFile("./lobbies.json", "utf8")
  ) as Lobby[];

  const lobby = lobbies.find((lobby) => lobby.id === id);
  return lobby || null;
}

export async function addPlayerToLobby(lobbyId: string, player: Player) {
  const lobbies = JSON.parse(
    await fsp.readFile("./lobbies.json", "utf8")
  ) as Lobby[];

  const lobby = lobbies.find((lobby) => lobby.id === lobbyId);
  if (!lobby) return console.log("Lobby not found");

  lobbies[lobbies.indexOf(lobby)].players = [...lobby.players, player];
  fsp.writeFile("./lobbies.json", JSON.stringify(lobbies));
  return lobby;
}

export async function removePlayerFromLobby(lobbyId: string, player: Player) {
  const lobbies = JSON.parse(
    await fsp.readFile("./lobbies.json", "utf8")
  ) as Lobby[];

  const lobby = lobbies.find((lobby) => lobby.id === lobbyId);
  if (!lobby) return console.log("Lobby not found");

  lobbies[lobbies.indexOf(lobby)].players = lobby.players.filter(
    (cPlayer) => cPlayer.username !== player.username
  );
  fsp.writeFile("./lobbies.json", JSON.stringify(lobbies));
  return lobby;
}

export async function startGameInLobby(lobbyId: string) {
  const lobbies = JSON.parse(
    await fsp.readFile("./lobbies.json", "utf8")
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

  fsp.writeFile("./lobbies.json", JSON.stringify(lobbies));
  return lobby;
}

export async function updateLobby(lobbyId: string, lobbyNew: Lobby) {
  const lobbies = JSON.parse(
    await fsp.readFile("./lobbies.json", "utf8")
  ) as Lobby[];

  const lobby = lobbies.find((lobby) => lobby.id === lobbyId);
  if (!lobby) return console.log("Lobby not found");

  lobbies[lobbies.indexOf(lobby)] = lobbyNew;
  fsp.writeFile("./lobbies.json", JSON.stringify(lobbies));
  return lobbyNew;
}

export default async function createLobby(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return new Response("Method not allowed", {
      status: 405,
    });

  return res.status(403).json({
    error: "Forbidden",
  });

  // ! This is disabled because it's not used, will be used in the future
  // ! DO NOT DELETE THIS CODE
  // try {
  //   const { name, maxPlayers } = req.body;
  //   if (!name || !maxPlayers) {
  //     return res.status(400).json({
  //       error: "Missing name or maxPlayers",
  //     });
  //   }
  //   const lobby = {
  //     id: Math.random().toString(36).substring(7),
  //     name,
  //     maxPlayers,
  //     players: [],
  //     host: "host",
  //     createdAt: new Date().toISOString(),
  //   };

  //   lobbies.push(lobby);

  //   res.status(200).json({
  //     lobby,
  //   });
  // } catch (error) {
  //   console.error(error);
  //   res.status(500).json({
  //     error: "Internal server error",
  //   });
  // }
}
