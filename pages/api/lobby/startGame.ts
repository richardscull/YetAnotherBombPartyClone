import { NextApiRequest, NextApiResponse } from "next";
import { getLobby, startGameInLobby } from "@/utils/lobbyUtils";

export default async function startGame(
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
