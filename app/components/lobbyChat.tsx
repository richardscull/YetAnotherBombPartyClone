import { initSocket } from "@/app/utils/clientSocket";
import { Lobby, Message } from "@/types";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import playSoundEffect from "../utils/playSoundEffect";
import { Session } from "next-auth";
import getUserColorAndBadge from "../utils/getUserColorAndBadge";
const socket = initSocket();

interface Props {
  lobby: Lobby;
  session: Session | null;
  playSFX: boolean;
}

export default function LobbyChat({ lobby, session, playSFX }: Props) {
  const messagesListRef = useRef<HTMLDivElement>(null);
  const [allMessages, setAllMessages] = useState([] as Message[]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function onReceiveMessageEvent(data: Message) {
      if (data.lobbyId !== lobby.id) return;
      setAllMessages((prev) => [...prev, data]);

      if (session == null || data.username !== session?.user?.name)
        if (playSFX) playSoundEffect("/sounds/message.mp3");

      if (messagesListRef.current) {
        await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for messages to load
        messagesListRef.current.scroll({
          top: messagesListRef.current.scrollHeight,
          behavior: "smooth",
        }); // Scroll to the bottom of the chat
      }
    }

    socket.on("receiveMessage", onReceiveMessageEvent);

    return () => {
      socket.off("receiveMessage", onReceiveMessageEvent);
    };
  });

  function sendMessage(e: any) {
    e.preventDefault(); // Prevent the page from reloading
    if (!message) return; // Don't send empty messages
    socket.emit("sendMessage", {
      lobbyId: lobby.id,
      message: message,
      avatar: session?.user?.image || "/images/guest.png",
      username: session?.user?.name || "Guest",
      type: "text",
    } as Message);

    setMessage(""); // Clear the message input
  }

  return (
    <div className="flex flex-col overflow-y-auto justify-between">
      <div className="flex flex-col overflow-y-auto" ref={messagesListRef}>
        {allMessages.length === 0 ? (
          <div className="flex flex-row items-center justify-center w-full px-4 py-2">
            No messages yet :(
          </div>
        ) : (
          allMessages.map((message: Message, index: number) => {
            const isMessageFromMyself =
              message.username === session?.user?.name;

            const user = getUserColorAndBadge(message.userType || "default");
            const userBadge = user.userBadge;
            let userColor = user.userColor;
            if (isMessageFromMyself) {
              userColor = "text-gray-300";
            }

            const senderImage = (
              <Image
                src={message.avatar || "/images/guest.png"}
                width={46}
                height={46}
                alt="avatar"
                className="rounded-md ml-1"
                placeholder="blur"
                blurDataURL={message.avatar || "/images/guest.png"}
              />
            );

            return (
              <div key={`${message.lobbyId}_${index}`}>
                <div
                  className={`flex flex-row items-end w-full px-4 py-2 ${
                    message.username === session?.user?.name
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  {!isMessageFromMyself && senderImage}
                  <div
                    className={`py-3 px-4 rounded-lg inline-block whitespace-normal break-all ${
                      isMessageFromMyself
                        ? "mr-2 bg-blue-600 text-white rounded-br-none"
                        : "ml-2 bg-gray-300 text-black rounded-bl-none"
                    }`}
                  >
                    <span> {message.message}</span>
                    <br></br>
                    <span className={`text-sm ${userColor}`}>
                      -{message.username} {userBadge}
                    </span>
                  </div>
                  {message.username === session?.user?.name && senderImage}
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
          className={`w-full px-4 py-4 mx-2 mt-5 rounded-lg bg-gray-200 ${
            !session && "cursor-not-allowed"
          }`}
          disabled={!session}
          placeholder="Write here something..."
          maxLength={200}
          autoComplete="off"
        />
        <button
          className={`hover:bg-neutral-800 bg-neutral-700 text-white px-4 py-4 mx-2 mt-5 rounded-lg ${
            !session && "cursor-not-allowed"
          }`}
          type="submit"
          disabled={!session}
        >
          Send
        </button>
      </form>
    </div>
  );
}
