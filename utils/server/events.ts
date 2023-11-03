import { Server as ServerIO, Socket as SocketIO } from "socket.io";
import { fetchServerApi, initializeBomb, toNextTurn } from "./helper";
import { Lobby, Message, dictionaryType } from "@/types";
import { getLobby, updateLobby } from "@/utils/lobbyUtils";
import {
  ChangeAnswerFieldRequest,
  JoinGameRequest,
  LeaveGameRequest,
  SendAnswerRequest,
  StartGameRequest,
} from "@/utils/server/types";
import { decode } from "next-auth/jwt";
import handleSlashCommands, { isSlashCommand } from "../handleSlashCommands";
import { getUserType } from "../getUserColorAndBadge";

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

export async function onSendMessage(
  socket: ServerIO,
  socketClient: SocketIO,
  message: Message
) {
  const lobby = (await getLobby(message.lobbyId)) as Lobby;
  if (!lobby) return console.error("Lobby not found");

  const isHost = message.username === lobby.host;

  if (isSlashCommand(message.message)) {
    if (!isHost)
      return socketClient.emit("receiveMessage", {
        type: "server",
        message: `You can't use slash commands if you're not the host`,
        lobbyId: lobby.id,
        username: "System Message",
        userType: "system",
      } as Message);

    if (lobby.status === "playing")
      socketClient.emit("receiveMessage", {
        type: "server",
        message: `You can't use slash commands while playing`,
        lobbyId: lobby.id,
        username: "System Message",
        userType: "system",
      } as Message);

    if (isHost && lobby.status === "waiting")
      return await handleSlashCommands(socket, socketClient, lobby, message);
  }

  socket.emit("receiveMessage", {
    ...message,
    userType: getUserType(message.username, lobby),
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

export async function onDisconnect(
  socketServer: ServerIO,
  socketClient: SocketIO
) {
  const lobbyId = socketClient.handshake.headers.referer?.split("/")[4];
  if (!lobbyId) return;

  const token =
    socketClient.handshake.headers.cookie?.match(
      /next-auth.session-token=([^;]+)/
    )?.[1] || undefined;
  if (!token) return;

  const getUser = await decode({
    token: token,
    secret: process.env.NEXTAUTH_SECRET!,
  }).catch(() => {});
  if (!getUser) return;

  let lobby = await getLobby(lobbyId);
  if (!lobby) return;

  if (!lobby.players.find((p) => p.username === getUser.name)) return;

  if (lobby.status === "waiting") {
    lobby =
      (await updateLobby(lobbyId, {
        ...lobby,
        players: lobby.players.filter((p) => p.username !== getUser.name),
      })) || lobby;
    socketServer.emit("userLeftLobby", {
      lobby: lobby,
      username: getUser.name,
    });
  }
}
