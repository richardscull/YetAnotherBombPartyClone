import Image from "next/image";
import { Lobby, Player } from "@/types";
import { initSocket } from "../utils/clientSocket";
import { useEffect, useState } from "react";
import playSoundEffect from "../utils/playSoundEffect";
import { Session } from "next-auth";
import { Socket } from "socket.io-client";
const socket = initSocket();

interface Props {
  lobby: Lobby;
  session: Session | null;
  socket: Socket;
}

// TODO: Need refactoring
function StartButton({ lobby, session, socket }: Props) {
  return (
    <>
      {lobby?.players.find(
        (player) => player.username === session?.user?.name
      ) &&
        (lobby.host === session?.user?.name ||
          (lobby.host !== session?.user?.name &&
            !lobby?.players.find(
              (player) => player.username === lobby.host
            ))) && (
          <button
            className="bg-neutral-700 hover:bg-neutral-800 text-white font-bold py-2 px-16 rounded mt-3"
            onClick={() => socket.emit("startGame", lobby.id)}
          >
            Start game!
          </button>
        )}
    </>
  );
}

function JoinButton({
  lobby,
  session,
  setJoinButtonDom,
}: {
  lobby: Lobby;
  session: any;
  setJoinButtonDom: any;
}) {
  function sendJoinGame() {
    if (!session || !socket) return;

    socket.emit(
      lobby?.players.find((player) => player.username === session.user?.name)
        ? "leaveGame"
        : "joinGame",
      {
        lobbyId: lobby.id,
        avatar: session?.user?.image || "/images/guest.png",
        username: session?.user?.name || "Guest",
      }
    );
  }

  return (
    <button
      className={`bg-neutral-700 hover:bg-neutral-800 text-white font-bold py-2 px-16 rounded ${
        !session && "cursor-not-allowed"
      }`}
      onClick={sendJoinGame}
      ref={(element) => setJoinButtonDom(element)}
    >
      {session
        ? lobby?.players.find(
            (player) => player.username === session.user?.name
          )
          ? "Leave game"
          : "Join game"
        : "Sign in to join"}
    </button>
  );
}

export default function PlayersList({
  lobby,
  session,
  setLobby,
  playSFX,
}: {
  lobby: Lobby;
  session: any;
  setLobby: any;
  playSFX: boolean;
}) {
  const [joinButtonDom, setJoinButtonDom] = useState<HTMLButtonElement | null>(
    null
  );

  useEffect(() => {
    function onUserJoinedGameEvent(data: any) {
      if (data.lobby.id !== lobby.id) return;
      setLobby(data.lobby);

      if (playSFX) playSoundEffect("/sounds/userJoin.mp3");
      if (data.username === session?.user?.name && joinButtonDom)
        joinButtonDom.innerText = "Leave game";
    }

    function onUserLeftGameEvent(data: any) {
      if (data.lobby.id !== lobby.id) return;
      setLobby(data.lobby);

      if (playSFX) playSoundEffect("/sounds/userLeft.mp3");
      if (data.username === session?.user?.name && joinButtonDom)
        joinButtonDom.innerText = "Join game";
    }

    socket.on("userJoinedGame", onUserJoinedGameEvent);
    socket.on("userLeftGame", onUserLeftGameEvent);

    return () => {
      socket.off("userJoinedGame", onUserJoinedGameEvent);
      socket.off("userLeftGame", onUserLeftGameEvent);
    };
  }, [session, lobby, joinButtonDom, playSFX, setLobby]);

  return (
    <div>
      <div
        className={`text-3xl font-bold pb-3 ${
          lobby.players.length === 0 && "py-3"
        }`}
      >
        <span>
          Players:{" "}
          <span className="text-3xl font-light">
            {lobby.players.length === 0 ? "None" : lobby.players.length}
          </span>
        </span>
      </div>
      <div className="flow-root">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700 overflow-y-auto max-h-[30vh] mb-3">
          {lobby.players.map((player: Player, index: number) => {
            return (
              <li key={`${player}_${index}`} className="py-3">
                <div className="flex items-center space-x-4">
                  <Image
                    src={player.avatar || "/images/guest.png"}
                    width={64}
                    height={64}
                    alt="logo"
                    className="rounded-lg m-1 flex-shrink-0"
                  />

                  <span
                    className={`text-xl font-bold flex-1 min-w-0 ${
                      player.username === lobby.host &&
                      lobby.status !== "playing" &&
                      "text-yellow-600"
                    } ${
                      lobby.status === "playing" &&
                      lobby.playersStatistics!.find(
                        (playerStats) =>
                          playerStats.username === player.username
                      )?.lives === 0 &&
                      "text-gray-300"
                    }}`}
                  >
                    {player.username}{" "}
                    {lobby.status === "playing"
                      ? lobby.playersStatistics!.find(
                          (playerStats) =>
                            playerStats.username === player.username
                        )?.lives === 0 && "💀 "
                      : player.username === lobby.host && "👑 "}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Buttons to join/leave & start game */}
      {lobby.status === "waiting" && (
        <div className="flex flex-col items-center justify-center">
          <JoinButton
            lobby={lobby}
            session={session}
            setJoinButtonDom={setJoinButtonDom}
          />
          <StartButton lobby={lobby} session={session} socket={socket} />
        </div>
      )}
    </div>
  );
}
