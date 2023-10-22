import { Server as NetServer, Socket } from "net";
import { NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";

type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

type Lobby = {
  id: string;
  name: string;
  maxPlayers: number;
  players: string[];
  host: string;
  createdAt: string;
};

type Message = {
  username: string;
  type: "text" | "admin";
  avatar: string;
  message: string;
  lobbyId: string;
};
