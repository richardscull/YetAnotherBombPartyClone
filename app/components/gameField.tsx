import { Lobby } from "@/types";
import NextImage from "next/image";
import { useEffect, useRef, useState } from "react";
import { initSocket } from "@/utils/clientSocket";
import { Session } from "next-auth";
import BombAsTimer from "./BombAsTimer";
import playSoundEffect from "@/utils/playSoundEffect";
const socket = initSocket();

export function calculateNumberOfHearts(lives: number) {
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
  setWinner: any;
  playSFX: boolean;
}

export default function GameField({
  lobby,
  session,
  setLobby,
  setWinner,
  playSFX,
}: Props) {
  const [answer, setAnswer] = useState("");
  const [guessDom, setGuessDom] = useState<HTMLInputElement | null>(null);
  const gifRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);

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
      if (playSFX) playSoundEffect("/sounds/wrongAnswer.mp3", 0.5);

      if (data.wordUsed) {
        guessDom.classList.add("bg-orange-200");
        guessDom.placeholder = "Word already used, try another!";
      } else {
        guessDom.classList.add("bg-red-200");
        guessDom.placeholder = "Wrong answer, try again...";
      }

      setAnswer("");

      guessDom.classList.add("bg-red-200");
      guessDom.classList.remove("bg-gray-200");

      setTimeout(() => {
        guessDom.placeholder = "Write your answer here...";
        guessDom.classList.add("bg-gray-200");
        guessDom.classList.remove("bg-red-200");
        guessDom.classList.remove("bg-orange-200");
      }, 2000);
    }

    function onChangedAnswerFieldEvent(data: any) {
      if (data.lobbyId !== lobby.id || data.username === session?.user?.name)
        return;
      setAnswer(data.guess);
    }

    function onNextTurnEvent(data: any) {
      if (playSFX) {
        if (data.isExploded) {
          playSoundEffect("/sounds/explosion.mp3");

          const gif = new Image();
          gif.src = "/images/boom.gif";
          gifRef.current?.appendChild(gif);
          gif.addEventListener("load", function () {
            setTimeout(() => {
              gifRef.current?.removeChild(gif);
            }, 2500);
          });
        } else playSoundEffect("/sounds/goodAnswer.mp3", 0.5);
      }
      reloadLobby(data);
      setTimeLeft(10);
      setIsPlaying(true);
      clearAnswerField(data);
    }

    socket.on("gameStarted", (data: any) => {
      reloadLobby(data);
      setWinner(null);
      setTimeLeft(10);
      setIsPlaying(true);
    });
    socket.on("wrongAnswer", onWrongAnswerEvent);
    socket.on("changedAnswerField", onChangedAnswerFieldEvent);
    socket.on("nextTurn", onNextTurnEvent);
    socket.on("gameFinished", (data: any) => {
      reloadLobby(data);
      setWinner(data.winner);
      setIsPlaying(false);
      clearAnswerField(data);
    });

    return () => {
      socket.off("gameStarted", reloadLobby);
      socket.off("wrongAnswer", onWrongAnswerEvent);
      socket.off("changedAnswerField", onChangedAnswerFieldEvent);
      socket.off("nextTurn", onNextTurnEvent);
      socket.off("gameFinished", reloadLobby);
    };
  }, [lobby, session, guessDom, setLobby, setWinner, playSFX]);

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
            <div>
              <div className="text-3xl font-bold">
                <span>Current turn is for:</span>
              </div>
              <div className="flex flex-col items-center justify-center relative">
                <span className="text-xl font-medium [text-shadow:_0px_5px_10px_rgb(10_0_0_/_100%)] mb-1">
                  {lobby.currentTurn?.username}
                </span>

                <div className="flex flex-col items-center ">
                  <div className="relative">
                    <NextImage
                      src={
                        lobby.players.find(
                          (player) =>
                            player.username === lobby.currentTurn?.username
                        )?.avatar || "/images/guest.png"
                      }
                      width={85}
                      height={85}
                      alt="user"
                      className="rounded-lg m-1 flex-shrink-0 shadow-xl shadow-black"
                    />

                    <div className="absolute right-0 left-[10px] bottom-[75px] [text-shadow:_0px_5px_10px_rgb(10_0_0_/_100%)] text-lg">
                      {calculateNumberOfHearts(
                        lobby.playersStatistics!.find(
                          (playerStats) =>
                            playerStats!.username ===
                            lobby.currentTurn!.username
                        )!.lives
                      ) || (
                        <span className="text-3xl font-light">
                          No lives left
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div
                  ref={gifRef}
                  className="rounded-lg absolute left-0 w-full h-full top-[10px] "
                >
                  {/* Place for explosion gif */}
                </div>
              </div>
            </div>
            <h1 className="text-6xl font-bold mt-3">
              {lobby.currentTurn?.prompt}
            </h1>
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
                  className={`w-[300px] px-4 py-3 mt-5 mb-2 rounded-lg bg-gray-200 ${
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
            <BombAsTimer
              isPlaying={isPlaying}
              setTimeLeft={setTimeLeft}
              timeLeft={timeLeft}
              playSFX={playSFX}
            />
          </div>
        </div>
      )}
    </>
  );
}
