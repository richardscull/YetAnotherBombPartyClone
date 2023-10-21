export default function Lobby({ params }: { params: { lobbyId: string } }) {
  const lobbies = [] as string[]; // TODO: implement
  if (!lobbies.includes(params.lobbyId)) {
    return (
      <div className="text-3xl px-6 mx-auto text-center mb-12 my-5">
        <h1 className="font-mono">Lobby not found</h1>
        <button className="bg-neutral-700 hover:bg-neutral-800 text-white font-bold py-2 px-16 rounded mt-5">
          <a href="/">Return to menu</a>
        </button>
      </div>
    );
  }

  //const lobby = getLobby(params.lobbyId) // TODO: implement

  return <>work in progress</>;
}
