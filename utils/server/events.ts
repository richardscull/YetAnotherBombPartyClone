import { Server as ServerIO } from "socket.io";
import { fetchServerApi, initializeBomb, toNextTurn } from "./helper";
import { Lobby, Message } from "@/types";
import { getLobby } from "@/utils/lobbyUtils";
import {
  ChangeAnswerFieldRequest,
  JoinGameRequest,
  LeaveGameRequest,
  SendAnswerRequest,
  StartGameRequest,
} from "@/utils/server/types";

export function onStartGame(socket: ServerIO, data: StartGameRequest) {
  fetchServerApi(`lobby/startGame`, "POST", data).then((data) => {
    if (data.error) return console.error(`❌ ${data.error}`);
    socket.emit("gameStarted", {
      lobby: data.lobby,
    });

    initializeBomb(socket, data.lobby);
  });
}

export function onJoinGame(socket: ServerIO, data: JoinGameRequest) {
  fetchServerApi(`lobby/joinGame`, "POST", {
    lobbyId: data.lobbyId,
    player: { username: data.username, avatar: data.avatar },
  }).then((data) => {
    if (data.error) return console.error(`❌ ${data.error}`);
    socket.emit("userJoinedGame", data);
  });
}

export function onLeaveGame(socket: ServerIO, data: LeaveGameRequest) {
  fetchServerApi(`lobby/leaveGame`, "POST", {
    lobbyId: data.lobbyId,
    player: { username: data.username, avatar: data.avatar },
  }).then((data) => {
    if (data.error) return console.error(`❌ ${data.error}`);
    socket.emit("userLeftGame", data);
  });
}

export async function onSendMessage(socket: ServerIO, message: Message) {
  const lobby = (await getLobby(message.lobbyId)) as Lobby;
  if (!lobby) return console.error("Lobby not found");

  const isDeveloper = message.username === "itsrichardscull";
  const isHost = message.username === lobby.host;

  socket.emit("receiveMessage", {
    ...message,
    userType: isHost ? "host" : isDeveloper ? "developer" : "default",
  } as Message);
}

export function onChangeAnswerField(
  socket: ServerIO,
  data: ChangeAnswerFieldRequest
) {
  socket.emit("changedAnswerField", data);
}

export async function onSendAnswer(socket: ServerIO, data: SendAnswerRequest) {
  const guess = await fetchServerApi(`game/checkGuess`, "POST", {
    lobbyId: data.lobbyId,
    player: { username: data.username },
    guess: data.guess,
  }).then((data) => {
    if (data.error) return { ...data, isGuessRight: false };
    return { ...data, isGuessRight: true };
  });

  if (!guess.isGuessRight)
    return socket.emit("wrongAnswer", {
      lobbyId: data.lobbyId,
      wordUsed: guess.isWordAlreadyUsed || false,
      isTooShort: guess.isTooShort || false,
    });

  toNextTurn(socket, data.lobbyId);
}
