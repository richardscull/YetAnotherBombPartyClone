import { Lobby } from "@/types";

interface Props {
  lobby: Lobby;
  playSFX: boolean;
  setPlaySFX: any;
  playMusic: boolean;
  setPlayMusic: any;
}

export default function UserSettings({
  lobby,
  playSFX,
  setPlaySFX,
  playMusic,
  setPlayMusic,
}: Props) {
  return (
    <div className="flex flex-col px-4 py-2 border-b border-neutral-700 sticky">
      <div className="flex flex-row items-center justify-between w-full">
        <span className="text-xl font-bold">
          Lobby: <span className="text-xl font-light"> {lobby.name}</span>
        </span>
        <span className="text-xl font-bold">
          Players:{" "}
          <span className="text-xl font-light">
            {lobby.players.length} / {lobby.maxPlayers}
          </span>
        </span>
      </div>
      <div className="flex flex-row items-center justify-between w-full mt-3">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={playMusic}
            onChange={() => {
              setPlayMusic(!playMusic);
            }}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 mb-1"></div>
          <span className="ml-3 text-xl font-medium">Music</span>
        </label>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            onChange={() => setPlaySFX(!playSFX)}
            checked={playSFX}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 mb-1"></div>
          <span className="ml-3 text-xl font-medium">SFX</span>
        </label>
      </div>
    </div>
  );
}
