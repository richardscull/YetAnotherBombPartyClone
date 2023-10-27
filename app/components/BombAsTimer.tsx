import { Dispatch, SetStateAction, useEffect, useState } from "react";

interface Props {
  isPlaying: boolean;
  timeLeft: number;
  setTimeLeft: Dispatch<SetStateAction<number>>;
}

export default function BombAsTimer({
  isPlaying,
  timeLeft,
  setTimeLeft,
}: Props) {
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, timeLeft, setTimeLeft]);

  return (
    (isPlaying || timeLeft > 0) && (
      <div className="flex flex-row items-center justify-center w-full px-4 py-2">
        {timeLeft}
      </div>
    )
  );
}
