"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import io from "socket.io-client";
import Loading from "../../components/loading";
import { Message } from "@/types";
import { useRef } from "react";
import Image from "next/image";

function InitSocket() {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    fetch(`/api/socket`);
    const socketIo = io({
      path: "/api/socket",
    });

    setSocket(socketIo as any);
    function cleanup() {
      socketIo.removeAllListeners();
      socketIo.disconnect();
    }
    return cleanup;
  }, []);

  return socket as any;
}

export default function Lobby({ params }: { params: { lobbyId: string } }) {
  const [lobby, setLobby] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [allMessages, setAllMessages] = useState([] as Message[]);
  const elementRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const socket = InitSocket();

  // Try to get the lobby from the server
  useEffect(() => {
    // Wait for the session to load
    if (!params.lobbyId) return;
    if (session === undefined) return;

    fetch(`/api/lobby/getLobby?id=` + params.lobbyId, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setLobby(data.lobby);
        if (data.lobby && socket) {
          socket.on("receiveMessage", async (data: Message) => {
            const scrollToBottom = (node: HTMLElement) => {
              node.scroll({ top: node.scrollHeight, behavior: "smooth" });
            };

            if (data.lobbyId !== params.lobbyId) return;

            console.log(data);
            setAllMessages((prev) => [...prev, data]);

            if (session == null || data.username !== session?.user?.name) {
              const audio = new Audio("/sounds/message.mp3");
              audio.loop = false;
              audio.play();
            }

            if (elementRef.current) {
              // Wait for messages to load
              await new Promise((resolve) => setTimeout(resolve, 100));
              scrollToBottom(elementRef.current);
            }
          });

          socket.on("buttonPressed", (data: any) => {
            console.log(data);
          });
        }

        setLoading(false);
      });
  }, [params.lobbyId, socket, session]);

  function sendMessage(e: any) {
    e.preventDefault();
    setMessage("");

    socket.emit("sendMessage", {
      lobbyId: params.lobbyId,
      message: message,
      avatar: session?.user?.image || "/images/guest.png",
      username: session?.user?.name,
      type: "text",
    } as Message);
  }

  // While we wait for fetch to return, show a loading message
  if (isLoading) return <Loading />;

  // If the lobby doesn't exist, show a message
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

  return (
    <div className="flex justify-center w-screen px-4 ">
      <div className="flex w-full h-[calc(100vh-105px)]">
        {/* Game field */}
        <div className="flex flex-col flex-grow border-r border-neutral-700">
          {/* {
            <div>
              {session ? (
                <button
                  className="bg-neutral-700 hover:bg-neutral-800 text-white font-bold py-2 px-16 rounded mt-5"
                  onClick={sendButtonPress}
                >
                  Send webhook!
                </button>
              ) : (
                <button className="bg-neutral-800 text-gray-400 font-bold py-2 px-16 rounded mt-5 cursor-not-allowed">
                  <span>You need to sign in first</span>
                </button>
              )}
            </div>
          } */}
        </div>
        {/* Chat window */}
        <div className="flex flex-col flex-shrink-0 w-1/4 py4 pl-4 justify-between">
          <div className="flex flex-col overflow-y-auto " ref={elementRef}>
            {allMessages.length === 0 ? (
              <div className="flex flex-row items-center justify-center w-full px-4 py-2">
                No messages yet
              </div>
            ) : (
              allMessages.map((message: Message, index: number) => {
                return (
                  <div key={`${message.lobbyId}_${index}`}>
                    <div
                      className={`" flex flex-row items-end w-full px-4 py-2 " ${
                        message.username === session?.user?.name
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {message.username !== session?.user?.name && (
                        <Image
                          src={message.avatar}
                          width={46}
                          height={46}
                          alt="logo"
                          className="rounded-md ml-1"
                        />
                      )}
                      <div
                        className={`" py-3 px-4 rounded-lg inline-block whitespace-normal break-all " ${
                          message.username === session?.user?.name
                            ? "mr-2 bg-blue-600 text-white rounded-bк-none"
                            : "ml-2 bg-gray-300 text-black rounded-bl-none"
                        }`}
                      >
                        <span> {message.message}</span>
                        <br></br>
                        <span
                          className={`" text-sm" ${
                            message.username === session?.user?.name
                              ? "text-gray-300"
                              : "text-gray-600"
                          }`}
                        >
                          -{message.username}
                        </span>
                      </div>
                      {message.username === session?.user?.name && (
                        <Image
                          src={message.avatar}
                          width={46}
                          height={46}
                          alt="logo"
                          className="rounded-md ml-1"
                        />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <form
            onSubmit={sendMessage}
            className="py-5 justify-center flex text-black"
          >
            <input
              name="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={`" w-full px-4 py-4 mx-2 mt-5 rounded-lg bg-gray-200 " ${
                !session && "cursor-not-allowed"
              }`}
              disabled={!session}
              placeholder="Write here something..."
              maxLength={200}
              autoComplete="off"
            />
            <button
              className={`" hover:bg-neutral-800 bg-neutral-700 text-white px-4 py-4 mx-2 mt-5 rounded-lg  " ${
                !session && "cursor-not-allowed"
              }`}
              type="submit"
              disabled={!session}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
