"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Lobby as LobbyType, Player } from "@/types";

import Loading from "@/app/components/loading";
import LobbyChat from "@/app/components/lobbyChat";
import UserSettings from "@/app/components/userSettings";
import BackgroundMusic from "@/app/components/backgroundMusic";
import PlayersList from "@/app/components/playersList";
import GameField from "@/app/components/gameField";
import WinnerScreen from "@/app/components/winnerScreen";

export default function Lobby({ params }: { params: { lobbyId: string } }) {
  const { data: session } = useSession();
  const [lobby, setLobby] = useState(null as LobbyType | null);
  const [isLoading, setLoading] = useState(true);
  const [winner, setWinner] = useState<Player | null>(null);
  const [playMusic, setPlayMusic] = useState(true);
  const [playSFX, setPlaySFX] = useState(true);

  useEffect(() => {
    // Try to get the lobby from the server
    fetch(`${process.env["NEXT_PUBLIC_URL"]}/api/lobby/getLobby?id=` + params.lobbyId, {
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
    <div className="flex justify-center w-screen">
      <BackgroundMusic playMusic={playMusic} />
      <div className="flex w-full h-[calc(100vh-105px)]">
        <div
          className={`flex flex-grow border-r relative border-neutral-700 items-center ${
            lobby.status === "waiting"
              ? "flex-col justify-center "
              : "flex-row justify-evenly"
          }`}
        >
          <PlayersList
            lobby={lobby}
            session={session}
            playSFX={playSFX}
            setLobby={setLobby}
          />

          {winner && (
            <div className="absolute top-0 left-0 w-full h-full">
              <WinnerScreen winner={winner} setWinner={setWinner} />
            </div>
          )}

          <GameField
            lobby={lobby}
            session={session}
            setLobby={setLobby}
            setWinner={setWinner}
            playSFX={playSFX}
          />
        </div>
        <div className="flex flex-col flex-shrink-0 w-1/4 py-4 px-4 justify-between pr-4">
          <UserSettings
            lobby={lobby}
            playSFX={playSFX}
            setPlaySFX={setPlaySFX}
            setPlayMusic={setPlayMusic}
            playMusic={playMusic}
          />
          <LobbyChat lobby={lobby} session={session} setLobby={setLobby} playSFX={playSFX} />
        </div>
      </div>
    </div>
  );
}
