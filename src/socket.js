"use client";

import { io } from "socket.io-client";

export const socket = io("https://kanban-server-production-f13f.up.railway.app", { transports: ["websocket", "polling"],
  withCredentials: true,
  });