import { useEffect, useState } from "react";

function playRandomBGMusic(audioDom: HTMLAudioElement, playMusic?: boolean) {
  if (playMusic === false) return;
  const songs = [
    "LazySunday.mp3",
    "SmoothNylons.mp3",
    "TownTalk.mp3",
    "CoffeeBreak.mp3",
    "PrimaBossaNova.mp3",
    "Solitaire.mp3",
  ];

  if (audioDom.src)
    songs.splice(songs.indexOf(audioDom.src.split("/").splice(5)[0]), 1);

  const randomSong = songs[Math.floor(Math.random() * songs.length)];
  audioDom.src = `/music/lobby/${randomSong}`;
}

export default function BackgroundMusic({ playMusic }: { playMusic: boolean }) {
  const [audioDom, setAudioDom] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioDom || playMusic === false) return;
    playRandomBGMusic(audioDom);
  }, [audioDom, playMusic]);

  return (
    <audio
      id="bgm"
      autoPlay
      ref={(element) => {
        setAudioDom(element);
        if (element) element.volume = 0.4;
      }}
      onEnded={() => playRandomBGMusic(audioDom!)}
      muted={!playMusic}
    />
  );
}
