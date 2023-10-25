import { getLobby as getLobbyLocal, updateLobby } from "../lobby/createLobby";
import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs/promises";

export async function generatePrompt(lobbyId: string) {
  const lobby = await getLobbyLocal(lobbyId);
  if (!lobby) return console.log("Lobby not found");

  const words = JSON.parse(
    await fs.readFile("./russian_nouns_with_definition.json", "utf8")
  );

  if (!words) return console.log("No words found");
  const keys = Object.keys(words);

  const word = keys[Math.floor(Math.random() * keys.length)];

  return getRandomLetters(word);
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

export default async function checkGuess(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({
      error: "Method not allowed",
    });

  try {
    const id = req.query.lobbyId as string;
    const { guess, username } = req.body;

    console.log(id);

    const words = Object.keys(
      JSON.parse(
        await fs.readFile("./russian_nouns_with_definition.json", "utf8")
      )
    );

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

    if (lobby.currentTurn?.username !== username) {
      return res.status(400).json({
        error: "Not your turn",
      });
    }

    if (
      !guess.toLowerCase().includes(lobby.currentTurn?.prompt.toLowerCase())
    ) {
      return res.status(400).json({
        error: "Incorrect guess",
      });
    }

    if (!words.includes(guess.toLowerCase())) {
      return res.status(400).json({
        error: "Incorrect guess",
      });
    }

    if (lobby.words?.wordsUsed.includes(guess.toLowerCase())) {
      return res.status(400).json({
        error: "Word already used",
      });
    }

    lobby = {
      ...lobby,
      words: {
        wordsUsed: [...lobby.words!.wordsUsed, guess.toLowerCase()],
      },
      playersStatistics: lobby.playersStatistics!.map((player) => {
        if (player.username === username) {
          return {
            ...player,
            wordsFound: player.wordsFound + 1,
          };
        } else {
          return player;
        }
      }),
    };

    lobby = (await updateLobby(id, lobby)) || lobby;

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
