import { Lobby, Message, dictionaryType } from "@/types";
import { Server as ServerIO, Socket as SocketIO } from "socket.io";
import { updateLobby } from "./lobbyUtils";

const dictionaryRegex = /^\/dictionary (\S+)/;
const kickRegex = /^\/kick (\S+)/;
const helpRegex = /^\/help/;

export default async function handleSlashCommands(
  socketServer: ServerIO,
  socketClient: SocketIO,
  lobby: Lobby,
  message: Message
) {
  const changeDictionaryTo = message.message.match(dictionaryRegex);
  const kickPlayer = message.message.match(kickRegex);
  const isHelp = message.message.match(helpRegex);

  if (isHelp) {
    return socketClient.emit("receiveMessage", {
      type: "server",
      message: `List of commands:\n/dictionary [dictionary] - Change dictionary to [dictionary]\n/kick [username] - Kick [username] from lobby\n/help - Show this message`,
      lobbyId: lobby.id,
      username: "System Message",
      userType: "system",
    } as Message);
  }

  if (changeDictionaryTo) {
    const dictionaryVals = ["russian", "english", "russian-big"];
    if (!dictionaryVals.includes(changeDictionaryTo[1] as dictionaryType))
      return socketClient.emit("receiveMessage", {
        type: "server",
        message: `Dictionary not found. Available dictionaries: ${dictionaryVals.join(
          ", "
        )}`,
        lobbyId: lobby.id,
        username: "System Message",
        userType: "system",
      } as Message);

    await updateLobby(lobby.id, {
      ...lobby,
      dictionary: changeDictionaryTo[1] as dictionaryType,
    });

    return socketServer.emit("receiveMessage", {
      type: "server",
      message: `Dictionary changed to ${changeDictionaryTo[1]} by ${message.username}`,
      lobbyId: lobby.id,
      username: "System Message",
      userType: "system",
    } as Message);
  }

  if (kickPlayer) {
    if (!lobby.players.find((p) => p.username === kickPlayer[1]))
      return socketClient.emit("receiveMessage", {
        type: "server",
        message: `Player not found in lobby. Available players: ${
          lobby.players.length
            ? lobby.players.map((p) => p.username).join(", ")
            : "None"
        }.`,
        lobbyId: lobby.id,
        username: "System Message",
        userType: "system",
      } as Message);

    await updateLobby(lobby.id, {
      ...lobby,
      players: lobby.players.filter((p) => p.username !== kickPlayer[1]),
    });

    return socketServer.emit("receiveMessage", {
      type: "server",
      message: `${kickPlayer[1]} was kicked by ${message.username}`,
      lobbyId: lobby.id,
      username: "System Message",
      userType: "system",
    } as Message);
  }

  return socketClient.emit("receiveMessage", {
    type: "server",
    message: `Command not found or not full. Use /help to see all commands.`,
    lobbyId: lobby.id,
    username: "System Message",
    userType: "system",
  } as Message);
}

export function isSlashCommand(text: string) {
  return text.startsWith("/");
}
