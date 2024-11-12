"use client";

import { io } from "socket.io-client";

export const socket = io("https://kanban-nextjs-production-6434.up.railway.app", { transports: ["websocket","polling"],
  withCredentials: true,
  });