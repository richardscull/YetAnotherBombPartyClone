"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Lobby as LobbyType } from "@/types";

import Loading from "@/app/components/loading";
import LobbyChat from "@/app/components/lobbyChat";
import UserSettings from "@/app/components/userSettings";
import BackgroundMusic from "@/app/components/backgroundMusic";
import PlayersList from "@/app/components/playersList";
import GameField from "@/app/components/gameField";

export default function Lobby({ params }: { params: { lobbyId: string } }) {
  const { data: session } = useSession();
  const [lobby, setLobby] = useState(null as LobbyType | null);
  const [isLoading, setLoading] = useState(true);
  const [playMusic, setPlayMusic] = useState(true);
  const [playSFX, setPlaySFX] = useState(true);

  useEffect(() => {
    // Try to get the lobby from the server
    fetch(`/api/lobby/getLobby?lobbyId=` + params.lobbyId, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data: { lobby: LobbyType }) => {
        setLobby(data.lobby);
        setLoading(false);
      });
  }, [params.lobbyId]);

  // While we wait for fetch to return, show a loading message
  if (isLoading) return <Loading />;

  // If the lobby doesn't exist, show a message
  if (!lobby) {
    return (
      <div className="text-3xl px-6 mx-auto text-center mb-12 my-5">
        <h1 className="font-mono">Lobby not found</h1>
        <button className="bg-neutral-700 hover:bg-neutral-800 text-white font-bold py-2 px-16 rounded mt-5">
          <a href="/">Return to menu</a>
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-center w-screen px-4">
      <BackgroundMusic playMusic={playMusic} />
      <div className="flex w-full h-[calc(100vh-105px)]">
        <div
          className={`flex flex-grow border-r border-neutral-700 items-center ${
            lobby.status === "waiting"
              ? "flex-col justify-center"
              : "flex-row justify-evenly"
          }`}
        >
          <PlayersList
            lobby={lobby}
            session={session}
            playSFX={playSFX}
            setLobby={setLobby}
          />

          <GameField lobby={lobby} session={session} setLobby={setLobby} />
        </div>
        <div className="flex flex-col flex-shrink-0 w-1/4 py-4 pl-4 justify-between">
          <UserSettings
            lobby={lobby}
            playSFX={playSFX}
            setPlaySFX={setPlaySFX}
            setPlayMusic={setPlayMusic}
            playMusic={playMusic}
          />
          <LobbyChat lobby={lobby} session={session} playSFX={playSFX} />
        </div>
      </div>
    </div>
  );
}
