import Image from "next/image";
import { Lobby, Player } from "@/types";
import { initSocket } from "@/utils/clientSocket";
import { useEffect, useState } from "react";
import playSoundEffect from "@/utils/playSoundEffect";
import { Session } from "next-auth";
import { Socket } from "socket.io-client";
import { calculateNumberOfHearts } from "./gameField";
import getUserColorAndBadge from "@/utils/getUserColorAndBadge";
const socket = initSocket();

interface StartProps {
  lobby: Lobby;
  session: Session | null;
  socket: Socket;
}

interface JoinProps {
  lobby: Lobby;
  session: Session | null;
  setJoinButtonDom: any;
}

function StartButton({ lobby, session, socket }: StartProps) {
  const isPlayerHost = lobby?.host === session?.user?.name;
  const isHostInLobby = lobby?.players.find(
    (player) => player.username === lobby.host
  );
  const isPlayerInLobby = lobby?.players.find(
    (player) => player.username === session?.user?.name
  );

  const isPlayerCanStartGame =
    isPlayerInLobby && (isPlayerHost || (!isPlayerHost && !isHostInLobby));

  return (
    <>
      {isPlayerCanStartGame && (
        <button
          className="bg-neutral-700 hover:bg-neutral-800 text-white font-bold py-2 px-16 rounded mt-3"
          onClick={() =>
            socket.emit("startGame", {
              lobbyId: lobby.id,
              username: session?.user?.name || "Guest",
            })
          }
        >
          Start game!
        </button>
      )}
    </>
  );
}

function JoinButton({ lobby, session, setJoinButtonDom }: JoinProps) {
  const isPlayerInLobby = session
    ? lobby?.players.find((player) => player.username === session.user?.name)
    : false;

  const isLobbyFull = lobby?.players.length === lobby?.maxPlayers;

  function sendGameRequest() {
    if (!session) return;
    socket.emit(isPlayerInLobby ? "leaveGame" : "joinGame", {
      lobbyId: lobby.id,
      avatar: session?.user?.image || "/images/guest.png",
      username: session?.user?.name || "Guest",
    });
  }

  return (
    <button
      className={`bg-neutral-700 hover:bg-neutral-800 text-white font-bold py-2 px-16 rounded ${
        (!session || (isLobbyFull && !isPlayerInLobby)) && "cursor-not-allowed"
      }`}
      onClick={sendGameRequest}
      ref={(element) => setJoinButtonDom(element)}
    >
      {session && isPlayerInLobby ? "Leave game" : "Join game"}
      {!session && "Login to join"}
    </button>
  );
}

interface Props {
  lobby: Lobby;
  session: Session | null;
  setLobby: any;
  playSFX: boolean;
}

export default function PlayersList({
  lobby,
  session,
  setLobby,
  playSFX,
}: Props) {
  const [joinButtonDom, setJoinButtonDom] = useState<HTMLButtonElement | null>(
    null
  );

  useEffect(() => {
    function onUserJoinedGameEvent(data: any) {
      if (data.lobby.id !== lobby.id) return;
      setLobby(data.lobby);
      if (playSFX) playSoundEffect("/sounds/userJoin.mp3");
    }

    function onUserLeftGameEvent(data: any) {
      if (data.lobby.id !== lobby.id) return;
      setLobby(data.lobby);
      if (playSFX) playSoundEffect("/sounds/userLeft.mp3");
    }

    socket.on("userJoinedGame", onUserJoinedGameEvent);
    socket.on("userLeftGame", onUserLeftGameEvent);

    return () => {
      socket.off("userJoinedGame", onUserJoinedGameEvent);
      socket.off("userLeftGame", onUserLeftGameEvent);
    };
  }, [session, lobby, joinButtonDom, playSFX, setLobby]);

  function getPlayersHealth(username: string) {
    return (
      lobby.playersStatistics?.find(
        (playerStats) => playerStats.username === username
      )?.lives || 0
    );
  }

  function avatarAsImage(avatar: string) {
    return (
      <Image
        src={avatar || "/images/guest.png"}
        width={64}
        height={64}
        alt="logo"
        className="rounded-lg m-1 flex-shrink-0"
      />
    );
  }

  function getNumberOfAlivePlayers() {
    return lobby.playersStatistics?.filter(
      (playerStats) => playerStats.lives > 0
    ).length;
  }

  function getDataByUsername(username: string, lobby: Lobby) {
    let userType = "default" as "default" | "host" | "developer";
    if (lobby.host === username) userType = "host";
    if (username === "itsrichardscull") userType = "developer";

    console.log(getUserColorAndBadge(userType));
    return getUserColorAndBadge(userType);
  }

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
            {lobby.status === "waiting" &&
              (lobby.players.length === 0 ? "None" : lobby.players.length)}
            {lobby.status === "playing" &&
              `${getNumberOfAlivePlayers()} / ${lobby.players.length}`}
          </span>
        </span>
      </div>

      {/* The only way to load the colors to make them work after loaded from getDataByUsername*/}
      <p className="opacity-0  text-amber-700 " />
      <p className="opacity-0  text-yellow-600 " />
      <p className="opacity-0  text-gray-600" />

      <div className="flow-root">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700 overflow-y-auto max-h-[30vh] mb-3">
          {lobby.players.map((player: Player, index: number) => {
            return (
              <li key={`${player}_${index}`} className="py-3">
                <div className="flex items-center space-x-4">
                  {avatarAsImage(player.avatar)}
                  <span>
                    <span
                      className={`text-xl font-bold flex-1 min-w-0 ${
                        getDataByUsername(player.username, lobby).userColor
                      } ${
                        lobby.status === "playing" &&
                        getPlayersHealth(player.username) === 0 &&
                        "line-through"
                      } ${
                        lobby.status === "playing" &&
                        getPlayersHealth(player.username) > 0 &&
                        "border-b-2 border-zinc-700 border-opacity-30 border-dashed"
                      }
                    `}
                    >
                      {player.username}{" "}
                      {getDataByUsername(player.username, lobby).userBadge}
                    </span>
                    <br></br>
                    {lobby.status === "playing" && (
                      <span className="text-sm font-normal">
                        {calculateNumberOfHearts(
                          getPlayersHealth(player.username)
                        ).length ? (
                          calculateNumberOfHearts(
                            getPlayersHealth(player.username)
                          )
                        ) : (
                          <span className="text-sm font-light">
                            💀 No lives left
                          </span>
                        )}
                      </span>
                    )}
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
