import { Lobby } from "@/types";
import { NextApiRequest, NextApiResponse } from "next";

export const lobbies = [
  {
    id: "public",
    name: "Public Lobby",
    maxPlayers: 16,
    players: [],
    host: "richardscull",
    createdAt: new Date().toISOString(),
  },
] as Lobby[];

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
