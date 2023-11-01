import { NextApiRequest, NextApiResponse } from "next";
import { getLobby, updateLobby } from "@/utils/lobbyUtils";
import getWordsFromDictionary from "@/utils/getWordsFromDictionary";

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

    if (lobby.status !== "playing") {
      return res.status(400).json({
        error: "Game not started",
      });
    }

    const words = getWordsFromDictionary(lobby.dictionary);

    if (lobby.currentTurn?.username !== player.username) {
      return res.status(400).json({
        error: "Not your turn",
      });
    }

    if (guess.length <= 2) {
      return res.status(400).json({
        error: "Guess is too short",
        isTooShort: true,
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
        isWordAlreadyUsed: true,
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
