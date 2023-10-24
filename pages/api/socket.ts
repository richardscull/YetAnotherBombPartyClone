import { NextApiResponseServerIO } from "@/types";
import { Server as ServerIO } from "socket.io";
import { Server as NetServer } from "http";
import fs from "fs/promises";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function SocketHandler(
  req: Request,
  res: NextApiResponseServerIO
) {
  if (!res.socket.server.io) {
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: "/api/socket",
    });

    // Scince this is a new server, we need to create a new lobbies.json file
    fs.writeFile(
      "./lobbies.json",
      JSON.stringify([
        {
          id: "public",
          name: "Public Lobby",
          maxPlayers: 16,
          players: [],
          status: "waiting",
          host: "richardscull",
          createdAt: new Date().toISOString(),
        },
      ])
    );

    res.socket.server.io = io;
    io.on("connection", (socket) => {
      socket.on("sendMessage", (message) => {
        console.log("got message");
        io.emit("receiveMessage", message);
      });

      socket.on("buttonPress", (data) => {
        console.log(data);
        io.emit("buttonPressed", data);
      });

      socket.on("joinGame", (data) => {
        fetch(
          `${process.env["NEXT_PUBLIC_URL"]}/api/lobby/joinGame?lobbyId=` +
            data.lobbyId,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              player: { username: data.username, avatar: data.avatar },
            }),
          }
        )
          .then((res) => res.json())
          .then((dataJson) => {
            if (dataJson.lobby) {
              io.emit("userJoinedGame", {
                lobby: dataJson.lobby,
                username: dataJson.username,
              });
            }
          });
      });

      socket.on("leaveGame", (data) => {
        fetch(
          `${process.env["NEXT_PUBLIC_URL"]}/api/lobby/leaveGame?lobbyId=` +
            data.lobbyId,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              player: { username: data.username, avatar: data.avatar },
            }),
          }
        )
          .then((res) => res.json())
          .then((dataJson) => {
            if (dataJson.lobby) {
              io.emit("userLeftGame", {
                lobby: dataJson.lobby,
                username: dataJson.username,
              });
            }
          });
      });
    });

    console.log("Setting up socket");
  }
  res.end();
}
