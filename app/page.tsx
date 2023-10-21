import { options } from "./api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth/next";

export default async function Home() {
  const session = await getServerSession(options);
  return (
    <div className="px-6 mx-auto text-center mb-12 my-5">
      <h1 className="text-3xl">
        Welcome to <span className="font-bold">bomb party!</span>
      </h1>
      <p>
        Bomb Party is a fast-paced word game where players take turns creating
        <br></br>
        words from a set of letter tiles while racing against a bomb&apos;s
        <br></br>
        countdown timer, and the player holding the bomb when it explodes loses
        the round.
      </p>

      {session ? (
        <button className="bg-neutral-700 hover:bg-neutral-800 text-white font-bold py-2 px-32 rounded mt-5">
          <a href="/lobby/public">Join a public lobby</a>
        </button>
      ) : (
        <button className="bg-neutral-800 text-gray-400 font-bold py-2 px-32 rounded mt-5 cursor-not-allowed">
          <span>You need to sign in first</span>
        </button>
      )}
    </div>
  );
}
