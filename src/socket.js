"use client";

import { io } from "socket.io-client";

export const socket = io("https://kanban-velidogan120.vercel.app", { transports: ["websocket", "polling"],
  withCredentials: true,
  });