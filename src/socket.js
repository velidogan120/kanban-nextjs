"use client";

import { io } from "socket.io-client";

export const socket = io("https://kanban-nextjs-production.up.railway.app", { transports: ["websocket","polling"],
  withCredentials: true,
  });