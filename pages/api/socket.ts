import { Message, NextApiResponseServerIO } from "@/types";
import { Server as ServerIO } from "socket.io";
import { Server as NetServer } from "http";
import fs from "fs";
import { defaultLobby } from "@/utils/server/helper";
import {
  onChangeAnswerField,
  onDisconnect,
  onJoinGame,
  onLeaveGame,
  onSendAnswer,
  onSendMessage,
  onStartGame,
} from "@/utils/server/events";

export const config = {
  api: {
    bodyParser: false,
  },
};

function InitializeServerSocket(res: NextApiResponseServerIO) {
  const httpServer: NetServer = res.socket.server as any;
  const io = new ServerIO(httpServer, {
    path: "/api/socket",
  });

  // Since this is a new server,
  // we need to create/update a lobbies.json file
  fs.writeFileSync("./lobbies.json", defaultLobby);

  res.socket.server.io = io;
  return io;
}

export default function SocketHandler(_: any, res: NextApiResponseServerIO) {
  if (res.socket.server.io) {
    res.end();
    return;
  }

  const serverIO = InitializeServerSocket(res);
  serverIO.on("connection", (socket) => {
    socket.on("sendMessage", (m: Message) =>
      onSendMessage(serverIO, socket, m)
    );
    socket.on("startGame", (data) => onStartGame(serverIO, data));
    socket.on("joinGame", (data) => onJoinGame(serverIO, data));
    socket.on("leaveGame", (data) => onLeaveGame(serverIO, data));
    socket.on("sendAnswer", (data) => onSendAnswer(serverIO, data));
    socket.on("disconnect", () => onDisconnect(serverIO, socket));
    socket.on("changeAnswerField", (data) =>
      onChangeAnswerField(serverIO, data)
    );
  });

  console.log("✅ Server socket initialized");
  res.end();
}
