import { Lobby } from "@/types";
import Image from "next/image";
import { useEffect, useState } from "react";
import { initSocket } from "@/utils/clientSocket";
import { Session } from "next-auth";
const socket = initSocket();

function calculateNumberOfHearts(lives: number) {
  return Array.from(
    {
      length: lives,
    },
    (_, index) => (
      <span key={index} role="img" aria-label="heart">
        ❤️
      </span>
    )
  );
}

interface Props {
  lobby: Lobby;
  session: Session | null;
  setLobby: any;
}

export default function GameField({ lobby, session, setLobby }: Props) {
  const [answer, setAnswer] = useState("");
  const [guessDom, setGuessDom] = useState<HTMLInputElement | null>(null);

  const isUsersTurn = session
    ? session.user?.name === lobby.currentTurn?.username
    : false;

  useEffect(() => {
    function reloadLobby(data: any) {
      if (data.lobby.id !== lobby.id) return;
      setLobby(data.lobby);
    }

    function clearAnswerField(data: any) {
      if (data.lobby.id !== lobby.id) return;
      setAnswer("");
    }

    function onWrongAnswerEvent(data: any) {
      if (data.lobbyId !== lobby.id || !guessDom) return;
      guessDom.placeholder = "Wrong answer, try again...";
      setAnswer("");

      guessDom.classList.add("bg-red-200");
      guessDom.classList.remove("bg-gray-200");

      setTimeout(() => {
        guessDom.placeholder = "Write your answer here...";
        guessDom.classList.add("bg-gray-200");
        guessDom.classList.remove("bg-red-200");
      }, 2000);
    }

    function onChangedAnswerFieldEvent(data: any) {
      if (data.lobbyId !== lobby.id || data.username === session?.user?.name)
        return;
      setAnswer(data.guess);
    }

    socket.on("gameStarted", reloadLobby);
    socket.on("wrongAnswer", onWrongAnswerEvent);
    socket.on("changedAnswerField", onChangedAnswerFieldEvent);
    socket.on("nextTurn", (data: any) => {
      reloadLobby(data);
      clearAnswerField(data);
    });
    socket.on("gameFinished", (data: any) => {
      reloadLobby(data);
      clearAnswerField(data);
    });

    return () => {
      socket.off("gameStarted", reloadLobby);
      socket.off("wrongAnswer", onWrongAnswerEvent);
      socket.off("changedAnswerField", onChangedAnswerFieldEvent);
      socket.off("nextTurn", reloadLobby);
      socket.off("gameFinished", reloadLobby);
    };
  }, [lobby, session, guessDom, setLobby]);

  function changeAnswerField(lobbyId: string, guess: string) {
    socket.emit("changeAnswerField", {
      lobbyId: lobbyId,
      guess: guess,
      username: session?.user?.name || "Guest",
    });
  }

  function sendAnswer(e: any) {
    e.preventDefault(); // Prevent the page from reloading
    if (!answer) return; // Don't send empty field

    socket.emit("sendAnswer", {
      lobbyId: lobby.id,
      guess: answer,
      username: session?.user?.name || "Guest",
    });
  }

  return (
    <>
      {lobby.status === "playing" && (
        <div className="flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <div className="text-3xl font-bold pb-3">
              <span>Current turn is for:</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="flex flex-col items-center">
                <Image
                  src={
                    lobby.players.find(
                      (player) =>
                        player.username === lobby.currentTurn?.username
                    )?.avatar || "/images/guest.png"
                  }
                  width={64}
                  height={64}
                  alt="user"
                  className="rounded-lg m-1 flex-shrink-0"
                />
                <span>
                  {calculateNumberOfHearts(
                    lobby.playersStatistics!.find(
                      (playerStats) =>
                        playerStats!.username === lobby.currentTurn!.username
                    )!.lives
                  ) || (
                    <span className="text-3xl font-light">No lives left</span>
                  )}
                </span>
              </div>
              <span className="text-xl font-bold">
                {lobby.currentTurn?.username}
              </span>
            </div>
            <h1 className="text-6xl font-bold">{lobby.currentTurn?.prompt}</h1>
            <div className="flex flex-row items-center justify-center">
              <form
                onSubmit={sendAnswer}
                className="justify-center flex text-black"
              >
                <input
                  name="answer"
                  value={answer}
                  onChange={(e) => {
                    setAnswer(e.target.value);
                    changeAnswerField(lobby.id, e.target.value);
                  }}
                  className={`px-4 py-3 mt-5 rounded-lg bg-gray-200 ${
                    !isUsersTurn && "cursor-not-allowed"
                  }`}
                  disabled={!isUsersTurn}
                  placeholder="Write your answer here..."
                  ref={(element) => setGuessDom(element)}
                  maxLength={40}
                  autoComplete="off"
                />
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}