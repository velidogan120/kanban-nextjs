"use client";

import { io } from "socket.io-client";

export const socket = io("kanban-velidogan120.vercel.app", {transports: ["polling"],
    withCredentials: true,
  });