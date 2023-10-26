import { Lobby, Message, NextApiResponseServerIO } from "@/types";
import { Server as ServerIO } from "socket.io";
import { Server as NetServer } from "http";
import fs from "fs/promises";
import { bombTimber, checkHowManyAlive } from "./game/nextTurn";
import { getLobby, updateLobby } from "./lobby/createLobby";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function finishGame(lobbyId: string, io: ServerIO) {
  const lobby = await getLobby(lobbyId);
  if (!lobby) return console.log("Lobby not found");
  const playersAlive = await checkHowManyAlive(lobbyId);

  io.emit("receiveMessage", {
    username: "System",
    lobbyId: lobbyId,
    type: "text",
    message: `Game finished! GG!\n⌛ Game lasted ${Math.floor(
      (Date.now() - lobby.gameStartedAt!) / 1000
    )} seconds.\n 🏆 ${
      playersAlive.length === 0 ? "No one" : playersAlive.join(", ")
    } survived!\n Most words guessed by ${
      lobby.playersStatistics?.sort((a, b) => b.wordsFound - a.wordsFound)[0]
        .username
    }, with ${
      lobby.playersStatistics?.sort((a, b) => b.wordsFound - a.wordsFound)[0]
        .wordsFound
    } words guessed!`,
  } as Message);

  lobby.status = "waiting";
  lobby.currentTurn = undefined;
  lobby.words = undefined;
  lobby.playersStatistics = undefined;
  lobby.players = [];
  lobby.gameStartedAt = undefined;

  await updateLobby(lobbyId, lobby);

  io.emit("gameFinished", {
    lobby: lobby,
    winner: playersAlive,
  });
}

async function startBomb(data: any, io: ServerIO) {
  const isExploded = await bombTimber(data.lobby.id, data.lobby.currentTurn);
  console.log(isExploded);

  if (isExploded) {
    fetch(
      `${process.env["NEXT_PUBLIC_URL"]}/api/game/nextTurn?lobbyId=` +
        data.lobby.id,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((res) => res.json())
      .then(async (dataJson) => {
        console.log(dataJson.error);
        if (dataJson.lobby) {
          console.log(dataJson.status);
          console.log(dataJson.status === "finished");
          if (dataJson.status === "finished") {
            await finishGame(dataJson.lobby.id, io);
          } else {
            io.emit("nextTurn", {
              lobby: dataJson.lobby,
            });
            console.log(dataJson.lobby);
            await startBomb(dataJson, io);
          }
        }
      });
  }
}

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
      socket.on("sendMessage", async (message: Message) => {
        const lobby = (await getLobby(message.lobbyId)) as Lobby;
        if (!lobby) return console.log("Lobby not found");
        const isDeveloper = message.username === "itsrichardscull";
        const isHost = message.username === lobby.host;

        io.emit("receiveMessage", {
          ...message,
          userType: isHost ? "host" : isDeveloper ? "developer" : "default",
        } as Message);
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

      socket.on("startGame", (data) => {
        console.log(data);
        fetch(
          `${process.env["NEXT_PUBLIC_URL"]}/api/lobby/startGame?lobbyId=` +
            data,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
          .then((res) => res.json())
          .then((dataJson) => {
            if (dataJson.lobby) {
              io.emit("gameStarted", {
                lobby: dataJson.lobby,
              });
              startBomb(dataJson, io);
            }
          });
      });

      socket.on("changeAnswerField", (data) => {
        io.emit("changedAnswerField", {
          lobbyId: data.lobbyId,
          guess: data.guess,
          username: data.username,
        });
      });

      socket.on("sendAnswer", (data) => {
        console.log(data.lobbyId);
        fetch(
          `${process.env["NEXT_PUBLIC_URL"]}/api/game/checkGuess?lobbyId=` +
            data.lobbyId,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: data.username,
              guess: data.guess,
            }),
          }
        )
          .then((res) => res.json())
          .then((dataJson) => {
            if (dataJson.lobby) {
              fetch(
                `${process.env["NEXT_PUBLIC_URL"]}/api/game/nextTurn?lobbyId=` +
                  data.lobbyId,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              )
                .then((res) => res.json())
                .then(async (dataJsonNext) => {
                  if (dataJsonNext.lobby) {
                    if (dataJsonNext.status === "finished") {
                      await finishGame(dataJson.lobby.id, io);
                    } else {
                      io.emit("nextTurn", {
                        lobby: dataJsonNext.lobby,
                      });
                      startBomb(dataJsonNext, io);
                    }
                  }
                });
            } else {
              io.emit("wrongAnswer", {
                lobbyId: data.lobbyId,
              });
            }
          });
      });
    });

    console.log("Setting up socket");
  }
  res.end();
}
