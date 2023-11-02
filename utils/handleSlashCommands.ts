import { Lobby, Message, dictionaryType } from "@/types";
import { Server as ServerIO, Socket as SocketIO } from "socket.io";
import { updateLobby } from "./lobbyUtils";

const dictionaryRegex = /^\/dictionary "([^"]+)"$/;

export default async function handleSlashCommands(
  socket: ServerIO,
  socketClient: SocketIO,
  lobby: Lobby,
  message: Message
) {
  const changeDictionaryTo = message.message.match(dictionaryRegex);
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

    return socket.emit("receiveMessage", {
      type: "server",
      message: `Dictionary changed to ${changeDictionaryTo[1]} by ${message.username}`,
      lobbyId: lobby.id,
      username: "System Message",
      userType: "system",
    } as Message);
  } else {
    return socketClient.emit("receiveMessage", {
      type: "server",
      message: `Command not found. Available commands: /dictionary`,
      lobbyId: lobby.id,
      username: "System Message",
      userType: "system",
    } as Message);
  }
}

export function isSlashCommand(text: string) {
  return text.startsWith("/");
}
