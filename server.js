const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const port = process.env.PORT || 4001;
const app = express();

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "https://kanban-velidogan120.vercel.app",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ["websocket","polling"],
});

io.on("connection", (socket) => {

  socket.on("commentAdd", (data) => {
    io.emit("commentAdded", data);
  });

  socket.on("commentDelete", (data) => {
    io.emit("commentDeleted", data);
  });

  socket.on("commentVote", (data) => {
    io.emit("commentVoted", data);
  });

  socket.on("commentStep", (data) => {
    io.emit("commentStepOver", data);
  });

  socket.on("btnDisable", (data) => {
    io.emit("btnDisabled", data);
  });
});

server.listen(port);