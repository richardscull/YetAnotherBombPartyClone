export default function playSoundEffect(path: string, volume?: number) {
  const audio = new Audio(path);
  audio.loop = false;
  audio.volume = volume || 1;
  audio.play();
}
