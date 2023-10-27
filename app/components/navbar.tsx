import Image from "next/image";
import { options } from "../api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth/next";
import { cookies } from "next/headers";

export default async function Navbar() {
  const session = await getServerSession(options);
  const csrf = cookies().get("next-auth.csrf-token")?.value.split("|")[0];

  return (
    <>
      <nav className="bg-neutral-800 p-3 sticky z-10 h-[105px] ">
        <div className="flex items-center mx-auto place-content-between logo-text">
          <a className="flex items-center" href="/">
            <Image
              src="/images/bomb.svg"
              width={64}
              height={64}
              alt="logo"
              className="rounded-full m-1 filter invert"
            />
            <h1 className="text-3xl font-mono mx-5">Bomb Party!</h1>
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
                  defaultValue={process.env["NEXTAUTH_URL"] || "/"} // TODO: Add current page too
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
