import { NextApiResponseServerIO } from "@/types";
import { Server as ServerIO } from "socket.io";
import { Server as NetServer } from "http";

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
    // thanks to redbaron76
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: "/api/socket",
    });
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
    });

    console.log("Setting up socket");
  }
  res.end();
}
