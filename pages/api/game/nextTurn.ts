import { getLobby as getLobbyLocal, updateLobby } from "../lobby/createLobby";
import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs/promises";
import { GameTurn } from "@/types";

export async function generatePrompt(lobbyId: string) {
  const lobby = await getLobbyLocal(lobbyId);
  if (!lobby) return console.log("Lobby not found");

  const words = Object.keys(
    JSON.parse(
      await fs.readFile("./russian_nouns_with_definition.json", "utf8")
    )
  );

  if (!words) return console.log("No words found");

  const word = words[Math.floor(Math.random() * words.length)];

  return getRandomLetters(word);
}

export async function bombTimber(lobbyId: string, currentTurn: GameTurn) {
  return new Promise<boolean>(async (resolve) => {
    let isBombExploded = false;
    setTimeout(async () => {
      let lobby = await getLobbyLocal(lobbyId);
      if (!lobby) {
        resolve(isBombExploded); // Resolve the promise with the current value
        return;
      }

      if (
        lobby.currentTurn?.username != currentTurn.username ||
        lobby.currentTurn?.prompt != currentTurn.prompt
      ) {
        resolve(isBombExploded); // Resolve the promise with the current value
        return;
      }

      lobby = {
        ...lobby,
        playersStatistics: lobby.playersStatistics!.map((player) => {
          if (player.username === currentTurn.username) {
            return {
              ...player,
              lives: player.lives - 1,
            };
          } else {
            return player;
          }
        }),
      };

      await updateLobby(lobbyId, lobby);
      isBombExploded = true;

      resolve(isBombExploded); // Resolve the promise with the updated value
    }, 1000 * 10);
  });
}

function getRandomLetters(word: string) {
  const letters = word.split("");

  if (letters.length >= 3 && Math.random() > 0.75) {
    return getRandomThreeLetters(letters);
  } else if (letters.length >= 2) {
    return getRandomTwoLetters(letters);
  } else {
    return letters[Math.floor(Math.random() * letters.length)];
  }
}

function getRandomTwoLetters(letters: string[]) {
  const randomLetterIndex = Math.floor(Math.random() * letters.length);
  if (!letters[randomLetterIndex + 1]) return getRandomTwoLetters(letters);
  return letters[randomLetterIndex] + letters[randomLetterIndex + 1];
}

function getRandomThreeLetters(letters: string[]) {
  const randomLetterIndex = Math.floor(Math.random() * letters.length);
  if (!letters[randomLetterIndex + 2]) return getRandomThreeLetters(letters);
  return (
    letters[randomLetterIndex] +
    letters[randomLetterIndex + 1] +
    letters[randomLetterIndex + 2]
  );
}

export async function changeTurn(lobbyId: string) {
  const lobby = await getLobbyLocal(lobbyId);
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

export async function checkHowManyAlive(lobbyId: string) {
  const lobby = await getLobbyLocal(lobbyId);
  if (!lobby) return [];

  const players = lobby.playersStatistics;
  if (!players) return [];

  return players.filter((player) => player.lives > 0);
}

export default async function nextTurn(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({
      error: "Method not allowed",
    });

  try {
    const id = req.query.lobbyId as string;

    if (!id) {
      return res.status(400).json({
        error: "Missing lobbyId",
      });
    }

    let lobby = await getLobbyLocal(id);
    if (!lobby) {
      return res.status(404).json({
        error: "Lobby not found",
      });
    }

    if (lobby.status !== "playing") {
      return res.status(400).json({
        error: "Game not started",
      });
    }

    const playersAlive = (await checkHowManyAlive(id)).length;

    console.log(playersAlive);
    console.log(lobby.playersStatistics!.length);
    if (playersAlive <= 1 && lobby.playersStatistics!.length > 1) {
      console.log("finished");
      return res.status(200).json({
        lobby,
        status: "finished",
      });
    } else if (playersAlive === 0) {
      console.log("finished");
      return res.status(200).json({
        lobby,
        status: "finished",
      });
    }

    const prompt = (await generatePrompt(id)) || "error";
    const newTurnUsername = (await changeTurn(id)) || "error";

    lobby.currentTurn = {
      username: newTurnUsername,
      prompt,
    };

    console.log(lobby);

    lobby = (await updateLobby(id, lobby)) || lobby;

    console.log("sent:");
    console.log(lobby);

    return res.status(200).json({
      lobby,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}
