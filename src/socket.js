"use client";

import { io } from "socket.io-client";

export const socket = io("kanban-velidogan120.vercel.app:4001", {
    withCredentials: true,
  });