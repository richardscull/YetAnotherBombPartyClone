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
        <div className="bg-black items-center text-center flex flex-col border-black border-[32px] rounded-lg shadow-2xl bg-opacity-80">
          <div className="relative mb-4">
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
          <div className="text-4xl font-bold ">{winner.username}</div>
          <div className="text-base font-normal ">
            won the last round!
          </div>
          <button
            className="bg-neutral-700 hover:bg-neutral-800 text-white font-bold py-2 px-16 rounded mt-5 "
            onClick={closeWinnerScreen}
          >
            Close
          </button>
        </div>
      </div>
    )
  );
}
