import { NextApiRequest, NextApiResponse } from "next";
import { getLobby, startGameInLobby } from "@/utils/lobbyUtils";
import { StartGameRequest } from "@/utils/server/types";

export default async function startGame(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({
      error: "Method not allowed",
    });

  try {
    const { lobbyId, username } = req.body as StartGameRequest;

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

    if (!lobby.players.find((cPlayer) => cPlayer.username === username)) {
      return res.status(400).json({
        error: "Username does not exist",
      });
    }

    if (
      lobby.players.find((cPlayer) => cPlayer.username === lobby?.host) &&
      username !== lobby?.host
    ) {
      return res.status(400).json({
        error: "Only the host can start the game",
      });
    }

    lobby = (await startGameInLobby(lobbyId)) || lobby;

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
