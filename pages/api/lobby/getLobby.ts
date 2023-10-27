import { getLobby as getLobbyLocal } from "@/utils/lobbyUtils";
import { NextApiRequest, NextApiResponse } from "next";

export default async function getLobby(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET")
    return res.status(405).json({
      error: "Method not allowed",
    });

  try {
    const id = req.query.id as string;

    if (!id) {
      return res.status(400).json({
        error: "Missing id",
      });
    }

    const lobby = await getLobbyLocal(id);
    if (!lobby) {
      return res.status(404).json({
        error: "Lobby not found",
      });
    }

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
