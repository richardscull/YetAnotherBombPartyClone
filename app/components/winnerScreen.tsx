import { Player } from "@/types";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function WinnerScreen({
  winner,
  setWinner,
}: {
  winner: Player;
  setWinner: any;
}) {
  const [showMenu, setShowMenu] = useState(true);

  useEffect(() => {
    if (winner) {
      setShowMenu(true);
    }
  }, [winner]);

  function closeWinnerScreen() {
    setShowMenu(false);
    setWinner(null);
  }

  return (
    showMenu && (
      <div
        className="relative flex flex-col items-center text-center top-0 left-0 w-full h-full bg-opacity-50 bg-black justify-center 
    "
      >
        <div className="bg-zinc-900 items-center text-center flex flex-col border-zinc-900 border-[32px] border-opacity-0 rounded-lg shadow-2xl shadow-zinc-900 bg-opacity-90">
          <div className="relative mb-4 shadow-black shadow-lg">
            <Image
              src={winner.avatar || "/images/guest.png"}
              alt="Avatar"
              width={96}
              height={96}
              className="rounded-lg shadow-2xl shadow-black"
            />
            <div className="absolute right-0 text-4xl left-0 top-[75px] ">
              🥇
            </div>
          </div>
          <div className="text-4xl font-bold">
            <h1 className="[text-shadow:_0px_5px_10px_rgb(10_0_0_/_100%)]">
              {winner.username}
            </h1>
          </div>
          <div className="text-base font-normal">
            <p className="[text-shadow:_0px_5px_10px_rgb(10_0_0_/_100%)]">
              won the last round!
            </p>
          </div>
          <button
            className="bg-neutral-700 hover:bg-neutral-800 text-white font-bold py-2 px-16 rounded mt-5 shadow-black shadow-lg"
            onClick={closeWinnerScreen}
          >
            Close
          </button>
        </div>
      </div>
    )
  );
}
