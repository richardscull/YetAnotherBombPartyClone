import { io } from "socket.io-client";
const URL = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

export const initSocket = () => {
  fetch(URL + `/api/socket`);
  const socketIO = io(URL, {
    path: "/api/socket",
  });

  return socketIO;
};
