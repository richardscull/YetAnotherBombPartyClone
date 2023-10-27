import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs/promises";
import { getLobby, updateLobby } from "@/utils/lobbyUtils";

export default async function checkGuess(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({
      error: "Method not allowed",
    });

  try {
    const { lobbyId, player, guess } = req.body as {
      lobbyId: string;
      player: { username: string };
      guess: string;
    };

    if (!lobbyId) {
      return res.status(400).json({
        error: "Missing lobbyId",
      });
    }

    let lobby = await getLobby(lobbyId);
    if (!lobby) {
      return res.status(404).json({
        error: "Lobby not found",
      });
    }

    const words = Object.keys(
      JSON.parse(
        await fs.readFile(
          `./utils/dictionaries/${lobby.dictionary}.json`,
          "utf8"
        )
      )
    );

    if (lobby.status !== "playing") {
      return res.status(400).json({
        error: "Game not started",
      });
    }

    if (lobby.currentTurn?.username !== player.username) {
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
      playersStatistics: lobby.playersStatistics!.map((cPlayer) => {
        if (cPlayer.username === player.username) {
          return {
            ...cPlayer,
            wordsFound: cPlayer.wordsFound + 1,
          };
        } else {
          return cPlayer;
        }
      }),
    };

    lobby = (await updateLobby(lobbyId, lobby)) || lobby;
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
