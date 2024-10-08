import Image from "next/image";
import { options } from "../api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth/next";
import { cookies } from "next/headers";
import { Noto_Color_Emoji } from "next/font/google";

const notoColorEmoji = Noto_Color_Emoji({
  weight: "400",
  subsets: ["emoji"],
});

export default async function Navbar() {
  const session = await getServerSession(options);
  const csrf = cookies().get("next-auth.csrf-token")?.value.split("|")[0];

  return (
    <>
      <nav className="bg-neutral-800 p-3 sticky z-10 h-[105px] ">
        <div className="flex items-center mx-auto place-content-between logo-text">
          <a className="flex items-center" href="/">
            <h1
              className={`text-4xl ml-5 [text-shadow:_0px_5px_10px_rgb(10_0_0_/_100%)] ${notoColorEmoji.className} `}
            >
              💣
            </h1>
            <h1 className="text-4xl mx-4 [text-shadow:_0px_5px_10px_rgb(10_0_0_/_100%)] ">
              Bomb Party!
            </h1>
          </a>
          <div className="border-4 border-neutral-900 bg-neutral-900 rounded-xl flex items-center">
            <div className="place-content-end">
              <h1 className="mx-6 font-mono">
                {session ? session.user?.name : "Guest"}
              </h1>
              <form
                action={
                  session ? `/api/auth/signout` : `/api/auth/signin/discord`
                }
                method="POST"
              >
                <input name="csrfToken" type="hidden" defaultValue={csrf} />
                <input
                  name="callbackUrl"
                  type="hidden"
                  defaultValue={process.env["NEXTAUTH_URL"] || "localhost:3000"} // TODO: Add current page too
                ></input>
                <button className="mx-6 font-mono text-white/50" type="submit">
                  {session ? "log out" : "sign in"}
                </button>
              </form>
            </div>
            <Image
              src={session ? session.user?.image! : "/images/guest.png"}
              width={64}
              height={64}
              alt="logo"
              className="rounded-full m-1"
            />
          </div>
        </div>
      </nav>
    </>
  );
}
