"use client";

import { io } from "socket.io-client";

export const socket = io("kanban-server-production-f13f.up.railway.app", {transports: ["polling"],
    withCredentials: true,
  });