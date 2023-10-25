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
  players: Player[];
  status: "waiting" | "playing";
  host: string;
  createdAt: string;
  currentTurn?: GameTurn;
  words?: GameWords;
  playersStatistics?: PlayerStatistics[];
  gameStartedAt?: number;
};

type Player = {
  username: string;
  avatar: string;
};

type Message = {
  username: string;
  type: "text" | "admin"; // ! "admin" type is deprecated
  avatar: string;
  message: string;
  lobbyId: string;
};

type GameTurn = {
  username: string;
  prompt: string;
};

type GameWords = {
  wordsUsed: string[];
};

type PlayerStatistics = {
  username: string;
  lives: number;
  wordsFound: number;
};
