import { NextApiRequest, NextApiResponse } from "next";
import {
  changeTurn,
  checkHowManyAlive,
  generatePrompt,
} from "@/utils/gameUtils";
import { getLobby, updateLobby } from "@/utils/lobbyUtils";

export default async function nextTurn(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({
      error: "Method not allowed",
    });

  try {
    const { lobbyId } = req.body as { lobbyId: string };

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

    const playersAlive = (await checkHowManyAlive(lobbyId)).length;

    if (playersAlive <= 1 && lobby.playersStatistics!.length > 1) {
      return res.status(200).json({
        lobby,
        finished: true,
      });
    } else if (playersAlive === 0) {
      return res.status(200).json({
        lobby,
        finished: true,
      });
    }

    const prompt = (await generatePrompt(lobbyId)) || "error";
    const newTurnUsername = (await changeTurn(lobbyId)) || "error";

    lobby.currentTurn = {
      username: newTurnUsername,
      prompt,
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
