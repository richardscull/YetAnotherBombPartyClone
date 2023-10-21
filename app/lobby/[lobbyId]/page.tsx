"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function Lobby({ params }: { params: { lobbyId: string } }) {
  const [lobby, setLobby] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    fetch(
      "http://localhost:3000" + `/api/lobby/getLobby?id=` + params.lobbyId,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        console.log(data.lobby);
        setLobby(data.lobby);
        setLoading(false);
      });
  }, [params.lobbyId]);

  if (isLoading) return <p>Loading...</p>;
  if (!lobby) {
    return (
      <div className="text-3xl px-6 mx-auto text-center mb-12 my-5">
        <h1 className="font-mono">Lobby not found</h1>
        <button className="bg-neutral-700 hover:bg-neutral-800 text-white font-bold py-2 px-16 rounded mt-5">
          <a href="/">Return to menu</a>
        </button>
      </div>
    );
  }

  // TODO: add lobby page UI

  return <>work in progress</>;
}
