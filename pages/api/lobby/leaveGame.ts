import { Player } from "@/types";
import { removePlayerFromLobby, getLobby } from "./createLobby";
import { NextApiRequest, NextApiResponse } from "next";

export default async function leaveGame(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({
      error: "Method not allowed",
    });

  try {
    const id = req.query.lobbyId as string;
    const { player } = req.body;

    if (!id) {
      return res.status(400).json({
        error: "Missing lobbyId",
      });
    }

    let lobby = await getLobby(id);
    if (!lobby) {
      return res.status(404).json({
        error: "Lobby not found",
      });
    }

    if (
      !lobby.players.find((cPlayer) => cPlayer.username === player.username)
    ) {
      return res.status(400).json({
        error: "Username does not exist",
      });
    }

    lobby = (await removePlayerFromLobby(id, player)) || lobby;

    return res.status(200).json({
      lobby,
      username: player.username,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}
