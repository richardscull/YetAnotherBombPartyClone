import playSoundEffect from "@/utils/playSoundEffect";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

interface Props {
  isPlaying: boolean;
  timeLeft: number;
  setTimeLeft: Dispatch<SetStateAction<number>>;
  playSFX: boolean;
}

export default function BombAsTimer({
  isPlaying,
  timeLeft,
  setTimeLeft,
  playSFX,
}: Props) {
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev <= 0 ? 0 : prev - 1));
      if (playSFX && timeLeft >= 0) playSoundEffect("/sounds/tick.mp3", 0.3);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, timeLeft, setTimeLeft, playSFX]);

  return (
    (isPlaying || timeLeft > 0) && (
      <div className="flex flex-row items-center justify-center w-full px-4 font-thin ">
        ⌛ Time left: <span className="font-semibold">&nbsp;{timeLeft}</span>
      </div>
    )
  );
}
